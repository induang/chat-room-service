const logger = require('../loggers/devLogger')

requestLoggerMiddleware = (req, res, next) => {
  logger.http(`[${req.method}]: ${req.originalUrl}`);
  Object.keys(req.query).length !== 0 && logger.http(` ----query: ${JSON.stringify(req.query)}`);
  Object.keys(req.params).length !== 0 && logger.http(` ----params: ${JSON.stringify(req.params)}`);
  Object.keys(req.body).length !== 0 && logger.http(` ----body: ${JSON.stringify(req.body)}`);
  next();
}

module.exports = requestLoggerMiddleware
