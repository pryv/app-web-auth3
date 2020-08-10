import {RequestMock, RequestLogger} from 'testcafe';
import testHelpers from '../test-helpers';

const resetEndpoint = testHelpers.apiEndpoint + 'account/reset-password';
const emailEndpoint = testHelpers.serviceInfo.register + testHelpers.email + '/uid';

// ---------- Requests loggers ----------

const resetLogger = RequestLogger(resetEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const emailLogger = RequestLogger(emailEndpoint);

// ---------- Requests mocks ----------

const resetRequestMock = RequestMock()
  .onRequestTo(resetEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

const usernameForEmailMock = RequestMock()
  .onRequestTo(emailEndpoint)
  .respond({uid: testHelpers.user}, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Reset password`)
  .page('http://localhost:8080/reset?resetToken=1234')
  .requestHooks(resetLogger, emailLogger, resetRequestMock, usernameForEmailMock);

test('Reset password with email conversion', async testController => {
  await testController
    // Catch eventual unexpected errors that pop as window.alert
    .setNativeDialogHandler((type, text, url) => {
      throw new Error(text);
    })
    // Fill password change form
    .typeText('#usernameOrEmail', testHelpers.email)
    .typeText('#password', '123456789')
    .typeText('#passwordConfirmation', '123456789')
    .click('#submitButton')
    // Email to username call was performed
    .expect(emailLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    // Password change call was performed
    .expect(resetLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appId":"' + testHelpers.appId + '"') &&
      record.request.body.includes('"username":"' + testHelpers.user +'"') &&
      record.request.body.includes('"newPassword":"123456789"') &&
      record.request.body.includes('"resetToken":"1234"')
    )).ok();
});
