// @flow

import type Context from '../../../context.js';

export type ServiceInfos = {
  version: string,
  register: string,
  access: string,
  api: string,
  name: string,
  home: string,
  support: string,
  terms: string,
}

async function getServiceInfo (ctx: Context): Promise<ServiceInfos> {
  const info = await ctx.pryvService.info();
  return info;
}

export default getServiceInfo;
