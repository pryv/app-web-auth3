import {RequestMock, RequestLogger} from 'testcafe';
import VueSelector from 'testcafe-vue-selectors';

const authEndpoint = 'https://tmodoux.pryv.me/auth/login';
const checkAppEndpoint = 'https://tmodoux.pryv.me/accesses/check-app';
const emailEndpoint = 'https://reg.pryv.me/test@test.com/uid';

const authLogger = RequestLogger(authEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const checkAppLogger = RequestLogger(checkAppEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const emailLogger = RequestLogger(emailEndpoint);

const fakePermissions = '[{"streamId":"diary","level":"read","name":"Diary"}]';

const authRequestMock = RequestMock()
  .onRequestTo(authEndpoint)
  .respond({token: 'personalToken'}, 200, {'Access-Control-Allow-Origin': '*'});

const checkAppMock = RequestMock()
  .onRequestTo(checkAppEndpoint)
  .respond({checkedPermissions: fakePermissions}, 200, {'Access-Control-Allow-Origin': '*'});

const usernameForEmailMock = RequestMock()
  .onRequestTo(emailEndpoint)
  .respond({uid: 'tmodoux'}, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Auth request`)
  .page(`http://localhost:8080/#/auth?requestedPermissions=${fakePermissions}`)
  .requestHooks(authLogger, checkAppLogger, emailLogger, authRequestMock, checkAppMock, usernameForEmailMock);

test('Auth request and app access check', async testController => {
  await testController
    .typeText('#usernameOrEmail', 'test@test.com')
    .typeText('#password', 'mypass')
    .click('#submitButton')
    .expect(emailLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    .expect(authLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appId":"pryv-auth-standalone"') &&
      record.request.body.includes('"username":"tmodoux"') &&
      record.request.body.includes('"password":"mypass"')
    )).ok()
    .expect(checkAppLogger.contains(record => {
      return record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"requestingAppId":"pryv-auth-standalone"') &&
      record.request.body.includes(`"requestedPermissions":${fakePermissions}`);
    }
    )).ok();
  const permissionsVue = await VueSelector('Permissions').getVue();
  await testController.expect(permissionsVue.props.permissionsArray).eql(fakePermissions);
});
