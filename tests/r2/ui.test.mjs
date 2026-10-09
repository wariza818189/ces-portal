import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
// Markup checks never connect to a database. Supply only inert synthetic settings
// when the explicitly configured integration suite is not running.
if (!process.env.CES_R2_TEST_DATABASE) Object.assign(process.env, {DB_HOST:'markup.invalid',DB_PORT:'1',DB_USER:'synthetic',DB_PASSWORD:'synthetic-only',DB_NAME:'ces_r2_test_markup'});
const {VolunteerExperience}=await import('@/components/volunteers/volunteer-experience');
const {LocationCard}=await import('@/components/maps/location-card');
const {StaffNavigation}=await import('@/components/layout/staff-navigation');
const {ActivityForm}=await import('@/components/activities/activity-form');
const demoMap={venue:'Configured synthetic venue',embedUrl:'https://www.openstreetmap.org/export/embed.html?marker=0%2C0',mapsUrl:'https://www.openstreetmap.org/?mlat=0&mlon=0'};
test('public empty and load failure states fail closed and stay distinct',()=>{
  const empty=renderToStaticMarkup(createElement(VolunteerExperience,{activities:[],demoMap}));
  const error=renderToStaticMarkup(createElement(VolunteerExperience,{activities:null,demoMap}));
  assert.ok(empty.includes('No CES volunteer activities are currently open for registration.'));
  assert.ok(error.includes('Unable to load registration activities.'));
  for(const html of [empty,error]){assert.ok(!html.includes('name="activity"'));assert.ok(!html.includes('type="submit"'));assert.ok(html.includes('Configured CES demonstration venue'));}
});
test('native public selector, personal fields and privacy notice; public metadata only',()=>{
  const activities=[{id:'1',name:'Demo',activity_date:'2026-10-20',venue_name:'Public venue',map:demoMap}];
  const html=renderToStaticMarkup(createElement(VolunteerExperience,{activities,demoMap}));
  assert.ok(html.includes('<select'));assert.ok(html.includes('name="activity_id"'));assert.ok(!html.includes('name="activity"'));
  for(const name of ['full_name','course_year','contact_number','acknowledgement'])assert.ok(html.includes(`name="${name}"`));
  assert.ok(html.includes('The information submitted in this form will be used by Community Extension Services'));
  assert.ok(!html.includes('created_by'));assert.ok(!html.includes('revision'));
});
test('text-only/no-venue cards render without iframe and retain third-party disclosure',()=>{
  for(const venue of ['Public text-only venue',null]){
    const html=renderToStaticMarkup(createElement(LocationCard,{map:{venue,embedUrl:null,mapsUrl:null},heading:'Selected Activity venue',description:'Selected Activity details'}));
    assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('Configured synthetic venue'));assert.ok(html.includes('Map unavailable.'));
    assert.ok(html.includes(venue??'Venue information unavailable.'));
  }
});
test('five visible primary links, two-column mobile navigation, Activity aria-current',()=>{
  const html=renderToStaticMarkup(createElement(StaffNavigation));
  assert.equal((html.match(/<a /g)||[]).length,5);assert.ok(html.includes('grid-cols-2'));assert.ok(html.includes('lg:grid-cols-1'));
  for(const label of ['Dashboard','Donations','Inventory','Activities','Volunteers'])assert.ok(html.includes(`>${label}</a>`));
  assert.ok(/aria-current="page"[^>]*>Activities<\/a>/.test(html));
});
test('Active editor includes visibility and historical snapshot notice',()=>{
  const html=renderToStaticMarkup(createElement(ActivityForm,{activity:{id:'1',name:'Demo',activity_date:'2026-10-20',status:'ACTIVE',revision:1,venue_name:null,latitude:null,longitude:null}}));
  assert.ok(html.includes('Changes are visible to people registering for this Activity.'));
  assert.ok(html.includes('not historical signup snapshots'));assert.ok(html.includes('name="revision"'));assert.ok(html.includes('aria-describedby'));
});
