import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  // Customer login returns the token as JSON (stored in localStorage), not a
  // cookie — so check the Authorization header first, falling back to the
  // cookie for any flow that does use one.
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = bearerToken || req.cookies.token;

  if (!token) {
    return res.json({ success: false, message: 'Not Authorized token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.json({ success: false, message: 'Invalid token' });
    }

    req.userId = decoded.id; // ✅ safely attach to req
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;