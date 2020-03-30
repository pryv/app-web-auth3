// @flow

import type Context from '../../../Context.js';
import AppError from '../../models/AppError.js';

async function mfaVerify (
  ctx: Context,
  code: string): Promise<void> {
  // Verify the MFA challenge
  try {
    ctx.user.personalToken = await ctx.pryvService.mfaVerify(ctx.user.username, ctx.user.mfaToken, code);
  } catch (err) {
    throw new AppError('MFA verification failed.');
  }
}

export default mfaVerify;
