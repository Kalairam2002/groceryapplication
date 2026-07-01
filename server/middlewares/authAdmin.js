import jwt from 'jsonwebtoken';

const authAdmin = (req, res, next) => {
    // Check cookie first, then Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) {
            return res.json({ success: false, message: 'Invalid Token' });
        }
        req.adminId = decoded.id;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default authAdmin;
