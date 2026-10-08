const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const survey = require('../js/bcmg-survey.js');
const WEBHOOK='https://services.leadconnectorhq.com/hooks/example-test-only/webhook-trigger/example-test-only';
const BOOKING='https://api.leadconnectorhq.com/widget/booking/HYJ0OuN4vdnduGY6sy3K';
const config={webhookUrl:WEBHOOK,minimumMonthlyBudget:3000,liveSubmissionsEnabled:true};
const state={submissionId:'test-stable-submission-id',startedAt:'2026-10-08T14:00:00.000Z',submittedAt:'2026-10-08T14:02:00.000Z'};
const answers={first_name:'Test',last_name:'Owner',email:'TEST@example.invalid',phone:'(407) 555-0100',company_name:'Example',business_location:'Orlando, FL',website:'',annual_revenue:'under_250k',decision_role:'researching',support_interest:'course',marketing_challenge:'Getting a clearer plan.',monthly_investment:'3000_4999',start_timeline:'later',sms_non_marketing_consent:false,sms_marketing_consent:false,company_fax:''};
const payload=survey.buildPayload(answers,state,config);
const environment=(fetch)=>({hostname:'thepatrickcarrshow.com',origin:'https://thepatrickcarrshow.com',fetch});
const reply=(body,ok=true)=>({ok,type:'cors',json:async()=>body});
const liveAck=(extra={})=>({status:'Success: request sent to trigger execution server',...extra});
const CHOICES={
 annual_revenue:{under_250k:'Less Than $250K','250k_1m':'$250K To $1M','1m_3m':'$1M - $3M','3m_10m':'$3M - $10M','10m_plus':'$10M+'},
 decision_role:{owner:'Owner or co-owner',authorized:'I am authorized to make the decision',researching:'I am researching for the decision-maker'},
 support_interest:{course:'A course I can work through',workshop:'A workshop with practical guidance',turnaround:'The 90-Day Marketing Turnaround',help_choosing:'I need help choosing the right option'},
 monthly_investment:{under_1000:'Under $1,000/month','1000_2999':'$1,000–$2,999/month','3000_4999':'$3,000–$4,999/month','5000_9999':'$5,000–$9,999/month','10000_plus':'$10,000/month or more',unsure:'I am not sure yet'},
 start_timeline:{within_30_days:'Within 30 days',one_to_three_months:'In 1–3 months',later:'More than 3 months from now',exploring:'I am exploring options'}
};
const CONSENT_TEXT={
 non_marketing:'By checking this box, I consent to receive non-marketing text messages from Blue Collar Media Group about my inquiry and appointment, including reminders and updates. Message frequency varies. Message and data rates may apply. Text HELP for assistance or STOP to opt out. Consent is optional and is not a condition of purchase.',
 marketing:'By checking this box, I consent to receive marketing and promotional text messages from Blue Collar Media Group at the phone number provided. Message frequency varies. Message and data rates may apply. Text HELP for assistance or STOP to opt out. Consent is optional and is not a condition of purchase.'
};

test('only $3,000+ bands qualify, regardless of revenue, role, timeline or consent',()=>{
 for(const budget of ['3000_4999','5000_9999','10000_plus']) assert.equal(survey.isQualified({...answers,monthly_investment:budget},config),true);
 for(const budget of ['under_1000','1000_2999','unsure','','invented']) assert.equal(survey.isQualified({...answers,monthly_investment:budget},config),false);
});

test('phone and website normalization match mapped field formats',()=>{
 assert.equal(survey.normalizePhone('(407) 555-0100'),'+14075550100');
 assert.equal(survey.normalizePhone('+44 20 7946 0123'),'+442079460123');
 for(const phone of ['','555','telephone','+0123456789','442079460123']) assert.equal(survey.normalizePhone(phone),'');
 assert.equal(survey.normalizeWebsite('https://example.com'),'https://example.com/');
 assert.equal(survey.normalizeWebsite(''),'');
 for(const url of ['ftp://example.com','https://localhost','https://user:pass@example.com']) assert.equal(survey.normalizeWebsite(url),null);
});

test('every choice has the exact labels used by GHL mappings',()=>{
 for(const [key,choices] of Object.entries(CHOICES)) for(const [value,label] of Object.entries(choices)){
  const actual=survey.buildPayload({...answers,[key]:value},state,config);
  assert.equal(actual[key+'_label'],label);
  assert.deepEqual(actual.labeled_choices[key],{value,label});
  assert.deepEqual(JSON.parse(actual.survey_answers).labeled_choices[key],{value,label});
 }
});

test('complete payload includes consent audit record, all answers and tracking metadata',()=>{
 assert.equal(payload.submission_id,state.submissionId);
 assert.equal(payload.email,'test@example.invalid');
 assert.equal(payload.phone,'+14075550100');
 assert.equal(payload.website,'');
 assert.equal(payload.qualification_status,'qualified');
 assert.equal(payload.qualified,true);
 assert.equal(payload.offer_interest,'course');
 assert.equal(payload.lead_source,'BCMG Marketing Survey');
 assert.equal(payload.submit_action,'book_consultation');
 assert.equal(payload.meta_event_id,'bcmg-survey-'+state.submissionId);
 assert.equal(payload.meta_event_name,'Lead');
 assert.equal(payload.meta_custom_event_name,'BCMGMarketingSurveySubmitted');
 const consent=JSON.parse(payload.consent_record);
 assert.deepEqual(consent.consent_text,CONSENT_TEXT);
 assert.equal(consent.sms_non_marketing_consent,false);
 assert.equal(consent.sms_marketing_consent,false);
 assert.equal(consent.consent_text_version,'bcmg-sms-v1-2026-10-08');
 assert.equal(consent.recorded_at,state.submittedAt);
 assert.equal(consent.privacy_policy_url,'https://bluecollarmediagroup.com/privacy-policy');
 assert.equal(consent.terms_url,'https://bluecollarmediagroup.com/terms-of-use');
 assert.equal(JSON.parse(payload.survey_answers).marketing_challenge,answers.marketing_challenge);
 assert.equal(payload.page_url.includes('?'),false);
 const lower=survey.buildPayload({...answers,monthly_investment:'unsure'},state,config);
 assert.equal(lower.qualification_status,'not_qualified');
 assert.equal(lower.submit_action,'review_inquiry');
});

test('enabled submission sends one real POST on every hostname',async()=>{
 for(const hostname of ['localhost','127.0.0.1','thepatrickcarrshow.com']){
  let requests=0;
  const outcome=await survey.sendSubmission(config,payload,{hostname,fetch:async()=>{requests++;return reply(liveAck());}});
  assert.equal(requests,1);
  assert.equal(outcome.qualified,true);
  assert.equal(outcome.booking_url,BOOKING);
 }
 assert.equal(Object.hasOwn(payload,'preview_mode'),false);
});

test('disabled live submissions never fetch',async()=>{
 let requests=0;
 await assert.rejects(survey.sendSubmission({...config,liveSubmissionsEnabled:false},payload,environment(async()=>{requests++;})),failure=>failure.code==='submissions_disabled' && survey.failureAction(failure)==='contact');
 assert.equal(requests,0);
});

test('missing target never pretends an enabled submission was sent',async()=>{
 let requests=0;
 await assert.rejects(survey.sendSubmission({...config,webhookUrl:''},payload,{hostname:'localhost',fetch:async()=>{requests++;}}),failure=>failure.code==='configuration');
 assert.equal(requests,0);
});

test('exact live ACK plus HTTP success allows one JSON POST and the fixed calendar',async()=>{
 const requests=[];
 const outcome=await survey.sendSubmission(config,payload,environment(async(url,options)=>{requests.push({url,options});return reply(liveAck({id:'provider-id-is-not-client-id'}));}));
 assert.equal(requests.length,1); assert.equal(requests[0].url,WEBHOOK);
 assert.equal(requests[0].options.method,'POST'); assert.equal(requests[0].options.mode,'cors');
 assert.equal(requests[0].options.headers['Content-Type'],'application/json');
 assert.equal(JSON.parse(requests[0].options.body).submission_id,state.submissionId);
 assert.equal(outcome.qualified,true);
 assert.equal(outcome.booking_url,BOOKING); assert.equal(outcome.submission_id,state.submissionId);
});

test('lower and unsure budgets never receive a booking destination after live ACK',async()=>{
 for(const budget of ['under_1000','1000_2999','unsure']){
  const lower=survey.buildPayload({...answers,monthly_investment:budget},state,config);
  const outcome=await survey.sendSubmission(config,lower,environment(async()=>reply(liveAck())));
  assert.equal(outcome.qualified,false); assert.equal(outcome.booking_url,null);
 }
});

test('draft test ACK is failure and freezes the original ID for contact guidance',async()=>{
 let requests=0;
 await assert.rejects(survey.sendSubmission(config,payload,environment(async()=>{requests++;return reply({status:'Success: test request received'});})),failure=>{
  assert.equal(failure.code,'workflow_not_live'); assert.equal(failure.submissionId,state.submissionId);
  assert.equal(failure.attempted,true); assert.equal(survey.failureAction(failure),'contact'); return true;
 });
 assert.equal(requests,1);
 const blocked={...state,submissionBlocked:true};
 survey.prepareAttempt(blocked,{...answers,monthly_investment:'unsure'},{randomUUID:()=> 'new-id'});
 assert.equal(blocked.submissionId,state.submissionId);
});

test('unrecognized 2xx, malformed JSON, empty JSON and 5xx never auto resend',async()=>{
 const responses=[reply({status:'Success'}),reply({ok:true,accepted:true}),reply(liveAck(),false),{ok:true,type:'cors',json:async()=>{throw new SyntaxError('empty');}},{ok:false,type:'cors',status:503}];
 for(const response of responses){
  let requests=0;
  await assert.rejects(survey.sendSubmission(config,payload,environment(async()=>{requests++;return response;})),failure=>failure.code==='submission_unconfirmed' && failure.attempted===true && survey.failureAction(failure)==='contact');
  assert.equal(requests,1);
 }
});

test('network or CORS failure makes only one attempt and retains the original ID',async()=>{
 let requests=0;
 await assert.rejects(survey.sendSubmission(config,payload,environment(async()=>{requests++;throw new TypeError('network');})),failure=>failure.submissionId===state.submissionId && failure.attempted===true);
 assert.equal(requests,1);
});

test('timeout aborts one request without a receipt recheck',async()=>{
 let requests=0;
 await assert.rejects(survey.sendSubmission({...config,requestTimeoutMs:10},payload,environment(async(_url,options)=>{
  requests++; return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));
 })),failure=>failure.code==='submission_unconfirmed' && failure.attempted===true);
 assert.equal(requests,1);
});

test('opaque or oversized acknowledgements remain unconfirmed',async()=>{
 await assert.rejects(survey.sendSubmission(config,payload,environment(async()=>({ok:true,type:'opaque',json:async()=>liveAck()}))));
 const bytes=new TextEncoder().encode(JSON.stringify({status:'Success: request sent to trigger execution server',extra:'x'.repeat(9000)}));
 await assert.rejects(survey.sendSubmission(config,payload,environment(async()=>({ok:true,type:'cors',body:new ReadableStream({start(controller){controller.enqueue(bytes);controller.close();}})}))));
});

test('honeypot, oversized answers and unsafe target fail before fetch',async()=>{
 let requests=0; const transport=environment(async()=>{requests++;return reply(liveAck());});
 await assert.rejects(survey.sendSubmission(config,{...payload,company_fax:'spam'},transport));
 await assert.rejects(survey.sendSubmission(config,{...payload,marketing_challenge:'x'.repeat(18000)},transport));
 await assert.rejects(survey.sendSubmission({...config,webhookUrl:'http://example.invalid'},payload,transport));
 assert.equal(requests,0);
});

test('format validation rejects invalid email and nonpublic or nonHTTP website before posting',()=>{
 for(const [name,type,value] of [['email','email','user@gmail'],['website','text','ftp://example.com'],['website','text','https://localhost']]){
  let message=''; const field={name,type,value,required:false,setCustomValidity:value=>{message=value;},checkValidity:()=>!message};
  assert.equal(survey.validateField(field),false);
 }
});

test('booking link permits only the verified calendar without contact query parameters',()=>{
 assert.equal(survey.bookingUrl({bookingUrl:BOOKING}),BOOKING);
 for(const url of ['javascript:alert(1)','http://example.invalid','https://example.invalid',BOOKING+'?email=test@example.invalid']) assert.equal(survey.bookingUrl({bookingUrl:url}),'');
});

test('bare and www domains pass validation without native URL-type rejection',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../blue-collar-media-group.html'),'utf8');
 const input=html.match(/<input\b[^>]*id="bcmg-website"[^>]*>/)[0];
 const type=input.match(/\btype="([^"]+)"/)[1];
 assert.equal(type,'text');
 assert.match(input,/\binputmode="url"/);
 assert.match(input,/\bplaceholder="yourbusiness\.com"/);
 for(const website of ['orlandoflorida.com','www.orlandoflorida.com','https://www.orlandoflorida.com','']){
  let message='';
  const field={name:'website',type,value:website,required:false,setCustomValidity:value=>{message=value;},checkValidity:()=>{
   if(message) return false;
   if(type==='url' && website){try {new URL(website);} catch(_) {return false;}}
   return true;
  }};
  assert.equal(survey.validateField(field),true,website);
  assert.equal(message,'');
  const actual=survey.buildPayload({...answers,website},state,config);
  assert.equal(actual.website,website ? 'https://'+website.replace(/^https:\/\//,'')+'/' : '');
 }
});
