// @flow

const ACCEPTED_STATUS = 'ACCEPTED';
const REFUSED_STATUS = 'REFUSED';
const ERROR_STATUS = 'ERROR';

export class AcceptedAuthState {
  body : {
    status: string,
    username: string,
    token: string,
  }

  constructor (username: string, token: string) {
    this.body = {
      status: ACCEPTED_STATUS,
      username: username,
      token: token,
    };
  }
}

export class RefusedAuthState {
  body: {
    status: string,
    reasonId: string,
    message: string,
  }

  constructor (reasonId: ?string, message: ?string) {
    this.body = {
      status: REFUSED_STATUS,
      reasonId: reasonId || 'REFUSED_BY_USER',
      message: message || 'The user refused to give access to the requested permissions',
    };
  }
}

export class ErrorAuthState {
  body: {
    status: string,
    id: number;
    message: string;
    detail: string;
  }

  constructor (id: number, message: string, detail: string) {
    this.body = {
      status: ERROR_STATUS,
      id: id,
      message: message,
      detail: detail,
    };
  }
}
