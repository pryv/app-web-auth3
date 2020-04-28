// @flow

import type Context from '../../../context.js';

export type NewUser = {
  username: string,
  server: string,
};

async function createUser (
  ctx: Context,
  password: string,
  email: string,
  hosting: string,
): Promise<NewUser> {
  // Create the new user
  let referer = null;
  if (ctx.accessState) {
    referer = ctx.accessState.referer || ctx.accessState.requestingAppId;
  };
  const newUser = await ctx.pryvService.createUser(
    ctx.user.username,
    password,
    email,
    hosting,
    ctx.language,
    ctx.appId,
    null, // <== invitation token should go here
    referer);
  return newUser;
}

export default createUser;
