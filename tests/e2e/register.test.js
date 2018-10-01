import {RequestMock, RequestLogger} from 'testcafe';

const registerEndpoint = 'https://reg.pryv.me/user';
const hostingsEndpoint = 'https://reg.pryv.me/hostings';
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

const registerLogger = RequestLogger(registerEndpoint, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

const hostingsLogger = RequestLogger(hostingsEndpoint);

const registerUserMock = RequestMock()
  .onRequestTo(registerEndpoint)
  .respond(null, 200, {'Access-Control-Allow-Origin': '*'});

const hostingsMock = RequestMock()
  .onRequestTo(hostingsEndpoint)
  .respond(fakeHostings, 200, {'Access-Control-Allow-Origin': '*'});

fixture(`Register user`)
  .page('http://localhost:8080/#/register?requestingAppId=pryv-reg-standalone')
  .requestHooks(registerLogger, hostingsLogger, registerUserMock, hostingsMock);

test('Register new user with hostings retrieval', async testController => {
  await testController
    .expect(hostingsLogger.contains(record =>
      record.request.method === 'get' &&
      record.response.statusCode === 200
    )).ok()
    .typeText('#username', 'tmodoux')
    .typeText('#password', 'mypass')
    .typeText('#passConfirmation', 'mypass')
    .typeText('#email', 'test@test.com')
    .click('#hosting')
    .pressKey('g')
    .pressKey('enter')
    .click('#submitButton')
    .expect(registerLogger.contains(record =>
      record.request.method === 'post' &&
      record.response.statusCode === 200 &&
      record.request.body.includes('"appid":"pryv-reg-standalone"') &&
      record.request.body.includes('"username":"tmodoux"') &&
      record.request.body.includes('"password":"mypass"') &&
      record.request.body.includes('"email":"test@test.com"') &&
      record.request.body.includes('"hosting":"gandi.net-fr"') &&
      record.request.body.includes('"username":"tmodoux"') &&
      record.request.body.includes('"languageCode":"en"') &&
      record.request.body.includes('"invitationtoken":"enjoy"')
    )).ok();
});
