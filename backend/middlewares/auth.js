
function requireAdminView(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.redirect('/admin/login');
}

function requireAdminApi(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.status(401).json({
    ok: false,
    mensaje: 'No autorizado: iniciá sesión como administrador en /admin/login',
  });
}

module.exports = { requireAdminView, requireAdminApi };
