// @ flow

import type Context from '../../../Context.js';
import type ServiceInfos from '';

async function getServiceInfo (ctx: Context): ServiceInfos {
  const info = await ctx.pryv.getServiceInfo();
  return info;
}

export default getServiceInfo;
