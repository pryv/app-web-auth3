import {Selector, RequestMock, RequestLogger} from 'testcafe';

const authEndpoint = 'https://tmodoux.pryv.me/auth/login';
const checkAppEndpoint = 'https://tmodoux.pryv.me/accesses/check-app';
const emailEndpoint = 'https://reg.pryv.me/test@test.com/uid';
const userEndpoint = 'https://reg.pryv.me/tmodoux/server';
const updateStateEndpoint = 'https://reg.pryv.me/access/pollKey';
const createAccessEndpoint = 'https://tmodoux.pryv.me/accesses';
const permissions = [
  {streamId: 'diary', defaultName: 'Diary', level: 'read'},
  {streamId: 'work', defaultName: 'Work', level: 'manage'},
];
const checkedPermissions = [
  {streamId: 'diary', defaultName: 'Diary', level: 'read'},
  {streamId: 'work', name: 'Work', level: 'manage'},
];

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

const userLogger = RequestLogger(userEndpoint);

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
  .respond({checkedPermissions: checkedPermissions}, 200, {'Access-Control-Allow-Origin': '*'});

const usernameForEmailMock = RequestMock()
  .onRequestTo(emailEndpoint)
  .respond({uid: 'tmodoux'}, 200, {'Access-Control-Allow-Origin': '*'});

const userExistenceMock = RequestMock()
  .onRequestTo(userEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

const updateStateMock = RequestMock()
  .onRequestTo(updateStateEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

const createAccessMock = RequestMock()
  .onRequestTo(createAccessEndpoint)
  .respond({access: {token: 'appToken'}}, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Auth request`)
  .page(`http://localhost:8080/auth?requestingAppId=pryv-auth-standalone&key=pollKey&requestedPermissions=${JSON.stringify(permissions)}`)
  .requestHooks(authLogger, checkAppLogger, emailLogger, userLogger, updateStateLogger, createAccessLogger,
    authRequestMock, checkAppMock, usernameForEmailMock, userExistenceMock, updateStateMock, createAccessMock);

test('Auth request, app access check and then accept permissions', async testController => {
  await testController
    // Catch eventual unexpected errors that pop as window.alert
    .setNativeDialogHandler((type, text, url) => {
      throw new Error(text);
    })
    // Fill the auth form
    .typeText('#usernameOrEmail', 'test@test.com')
    .typeText('#password', 'mypass')
    .click('#submitButton')
    // Email to username call was performed
    .expect(emailLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    // Check user existence call was performed
    .expect(userLogger.contains(record =>
      record.request.method === 'post' &&
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
      record.request.body.includes(`"requestedPermissions":${JSON.stringify(permissions)}`)
    )).ok()
    // Requested permissions are printed to the user
    .expect(Selector('#appIdText').innerText).contains('App pryv-auth-standalone is requesting :')
    .expect(Selector('ul').textContent).contains('A permission on stream Diary with level READ')
    .expect(Selector('ul').textContent).contains('A permission on stream Work with level MANAGE')
    // If the user accepts them
    .click('#acceptPermissions')
    // Access creation call is performed
    .expect(createAccessLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"name":"pryv-auth-standalone"') &&
      record.request.body.includes('"type":"app"') &&
      record.request.body.includes(`"permissions":${JSON.stringify(checkedPermissions)}`)
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
