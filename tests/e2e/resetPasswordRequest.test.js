import {Selector, RequestMock, RequestLogger} from 'testcafe';

const resetEndpoint = 'https://tmodoux.pryv.me/account/request-password-reset';
const emailEndpoint = 'https://reg.pryv.me/test@test.com/uid';

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
  .respond({uid: 'tmodoux'}, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Reset password request`)
  .page('http://localhost:8080/#/reset?requestingAppId=pryv-reset-standalone&standaloneReset=true')
  .requestHooks(resetLogger, emailLogger, resetRequestMock, usernameForEmailMock);

test('Reset request with email-username conversion', async testController => {
  await testController
    // Fill password reset form
    .typeText('#usernameOrEmail', 'test@test.com')
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
      record.request.body.includes('"appId":"pryv-reset-standalone"') &&
      record.request.body.includes('"username":"tmodoux"')
    )).ok()
    .expect(Selector('body').textContent).contains('We have sent password reset instructions to your e-mail address.');
});
