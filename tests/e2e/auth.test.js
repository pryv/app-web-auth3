import {Selector, RequestMock, RequestLogger} from 'testcafe';

const authEndpoint = 'https://tmodoux.pryv.me/auth/login';
const checkAppEndpoint = 'https://tmodoux.pryv.me/accesses/check-app';
const emailEndpoint = 'https://reg.pryv.me/test@test.com/uid';
const updateStateEndpoint = 'https://reg.pryv.me/access/pollKey';
const createAccessEndpoint = 'https://tmodoux.pryv.me/accesses';
const fakePermissions = '[{"streamId":"diary","level":"read","name":"Diary"}]';

// ---------- Requests loggers ----------

const authLogger = RequestLogger(authEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const checkAppLogger = RequestLogger(checkAppEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const emailLogger = RequestLogger(emailEndpoint);

const updateStateLogger = RequestLogger(updateStateEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const createAccessLogger = RequestLogger(createAccessEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

// ---------- Requests mocks ----------

const authRequestMock = RequestMock()
  .onRequestTo(authEndpoint)
  .respond({token: 'personalToken'}, 200, {'Access-Control-Allow-Origin': '*'});

const checkAppMock = RequestMock()
  .onRequestTo(checkAppEndpoint)
  .respond({checkedPermissions: JSON.parse(fakePermissions)}, 200, {'Access-Control-Allow-Origin': '*'});

const usernameForEmailMock = RequestMock()
  .onRequestTo(emailEndpoint)
  .respond({uid: 'tmodoux'}, 200, {'Access-Control-Allow-Origin': '*'});

const updateStateMock = RequestMock()
  .onRequestTo(updateStateEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

const createAccessMock = RequestMock()
  .onRequestTo(createAccessEndpoint)
  .respond({access: {token: 'appToken'}}, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Auth request`)
  .page(`http://localhost:8080/#/auth?requestingAppId=pryv-auth-standalone&key=pollKey&requestedPermissions=${fakePermissions}`)
  .requestHooks(authLogger, checkAppLogger, emailLogger, updateStateLogger, createAccessLogger,
    authRequestMock, checkAppMock, usernameForEmailMock, updateStateMock, createAccessMock);

test('Auth request, app access check, refuse permissions and then accept', async testController => {
  await testController
    // Fill the auth form
    .typeText('#usernameOrEmail', 'test@test.com')
    .typeText('#password', 'mypass')
    .click('#submitButton')
    // Email to username call was performed
    .expect(emailLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    // Login call was performed
    .expect(authLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appId":"pryv-auth-standalone"') &&
      record.request.body.includes('"username":"tmodoux"') &&
      record.request.body.includes('"password":"mypass"')
    )).ok()
    // Check-app call was performed
    .expect(checkAppLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"requestingAppId":"pryv-auth-standalone"') &&
      record.request.body.includes(`"requestedPermissions":${fakePermissions}`)
    )).ok()
    // Requested permissions are printed to the user
    .expect(Selector('#appIdText').innerText).contains('App pryv-auth-standalone is requesting:')
    .expect(Selector('ul').textContent).contains('A permission on stream diary with level read')
    // If the user refuses them, update call is performed with refused state
    .click('#refusePermissions')
    .expect(updateStateLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"status":"REFUSED"') &&
      record.request.body.includes('"reasonId":"REFUSED_BY_USER"') &&
      record.request.body.includes('"message":"The user refused to give access to the requested permissions"')
    )).ok()
    // If the user accepts them
    .click('#acceptPermissions')
    // Access creation call is performed
    .expect(createAccessLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"name":"pryv-auth-standalone"') &&
      record.request.body.includes('"type":"app"') &&
      record.request.body.includes(`"permissions":${fakePermissions}`)
    )).ok()
    // Update call is performed with accepted state
    .expect(updateStateLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"status":"ACCEPTED"') &&
      record.request.body.includes('"username":"tmodoux"') &&
      record.request.body.includes('"token":"appToken"')
    )).ok();
});
