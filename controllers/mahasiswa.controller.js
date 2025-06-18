import Mahasiswa from "../models/mahasiswa.model.js";
import JenisKelamin from "../models/jenis_kelamin.model.js";
import Kelas from "../models/kelas.model.js";
import Prodi from "../models/prodi.model.js";
import bcrypt from "bcrypt";
import auth from "../middleware/verifyToken.js";
import dotenv from "dotenv";

dotenv.config();

// Fungsi untuk mengambil semua data mahasiswa
export const getAllMahasiswa = async (req, res) => {
    try {
        const mahasiswa = await Mahasiswa.findAll({
            include: [
                { model: JenisKelamin, as: 'jenis_kelamin' },
                { model: Kelas, as: 'kelas' },
                { model: Prodi, as: 'prodi' }
            ]
        });
        res.status(200).json({
            statusCode: 200,
            message: "Berhasil mengambil data mahasiswa",
            data: mahasiswa
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat mengambil data mahasiswa",
            data: null
        });
    }
}

// Fungsi untuk membuat data mahasiswa baru
export const createMahasiswa = async (req, res) => {
    // Periksa apakah ada file yang diupload
    console.log('File upload:', req.file);
    try {
        // Ambil data dari request body
        const {
            nim,
            nama,
            id_jenis_kelamin,
            id_kelas,
            id_prodi,
            email,
            password,
            no_wa,
            tempat_lahir,
            tanggal_lahir,
            alamat
        } = req.body;

        // Validasi input wajib
        if (!nim || !nama || !id_jenis_kelamin || !id_kelas || !id_prodi || !password || !tempat_lahir || !tanggal_lahir || !alamat) {
            return res.status(400).json({
                statusCode: 400,
                message: "Mohon lengkapi semua field yang wajib diisi",
                data: null
            });
        }

        // Cek NIM unik
        const existingNim = await Mahasiswa.findOne({
            where: {
                nim
            }
        });

        if (existingNim) {
            return res.status(400).json({
                statusCode: 400,
                message: "NIM sudah digunakan",
                data: null
            });
        }

        // Cek email unik jika ada
        if (email) {
            const existingEmail = await Mahasiswa.findOne({
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
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12   );

        // Ambil path gambar jika ada upload
        const imagePath = req.file ? `/uploads/mahasiswa/${req.file.filename}` : null;

        // Simpan data mahasiswa baru
        const newMahasiswa = await Mahasiswa.create({
            nim,
            nama,
            id_jenis_kelamin,
            id_kelas,
            id_prodi,
            image: imagePath,
            email: email || null,
            password: hashedPassword,
            no_wa: no_wa || null,
            tempat_lahir,
            tanggal_lahir,
            alamat,
            status: 1 // Status aktif
        });

        res.status(201).json({
            statusCode: 201,
            message: "Berhasil menambahkan mahasiswa baru",
            data: {
                id: newMahasiswa.id,
                nim: newMahasiswa.nim,
                nama: newMahasiswa.nama,
                id_jenis_kelamin: newMahasiswa.id_jenis_kelamin,
                id_kelas: newMahasiswa.id_kelas,
                id_prodi: newMahasiswa.id_prodi,
                image: newMahasiswa.image,
                email: newMahasiswa.email,
                no_wa: newMahasiswa.no_wa
            }
        });
    } catch (error) {
        console.error("Error creating mahasiswa:", error);

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
                message: "NIM atau email sudah digunakan",
                data: null
            });
        }

        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat menambahkan mahasiswa",
            data: null
        });
    }
};

// Fungsi logout mahasiswa untuk aplikasi mobile
export const logoutMahasiswa = async (req, res) => {
    try {
        // Di arsitektur stateless berbasis token, logout di sisi server
        // pada dasarnya hanya memberikan sinyal ke klien untuk menghapus token.
        // Klien-lah yang bertanggung jawab penuh untuk menghapus token dari penyimpanannya.
        res.status(200).json({
            statusCode: 200,
            message: "Logout berhasil",
            data: null
        });
    } catch (error) {
        console.error("Error logout mahasiswa:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat logout",
            data: null
        });
    }
};

// Fungsi login mahasiswa untuk aplikasi mobile
export const loginMahasiswa = async (req, res) => {
    try {
        // Ambil data dari request body
        const { nim, password } = req.body;

        // Validasi input
        if (!nim || !password) {
            return res.status(400).json({
                statusCode: 400,
                message: "NIM dan password harus diisi",
                data: null
            });
        }

        // Cari mahasiswa berdasarkan NIM
        const mahasiswa = await Mahasiswa.findOne({
            where: {
                nim
            }
        });

        // Jika mahasiswa tidak ditemukan
        if (!mahasiswa) {
            return res.status(404).json({
                statusCode: 404,
                message: "Mahasiswa tidak ditemukan",
                data: null
            });
        }

        // Cek status mahasiswa aktif
        if (mahasiswa.status !== 1) {
            return res.status(403).json({
                statusCode: 403,
                message: "Akun mahasiswa tidak aktif",
                data: null
            });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, mahasiswa.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                statusCode: 401,
                message: "Password salah",
                data: null
            });
        }

        // Buat payload untuk token
        const payload = {
            id: mahasiswa.id,
            nim: mahasiswa.nim,
            nama: mahasiswa.nama,
            role: 'mahasiswa'
        };

        // Generate token
        const token = auth.generateToken(payload);

        // Kirim response dengan token dan data mahasiswa
        res.status(200).json({
            statusCode: 200,
            message: "Login berhasil",
            data: {
                token                
            }
        });
    } catch (error) {
        console.error("Error login mahasiswa:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat login",
            data: null
        });
    }
};

// Fungsi untuk mendapatkan data mahasiswa berdasarkan ID dari token
export const getMahasiswaById = async (req, res) => {
    try {
        // ID mahasiswa diambil dari token (setelah divalidasi middleware) untuk keamanan
        const mahasiswaId = req.user.id;

        const mahasiswa = await Mahasiswa.findByPk(mahasiswaId, {
            attributes: { exclude: ['password'] } // Jangan kirim password ke klien
        });

        if (!mahasiswa) {
            return res.status(404).json({
                statusCode: 404,
                message: `Mahasiswa tidak ditemukan`,
                data: null
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: "Data mahasiswa berhasil diambil",
            data: mahasiswa
        });
    } catch (error) {
        console.error("Error getMahasiswaById:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat mengambil data mahasiswa",
            data: null
        });
    }
};

// Fungsi untuk memperbarui data mahasiswa berdasarkan ID dari token
export const updateDataMahasiswa = async (req, res) => {
    try {
        // ID mahasiswa diambil dari token
        const mahasiswaId = req.user.id;
        const { nama, nim, password } = req.body;

        const mahasiswa = await Mahasiswa.findByPk(mahasiswaId);

        if (!mahasiswa) {
            return res.status(404).json({
                statusCode: 404,
                message: `Mahasiswa tidak ditemukan`,
                data: null
            });
        }

        // Siapkan data untuk diupdate
        const updateData = { nama, nim };

        // Jika ada file gambar baru, update path gambar
        if (req.file) {
            updateData.image = req.file.path;
        }

        // Jika ada password baru (dan tidak kosong), hash dan update
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await mahasiswa.update(updateData);

        // Ambil data terbaru setelah update untuk dikirim sebagai response
        const updatedMahasiswa = await Mahasiswa.findByPk(mahasiswaId, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            statusCode: 200,
            message: "Data mahasiswa berhasil diperbarui",
            data: updatedMahasiswa
        });
    } catch (error) {
        console.error("Error updateDataMahasiswa:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat memperbarui data mahasiswa",
            data: null
        });
    }
};

// Fungsi untuk mendapatkan data mahasiswa berdasarkan NIM
export const getMahasiswaByNim = async (req, res) => {
    try {
        const { nim } = req.params;

        if (!nim) {
            return res.status(400).json({
                statusCode: 400,
                message: "NIM harus disertakan",
                data: null
            });
        }

        const mahasiswa = await Mahasiswa.findOne({
            where: { nim },
            attributes: { exclude: ['password'] } // Jangan kirim password
        });

        if (!mahasiswa) {
            return res.status(404).json({
                statusCode: 404,
                message: `Mahasiswa dengan NIM ${nim} tidak ditemukan`,
                data: null
            });
        }

        res.status(200).json({
            statusCode: 200,
            message: "Data mahasiswa berhasil diambil",
            data: mahasiswa
        });
    } catch (error) {
        console.error("Error getMahasiswaByNim:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat mengambil data mahasiswa",
            data: null
        });
    }
};