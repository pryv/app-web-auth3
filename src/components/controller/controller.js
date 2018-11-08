// @ flow

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

function tryAndCatch (ctx, fun) {
  return async (...args) => {
    try {
      return await fun(ctx, ...args);
    } catch (err) {
      throw new AppError(err);
    }
  };
}

function controllerFactory (ctx) {
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
  };
}

export default controllerFactory;
