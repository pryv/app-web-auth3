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
  apiEndpoint: null
}

testHelpers.load = async function () {
  const service = new Pryv.Service(testHelpers.serviceInfoUrl);
  testHelpers.serviceInfo = await service.info();
  testHelpers.apiEndpoint = await service.apiEndpointFor(testHelpers.user);
  console.log(testHelpers.serviceInfo);
  return true;
}

module.exports = testHelpers;