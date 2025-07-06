import Mahasiswa from "../models/mahasiswa.model.js";
import JenisKelamin from "../models/jenis_kelamin.model.js";
import Prodi from "../models/prodi.model.js";
import Semester from "../models/semester.model.js";
import bcrypt from "bcrypt";
import auth from "../middleware/verifyToken.js";
import dotenv from "dotenv";
import path from 'path';
import { getFaceEmbedding } from '../services/face.service.js';

dotenv.config();

// Fungsi untuk mengambil semua data mahasiswa
export const getAllMahasiswa = async (req, res) => {
    try {
        const mahasiswa = await Mahasiswa.findAll({
            include: [
                { model: JenisKelamin, as: 'jenis_kelamin' },
                { model: Prodi, as: 'prodi' },
                { model: Semester, as: 'semester' }
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
            id_prodi,
            id_semester,
            email,
            password,
            no_wa,
            tempat_lahir,
            tanggal_lahir,
            alamat
        } = req.body;
        
        console.log('[DEBUG] Mencoba membuat mahasiswa dengan data:', req.body);

        // Validasi input wajib, termasuk file gambar dan alamat
        if (!nim || !nama || !id_jenis_kelamin || !id_prodi || !password || !tempat_lahir || !tanggal_lahir || !alamat || !req.file) {
            return res.status(400).json({
                statusCode: 400,
                message: "Mohon lengkapi semua field yang wajib diisi, termasuk foto dan alamat.",
                data: null
            });
        }

        // Cek NIM unik
        console.log(`[DEBUG] Mengecek NIM: ${nim}`);
        const existingNim = await Mahasiswa.findOne({
            where: {
                nim
            }
        });
        console.log('[DEBUG] Hasil pengecekan NIM (existingNim):', existingNim ? existingNim.toJSON() : null);


        if (existingNim) {
            return res.status(400).json({
                statusCode: 400,
                message: "NIM sudah digunakan",
                data: null
            });
        }

        // Cek email unik jika ada
        if (email) {
            console.log(`[DEBUG] Mengecek Email: ${email}`);
            const existingEmail = await Mahasiswa.findOne({
                where: {
                    email
                }
            });
            console.log('[DEBUG] Hasil pengecekan Email (existingEmail):', existingEmail ? existingEmail.toJSON() : null);

            if (existingEmail) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Email sudah digunakan",
                    data: null
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Path gambar diambil dari req.file yang sudah divalidasi
        const imagePath = `/uploads/mahasiswa/${req.file.filename}`;

        // Hasilkan face embedding dari gambar yang diunggah
        const absoluteImagePath = path.join(process.cwd(), 'uploads', 'mahasiswa', req.file.filename);
        console.log(`[CREATE-DEBUG] Mencoba menghasilkan face descriptor untuk: ${absoluteImagePath}`);
        const faceDescriptor = await getFaceEmbedding(absoluteImagePath);
        let faceEmbedding = null;
        if (faceDescriptor) {
            console.log('[CREATE-DEBUG] Face descriptor berhasil dibuat.');
            faceEmbedding = Array.from(faceDescriptor);
        } else {
            console.log('[CREATE-WARN] Tidak ada wajah terdeteksi, face_embedding diatur ke null.');
        }

        // Simpan data mahasiswa baru
        console.log('[DEBUG] Semua pengecekan unik lolos. Mencoba Mahasiswa.create...');
        const newMahasiswa = await Mahasiswa.create({
            nim,
            nama,
            id_jenis_kelamin,
            id_prodi,
            id_semester: id_semester || null,
            image: imagePath,
            face_embedding: faceEmbedding,
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
                id_prodi: newMahasiswa.id_prodi,
                id_semester: newMahasiswa.id_semester,
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
            const field = error.errors[0].path;
            let message = 'Terjadi duplikasi data.';
            if (field === 'nim') {
                message = 'NIM sudah digunakan.';
            } else if (field === 'email') {
                message = 'Email sudah digunakan.';
            } else if (field === 'id') {
                message = 'Terjadi kesalahan pada ID internal. Coba lagi.';
            }
            return res.status(400).json({
                statusCode: 400,
                message: message,
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

        // Kirim response dengan token dan data mahasiswa yang lengkap
        res.status(200).json({
            statusCode: 200,
            message: "Login berhasil",
            data: {
                token,
                user: {
                    id: mahasiswa.id,
                    nim: mahasiswa.nim,
                    nama: mahasiswa.nama,
                    image: mahasiswa.image,

                }
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

// Fungsi untuk mendapatkan data mahasiswa berdasarkan NIM
export const updateDataMahasiswaById = async (req, res) => {
    try {
        const { id } = req.params;
        const mahasiswa = await Mahasiswa.findByPk(id);

        if (!mahasiswa) {
            return res.status(404).json({
                statusCode: 404,
                message: "Mahasiswa tidak ditemukan",
            });
        }

        // Siapkan data untuk pembaruan
        const { password, ...otherData } = req.body;
        const dataToUpdate = { ...otherData };

        // Update gambar dan face embedding jika ada file baru
        if (req.file) {
            const newImagePath = `/uploads/mahasiswa/${req.file.filename}`;
            dataToUpdate.image = newImagePath;

            // Dapatkan path absolut dari file yang diunggah
            const absoluteImagePath = path.join(process.cwd(), 'uploads', 'mahasiswa', req.file.filename);
            console.log(`[ADMIN-DEBUG] Mencoba menghasilkan face descriptor untuk: ${absoluteImagePath}`);

            // Hasilkan face descriptor dari gambar baru
            const faceDescriptor = await getFaceEmbedding(absoluteImagePath);

            if (faceDescriptor) {
                console.log('[ADMIN-DEBUG] Face descriptor berhasil dibuat.');
                // Konversi Float32Array ke array biasa untuk disimpan di JSON
                dataToUpdate.face_embedding = Array.from(faceDescriptor);
            } else {
                console.log('[ADMIN-WARN] Tidak ada wajah terdeteksi, face_embedding diatur ke null.');
                dataToUpdate.face_embedding = null;
            }
        }

        // Tangani hashing password hanya jika password baru diberikan
        if (password && password.length > 0) {
            dataToUpdate.password = await bcrypt.hash(password, 12);
        }

        // Lakukan pembaruan
        await mahasiswa.update(dataToUpdate);

        // Kembalikan respons sukses dengan data yang diperbarui
        res.status(200).json({
            statusCode: 200,
            message: "Data mahasiswa berhasil diperbarui",
            data: mahasiswa, // instance diperbarui di tempat oleh .update()
        });
    } catch (error) {
        console.error("Error updating mahasiswa by id:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat memperbarui data mahasiswa",
        });
    }
};

export const deleteMahasiswa = async (req, res) => {
    try {
        const { id } = req.params;
        const mahasiswa = await Mahasiswa.findByPk(id);

        if (!mahasiswa) {
            return res.status(404).json({
                statusCode: 404,
                message: "Mahasiswa tidak ditemukan",
            });
        }

        await mahasiswa.destroy();

        res.status(200).json({
            statusCode: 200,
            message: "Data mahasiswa berhasil dihapus",
        });
    } catch (error) {
        console.error("Error deleting mahasiswa:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat menghapus data mahasiswa",
        });
    }
};

// Untuk update data mahasiswa (Untuk Mobile)
export const updateMahasiswaByNim = async (req, res) => { 
    try {
        const { nim } = req.params;
        const loggedInUserId = req.user.id; // Diambil dari token JWT

        const mahasiswaToUpdate = await Mahasiswa.findOne({ where: { nim } });

        if (!mahasiswaToUpdate) {
            return res.status(404).json({
                statusCode: 404,
                message: "Mahasiswa tidak ditemukan",
            });
        }

        // Security Check: Pastikan mahasiswa yang login hanya bisa mengubah datanya sendiri
        if (mahasiswaToUpdate.id !== loggedInUserId) {
            return res.status(403).json({
                statusCode: 403,
                message: "Akses ditolak. Anda hanya dapat memperbarui profil Anda sendiri.",
            });
        }

        const { nama, password } = req.body;
        const imageFile = req.file;

        // Validasi: Pastikan ada data yang dikirim untuk diupdate
        if (!nama && !password && !imageFile) {
            return res.status(400).json({
                statusCode: 400,
                message: "Tidak ada data yang diperbarui. Mohon kirim nama, password, atau gambar baru.",
            });
        }

        // Update nama jika ada
        if (nama) {
            mahasiswaToUpdate.nama = nama;
        }

        // Update password jika ada
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12);
            mahasiswaToUpdate.password = hashedPassword;
        }

        // Update gambar dan face embedding jika ada file baru
        if (imageFile) {
            const newImagePath = `/uploads/mahasiswa/${imageFile.filename}`;
            mahasiswaToUpdate.image = newImagePath;

            // Dapatkan path absolut dari file yang diunggah
            const absoluteImagePath = path.join(process.cwd(), 'uploads', 'mahasiswa', imageFile.filename);
            console.log(`[DEBUG] Mencoba menghasilkan face descriptor untuk: ${absoluteImagePath}`);

            // Hasilkan face descriptor dari gambar baru
            const faceDescriptor = await getFaceEmbedding(absoluteImagePath);

            if (faceDescriptor) {
                console.log('[DEBUG] Face descriptor berhasil dibuat.');
                // Konversi Float32Array ke array biasa untuk disimpan di JSON
                mahasiswaToUpdate.face_embedding = Array.from(faceDescriptor);
            } else {
                console.log('[WARN] Tidak ada wajah terdeteksi, face_embedding diatur ke null.');
                mahasiswaToUpdate.face_embedding = null;
            }
        }

        await mahasiswaToUpdate.save();

        res.status(200).json({
            statusCode: 200,
            message: "Profil berhasil diperbarui",
            data: {
                image: mahasiswaToUpdate.image,
                nama: mahasiswaToUpdate.nama,
            },
        });
    } catch (error) {
        console.error("Error updating mahasiswa by nim:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat memperbarui data mahasiswa",
        });
    }
};

// untuk mobile
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
            attributes: ['id', 'nim', 'nama', 'image', 'password', 'face_embedding', 'id_semester', 'id_prodi'],
            include: [
                {
                    model: Semester,
                    as: 'semester',
                    attributes: ['id', 'nama']
                },
                {
                    model: Prodi,
                    as: 'prodi',
                    attributes: ['id', 'nama']
                }
            ]
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