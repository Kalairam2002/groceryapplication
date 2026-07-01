import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  const { token } = req.cookies;

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
