class APIError extends Error {
  /**
   * Create an Error Object
   * @param {Number} status - The HTTP Status Code (e.g. 404)
   * @param {String} title - The title corresponding to the HTTP Status Code (e.g. Bad Request)
   * @param {String} message - Specific information about what caused the error
   */
  constructor(
    status = 500,
    title = 'Internal Server Error',
    message = 'Something bad happened.'
  ) {
    super(message); // call parent class constructor (Error) with message
    this.status = status;
    this.title = title;
    this.message = message;
    Error.captureStackTrace(this); // include the normal error stack trace for API errors
  }

  toJSON() {
    return {
      status: this.status,
      title: this.title,
      message: this.message
    };
  }
}
// class APIError extends Error {
//   constructor(
//     status = 500,
//     title = 'Internal Server Error',
//     message = 'Something Bad Happened.'
//   ) {
//     super(message);
//     this.status = status;
//     this.title = title;
//     this.message = message;
//     Error.captureStackTrace(this); // include the normal error stack trace for API error
//   }

//   toJSON() {
//     return {
//       error: {
//         status: this.status,
//         title: this.title,
//         message: this.message
//       }
//     };
//   }
// }

// // next(new APIError(401, 'unauthorized', 'You must auth first.'));

// // let global = {
// //   error: {
// //     title: 'Bad Request',
// //     message: 'Invalid type for password. Expected string.',
// //     status: 400
// //   }
// // };

module.exports = APIError; // any other file you use this, const APIError = require('./APIError')

// // any other file you want to use this
// const APIError = require('./APIError');
// // example
// new APIError(400, 'Bad Request', 'Invalid JSON body.');
