const { supabaseAdmin } = require('../config/db');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && user) {
        req.user = user;
        return next();
      }
    }

    const anonymousId = req.headers['x-anonymous-id'];
    if (anonymousId && UUID_RE.test(anonymousId)) {
      req.anonymousId = anonymousId;
    }

    next();
  } catch (error) {
    next();
  }
}

module.exports = optionalAuth;
