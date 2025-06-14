import Informasi from "../models/informasi.model.js";
import { Sequelize } from "sequelize";
import { uploadInformasiSingle } from "../config/multer.config.js";

// Fungsi untuk mengambil semua data informasi
export const getAllInformasi = async (req, res) => {
    try {
        const informasi = await Informasi.findAll();
        return res.status(200).json({
            statusCode: 200,
            message: "Data informasi berhasil diambil",
            data: informasi
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
}

// Fungsi untuk mengambil data informasi berdasarkan ID
export const getInformasiById = async (req, res) => {
    try {
        const informasi = await Informasi.findByPk(req.params.id);
        if (informasi) {
            return res.status(200).json({
                statusCode: 200,
                message: "Data informasi berhasil diambil",
                data: informasi
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: 'Informasi tidak ditemukan'
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Middleware untuk upload gambar informasi
export const uploadImage = uploadInformasiSingle('image');

// Fungsi untuk menambahkan data informasi
export const createInformasi = async (req, res) => {
    try {
        // Validasi input wajib
        const { nama, slug, isi } = req.body;
        
        if (!nama || !slug || !isi) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama, slug, dan isi wajib diisi"
            });
        }
        
        // Cek apakah slug sudah ada
        const existingSlug = await Informasi.findOne({ where: { slug: slug } });
        if (existingSlug) {
            return res.status(400).json({
                statusCode: 400,
                message: "Slug sudah digunakan"
            });
        }
        
        // Pastikan ada file gambar yang diupload
        if (!req.file) {
            return res.status(400).json({
                statusCode: 400,
                message: "Gambar wajib diupload"
            });
        }
        
        // Buat data informasi baru
        const informasi = await Informasi.create({
            nama,
            slug,
            isi,
            image: req.file.filename,
            is_aktif: 1, // Aktif secara default
            status: 1 // Status aktif
        });
        
        return res.status(201).json({
            statusCode: 201,
            message: "Data informasi berhasil ditambahkan",
            data: informasi
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengupdate data informasi berdasarkan ID
export const updateInformasi = async (req, res) => {
    try {
        const informasi = await Informasi.findByPk(req.params.id);
        if (!informasi) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Informasi tidak ditemukan'
            });
        }
        
        const { nama, slug, isi, is_aktif, status } = req.body;
        
        // Cek apakah slug sudah digunakan oleh informasi lain
        if (slug && slug !== informasi.slug) {
            const existingSlug = await Informasi.findOne({ 
                where: { slug: slug, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingSlug) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Slug sudah digunakan oleh informasi lain"
                });
            }
        }
        
        // Update data informasi
        if (nama) informasi.nama = nama;
        if (slug) informasi.slug = slug;
        if (isi) informasi.isi = isi;
        if (is_aktif !== undefined) informasi.is_aktif = is_aktif;
        if (status !== undefined) informasi.status = status;
        
        // Jika ada file gambar yang diupload
        if (req.file) {
            informasi.image = req.file.filename;
        }
        
        await informasi.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: "Data informasi berhasil diperbarui",
            data: informasi
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data informasi berdasarkan ID
export const deleteInformasi = async (req, res) => {
    try {
        const informasi = await Informasi.findByPk(req.params.id);
        if (!informasi) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Informasi tidak ditemukan'
            });
        }
        
        await informasi.destroy();
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Data informasi berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};
