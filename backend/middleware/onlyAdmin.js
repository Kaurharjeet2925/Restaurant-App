module.exports = (req, res, next) => {
  console.log("onlyAdmin check - req.user:", req.user ? { id: req.user._id, role: req.user.role } : "NOT FOUND");
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: user not found in request" });
  }

  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: `Access denied: Only Admin can create users. Your role is: ${req.user.role}` });
  }

  next();
};
