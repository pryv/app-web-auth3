// @ flow

import type Context from '../../../Context.js';
import checkUsername from './check_username.js';

async function login (
  ctx: Context,
  usernameOrEmail: string,
  password: string): [string, string] {
  const username = await checkUsername(ctx, usernameOrEmail);

  // Login against Pryv
  const personalToken = await ctx.pryv.login(username, password);
  return [username, personalToken];
}

export default login;
