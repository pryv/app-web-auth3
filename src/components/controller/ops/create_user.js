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
  const newUser = await ctx.pryvService.createUser(
    ctx.user.username,
    password,
    email,
    hosting,
    ctx.language,
    ctx.appId);
  return newUser;
}

export default createUser;
