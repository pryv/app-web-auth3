// @flow

type SubErrorData = {
  message: string,
  detail: ?string,
};

type SubErrors = Array<SubErrorData>;

type EncapsulatedError = {
  message: string,
  detail: ?string,
  data: SubErrors,
}

type ErrorData = {
  message: ?string,
  detail: ?string,
  errors: ?SubErrors,
  error: ?EncapsulatedError,
};

type UnparsedError = {
  response: {
    data: ErrorData,
  }
}

class AppError {
  msg: string;

  constructor (error: UnparsedError) {
    this.msg = this.parseError(error);
  }

  parseError (error: string | UnparsedError): string {
    // Error is a simple string
    if (typeof error === 'string') {
      return `<b>${error}</b>`;
    }

    // Error is lacking of information, declare it as unexpected
    if (error == null || error.response == null || error.response.data == null) {
      return `<b>${this.unexpectedError()}</b>`;
    }

    // Parse main error
    const errorData = error.response.data;
    const encapsulatedError = errorData.error;
    let errorMsg = `<b>${this.parseErrorData(encapsulatedError || errorData)}</b>`;

    // Parse additional sub errors
    const subErrors = encapsulatedError ? encapsulatedError.data : errorData.errors;
    errorMsg += this.parseSubErrors(subErrors);

    return errorMsg;
  }

  parseSubErrors (subErrors: ?SubErrors): string {
    let subErrorMsg = '';
    if (subErrors != null && Array.isArray(subErrors)) {
      subErrors.forEach(subError => {
        subErrorMsg += `<br/>${this.parseErrorData(subError)}`;
      });
    }
    return subErrorMsg;
  }

  parseErrorData (errorData: ErrorData | EncapsulatedError | SubErrorData): string {
    return errorData.detail || errorData.message || this.unexpectedError();
  }

  unexpectedError () {
    return 'Unexpected error';
  }
}

export default AppError;
