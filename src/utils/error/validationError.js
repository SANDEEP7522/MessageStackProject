// that component we use again and again in our code that make that type of code

import { StatusCodes } from 'http-status-codes';

class validationError extends Error {
  constructor(errorDetails, message) {
    super(message);
    this.name = 'ValidationError';
    let explanation = [];
    Object.keys(errorDetails.error).forEach((key) => {
      explanation.push(errorDetails.error[key]);
    });
    this.explanation = explanation;
    this.message = message;
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}
export default validationError;