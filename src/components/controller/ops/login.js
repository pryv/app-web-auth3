// @flow

import type Context from '../../../context.js';
import { NEED_SIGNIN_STATUS } from '../../models/AccessStates.js';
import checkUsername from './check_username.js';
import closeOrRedirect from './close_or_redirect.js';
import AppError from '../../models/AppError.js';

async function login (
  ctx: Context,
  password: string): Promise<void> {
  if (ctx.accessState && ctx.accessState.status !== NEED_SIGNIN_STATUS) {
    return closeOrRedirect(ctx);
  }

  await checkUsername(ctx);

  const username = ctx.user.username;
  // Login against Pryv

  try {
    const pryvConnection = await ctx.pryvService.loginWithThrow(
      username,
      password,
      ctx.appId);

    ctx.user.personalToken = pryvConnection.token || '';
  } catch (err) {
    // MFA is required
    if (err.response != null && err.response.body != null && err.response.body.mfaToken != null) {
      const mfaToken = err.response.body.mfaToken;
      try {
        await ctx.pryvService.mfaChallenge(username, mfaToken);
        ctx.user.mfaToken = mfaToken || '';
      } catch (err) {
        throw new AppError('Failed to perform MFA challenge.');
      }
    } else {
      throw new AppError('Failed to login.');
    }
  }
}

export default login;
