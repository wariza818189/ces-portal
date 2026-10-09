import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { activityDetailsSchema, activityIdSchema, activityRevisionSchema } from '@/lib/validation/activities';
import { volunteerSchema } from '@/lib/validation/volunteers';
import { ACTIVITY_TRANSITIONS } from '../../lib/activity-policy.mjs';
import { writeAudit } from '../../lib/auth/audit.mjs';
import { migrationStatements, AUDIT_CHECK_REPLACEMENT } from '../../scripts/lib/migrations.mjs';
import { getCesLocationMap } from '@/lib/ces-map';
import { safeReturnPath } from '../../lib/auth/policy.mjs';
const details = { name: 'Demo Activity', activity_date: '2026-10-20', venue_name: '', latitude: '', longitude: '' };
test('name Unicode limits, trimming, internal text, and control characters', () => {
  for (const name of ['  CES  Event  ', '😀'.repeat(150), '重复', 'Duplicate']) assert.ok(activityDetailsSchema.safeParse({...details, name}).success);
  assert.equal(activityDetailsSchema.parse({...details, name: '  CES  Event  '}).name, 'CES  Event');
  for (const name of ['', ' ', '😀'.repeat(151), 'a\nb', '\nActivity', 'a\0b', null]) assert.equal(activityDetailsSchema.safeParse({...details, name}).success, false);
});
test('calendar range, leap rules, past and future dates', () => {
  for (const activity_date of ['1000-01-01','9999-12-31','2000-02-29','2024-02-29','2020-01-01','2030-01-01']) assert.ok(activityDetailsSchema.safeParse({...details, activity_date}).success);
  for (const activity_date of ['0999-12-31','10000-01-01','1900-02-29','2026-02-29','2026-04-31','2026-1-01','0000-00-00','2026-10-20T00:00:00Z']) assert.equal(activityDetailsSchema.safeParse({...details, activity_date}).success, false);
});
test('venue limits and coordinate pairing, exact precision and inclusive bounds', () => {
  const valid = (latitude,longitude,venue_name='Demo venue') => activityDetailsSchema.safeParse({...details,latitude,longitude,venue_name});
  for (const pair of [['90','180'],['-90','-180'],['0','0'],['+.5','-.5'],['7.088190','125.624200'],['0001.250000','+0']]) assert.ok(valid(...pair).success);
  assert.equal(valid('-0','0').data.latitude,'0.000000');
  assert.equal(valid('1.25','2').data.latitude,'1.250000');
  for (const pair of [['90.000001','0'],['0','180.000001'],['1e2','0'],['NaN','0'],['Infinity','0'],['.1234567','0'],['0',''],['','0'],['0.','0']]) assert.equal(valid(...pair).success,false);
  assert.equal(valid('0','0','').success,false);
  assert.ok(valid('','','😀'.repeat(250)).success);
  for(const venue_name of ['😀'.repeat(251),'<venue>','a\nb','\nVenue']) assert.equal(valid('','',venue_name).success,false);
});
test('IDs and revisions are bounded canonical values', () => {
  for (const id of ['1','9007199254740993','18446744073709551615']) assert.ok(activityIdSchema.safeParse(id).success);
  for (const id of ['0','01','+1','1.0','1e2',' 1','18446744073709551616',null]) assert.equal(activityIdSchema.safeParse(id).success,false);
  for (const revision of ['1','4294967295']) assert.ok(activityRevisionSchema.safeParse(revision).success);
  for (const revision of ['0','01','4294967296','1.5',null]) assert.equal(activityRevisionSchema.safeParse(revision).success,false);
});
test('Volunteer accepts only managed choice and preserves ordinary field semantics', () => {
  const data={full_name:' Demo ',course_year:'IT  3',contact_number:'00000000000',activity_id:'1',acknowledgement:'on'};
  assert.equal(volunteerSchema.parse(data).contact_number,'00000000000');
  assert.equal(volunteerSchema.parse(data).course_year,'IT  3');
  assert.equal(volunteerSchema.safeParse({...data,activity_id:undefined,activity:'free text'}).success,false);
  assert.equal(volunteerSchema.safeParse({...data,acknowledgement:''}).success,false);
});
test('migration parser allows only the exact audit CHECK replacement; R1 immutable', async () => {
  const legacy=await readFile(new URL('../../database/migrations/001_auth_foundation.sql',import.meta.url));
  assert.equal(createHash('sha256').update(legacy).digest('hex'),'7c018fd31fabb353545a9dd04cea3bfd4327e88ddab488764fecb2acdfa85d3d');
  assert.equal(migrationStatements(await readFile(new URL('../../database/migrations/002_activity_management.sql',import.meta.url),'utf8')).length,5);
  assert.equal(migrationStatements(`${AUDIT_CHECK_REPLACEMENT};`).length,1);
  for(const sql of ['DROP TABLE users;','ALTER TABLE users DROP COLUMN name;','ALTER TABLE audit_logs DROP CHECK chk_audit_event;','TRUNCATE volunteers;','DELETE FROM volunteers;','UPDATE users SET role = 1;','REPLACE INTO users VALUES (1);',AUDIT_CHECK_REPLACEMENT.replace("'ACTIVITY_UPDATED'","'OTHER_EVENT'")]) assert.throws(()=>migrationStatements(sql));
  assert.equal(safeReturnPath('/activities'),'/activities');
  assert.equal(safeReturnPath('/activities?edit=1'),'/dashboard');
});
test('audit strictly bounds events, revisions, fields and old event metadata', async () => {
  const captures=[];const connection={execute:async(sql,values)=>{captures.push(values);return [{affectedRows:1}];}};
  await writeAudit(connection,'ACTIVITY_CREATED','1','2');
  await writeAudit(connection,'ACTIVITY_UPDATED','1','2',{changes:{name:{before:'Old',after:'New'}},previous_revision:1,new_revision:2});
  await writeAudit(connection,'ACTIVITY_STATUS_CHANGED','1','2',{previous_status:'DRAFT',new_status:'ACTIVE',previous_revision:2,new_revision:3});
  for (const metadata of [{changes:{contact_number:{before:'a',after:'b'}},previous_revision:1,new_revision:2},{changes:{name:{before:'a',after:'a'}},previous_revision:1,new_revision:2},{changes:{name:{before:'a',after:'b',other:1}},previous_revision:1,new_revision:2},{changes:{name:{before:'a',after:'b'}},previous_revision:1,new_revision:3}]) await assert.rejects(()=>writeAudit(connection,'ACTIVITY_UPDATED','1','2',metadata));
  await assert.rejects(()=>writeAudit(connection,'ACTIVITY_CREATED',null,'2'));
  await assert.rejects(()=>writeAudit(connection,'AUTH_LOGOUT','1','1',{password:'secret'}));
  await assert.rejects(()=>writeAudit(connection,'OTHER','1','2'));
  await assert.rejects(()=>writeAudit(connection,'ACTIVITY_STATUS_CHANGED','1','2',{previous_status:'ACTIVE',new_status:'ARCHIVED',previous_revision:1,new_revision:2}));
  assert.equal(captures[0][6],null);
  assert.deepEqual(JSON.parse(captures[1][6]),{changes:{name:{before:'Old',after:'New'}},previous_revision:1,new_revision:2});
});
test('OSM maps have fixed origins and public coordinates only; edge viewport clamped', () => {
  const map=getCesLocationMap('Demo venue','90.000000','180.000000');
  assert.equal(new URL(map.embedUrl).origin,'https://www.openstreetmap.org');
  assert.equal(new URL(map.embedUrl).searchParams.get('bbox'),'179.998,89.998,180,90');
  assert.equal(new URL(map.embedUrl).searchParams.get('marker'),'90,180');
  assert.equal(getCesLocationMap('Venue',undefined,undefined).embedUrl,null);
  assert.deepEqual(getCesLocationMap(undefined,'0','0'),{venue:null,mapsUrl:null,embedUrl:null});
  assert.deepEqual(ACTIVITY_TRANSITIONS.ARCHIVED,[]);
});
