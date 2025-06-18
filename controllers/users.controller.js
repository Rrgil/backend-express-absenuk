import Users from "../models/users.model.js";
import GroupUser from "../models/group_users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import multer from "multer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk mengambil semua data users
export const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'id_groups_users', 'username', 'nama', 'email', 'image', 'status'],
            include: [{
                model: GroupUser,
                as: 'group',
                attributes: ['group_nama']
            }]
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Fungsi untuk mengambil data user berdasarkan id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Users.findOne({
            where: {
                id: id
            },
            include: [{
                model: GroupUser,
                as: 'group',
                attributes: ['group_nama']
            }]
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Fungsi untuk menambahkan user baru
export const createUser = async (req, res) => {
    try {
        // Periksa apakah ada file yang diupload
        console.log('File upload:', req.file);

        const { nama, id_groups_users, username, email, password } = req.body;

        // Validasi input
        if (!nama || !id_groups_users || !username || !email || !password) {
            return res.status(400).json({
                statusCode: 400,
                message: "Mohon lengkapi semua field yang wajib diisi",
                data: null
            });
        }

        // Cek username unik
        const existingUsername = await Users.findOne({
            where: {
                username
            }
        });

        if (existingUsername) {
            return res.status(400).json({
                statusCode: 400,
                message: "Username sudah digunakan",
                data: null
            });
        }

        // Cek email unik
        const existingEmail = await Users.findOne({
            where: {
                email
            }
        });

        if (existingEmail) {
            return res.status(400).json({
                statusCode: 400,
                message: "Email sudah digunakan",
                data: null
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Ambil path gambar jika ada upload
        const imagePath = req.file ? `/uploads/users/${req.file.filename}` : null;

        // Simpan user baru
        const newUser = await Users.create({
            nama,
            id_groups_users,
            username,
            email,
            password: hashedPassword,
            image: imagePath,
            status: 1
        });

        res.status(201).json({
            statusCode: 201,
            message: "Berhasil menambahkan pengguna baru",
            data: {
                id: newUser.id,
                nama: newUser.nama,
                username: newUser.username,
                email: newUser.email,
                id_groups_users: newUser.id_groups_users,
                image: newUser.image
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);

        // Handle Multer errors
        if (error.name === 'MulterError') {
            return res.status(400).json({
                statusCode: 400,
                message: `Error upload gambar: ${error.message}`,
                data: null
            });
        }

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                statusCode: 400,
                message: error.errors[0].message,
                data: null
            });
        }

        // Handle Sequelize unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                statusCode: 400,
                message: "Username atau email sudah digunakan",
                data: null
            });
        }

        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat menambahkan pengguna",
            data: null
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Users.findByPk(id);

        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User tidak ditemukan"
            });
        }

        const { nama, id_groups_users, username, email, password } = req.body;

        // Validasi input dasar
        if (!nama || !id_groups_users || !username || !email) {
            return res.status(400).json({
                statusCode: 400,
                message: "Mohon lengkapi semua field yang wajib diisi"
            });
        }

        // Cek duplikasi username jika diubah
        if (username !== user.username) {
            const existingUsername = await Users.findOne({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({ statusCode: 400, message: "Username sudah digunakan" });
            }
        }

        // Cek duplikasi email jika diubah
        if (email !== user.email) {
            const existingEmail = await Users.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ statusCode: 400, message: "Email sudah digunakan" });
            }
        }

        const updateData = {
            nama,
            id_groups_users,
            username,
            email,
        };

        // Hash password jika ada perubahan
        if (password) {
            updateData.password = await bcrypt.hash(password, 12);
        }

        // Handle image update
        if (req.file) {
            const newImagePath = `/uploads/users/${req.file.filename}`;
            // Hapus gambar lama jika ada
            if (user.image) {
                const oldImagePath = path.join(__dirname, '..', user.image.substring(1));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = newImagePath;
        }

        await Users.update(updateData, { where: { id } });

        const updatedUser = await Users.findByPk(id, {
            attributes: ['id', 'nama', 'username', 'email', 'id_groups_users', 'image']
        });

        res.status(200).json({
            statusCode: 200,
            message: "Berhasil memperbarui pengguna",
            data: updatedUser
        });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan pada server",
            error: error.message
        });
    }
};

// Fungsi untuk menghapus data user berdasarkan ID
export const deleteUser = async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: 'User tidak ditemukan'
            });
        }

        // Soft delete dengan mengubah status menjadi 0
        user.status = 0;
        await user.save();

        return res.status(200).json({
            statusCode: 200,
            message: 'Data user berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengambil token dari request
export const getTokenFromRequest = (req) => {
    // Cek token dari cookie terlebih dahulu
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    // Jika tidak ada di cookie, cek header Authorization sebagai fallback
    const authHeader = req.headers.authorization;
    return authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
};

// Fungsi untuk memverifikasi token dan mendapatkan user ID
const verifyTokenAndGetUserId = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.id || decoded.userId, error: null };
    } catch (error) {
        return { userId: null, error };
    }
};

// Fungsi untuk menangani error token
const handleTokenError = (res, error) => {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
            statusCode: 401,
            message: "Token tidak valid atau kadaluarsa"
        });
    }
    return null;
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        // Ambil userId dari middleware yang sudah memverifikasi token
        const userId = req.user.id;

        // Cari user berdasarkan ID
        const user = await Users.findOne({
            where: {
                id: userId,
                status: 1 // Hanya ambil user yang aktif
            },
            attributes: ['id', 'username', 'email', 'nama', 'image', 'id_groups_users']
        });

        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User tidak ditemukan"
            });
        }
        
        // Ambil data group user secara terpisah
        let groupUserData = null;
        if (user.id_groups_users) {
            const groupUser = await GroupUser.findByPk(user.id_groups_users);
            if (groupUser) {
                groupUserData = {
                    id: groupUser.id,
                    nama: groupUser.group_nama
                };
            }
        }

        // Format response
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            nama: user.nama,
            image: user.image,
            group_user: groupUserData
        };

        return res.status(200).json({
            statusCode: 200,
            message: "Berhasil mengambil data profil",
            data: userData
        });

    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat mengambil data profil",
            error: error.message
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nama, email, username } = req.body;

        // Validasi input wajib
        if (!nama || !email || !username) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama, email, dan username wajib diisi"
            });
        }

        const currentUser = await Users.findByPk(userId);
        if (!currentUser) {
            return res.status(404).json({
                statusCode: 404,
                message: "User tidak ditemukan"
            });
        }

        // Cek username dan email unik jika berubah
        if (username !== currentUser.username || email !== currentUser.email) {
            const existingUser = await Users.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        { username: username },
                        { email: email }
                    ],
                    id: { [Sequelize.Op.ne]: userId }
                }
            });

            if (existingUser) {
                if (existingUser.username === username) {
                    return res.status(400).json({ statusCode: 400, message: "Username sudah digunakan" });
                }
                if (existingUser.email === email) {
                    return res.status(400).json({ statusCode: 400, message: "Email sudah digunakan" });
                }
            }
        }

        const updateData = {
            nama,
            email,
            username
        };

        // Jika ada file foto baru yang diupload
        if (req.file) {
            updateData.image = `/uploads/users/${req.file.filename}`;
            
            // Hapus gambar lama jika ada
            if (currentUser.image) {
                try {
                    const oldImagePath = path.join(process.cwd(), currentUser.image.replace(/^\//, ''));
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (fsError) {
                    console.error('Error saat menghapus gambar lama:', fsError);
                }
            }
        }

        // Update data user
        await Users.update(updateData, {
            where: { id: userId }
        });

        const updatedUser = await Users.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'nama', 'image', 'id_groups_users']
        });
        
        let groupUserData = null;
        if (updatedUser.id_groups_users) {
            const groupUser = await GroupUser.findByPk(updatedUser.id_groups_users);
            if (groupUser) {
                groupUserData = {
                    id: groupUser.id,
                    nama: groupUser.group_nama
                };
            }
        }
        
        const responseData = {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            nama: updatedUser.nama,
            image: updatedUser.image,
            group_user: groupUserData
        };

        return res.status(200).json({
            statusCode: 200,
            message: "Profil berhasil diperbarui",
            data: responseData
        });

    } catch (error) {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({
                statusCode: 400,
                message: `Error saat upload file: ${error.message}`
            });
        }
        console.error('Error in updateProfile:', error);
        return res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat memperbarui profil",
            error: error.message
        });
    }
};

// Update password
export const updatePassword = async (req, res) => {
    try {
        // Ambil userId dari middleware yang sudah memverifikasi token
        const userId = req.user.id;

        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validasi input
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                statusCode: 400,
                message: "Password lama, password baru, dan konfirmasi password harus diisi"
            });
        }
        
        // Validasi password baru dan konfirmasi password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                statusCode: 400,
                message: "Password baru dan konfirmasi password tidak sama"
            });
        }
        
        // Validasi panjang password minimal 6 karakter
        if (newPassword.length < 6) {
            return res.status(400).json({
                statusCode: 400,
                message: "Password baru minimal 6 karakter"
            });
        }

        // Cari user dan verifikasi password lama
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User tidak ditemukan"
            });
        }
        
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                statusCode: 400,
                message: "Password lama tidak sesuai"
            });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await Users.update(
            { password: hashedPassword },
            { where: { id: userId } }
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Password berhasil diperbarui"
        });

    } catch (error) {
        console.error('Error in updatePassword:', error);
        return res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat memperbarui password",
            error: error.message
        });
    }
};

// Fungsi untuk Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({
                statusCode: 400,
                message: "Username dan password harus diisi",
                data: null
            });
        }

        // Cari user berdasarkan username
        const user = await Users.findOne({
            where: {
                username: username
            },
            include: [{
                model: GroupUser,
                as: 'group',
                attributes: ['group_nama']
            }]
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "Username tidak ditemukan",
                data: null
            });
        }

        // Verifikasi password menggunakan bcrypt
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({
                statusCode: 401,
                message: "Password salah",
                data: null
            });
        }

        // Cek status user aktif
        if (user.status !== 1) {
            return res.status(403).json({
                statusCode: 403,
                message: "Akun tidak aktif",
                data: null
            });
        }

        // Buat token JWT
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                nama: user.nama
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Set token di cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 jam
        });

        // Kirim response
        res.status(200).json({
            statusCode: 200,
            message: "Login berhasil",
            data: {
                token: token, // Kirim token untuk disimpan di localStorage
            }
        });

    } catch (error) {
        console.error("Error saat login:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan pada server",
            data: null
        });
    }
}

// Fungsi untuk Logout
export const logout = async (req, res) => {
    try {
        // Hapus token dari cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Kirim response
        res.status(200).json({
            statusCode: 200,
            message: "Logout berhasil",
            data: null
        });
    } catch (error) {
        console.error("Error saat logout:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan pada server",
            data: null
        });
    }
}

