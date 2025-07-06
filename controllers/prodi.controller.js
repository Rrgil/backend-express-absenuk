import Prodi from "../models/prodi.model.js";
import { Sequelize } from "sequelize";

// Fungsi untuk mengambil semua data prodi
export const getAllProdi = async (req, res) => {
    try {
        const prodi = await Prodi.findAll();
        return res.status(200).json({
            statusCode: 200,
            message: "Data prodi berhasil diambil",
            data: prodi
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
}

// Fungsi untuk mengambil data prodi berdasarkan ID
export const getProdiById = async (req, res) => {
    try {
        const prodi = await Prodi.findByPk(req.params.id);
        if (prodi) {
            return res.status(200).json({
                statusCode: 200,
                message: "Data prodi berhasil diambil",
                data: prodi
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: 'Prodi tidak ditemukan'
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menambahkan data prodi
export const createProdi = async (req, res) => {
    try {
        const { slug, nama } = req.body;
        if (!slug || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Slug dan nama wajib diisi"
            });
        }
        
        const prodi = await Prodi.create({
            slug: slug,
            nama: nama,
            status: 1 // Status default aktif
        });
        
        return res.status(201).json({
            statusCode: 201,
            message: "Data prodi berhasil ditambahkan",
            data: prodi
        });
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            const field = error.errors[0] ? error.errors[0].path : 'unknown';
            const value = error.errors[0] ? error.errors[0].value : 'unknown';
            const message = `Nilai '${value}' untuk kolom '${field}' sudah ada. Silakan gunakan nilai lain.`;
            return res.status(400).json({
                statusCode: 400,
                message: message
            });
        }
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengupdate data prodi berdasarkan ID
export const updateProdi = async (req, res) => {
    try {
        const prodi = await Prodi.findByPk(req.params.id);
        if (!prodi) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Prodi tidak ditemukan'
            });
        }
        
        const { slug, nama, status } = req.body;
        
        // Validasi input wajib
        if (!slug || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Slug dan nama wajib diisi"
            });
        }
        

        
        // Update data prodi
        prodi.slug = slug;
        prodi.nama = nama;
        if (status !== undefined) prodi.status = status;
        await prodi.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: "Data prodi berhasil diperbarui",
            data: prodi
        });
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            const field = error.errors[0] ? error.errors[0].path : 'unknown';
            const value = error.errors[0] ? error.errors[0].value : 'unknown';
            const message = `Nilai '${value}' untuk kolom '${field}' sudah digunakan. Silakan gunakan nilai lain.`;
            return res.status(400).json({
                statusCode: 400,
                message: message
            });
        }
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data prodi berdasarkan ID (Hard Delete)
export const deleteProdi = async (req, res) => {
    try {
        const prodi = await Prodi.findByPk(req.params.id);
        if (!prodi) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Prodi tidak ditemukan'
            });
        }
        
        // Hard delete: hapus data secara permanen dari database
        await prodi.destroy();
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Data prodi berhasil dihapus secara permanen'
        });
    } catch (error) {
        // Cek apakah error disebabkan oleh foreign key constraint
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                statusCode: 400,
                message: 'Data prodi tidak dapat dihapus karena masih digunakan di data lain (misalnya: data mahasiswa atau jadwal).'
            });
        }
        
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};
