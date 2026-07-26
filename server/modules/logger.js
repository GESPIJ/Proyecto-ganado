/**
 * Logger mínimo: timestamp ISO + nivel sobre console. Sin dependencias.
 */
const write = (method, level) => (...args) => {
  console[method](`[${new Date().toISOString()}] [${level}]`, ...args);
};

module.exports = {
  debug: write('debug', 'DEBUG'),
  info: write('info', 'INFO'),
  log: write('log', 'INFO'),
  warn: write('warn', 'WARN'),
  error: write('error', 'ERROR'),
};
