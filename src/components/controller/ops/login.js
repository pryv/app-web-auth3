// @flow

import type Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function login (
  ctx: Context,
  password: string): Promise<void> {
  await checkUsername(ctx);

  // Login against Pryv
  ctx.user.personalToken = await ctx.pryv.login(
    ctx.user.username,
    password,
    ctx.appId);
}

export default login;
