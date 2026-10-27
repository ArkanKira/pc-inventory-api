class ApiError extends Error {
  constructor(statusCode, message, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(msg, code = 'BAD_REQUEST')   { return new ApiError(400, msg, code); }
  static unauthorized(msg = 'Authentication required', code = 'UNAUTHORIZED') { return new ApiError(401, msg, code); }
  static forbidden(msg = 'Access denied', code = 'FORBIDDEN')    { return new ApiError(403, msg, code); }
  static notFound(msg = 'Resource not found', code = 'NOT_FOUND') { return new ApiError(404, msg, code); }
  static conflict(msg, code = 'CONFLICT')        { return new ApiError(409, msg, code); }
  static internal(msg = 'Internal server error') { return new ApiError(500, msg, 'INTERNAL'); }
}

module.exports = ApiError;