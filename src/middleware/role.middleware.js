const db = require('@core/database');

const requireAdmin = (req, res, next) => {
  const userId = req.user.userId;

  db.get('SELECT is_admin FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user || !user.is_admin) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
    }
    next();
  });
};

module.exports = requireAdmin;
