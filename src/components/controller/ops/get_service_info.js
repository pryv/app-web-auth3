// @flow

import type Context from '../../../Context.js';
import type ServiceInfos from '../../models/Pryv.js';

async function getServiceInfo (ctx: Context): Promise<ServiceInfos> {
  const info = await ctx.pryv.getServiceInfo();
  return info;
}

export default getServiceInfo;
