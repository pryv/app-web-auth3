// @flow

const ACCEPTED_STATUS = 'ACCEPTED';
const REFUSED_STATUS = 'REFUSED';
const ERROR_STATUS = 'ERROR';

class AuthState {
  status: string;

  constructor (status) {
    this.status = status;
  }
}

class AcceptedState extends AuthState {
  username: string;
  token: string;

  constructor (username, token) {
    super(ACCEPTED_STATUS);
    this.username = username;
    this.token = token;
  }
}

class RefusedState extends AuthState {
  reasonID: number;
  message: string;

  constructor (reasonID, message) {
    super(REFUSED_STATUS);
    this.reasonID = reasonID;
    this.message = message;
  }
}

class ErrorState extends AuthState {
  id: number;
  message: string;
  detail: string;

  constructor (id, message, detail) {
    super(ERROR_STATUS);
    this.id = id;
    this.message = message;
    this.detail = detail;
  }
}
