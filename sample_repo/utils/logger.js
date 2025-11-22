/**
 * Logger Utility - Centralized logging system
 */

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
};

function getTimestamp() {
  return new Date().toISOString();
}

function formatLog(level, message, data) {
  const timestamp = getTimestamp();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

function log(level, message, data = null) {
  const formattedLog = formatLog(level, message, data);
  console.log(formattedLog);
  return formattedLog;
}

function debug(message, data) {
  return log(LogLevel.DEBUG, message, data);
}

function info(message, data) {
  return log(LogLevel.INFO, message, data);
}

function warn(message, data) {
  return log(LogLevel.WARN, message, data);
}

function error(message, data) {
  return log(LogLevel.ERROR, message, data);
}

function success(message, data) {
  return log(LogLevel.SUCCESS, message, data);
}

function logRequest(method, path, statusCode) {
  return info(`${method} ${path}`, { statusCode });
}

function logError(errorMessage, context) {
  return error(errorMessage, { context });
}

module.exports = {
  LogLevel,
  log,
  debug,
  info,
  warn,
  error,
  success,
  logRequest,
  logError,
  getTimestamp,
  formatLog
};
