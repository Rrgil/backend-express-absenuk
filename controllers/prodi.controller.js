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
        // Validasi input wajib
        const { slug, nama } = req.body;
        
        if (!slug || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Slug dan nama wajib diisi"
            });
        }
        
        // Cek apakah slug prodi sudah ada
        const existingProdiBySlug = await Prodi.findOne({
            where: {
                slug: slug
            }
        });

        if (existingProdiBySlug) {
            return res.status(400).json({
                statusCode: 400,
                message: "Slug prodi sudah terdaftar"
            });
        }
        
        // Buat data prodi baru dengan status eksplisit
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
        
        // Cek apakah slug sudah digunakan oleh prodi lain
        if (slug !== prodi.slug) {
            const existingSlug = await Prodi.findOne({ 
                where: { slug: slug, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingSlug) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Slug sudah digunakan oleh prodi lain"
                });
            }
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
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data prodi berdasarkan ID
export const deleteProdi = async (req, res) => {
    try {
        const prodi = await Prodi.findByPk(req.params.id);
        if (!prodi) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Prodi tidak ditemukan'
            });
        }
        
        // Soft delete dengan mengubah status menjadi 0
        prodi.status = 0;
        await prodi.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Data prodi berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};
