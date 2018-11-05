// @ flow

import Context from '../../../Context.js';
import type ServiceInfos from '';

async function getServiceInfo (): ServiceInfos {
  const info = await Context.pryv.getServiceInfo();
  return info;
}

export default getServiceInfo;
