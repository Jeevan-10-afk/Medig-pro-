export function log(level, msg, meta = {}) {
  const entry = { ts: new Date().toISOString(), level, msg, ...meta };
  // keep it simple: console.log an object for structured logging
  console.log(JSON.stringify(entry));
}

export const info = (msg, meta) => log('info', msg, meta);
export const warn = (msg, meta) => log('warn', msg, meta);
export const error = (msg, meta) => log('error', msg, meta);
