import Users from "../models/users.model.js";
import GroupUser from "../models/group_users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { uploadUserSingle } from "../config/multer.config.js";
import multer from "multer";

dotenv.config();

// Fungsi untuk mengambil semua data users
export const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll();
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
        // Handle file upload
        upload2(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Error uploading file: ' + err.message
                });
            } else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }

            const { id } = req.params;
            console.log('Raw body:', req.body);
            console.log('Files:', req.file);

            // Ambil data dari form-data
            const nama = req.body.nama || '';
            const group_id = req.body.group_id || '';
            const username = req.body.username || '';
            const email = req.body.email || '';
            const no_telp = req.body.no_telp || '';
            const alamat = req.body.alamat || null;
            const password = req.body.password;

            // Validasi data wajib
            if (!nama || !group_id || !username || !email || !no_telp) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Nama, group, username, email, dan no telepon wajib diisi'
                });
            }

            // Cek apakah user ada
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User tidak ditemukan'
                });
            }

            console.log('User yang akan diupdate:', user.toJSON());

            // Update data user
            const updateData = {
                nama: nama,
                group_id: parseInt(group_id),
                username: username,
                email: email,
                no_telp: no_telp,
                alamat: alamat,
                updated_at: new Date()
            };

            // Update password jika ada
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }

            // Update foto jika ada
            if (req.file) {
                updateData.image = req.file.filename;
            }

            console.log('Data yang akan diupdate:', updateData);

            // Update user
            const [updatedRows] = await User.update(updateData, {
                where: { id: parseInt(id) }
            });

            if (updatedRows === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Gagal mengupdate data user'
                });
            }

            // Ambil data user yang sudah diupdate
            const updatedUser = await User.findByPk(id);

            res.json({
                status: 'success',
                message: 'Berhasil mengupdate data user',
                data: {
                    id: updatedUser.id,
                    nama: updatedUser.nama,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    no_telp: updatedUser.no_telp,
                    alamat: updatedUser.alamat,
                    foto: updatedUser.image,
                    group_id: updatedUser.group_id
                }
            });
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Gagal mengupdate data user'
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
        // Ambil userId dari middleware yang sudah memverifikasi token
        const userId = req.user.id;

        // Cari user untuk mendapatkan gambar lama jika ada
        const currentUser = await Users.findByPk(userId);
        if (!currentUser) {
            return res.status(404).json({
                statusCode: 404,
                message: "User tidak ditemukan"
            });
        }

        // Gunakan middleware upload
        // Catatan: field di form-data harus bernama 'image'
        uploadUserSingle('image')(req, res, async function (err) {
            if (err) {
                return res.status(400).json({
                    statusCode: 400,
                    message: err instanceof multer.MulterError 
                        ? `Error saat upload file: ${err.message}` 
                        : err.message
                });
            }

            try {
                const { nama, email, username } = req.body;
                
                // Validasi input wajib
                if (!nama || !email || !username) {
                    return res.status(400).json({
                        statusCode: 400,
                        message: "Nama, email, dan username wajib diisi"
                    });
                }
                
                // Cek username dan email unik
                const existingUser = await Users.findOne({
                    where: {
                        [Sequelize.Op.or]: [
                            { username },
                            { email }
                        ],
                        id: { [Sequelize.Op.ne]: userId }
                    }
                });
                
                if (existingUser) {
                    if (existingUser.username === username) {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "Username sudah digunakan"
                        });
                    }
                    if (existingUser.email === email) {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "Email sudah digunakan"
                        });
                    }
                }

                const updateData = {
                    nama,
                    email,
                    username
                };

                // Jika ada file foto yang diupload
                if (req.file) {
                    // Path relatif untuk disimpan di database
                    // Simpan path sesuai dengan konfigurasi multer
                    updateData.image = `/uploads/users/${req.file.filename}`;
                    console.log('Berhasil mengupload gambar:', req.file.filename);
                    
                    // Hapus gambar lama jika ada
                    if (currentUser.image) {
                        try {
                            // Ambil nama file dari path
                            const oldImagePath = path.join(process.cwd(), currentUser.image.replace(/^\//, ''));
                            
                            // Periksa apakah file ada sebelum dihapus
                            if (fs.existsSync(oldImagePath)) {
                                fs.unlinkSync(oldImagePath);
                                console.log(`Berhasil menghapus gambar lama: ${oldImagePath}`);
                            }
                        } catch (fsError) {
                            console.error('Error saat menghapus gambar lama:', fsError);
                            // Lanjutkan proses meskipun gagal menghapus gambar lama
                        }
                    }
                }

                // Update data user
                const [updated] = await Users.update(updateData, {
                    where: { id: userId }
                });

                if (updated === 0) {
                    return res.status(404).json({
                        statusCode: 404,
                        message: "User tidak ditemukan"
                    });
                }

                // Ambil data user yang sudah diupdate
                const updatedUser = await Users.findByPk(userId, {
                    attributes: ['id', 'username', 'email', 'nama', 'image', 'id_groups_users']
                });
                
                // Ambil data group user
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

                return res.status(200).json({
                    statusCode: 200,
                    message: "Profil berhasil diperbarui",
                    data: {
                        id: updatedUser.id,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        nama: updatedUser.nama,
                        image: updatedUser.image,
                        group_user: groupUserData
                    }
                });

            } catch (error) {
                console.error('Error in updateProfile:', error);
                return res.status(500).json({
                    statusCode: 500,
                    message: "Terjadi kesalahan saat memperbarui profil",
                    error: error.message
                });
            }
        });

    } catch (error) {
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

