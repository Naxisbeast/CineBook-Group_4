function requireRole(...roles) {
  const allowedRoles = roles.flat();

  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'You must be logged in to access this resource.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }

    return next();
  };
}

module.exports = requireRole;
