// @flow

import type Context from '../../../Context.js';
import type {AuthState, TerminationAuthState, NeedSigninState} from '../../models/AuthStates.js';
import {NEED_SIGNIN_STATUS} from '../../models/AuthStates.js';
import checkUsername from './check_username.js';
import closeOrRedirect from './close_or_redirect.js';
import AppError from '../../models/AppError.js';

async function login (
  ctx: Context,
  password: string): Promise<void> {
  // Retrieve auth request parameters
  const authState: AuthState = await ctx.pryv.poll(ctx.pollKey);
  switch (authState.status) {
    case NEED_SIGNIN_STATUS:
      // Auth request is pending
      const needSigninState: NeedSigninState = authState;
      ctx.updateFromAuthState(needSigninState);
      break;
    default:
      // Auth request was already accepted or terminated (error/refused)
      const terminationAuthState: TerminationAuthState = authState;
      return closeOrRedirect(ctx, terminationAuthState);
  }

  await checkUsername(ctx);

  const username = ctx.user.username;
  // Login against Pryv

  try {
    const res = await ctx.pryv.login(
      username,
      password,
      ctx.appId);

    ctx.user.personalToken = res.token || '';
  } catch (err) {
    // MFA is required
    if (err.response != null && err.response.data != null && err.response.data.mfaToken != null) {
      const mfaToken = err.response.data.mfaToken;
      try {
        await ctx.pryv.mfaChallenge(username, mfaToken);
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
