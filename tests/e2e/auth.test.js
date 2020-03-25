import { Selector, RequestMock, RequestLogger } from 'testcafe';
import testHelpers from '../test-helpers';

const authEndpoint = testHelpers.apiEndpoint + 'auth/login';
const createAccessEndpoint = testHelpers.apiEndpoint + 'accesses';
const checkAppEndpoint = createAccessEndpoint + '/check-app';
const emailEndpoint = testHelpers.serviceInfo.register + testHelpers.email + '/uid';
const userEndpoint = testHelpers.serviceInfo.register + testHelpers.user + '/server';
const pollEndpoint = testHelpers.serviceInfo.access + 'pollKey';

const permissions = [
  { streamId: 'diary', defaultName: 'Diary', level: 'read' },
  { streamId: 'work', defaultName: 'Work', level: 'manage' },
];
const checkedPermissions = [
  { streamId: 'diary', defaultName: 'Diary', level: 'read' },
  { streamId: 'work', name: 'Work', level: 'manage' },
];
const needSigninState = {
  status: 'NEED_SIGNIN',
  requestingAppId: testHelpers.requestingAppId,
  requestedPermissions: permissions,
};

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

const pollLogger = RequestLogger(pollEndpoint, {
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
  .respond({ token: 'personalToken' }, 200, { 'Access-Control-Allow-Origin': '*' });

const checkAppMock = RequestMock()
  .onRequestTo(checkAppEndpoint)
  .respond({ checkedPermissions: checkedPermissions }, 200, { 'Access-Control-Allow-Origin': '*' });

const usernameForEmailMock = RequestMock()
  .onRequestTo(emailEndpoint)
  .respond({ uid: testHelpers.user }, 200, { 'Access-Control-Allow-Origin': '*' });

const userExistenceMock = RequestMock()
  .onRequestTo(userEndpoint)
  .respond({server: 'exists.com'}, 200, { 'Access-Control-Allow-Origin': '*' });

const pollMock = RequestMock()
  .onRequestTo(pollEndpoint)
  .respond(needSigninState, 200, { 'Access-Control-Allow-Origin': '*' });

const createAccessMock = RequestMock()
  .onRequestTo(createAccessEndpoint)
  .respond({ access: { token: 'appToken' } }, 200, { 'Access-Control-Allow-Origin': '*' });

fixture(`Auth request`)
  .page(`http://localhost:8080/auth?key=` + testHelpers.pollKey)
  .requestHooks(authLogger, checkAppLogger, emailLogger, userLogger, pollLogger, createAccessLogger,
    authRequestMock, checkAppMock, usernameForEmailMock, userExistenceMock, pollMock, createAccessMock);

test('Auth request, app access check and then accept permissions', async testController => {
  await testController
    // Catch eventual unexpected errors that pop as window.alert
    .setNativeDialogHandler((type, text, url) => {
      throw new Error(text);
    })
    // Fill the auth form
    .typeText('#usernameOrEmail', testHelpers.email)
    .typeText('#password', testHelpers.password)
    .click('#submitButton')
    // Poll call was performed
    .expect(pollLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
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
      record.request.body.includes('"appId":"' + testHelpers.appId + '"') &&
      record.request.body.includes('"username":"' + testHelpers.user + '"') &&
      record.request.body.includes('"password":"' + testHelpers.password + '"')
    )).ok()
    // Check-app call was performed
    .expect(checkAppLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"requestingAppId":"' + testHelpers.requestingAppId + '"') &&
      record.request.body.includes(`"requestedPermissions":${JSON.stringify(permissions)}`)
    )).ok()
    // Requested permissions are printed to the user
    .expect(Selector('#appIdText').innerText).contains('App client-app is requesting :')
    .expect(Selector('ul').textContent).contains('A permission on stream Diary with level READ')
    .expect(Selector('ul').textContent).contains('A permission on stream Work with level MANAGE')
    // If the user accepts them

    .click('#acceptPermissions')
    // Access creation call is performed
    .expect(createAccessLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"name":"' + testHelpers.requestingAppId + '"') &&
      record.request.body.includes('"type":"app"') &&
      record.request.body.includes(`"permissions":${JSON.stringify(checkedPermissions)}`)
    )).ok()
    // Update call is performed with accepted state
    .expect(pollLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"status":"ACCEPTED"') &&
      record.request.body.includes('"username":"' + testHelpers.user + '"') &&
      record.request.body.includes('"token":"appToken"')
    )).ok();
});