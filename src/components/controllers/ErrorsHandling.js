class ErrorsHandling {
  handler (fun) {
    return async (next, ...params) => {
      try {
        const res = await fun(params);
        return next(res);
      } catch (err) {
        return next(err);
      }
    };
  }
}

export default ErrorsHandling;
