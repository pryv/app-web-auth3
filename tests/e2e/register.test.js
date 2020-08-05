import {RequestMock, RequestLogger} from 'testcafe';
import testHelpers from '../test-helpers';

const registerEndpoint = testHelpers.serviceInfo.register + 'user';
const hostingsEndpoint = testHelpers.serviceInfo.register + 'hostings';
const redirectEndpoint = testHelpers.apiEndpoint;
const fakeHostings = {
  'regions': {
    'europe': {
      'name': 'Europe',
      'localizedName': {'fr': 'Europe'},
      'zones': {
        'france': {
          'name': 'France',
          'localizedName': {'fr': 'France'},
          'hostings': {
            'gandi.net-fr': {
              'url': 'http://gandi.net',
              'name': 'Gandi',
              'description': 'Domains made simple. Since 1999.',
              'localizedDescription': {},
              'available': true,
            },
          },
        },
      },
    },
  },
};

// ---------- Requests loggers ----------

const registerLogger = RequestLogger(registerEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const hostingsLogger = RequestLogger(hostingsEndpoint);

// ---------- Requests mocks ----------

const registerUserMock = RequestMock()
  .onRequestTo(registerEndpoint)
  .respond({ username: testHelpers.user}, 200, {'Access-Control-Allow-Origin': '*'});

const hostingsMock = RequestMock()
  .onRequestTo(hostingsEndpoint)
  .respond(fakeHostings, 200, {'Access-Control-Allow-Origin': '*'});

const redirectMock = RequestMock()
  .onRequestTo(redirectEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Register user`)
  .before(async ctx => {
    ctx.testHelpers = testHelpers;
  })
  .page('http://localhost:8080/register?lang=fr')
  .requestHooks(registerLogger, hostingsLogger, registerUserMock, hostingsMock, redirectMock);

test('Register new user with hostings retrieval', async testController => {
  await testController
    // Catch eventual unexpected errors that pop as window.alert
    .setNativeDialogHandler((type, text, url) => {
      throw new Error(text);
    })
    // Hostings retrieval call was performed
    .expect(hostingsLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    // Fill the new user information
    .typeText('#username', testHelpers.user)
    .typeText('#password', testHelpers.password)
    .typeText('#passwordConfirmation', testHelpers.password)
    .typeText('#email', testHelpers.email)
    .click('#submitButton')
    // User creation call was performed
    .expect(registerLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appid":"' + testHelpers.appId + '"') &&
      record.request.body.includes('"username":"' + testHelpers.user + '"') &&
      record.request.body.includes('"password":"' + testHelpers.password + '"') &&
      record.request.body.includes('"email":"' + testHelpers.email + '"') &&
      record.request.body.includes('"hosting":"gandi.net-fr"') &&
      record.request.body.includes('"languageCode":"fr"') &&
      record.request.body.includes('"invitationtoken":"enjoy"')
    )).ok();
});
