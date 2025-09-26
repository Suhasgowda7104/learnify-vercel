const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      const userRole = req.user.role.toLowerCase();
      const hasRequiredRole = roles.some(role => role.toLowerCase() === userRole);

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in role verification'
      });
    }
  };
};

export default roleMiddleware;