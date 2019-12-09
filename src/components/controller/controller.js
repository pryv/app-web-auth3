// @flow

import type Context from '../../context.js';

import AppError from '../models/AppError.js';
import acceptAccess from './ops/accept_access.js';
import changePassword from './ops/change_password.js';
import checkAccess from './ops/check_access.js';
import createUser from './ops/create_user.js';
import loadHostings from './ops/load_hostings.js';
import login from './ops/login.js';
import refuseAccess from './ops/refuse_access.js';
import resetPassword from './ops/reset_password.js';
import getServiceInfo from './ops/get_service_info.js';
import checkUsername from './ops/check_username.js';
import mfaVerify from './ops/mfa_verify.js';

function tryAndCatch (ctx, fun) {
  return async (...args: Array<*>) => {
    try {
      return await fun(ctx, ...args);
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      } else {
        throw new AppError(err);
      }
    }
  };
}

function controllerFactory (ctx: Context) {
  return {
    acceptAccess: tryAndCatch(ctx, acceptAccess),
    changePassword: tryAndCatch(ctx, changePassword),
    checkAccess: tryAndCatch(ctx, checkAccess),
    createUser: tryAndCatch(ctx, createUser),
    loadHostings: tryAndCatch(ctx, loadHostings),
    login: tryAndCatch(ctx, login),
    refuseAccess: tryAndCatch(ctx, refuseAccess),
    resetPassword: tryAndCatch(ctx, resetPassword),
    getServiceInfo: tryAndCatch(ctx, getServiceInfo),
    checkUsername: tryAndCatch(ctx, checkUsername),
    mfaVerify: tryAndCatch(ctx, mfaVerify),
  };
}

export default controllerFactory;
