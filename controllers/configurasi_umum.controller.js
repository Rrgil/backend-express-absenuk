import ConfigurasiUmum from "../models/configurasi_umum.model.js";
import { uploadConfigurasiSingle } from "../config/multer.config.js";
import fs from 'fs';
import path from 'path';

// Middleware untuk upload icon
export const uploadIcon = uploadConfigurasiSingle('icon');

/**
 * Fungsi untuk mengambil konfigurasi umum website
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {object} Response dengan data konfigurasi umum
 */
export const getKonfigurasiUmum = async (req, res) => {
    try {
        // Ambil konfigurasi aktif (status = 1)
        const konfigurasi = await ConfigurasiUmum.findOne({
            where: {
                status: 1
            }
        });

        if (!konfigurasi) {
            return res.status(404).json({
                statusCode: 404,
                message: "Konfigurasi umum tidak ditemukan",
                data: null
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Konfigurasi umum berhasil diambil",
            data: konfigurasi
        });
    } catch (error) {
        console.error("Error saat mengambil konfigurasi umum:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat mengambil konfigurasi umum",
            data: null
        });
    }
};

/**
 * Fungsi untuk mengupdate konfigurasi umum website
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {object} Response dengan data konfigurasi umum yang diupdate
 */
export const updateKonfigurasi = async (req, res) => {
    try {
        // Ambil data dari request body
        const { 
            nama_website, 
            singkatan_website, 
            tagline_website, 
            alamat_website 
        } = req.body;

        // Validasi input wajib
        if (!nama_website || !singkatan_website || !tagline_website || !alamat_website) {
            return res.status(400).json({
                statusCode: 400,
                message: "Semua field wajib diisi",
                data: null
            });
        }

        // Cari konfigurasi yang aktif
        let konfigurasi = await ConfigurasiUmum.findOne({
            where: {
                status: 1
            }
        });

        // Jika tidak ada konfigurasi aktif, buat baru
        if (!konfigurasi) {
            // Siapkan data untuk konfigurasi baru
            const configData = {
                nama_website,
                singkatan_website,
                tagline_website,
                alamat_website,
                status: 1
            };

            // Jika ada file icon yang diupload
            if (req.file) {
                configData.icon = `uploads/configurasi/${req.file.filename}`;
            }

            // Buat konfigurasi baru
            konfigurasi = await ConfigurasiUmum.create(configData);

            return res.status(201).json({
                statusCode: 201,
                message: "Konfigurasi umum berhasil dibuat",
                data: konfigurasi
            });
        }

        // Jika ada konfigurasi aktif, update
        // Simpan icon lama jika ada
        const oldIcon = konfigurasi.icon;

        // Update data konfigurasi
        konfigurasi.nama_website = nama_website;
        konfigurasi.singkatan_website = singkatan_website;
        konfigurasi.tagline_website = tagline_website;
        konfigurasi.alamat_website = alamat_website;

        // Jika ada file icon yang diupload
        if (req.file) {
            konfigurasi.icon = `uploads/configurasi/${req.file.filename}`;

            // Hapus file icon lama jika ada
            if (oldIcon) {
                try {
                    // Path lengkap ke file icon lama, __dirname merujuk ke folder controllers
                    const oldIconPath = path.resolve(__dirname, '..', oldIcon.replace(/^\//, ''));
                    
                    if (fs.existsSync(oldIconPath)) {
                        fs.unlinkSync(oldIconPath);
                        console.log(`File lama berhasil dihapus: ${oldIconPath}`);
                    }
                } catch (err) {
                    console.error(`Gagal menghapus file icon lama: ${err.message}`);
                    // Lanjutkan proses meskipun gagal menghapus file lama
                }
            }
        }

        // Simpan perubahan
        await konfigurasi.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Konfigurasi umum berhasil diperbarui",
            data: konfigurasi
        });
    } catch (error) {
        console.error("Error saat mengupdate konfigurasi umum:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan saat mengupdate konfigurasi umum",
            data: null
        });
    }
};
