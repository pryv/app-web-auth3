
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

function tryAndCatch (ctx, errorCb, fun) {
  return async (...args) => {
    try {
      return await fun(...args);
    } catch (err) {
      errorCb(new AppError(err).msg);
    }
  };
}

function controllerFactory (ctx, errorCb) {
  return {
    acceptAccess: tryAndCatch(ctx, errorCb, acceptAccess),
    changePassword: tryAndCatch(ctx, errorCb, changePassword),
    checkAccess: tryAndCatch(ctx, errorCb, checkAccess),
    createUser: tryAndCatch(ctx, errorCb, createUser),
    loadHostings: tryAndCatch(ctx, errorCb, loadHostings),
    login: tryAndCatch(ctx, errorCb, login),
    refuseAccess: tryAndCatch(ctx, errorCb, refuseAccess),
    resetPassword: tryAndCatch(ctx, errorCb, resetPassword),
    getServiceInfo: tryAndCatch(ctx, errorCb, getServiceInfo),
  };
}

export default controllerFactory;
