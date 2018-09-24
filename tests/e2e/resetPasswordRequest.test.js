import {Selector, RequestMock, RequestLogger} from 'testcafe';

const logger = RequestLogger('https://tmodoux.pryv.me/account/request-password-reset', {
  logRequestBody: true,
  stringifyRequestBody: true,
});

fixture(`Reset password page`)
  .page('http://localhost:8080/#/reset')
  .requestHooks(logger);

const resetRequestMock = RequestMock()
  .onRequestTo('https://tmodoux.pryv.me/account/request-password-reset')
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

const usernameForEmailMock = RequestMock()
  .onRequestTo('https://reg.pryv.me/test@test.com/uid')
  .respond({uid: 'tmodoux'}, 200, {'Access-Control-Allow-Origin': '*'});

test.requestHooks(resetRequestMock, usernameForEmailMock)('Reset request with email-username conversion', async testController => {
  const usernameSelector = Selector('#usernameOrEmail');

  await testController
    .typeText(usernameSelector, 'test@test.com')
    .click('#submitButton')
    .expect(logger.contains(record =>
      record.request.url.includes('tmodoux.pryv.me') &&
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('appId') &&
      record.request.body.includes('username') &&
      record.request.body.includes('tmodoux')
    )).ok()
    .expect(Selector('body').textContent).contains('We have sent you a reset link by email');
});
