const attemptsMap = new Map();

// Periodic cleanup of expired IP windows every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of attemptsMap.entries()) {
    if (now > data.resetTime) {
      attemptsMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 15; // Max 15 attempts per IP

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'ip_unknown';
    const now = Date.now();

    const record = attemptsMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      attemptsMap.set(ip, record);
      return next();
    }

    record.count += 1;
    attemptsMap.set(ip, record);

    if (record.count > max) {
      const waitMinutes = Math.ceil((record.resetTime - now) / 60000);
      return res.status(429).json({
        message: `Too many authentication attempts from this IP. Please wait ${waitMinutes} minute(s) before trying again.`
      });
    }

    next();
  };
}

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20
});

module.exports = {
  authLimiter,
  createRateLimiter
};

