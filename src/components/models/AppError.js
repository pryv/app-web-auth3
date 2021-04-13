// @flow

type SubErrorData = {
  message: string,
  detail: ?string,
};

type SubErrors = Array<SubErrorData>;

type ValidationError = {
  code: ?string,
  message: string,
  param: ?string,
  path: ?string
}

type EncapsulatedError = {
  message: string,
  detail: ?string,
  data: ?any,
  body: SubErrors,
}

type ErrorData = {
  message: ?string,
  detail: ?string,
  errors: ?SubErrors,
  error: ?EncapsulatedError,
};

type UnparsedError = {
  response: {
    body: ErrorData,
  }
}

class AppError {
  msg: string;

  constructor (error: string | UnparsedError) {
    this.msg = this.parseError(error);
  }

  parseError (error: string | UnparsedError): string {
    console.error(error);

    // Error is a simple string
    if (typeof error === 'string') {
      return `<b>${error}</b>`;
    }

    // Error is lacking of information, declare it as unexpected
    if (error == null || error.response == null || error.response.body == null) {
      return `<b>${this.unexpectedError()}</b>`;
    }

    // Parse main error
    const errorData = error.response.body;
    const encapsulatedError = errorData.error;
    let errorMsg = `<b>${this.parseErrorData(encapsulatedError || errorData)}</b>`;

    // Parse additional sub errors

    const subErrors = encapsulatedError ? encapsulatedError.body : errorData.errors;
    errorMsg += this.parseSubErrors(subErrors);

    // error formats are not unified and nested errors could appear in error:data,
    // so handle those suberrors too
    if (encapsulatedError && encapsulatedError.data && Array.isArray(encapsulatedError.data)) {
      errorMsg += this.parseValidationSubErrors(encapsulatedError.data);
    }

    return errorMsg;
  }

  parseValidationSubErrors (subErrors: ?Array<ValidationError>): string {
    let subErrorMsg = '';
    if (subErrors != null && Array.isArray(subErrors)) {
      subErrors.forEach(subError => {
        subErrorMsg += `<br/>${subError.message}`;
      });
    }
    return subErrorMsg;
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

  unexpectedError (): string {
    return 'Unexpected error';
  }
}

export default AppError;
