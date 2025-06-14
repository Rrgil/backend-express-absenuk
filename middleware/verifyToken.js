import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Generate token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // bisa kamu ganti dengan throw err kalau mau lebih strict
  }
};

// Middleware untuk autentikasi
const authMiddleware = (req, res, next) => {
  try {
    // Cek token dari cookie
    const token = req.cookies.token;
    
    // Jika tidak ada token di cookie, cek di header Authorization
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token) {
          const decoded = verifyToken(token);
          if (decoded) {
            req.user = decoded;
            return next();
          }
        }
      }
      return res.status(401).json({ 
        statusCode: 401,
        message: "Token tidak valid", 
        data: null 
      });
    }
    
    // Jika tidak ada token sama sekali
    if (!token) {
      return res.status(401).json({ 
        statusCode: 401,
        message: "Akses ditolak, silakan login", 
        data: null 
      });
    }
    
    // Verifikasi token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        statusCode: 401,
        message: "Token tidak valid atau kadaluarsa", 
        data: null 
      });
    }
    
    // Simpan data user di request untuk digunakan di controller
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error autentikasi:", error);
    return res.status(500).json({ 
      statusCode: 500,
      message: "Terjadi kesalahan pada server", 
      data: null 
    });
  }
};



export default {
  generateToken,
  verifyToken,
  authMiddleware
};
