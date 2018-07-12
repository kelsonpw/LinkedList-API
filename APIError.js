class APIError extends Error {
  constructor(
    status = 500,
    title = 'Internal Server Error',
    message = 'Something Bad Happened.'
  ) {
    super(message);
    this.status = status;
    this.title = title;
    this.message = message;
    Error.captureStackTrace(this); // include the normal error stack trace for API error
  }

  toJSON() {
    return {
      error: {
        status: this.status,
        title: this.title,
        message: this.message
      }
    };
  }
}

// next(new APIError(401, 'unauthorized', 'You must auth first.'));

// let global = {
//   error: {
//     title: 'Bad Request',
//     message: 'Invalid type for password. Expected string.',
//     status: 400
//   }
// };

module.exports = APIError; // any other file you use this, const APIError = require('./APIError')
