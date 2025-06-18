import Informasi from "../models/informasi.model.js";
import { Sequelize } from "sequelize";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Fungsi untuk menambahkan data informasi
export const createInformasi = async (req, res) => {
    try {
        const { nama, slug, isi, is_aktif, status } = req.body;

        if (!nama || !slug || !isi) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama, slug, dan isi wajib diisi"
            });
        }

        const existingSlug = await Informasi.findOne({ where: { slug: slug } });
        if (existingSlug) {
            return res.status(400).json({
                statusCode: 400,
                message: "Slug sudah digunakan"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                statusCode: 400,
                message: "Gambar wajib diupload"
            });
        }

        const imageUrl = `/uploads/informasi/${req.file.filename}`;

        const informasi = await Informasi.create({
            nama,
            slug,
            isi,
            image: imageUrl,
            is_aktif: is_aktif !== undefined ? is_aktif : 1,
            status: status !== undefined ? status : 1
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
        const oldImage = informasi.image;

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

        let imageUrl = informasi.image;
        if (req.file) {
            imageUrl = `/uploads/informasi/${req.file.filename}`;
        }

        informasi.nama = nama || informasi.nama;
        informasi.slug = slug || informasi.slug;
        informasi.isi = isi || informasi.isi;
        informasi.image = imageUrl;
        if (is_aktif !== undefined) {
            informasi.is_aktif = is_aktif;
        }
        if (status !== undefined) {
            informasi.status = status;
        }

        await informasi.save();

        if (req.file && oldImage && oldImage !== imageUrl) {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const oldImagePath = path.join(__dirname, '..', 'public', oldImage);
            if (fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                } catch (err) {
                    console.error("Gagal menghapus gambar lama:", err);
                }
            }
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Data informasi berhasil diperbarui",
            data: informasi
        });
    } catch (error) {
        if (req.file) {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const newImagePath = path.join(__dirname, '..', 'public', 'uploads', 'informasi', req.file.filename);
            if (fs.existsSync(newImagePath)) {
                fs.unlinkSync(newImagePath);
            }
        }
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
