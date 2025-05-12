// middleware/roleMiddleware.js
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
      if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied. Role not permitted.' });
      }
      next();
    };
  };
  
  module.exports = authorizeRole;
  