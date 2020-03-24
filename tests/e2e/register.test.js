import {RequestMock, RequestLogger} from 'testcafe';

const registerEndpoint = 'https://reg.pryv.li/user';
const hostingsEndpoint = 'https://reg.pryv.li/hostings';
const redirectEndpoint = 'https://js-lib.pryv.li';
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
  .respond({username: 'js-lib'}, 200, {'Access-Control-Allow-Origin': '*'});

const hostingsMock = RequestMock()
  .onRequestTo(hostingsEndpoint)
  .respond(fakeHostings, 200, {'Access-Control-Allow-Origin': '*'});

const redirectMock = RequestMock()
  .onRequestTo(redirectEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Register user`)
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
    .typeText('#username', 'js-lib')
    .typeText('#password', 'js-libpass')
    .typeText('#passConfirmation', 'js-libpass')
    .typeText('#email', 'test@test.com')
    .click('#submitButton')
    // User creation call was performed
    .expect(registerLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appid":"pryv-app-web-auth-3"') &&
      record.request.body.includes('"username":"js-lib"') &&
      record.request.body.includes('"password":"js-libpass"') &&
      record.request.body.includes('"email":"test@test.com"') &&
      record.request.body.includes('"hosting":"gandi.net-fr"') &&
      record.request.body.includes('"languageCode":"fr"') &&
      record.request.body.includes('"invitationtoken":"enjoy"')
    )).ok();
});
