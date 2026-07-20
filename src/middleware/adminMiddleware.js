// Admin middleware: ensures the authenticated user has admin privileges.
export function requireAdmin(req, res, next) {
	try {
		const user = req.user;

		// If there is no user credentials in the request: 
		if (!user) {
			return res.status(401).json({ success: false, message: 'Authentication required' });
		}

		const userRole = typeof user.role === 'string' ? user.role.toLowerCase() : null;

		if (!userRole) {
			return res.status(403).json({ success: false, message: 'Admin access required' });
		}

		if (!['admin', 'referee'].includes(userRole)) {
			return res.status(403).json({ success: false, message: 'Admin access required' });
		}

		return next();
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('requireAdmin middleware error:', err);
		return res.status(500).json({ success: false, message: 'Internal server error' });
	}
}

export default requireAdmin;
