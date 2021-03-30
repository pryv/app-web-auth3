import {Selector, RequestMock, RequestLogger} from 'testcafe';
import testHelpers from '../test-helpers';

const resetEndpoint = testHelpers.apiEndpoint + 'account/request-password-reset';
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
  .respond({uid: 'appwebauth3test'}, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Reset password request`)
  .page('http://localhost:8080/reset-password.html')
  .requestHooks(resetLogger, emailLogger, resetRequestMock, usernameForEmailMock);

test('Reset request with email-username conversion', async testController => {
  await testController
    // Catch eventual unexpected errors that pop as window.alert
    .setNativeDialogHandler((type, text, url) => {
      throw new Error(text);
    })
    // Fill password reset form
    .typeText('#usernameOrEmail', testHelpers.email)
    .click('#submitButton')
    // Email to username call was performed
    .expect(emailLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    // Password reset call was performed
    .expect(resetLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appId":"' + testHelpers.appId + '"') &&
      record.request.body.includes('"username":"' + testHelpers.user + '"')
    )).ok()
    .expect(Selector('body').textContent).contains('We have sent password reset instructions to your e-mail address.');
});
