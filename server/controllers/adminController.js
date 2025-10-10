import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register Admin : /api/admin/register 
export const register = async(req,res) => {
    try{
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.json({success: false, message: 'Missing Details'});
        }

        const existingAdmin = await Admin.findOne({email});
        if(existingAdmin)
        {
            return res.json({success: false, message : 'Admin Already Exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({name, email, password: hashedPassword});

        const token = jwt.sign({id: admin._id}, process.env.JWT_SECRET, {expiresIn : '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({success: true, admin : {email : admin.email, name: admin.name }});
    }
    catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Login : /api/admin/login 

export const login = async(req,res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password ){
            return res.json({success: false, message: 'Email and password are required'});
        }

        const admin = await Admin.findOne({email});
        if(!admin){
            return res.json({success: false, message: 'Invalid Email'});
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            return res.json({success: false, message: 'Invalid Password'});
        }

        const token = jwt.sign({id : admin._id}, process.env.JWT_SECRET, {expiresIn : '7d'});

        res.cookie('token', token, {
            httpOnly : true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({success: true, admin: {email: admin.email, name: admin.name, adminId: admin._id}});
    }
    catch(error){
        console.login(error.message);
        res.json({success: true, message: error.message});
    }
}

// Check Auth : /api/admin/is-auth 
export const isAuth = async(req,res)=> {
    try{
        const admin = await Admin.findById(req.adminId).select('-password');

        if(!admin){
            return res.json({success: false, message: 'Admin Not Found'});
        }

        return res.json({ success: true, admin });
    }
    catch(error){
        console.log(error.message);
        return res.json({success: false, message: error.message});
    }
}

// Logout : /api/admin/logout 

export const logout = async (req,res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: process.env.NODE_ENV === 'production'?  'none': 'strict',
        });
        return res.status(200).json({ success: true, message: 'Logged Out'});
    }
    catch(error){
        console.log('Logout Error :', error.message);
        return res.status(500).json({success: false, message: error.message})
    }
}
