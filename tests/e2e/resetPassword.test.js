import {RequestMock, RequestLogger} from 'testcafe';

const resetEndpoint = 'https://js-lib.pryv.li/account/reset-password';
const emailEndpoint = 'https://reg.pryv.li/test@test.com/uid';

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
  .respond({uid: 'js-lib'}, 200, {'Access-Control-Allow-Origin': '*'});

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
    .typeText('#usernameOrEmail', 'test@test.com')
    .typeText('#password', '123456789')
    .typeText('#passConfirmation', '123456789')
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
      record.request.body.includes('"appId":"pryv-app-web-auth-3"') &&
      record.request.body.includes('"username":"js-lib"') &&
      record.request.body.includes('"newPassword":"123456789"') &&
      record.request.body.includes('"resetToken":"1234"')
    )).ok();
});
