import test from 'node:test';
import assert from 'node:assert/strict';
import { createConnection } from 'mysql2/promise';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyMigrations } from '../../scripts/lib/migrations.mjs';
import { databaseConfiguration } from '../../scripts/lib/database.mjs';
import { bootstrapAdmin } from '../../scripts/bootstrap-admin.mjs';
import { hashPassword } from '../../lib/auth/passwords.mjs';
import { authenticateCredentials } from '@/lib/auth/login';
import { withRequest } from '../r1/framework.mjs';

const enabled = process.env.CES_R2_TEST_DATABASE === process.env.DB_NAME && /^ces_r2_test_[a-z0-9_]+$/.test(process.env.DB_NAME ?? '')
  && /^\/tmp\/ces-r2-mysql-[A-Za-z0-9]+\/mysql.sock$/.test(process.env.DB_SOCKET ?? '');
const suite = enabled ? test : test.skip;
const initial = {status:'idle',message:'',fieldErrors:{}};
const form = values => {const data=new FormData();for(const [key,value] of Object.entries(values))data.set(key,String(value));return data;};
const details = {name:'Synthetic R2 Activity',activity_date:'2026-10-20',venue_name:'Synthetic venue',latitude:'7.08819',longitude:'125.6242'};
const signup = id => form({full_name:'Synthetic R2 Volunteer',course_year:'IT DEMO',contact_number:'00000000000',acknowledgement:'on',activity_id:id,activity:'Untrusted forged name',status:'ACTIVE'});
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};

suite('R2 disposable MySQL migrations, domain, locks and security', async t => {
  const cfg=databaseConfiguration();
  const connection=await createConnection(cfg);
  // This root connection can only reach the fresh /tmp socket explicitly guarded above.
  const operator=await createConnection({socketPath:process.env.DB_SOCKET,user:'root'});
  let sequence=0;
  const legacy=await readFile(new URL('../r1/legacy-schema.sql',import.meta.url),'utf8');
  const latest=await readFile(new URL('../../database/schema.sql',import.meta.url),'utf8');
  const migration1=await readFile(new URL('../../database/migrations/001_auth_foundation.sql',import.meta.url),'utf8');
  const migration2=await readFile(new URL('../../database/migrations/002_activity_management.sql',import.meta.url),'utf8');
  const executeSql=async(c,sql)=>{for(const statement of sql.replace(/^\s*--.*$/gm,'').split(';').map(x=>x.trim()).filter(Boolean))await c.query(statement);};
  const newSchema=async(fresh=false)=>{
    const name=`ces_r2_test_case_${process.pid}_${++sequence}`;
    await operator.query(`CREATE DATABASE \`${name}\``);
    const c=await createConnection({socketPath:process.env.DB_SOCKET,user:'root',database:name});
    await executeSql(c,fresh?latest:legacy);
    return c;
  };
  let db;
  try {
    const [existing]=await connection.query('SHOW TABLES'); assert.equal(existing.length,0,'fixture target must be empty');
    await executeSql(connection,legacy);
    await connection.query("INSERT INTO volunteers (full_name,course_year,contact_number,activity) VALUES ('Synthetic Legacy','DEMO','00000000000','Historical free text')");
    await t.test('existing rows preserved, exact new definitions, rerun and restrictive FKs',async()=>{
      await applyMigrations(connection);await applyMigrations(connection);
      const [[row]]=await connection.query('SELECT activity,activity_id,contact_number FROM volunteers');
      assert.deepEqual(row,{activity:'Historical free text',activity_id:null,contact_number:'00000000000'});
      const [migration]=await connection.query('SELECT version,status,completed_statements FROM schema_migrations ORDER BY version');
      assert.equal(migration.length,2);assert.equal(migration[1].completed_statements,5);assert.ok(migration.every(x=>x.status==='APPLIED'));
      const [fields]=await connection.query("SELECT COLUMN_NAME,COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='activities'");
      assert.equal(fields.find(x=>x.COLUMN_NAME==='activity_date').COLUMN_TYPE,'date');
      assert.equal(fields.find(x=>x.COLUMN_NAME==='latitude').COLUMN_TYPE,'decimal(8,6)');
      assert.equal(fields.find(x=>x.COLUMN_NAME==='longitude').COLUMN_TYPE,'decimal(9,6)');
      await assert.rejects(()=>connection.query("INSERT INTO volunteers(full_name,course_year,contact_number,activity,activity_id) VALUES('Demo','DEMO','000','Demo',9999)"));
    });
    await t.test('fresh latest schema records and verifies both historical migrations',async()=>{
      const c=await newSchema(true);try{await applyMigrations(c);await applyMigrations(c);const [[r]]=await c.query('SELECT COUNT(*) AS n FROM schema_migrations');assert.equal(r.n,2);}finally{await c.end();}
    });
    await t.test('every committed DDL/checkpoint interruption resumes safely',async()=>{
      for(let stop=1;stop<=5;stop++){
        const c=await newSchema();try{
          // First apply only R1 using its unchanged file.
          const dir=await mkdtemp(join(tmpdir(),'ces-r2-chain-'));await writeFile(join(dir,'001_auth_foundation.sql'),migration1);await applyMigrations(c,dir);await writeFile(join(dir,'002_activity_management.sql'),migration2);
          let failed=false;
          const proxy=new Proxy(c,{get(target,key){if(key==='execute')return async(sql,args)=>{if(!failed&&sql.startsWith('UPDATE schema_migrations SET completed_statements')&&args[0]===stop&&args[1]==='002_activity_management.sql'){failed=true;throw Error('Injected checkpoint interruption');}return target.execute(sql,args);};const value=target[key];return typeof value==='function'?value.bind(target):value;}});
          await assert.rejects(()=>applyMigrations(proxy,dir));assert.ok(failed);await applyMigrations(c,dir);await applyMigrations(c,dir);
        }finally{await c.end();}
      }
    });
    await t.test('audit CHECK drift, missing checks, defaults, DATE/DECIMAL drift fail closed',async()=>{
      for(const alter of ["ALTER TABLE audit_logs DROP CHECK chk_audit_event", "ALTER TABLE audit_logs DROP CHECK chk_audit_event, ADD CONSTRAINT chk_audit_event CHECK(event_type IN ('AUTH_LOGOUT'))", "ALTER TABLE activities MODIFY latitude DECIMAL(9,6) NULL", "ALTER TABLE activities ALTER revision SET DEFAULT 2", "ALTER TABLE activities MODIFY activity_date DATETIME NOT NULL", "ALTER TABLE activities ALTER status SET DEFAULT 'draft'", "ALTER TABLE activities DROP CHECK chk_activities_status"]){
        const c=await newSchema(true);try{await applyMigrations(c);await c.query(alter);await assert.rejects(()=>applyMigrations(c));}finally{await c.end();}
      }
    });
    await t.test('checksum drift and unrecognized successor file rejected',async()=>{
      const c=await newSchema();const dir=await mkdtemp(join(tmpdir(),'ces-r2-drift-'));
      try{await writeFile(join(dir,'001_auth_foundation.sql'),migration1);await writeFile(join(dir,'002_activity_management.sql'),migration2);await applyMigrations(c,dir);await writeFile(join(dir,'001_auth_foundation.sql'),migration1+'\n-- drift');await assert.rejects(()=>applyMigrations(c,dir));}finally{await c.end();}
      const fresh=await newSchema();try{await writeFile(join(dir,'001_auth_foundation.sql'),migration1);await writeFile(join(dir,'002_activity_management.sql'),migration2.replace("'ACTIVITY_UPDATED'","'OTHER'"));await assert.rejects(()=>applyMigrations(fresh,dir));}finally{await fresh.end();}
    });
    const adminId=await bootstrapAdmin(connection,'Synthetic Admin','r2.admin','Synthetic password 12');
    await assert.rejects(()=>bootstrapAdmin(connection,'Another Admin','other.admin','Synthetic password 12'));
    await connection.execute("INSERT INTO users(name,username,password_hash,role) VALUES('Synthetic Staff','r2.staff',?,'STAFF')",[await hashPassword('Synthetic password 12')]);
    const [[staff]]=await connection.query("SELECT CAST(id AS CHAR) AS id FROM users WHERE username='r2.staff'");
    const actions=await import('@/lib/actions/activities');
    const {createVolunteer}=await import('@/lib/actions/volunteers');
    const {listActivities,listPublicActivities}=await import('@/lib/activities');
    db=(await import('@/lib/db')).db;
    const adminToken=await authenticateCredentials(db,'r2.admin','Synthetic password 12');
    const staffToken=await authenticateCredentials(db,'r2.staff','Synthetic password 12');
    const call=(action,values,token=staffToken)=>withRequest(token,()=>action(initial,form(values)));
    const row=async id=>(await connection.execute('SELECT CAST(id AS CHAR) AS id,name,status,revision,created_by,updated_at FROM activities WHERE id=?',[id]))[0][0];
    const counts=async()=>{const [[r]]=await connection.query('SELECT (SELECT COUNT(*) FROM activities) AS activities,(SELECT COUNT(*) FROM volunteers) AS volunteers,(SELECT COUNT(*) FROM audit_logs WHERE entity_type=\'ACTIVITY\') AS audits');return r;};
    const create=async(name='Synthetic R2 Activity',token=staffToken,extra={})=>{assert.equal((await call(actions.createActivity,{...details,...extra,name,created_by:adminId,status:'ACTIVE'},token)).status,'success');return (await connection.query('SELECT CAST(MAX(id) AS CHAR) AS id FROM activities'))[0][0].id;};
    const transition=async(id,status)=>{const current=await row(id);return call(actions.changeActivityStatus,{id,revision:current.revision,status});};
    await t.test('anonymous, invalid, expired and inactive sessions cannot mutate',async()=>{
      const before=await counts();for(const token of [null,'f'.repeat(64)])assert.equal((await call(actions.createActivity,details,token)).status,'error');
      await connection.execute('UPDATE users SET is_active=0 WHERE id=?',[staff.id]);assert.equal((await call(actions.createActivity,details)).status,'error');await connection.execute('UPDATE users SET is_active=1 WHERE id=?',[staff.id]);
      const expiring=await authenticateCredentials(db,'r2.staff','Synthetic password 12');
      await connection.execute("UPDATE staff_sessions SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 10 HOUR),expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 HOUR) WHERE user_id=? AND token_hash=UNHEX(SHA2(?,256))",[staff.id,expiring]);
      assert.equal((await call(actions.createActivity,details,expiring)).status,'error');assert.deepEqual(await counts(),before);
    });
    const id=await create();
    await t.test('Staff/Admin create Draft, server actor, duplicate names, checks and FK restrictions',async()=>{
      const current=await row(id);assert.equal(current.status,'DRAFT');assert.equal(String(current.created_by),staff.id);
      const second=await create(details.name,adminToken);assert.equal(String((await row(second)).created_by),adminId);
      for(const set of ["latitude=91,longitude=0","latitude=0,longitude=NULL","venue_name=NULL,latitude=0,longitude=0","status='OTHER'","revision=0","name=''","activity_date='0999-01-01'"])await assert.rejects(()=>connection.query(`UPDATE activities SET ${set} WHERE id=${id}`));
      await assert.rejects(()=>connection.execute('DELETE FROM users WHERE id=?',[staff.id]));
    });
    await t.test('no-op edit unchanged; exact bounded before/after audit and stale revision',async()=>{
      const before=await counts();const original=await row(id);
      assert.equal((await call(actions.editActivity,{...details,id,revision:1})).status,'success');assert.deepEqual(await counts(),before);assert.equal((await row(id)).updated_at.getTime(),original.updated_at.getTime());
      assert.equal((await call(actions.editActivity,{...details,name:'Renamed Activity',activity_date:'2026-10-21',id,revision:1})).status,'success');
      const [[audit]]=await connection.query("SELECT metadata FROM audit_logs WHERE event_type='ACTIVITY_UPDATED' AND entity_id="+id+" ORDER BY id DESC LIMIT 1");
      assert.deepEqual(audit.metadata,{changes:{name:{before:details.name,after:'Renamed Activity'},activity_date:{before:'2026-10-20',after:'2026-10-21'}},previous_revision:1,new_revision:2});
      assert.equal((await call(actions.editActivity,{...details,id,revision:1})).message,'This Activity changed since you opened it. Reload and review the latest details.');
    });
    await t.test('all lifecycle edges, invalid edges and same-state no-op',async()=>{
      for(const source of ['DRAFT','ACTIVE','CLOSED','ARCHIVED'])for(const target of ['DRAFT','ACTIVE','CLOSED','ARCHIVED']){
        const eventId=await create(`Lifecycle ${source} ${target}`);
        if(source==='ACTIVE'||source==='CLOSED'||source==='ARCHIVED')assert.equal((await transition(eventId,'ACTIVE')).status,'success');
        if(source==='CLOSED'||source==='ARCHIVED')assert.equal((await transition(eventId,'CLOSED')).status,'success');
        if(source==='ARCHIVED')assert.equal((await transition(eventId,'ARCHIVED')).status,'success');
        const before=await counts();const r=await row(eventId);const result=await call(actions.changeActivityStatus,{id:eventId,revision:r.revision,status:target});
        const permitted={DRAFT:['ACTIVE','ARCHIVED'],ACTIVE:['CLOSED'],CLOSED:['ACTIVE','ARCHIVED'],ARCHIVED:[]}[source].includes(target);
        assert.equal(result.status,source===target||permitted?'success':'error');
        if(source===target||!permitted)assert.deepEqual(await counts(),before);
        else{const [[audit]]=await connection.query("SELECT metadata FROM audit_logs WHERE event_type='ACTIVITY_STATUS_CHANGED' AND entity_id="+eventId+" ORDER BY id DESC LIMIT 1");assert.deepEqual(audit.metadata,{previous_status:source,new_status:target,previous_revision:r.revision,new_revision:r.revision+1});}
        if(source==='CLOSED'||source==='ARCHIVED')assert.equal((await call(actions.editActivity,{...details,id:eventId,revision:(await row(eventId)).revision})).status, ['DRAFT','ACTIVE'].includes((await row(eventId)).status)?'success':'error');
      }
    });
    await t.test('Volunteer current eligibility and immutable canonical snapshots',async()=>{
      assert.equal((await withRequest(null,()=>createVolunteer(initial,signup(id)))).status,'error');
      await transition(id,'ACTIVE');
      assert.equal((await withRequest(null,()=>createVolunteer(initial,signup(id)))).status,'success');
      const [[volunteer]]=await connection.execute('SELECT activity,CAST(activity_id AS CHAR) AS activity_id FROM volunteers WHERE activity_id=?',[id]);assert.deepEqual(volunteer,{activity:'Renamed Activity',activity_id:id});
      const current=await row(id);await call(actions.editActivity,{...details,name:'Changed after signup',id,revision:current.revision});
      assert.equal((await connection.execute('SELECT activity FROM volunteers WHERE activity_id=?',[id]))[0][0].activity,'Renamed Activity');
      await assert.rejects(()=>connection.execute('DELETE FROM activities WHERE id=?',[id]));
      for(const status of ['CLOSED','ARCHIVED']){await transition(id,status);assert.equal((await withRequest(null,()=>createVolunteer(initial,signup(id)))).status,'error');}
      assert.equal((await withRequest(null,()=>createVolunteer(initial,signup('18446744073709551615')))).status,'error');
    });
    await t.test('coordinate before/after metadata and revision exhaustion',async()=>{
      const eventId=await create('Coordinate audit');
      assert.equal((await call(actions.editActivity,{...details,name:'Coordinate audit',venue_name:'',latitude:'',longitude:'',id:eventId,revision:1})).status,'success');
      const [[audit]]=await connection.execute("SELECT metadata FROM audit_logs WHERE event_type='ACTIVITY_UPDATED' AND entity_id=? ORDER BY id DESC LIMIT 1",[eventId]);
      assert.deepEqual(audit.metadata,{changes:{venue_name:{before:'Synthetic venue',after:null},latitude:{before:'7.088190',after:null},longitude:{before:'125.624200',after:null}},previous_revision:1,new_revision:2});
      await connection.execute('UPDATE activities SET revision=4294967295 WHERE id=?',[eventId]);
      const before=await counts();assert.equal((await call(actions.changeActivityStatus,{id:eventId,revision:'4294967295',status:'ACTIVE'})).status,'error');assert.deepEqual(await counts(),before);
    });
    await t.test('public DTO has Active records only, ordering, historical reads and empty result',async()=>{
      const past=await create('Past Active',staffToken,{activity_date:'1000-01-01'});const future=await create('Future Active',staffToken,{activity_date:'9999-12-31'});
      await transition(past,'ACTIVE');await transition(future,'ACTIVE');
      const options=await listPublicActivities();assert.ok(options.some(x=>x.id===past));assert.ok(options.some(x=>x.id===future));assert.ok(options.length);for(const option of options)assert.deepEqual(Object.keys(option).sort(),['activity_date','id','map','name','venue_name']);
      const all=await listActivities();const expected=all.filter(x=>x.status==='ACTIVE').sort((a,b)=>a.activity_date.localeCompare(b.activity_date)||Number(BigInt(a.id)-BigInt(b.id))).map(x=>x.id);assert.deepEqual(options.map(x=>x.id),expected);
      for(const activity of all.filter(x=>x.status==='ACTIVE'))await transition(activity.id,'CLOSED');
      assert.deepEqual(await listPublicActivities(),[]);
      const [[historic]]=await connection.query('SELECT activity,activity_id FROM volunteers WHERE id=1');assert.deepEqual(historic,{activity:'Historical free text',activity_id:null});
    });
    // Proxy pauses a real locking read while preserving the actual transaction.
    const pauseNext=predicate=>{
      const acquired=deferred(),release=deferred();const original=db.getConnection.bind(db);let used=false;
      db.getConnection=async()=>{const c=await original();return new Proxy(c,{get(target,key){if(key==='execute')return async(sql,args)=>{const result=await target.execute(sql,args);if(!used&&predicate(sql)){used=true;acquired.resolve();await release.promise;}return result;};const value=target[key];return typeof value==='function'?value.bind(target):value;}});};
      return {acquired:acquired.promise,release:()=>release.resolve(),restore:()=>{db.getConnection=original;}};
    };
    const faultAudit=()=>{const original=db.getConnection.bind(db);db.getConnection=async()=>{const c=await original();return new Proxy(c,{get(target,key){if(key==='execute')return(sql,args)=>{if(sql.includes('INSERT INTO audit_logs'))throw Error('Injected audit failure');return target.execute(sql,args);};const value=target[key];return typeof value==='function'?value.bind(target):value;}});};return()=>{db.getConnection=original;};};
    await t.test('create/edit/status audit failures roll back every domain mutation',async()=>{
      const eventId=await create('Rollback');const before=await counts();const restore=faultAudit();try{
        assert.equal((await call(actions.createActivity,details)).status,'error');
        assert.equal((await call(actions.editActivity,{...details,name:'Failed edit',id:eventId,revision:1})).status,'error');
        assert.equal((await call(actions.changeActivityStatus,{id:eventId,revision:1,status:'ACTIVE'})).status,'error');
      }finally{restore();}assert.deepEqual(await counts(),before);assert.equal((await row(eventId)).revision,1);
    });
    await t.test('competing staff edits serialize and reject stale revision',async()=>{
      const eventId=await create('Race edits');const results=await Promise.all([call(actions.editActivity,{...details,name:'First',id:eventId,revision:1}),call(actions.editActivity,{...details,name:'Second',id:eventId,revision:1})]);assert.deepEqual(results.map(x=>x.status).sort(),['error','success']);assert.equal((await row(eventId)).revision,2);
    });
    await t.test('signup first holds shared lock; close waits then succeeds',async()=>{
      const eventId=await create('Signup first');await transition(eventId,'ACTIVE');const pause=pauseNext(sql=>sql.includes('FROM activities')&&sql.includes('FOR SHARE'));
      try{const submit=withRequest(null,()=>createVolunteer(initial,signup(eventId)));await pause.acquired;let ended=false;const close=transition(eventId,'CLOSED').then(r=>{ended=true;return r;});await new Promise(r=>setTimeout(r,100));assert.equal(ended,false);pause.release();assert.equal((await submit).status,'success');assert.equal((await close).status,'success');}finally{pause.release();pause.restore();}
    });
    await t.test('close first commits; stale signup waits and rejects',async()=>{
      const eventId=await create('Close first');await transition(eventId,'ACTIVE');const pause=pauseNext(sql=>sql.includes('FROM activities')&&sql.includes('FOR UPDATE'));
      try{const close=transition(eventId,'CLOSED');await pause.acquired;let ended=false;const submit=withRequest(null,()=>createVolunteer(initial,signup(eventId))).then(r=>{ended=true;return r;});await new Promise(r=>setTimeout(r,100));assert.equal(ended,false);pause.release();assert.equal((await close).status,'success');assert.equal((await submit).status,'error');}finally{pause.release();pause.restore();}
    });
    await t.test('close rollback releases lock; waiting signup accepts still-Active row',async()=>{
      const eventId=await create('Rollback close');await transition(eventId,'ACTIVE');const restoreFault=faultAudit();const pause=pauseNext(sql=>sql.includes('FROM activities')&&sql.includes('FOR UPDATE'));
      try{const close=transition(eventId,'CLOSED');await pause.acquired;const submit=withRequest(null,()=>createVolunteer(initial,signup(eventId)));pause.release();assert.equal((await close).status,'error');assert.equal((await submit).status,'success');assert.equal((await row(eventId)).status,'ACTIVE');}finally{pause.release();pause.restore();restoreFault();}
    });
    await t.test('rename first serializes canonical snapshot and close/reopen catches stale transition',async()=>{
      const eventId=await create('Before rename');await transition(eventId,'ACTIVE');const pause=pauseNext(sql=>sql.includes('FROM activities')&&sql.includes('FOR UPDATE'));
      try{const rename=call(actions.editActivity,{...details,name:'After rename',id:eventId,revision:2});await pause.acquired;const submit=withRequest(null,()=>createVolunteer(initial,signup(eventId)));pause.release();assert.equal((await rename).status,'success');assert.equal((await submit).status,'success');const [[v]]=await connection.execute('SELECT activity FROM volunteers WHERE activity_id=?',[eventId]);assert.equal(v.activity,'After rename');}finally{pause.release();pause.restore();}
      const previous=(await row(eventId)).revision;await transition(eventId,'CLOSED');await transition(eventId,'ACTIVE');assert.equal((await call(actions.changeActivityStatus,{id:eventId,revision:previous,status:'CLOSED'})).status,'error');
    });
  } finally {if(db)await db.end();await connection.end();await operator.end();}
});
