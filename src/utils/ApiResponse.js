exports.success = (res, data, statusCode = 200, meta = undefined) =>
  res.status(statusCode).json({ success: true, data, ...(meta && { meta }) });

exports.created = (res, data) => exports.success(res, data, 201);