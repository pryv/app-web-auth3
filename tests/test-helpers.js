const domain = 'pryv.li';
const Pryv = require('pryv');

const testHelpers = {
  serviceInfoUrl: 'https://reg.pryv.li/service/info',
  user: 'js-lib',
  email: 'test@test.com',
  password: 'js-libpass',
  appId: 'pryv-app-web-auth-3',
  requestingAppId: 'client-app',
  pollKey: 'pollKey',
  serviceInfo: null,
  apiEndpoint: null,
  pollUrl: null,
  needSigninState: {
    "status": "NEED_SIGNIN",
    "code": 201,
    "key": "pollKey",
    "requestingAppId": null,
    "requestedPermissions": null,
    "url": "https://sw.rec.la:4443/access/access.html?lang=fr&key=RKHRTvKlaUDQodGX&requestingAppId=test-value-notes&domain=pryv.li&registerURL=https%3A%2F%2Freg.pryv.li%2F&poll=https%3A%2F%2Faccess.pryv.li%2Faccess%2FRKHRTvKlaUDQodGX",
    "authUrl": "https://sw.rec.la:4443/access/access.html?&pollUrl=https%3A%2F%2Faccess.pryv.li%2Faccess%2FRKHRTvKlaUDQodGX",
    "poll": "https://access.pryv.li/access/pollKey",
    "returnURL": null,
    "oaccessState": null,
    "poll_rate_ms": 1000,
    "clientData": {
      "app-web-auth:description": {
        "type": "note/txt",
        "content": "This is a consent message."
      }
    },
    "lang": "en",
    "serviceInfo": null
  }
}

testHelpers.load = async function () {
  const service = new Pryv.Service(testHelpers.serviceInfoUrl);
  testHelpers.serviceInfo = await service.info();
  testHelpers.needSigninState.serviceInfo = testHelpers.serviceInfo;
  testHelpers.apiEndpoint = await service.apiEndpointFor(testHelpers.user);
  testHelpers.pollUrl = testHelpers.serviceInfo.access + testHelpers.pollKey;
  console.log(testHelpers.serviceInfo);
  return true;
}

module.exports = testHelpers;