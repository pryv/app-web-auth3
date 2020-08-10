import {Selector, RequestMock, RequestLogger} from 'testcafe';
import testHelpers from '../test-helpers';

const authEndpoint = testHelpers.apiEndpoint + 'auth/login';
const changePasswordEndpoint = testHelpers.apiEndpoint + 'account/change-password';

const authReqLogger = RequestLogger(authEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});
const changePasswordReqLogger = RequestLogger(changePasswordEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const authLoginRequestMock = RequestMock()
  .onRequestTo(authEndpoint)
  .respond({ token: 'personalToken' }, 200, { 'Access-Control-Allow-Origin': '*' });
const changePasswordRequestMock = RequestMock()
  .onRequestTo(changePasswordEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Change password request`)
  .page('http://localhost:8080/change-password')
  .requestHooks(authReqLogger, changePasswordReqLogger, changePasswordRequestMock, authLoginRequestMock);

test('Change password', async testController => {
  await testController
    .setNativeDialogHandler((type, text, url) => {
      throw new Error(text);
    })
    .typeText('#usernameOrEmail', testHelpers.email)
    .typeText('#oldPassword', testHelpers.password)
    .typeText('#newPassword', testHelpers.password)
    .typeText('#newPasswordConfirmation', testHelpers.password)
    .click('#submitButton')
    .expect(changePasswordReqLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"oldPassword":"' + testHelpers.password + '"') &&
      record.request.body.includes('"newPassword":"' + testHelpers.password + '"')
    )).ok()
    .expect(Selector('body').textContent).contains('Your password has been successfully changed.');
});
