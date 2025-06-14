import MataKuliah from "../models/mata_kuliah.model.js";
import Prodi from "../models/prodi.model.js";
import { Sequelize } from "sequelize";

// Fungsi untuk mengambil semua data mata kuliah
export const getAllMataKuliah = async (req, res) => {
    try {
        const mata_kuliah = await MataKuliah.findAll({
            include: [{
                model: Prodi,
                attributes: ['nama']
            }]
        });
        return res.status(200).json({
            statusCode: 200,
            message: "Data mata kuliah berhasil diambil",
            data: mata_kuliah
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
}

// Fungsi untuk mengambil data mata kuliah berdasarkan ID
export const getMataKuliahById = async (req, res) => {
    try {
        const mata_kuliah = await MataKuliah.findByPk(req.params.id, {
            include: [{
                model: Prodi,
                attributes: ['nama']
            }]
        });
        if (mata_kuliah) {
            return res.status(200).json({
                statusCode: 200,
                message: "Data mata kuliah berhasil diambil",
                data: mata_kuliah
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: 'Mata kuliah tidak ditemukan'
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menambahkan data mata kuliah
export const createMataKuliah = async (req, res) => {
    try {
        // Validasi input wajib
        const { id_prodi, kode_mata_kuliah, nama } = req.body;
        
        if (!id_prodi || !kode_mata_kuliah || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "ID prodi, kode mata kuliah, dan nama wajib diisi"
            });
        }
        
        // Cek apakah prodi ada
        const prodi = await Prodi.findByPk(id_prodi);
        if (!prodi) {
            return res.status(400).json({
                statusCode: 400,
                message: "Prodi tidak ditemukan"
            });
        }
        
        // Cek apakah kode mata kuliah sudah ada
        const existingKode = await MataKuliah.findOne({ where: { kode_mata_kuliah: kode_mata_kuliah } });
        if (existingKode) {
            return res.status(400).json({
                statusCode: 400,
                message: "Kode mata kuliah sudah terdaftar"
            });
        }
        
        // Buat data mata kuliah baru
        const mata_kuliah = await MataKuliah.create({
            id_prodi,
            kode_mata_kuliah,
            nama,
            status: 1 // Status aktif
        });
        
        return res.status(201).json({
            statusCode: 201,
            message: "Data mata kuliah berhasil ditambahkan",
            data: mata_kuliah
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengupdate data mata kuliah berdasarkan ID
export const updateMataKuliah = async (req, res) => {
    try {
        const mata_kuliah = await MataKuliah.findByPk(req.params.id);
        if (!mata_kuliah) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Mata kuliah tidak ditemukan'
            });
        }
        
        const { id_prodi, kode_mata_kuliah, nama, status } = req.body;
        
        // Validasi input wajib
        if (!id_prodi || !kode_mata_kuliah || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "ID prodi, kode mata kuliah, dan nama wajib diisi"
            });
        }
        
        // Cek apakah prodi ada
        const prodi = await Prodi.findByPk(id_prodi);
        if (!prodi) {
            return res.status(400).json({
                statusCode: 400,
                message: "Prodi tidak ditemukan"
            });
        }
        
        // Cek apakah kode mata kuliah sudah digunakan oleh mata kuliah lain
        if (kode_mata_kuliah !== mata_kuliah.kode_mata_kuliah) {
            const existingKode = await MataKuliah.findOne({ 
                where: { kode_mata_kuliah: kode_mata_kuliah, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingKode) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Kode mata kuliah sudah digunakan oleh mata kuliah lain"
                });
            }
        }
        
        // Update data mata kuliah
        mata_kuliah.id_prodi = id_prodi;
        mata_kuliah.kode_mata_kuliah = kode_mata_kuliah;
        mata_kuliah.nama = nama;
        if (status !== undefined) mata_kuliah.status = status;
        await mata_kuliah.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: "Data mata kuliah berhasil diperbarui",
            data: mata_kuliah
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data mata kuliah berdasarkan ID
export const deleteMataKuliah = async (req, res) => {
    try {
        const mata_kuliah = await MataKuliah.findByPk(req.params.id);
        if (!mata_kuliah) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Mata kuliah tidak ditemukan'
            });
        }
        
        // Soft delete dengan mengubah status menjadi 0
        mata_kuliah.status = 0;
        await mata_kuliah.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Data mata kuliah berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};