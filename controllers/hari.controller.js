import Hari from "../models/hari.model.js";
import { Sequelize } from "sequelize";

// Fungsi untuk mengambil semua data hari
export const getAllHari = async (req, res) => {
    try {
        const hari = await Hari.findAll();
        return res.status(200).json({
            statusCode: 200,
            message: "Data hari berhasil diambil",
            data: hari
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
}

// Fungsi untuk mengambil data hari berdasarkan ID
export const getHariById = async (req, res) => {
    try {
        const hari = await Hari.findByPk(req.params.id);
        if (hari) {
            return res.status(200).json({
                statusCode: 200,
                message: "Data hari berhasil diambil",
                data: hari
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: 'Hari tidak ditemukan'
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menambahkan data hari
export const createHari = async (req, res) => {
    try {
        // Validasi input wajib
        const { nama } = req.body;
        
        if (!nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama hari wajib diisi"
            });
        }
        
        // Cek apakah nama hari sudah ada
        const existingNama = await Hari.findOne({ where: { nama: nama } });
        if (existingNama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama hari sudah terdaftar"
            });
        }
        
        // Buat data hari baru
        const hari = await Hari.create({
            nama
        });
        
        return res.status(201).json({
            statusCode: 201,
            message: "Data hari berhasil ditambahkan",
            data: hari
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengupdate data hari berdasarkan ID
export const updateHari = async (req, res) => {
    try {
        const hari = await Hari.findByPk(req.params.id);
        if (!hari) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Hari tidak ditemukan'
            });
        }
        
        const { nama } = req.body;
        
        // Validasi input wajib
        if (!nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama hari wajib diisi"
            });
        }
        
        // Cek apakah nama hari sudah digunakan oleh hari lain
        if (nama !== hari.nama) {
            const existingNama = await Hari.findOne({ 
                where: { nama: nama, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingNama) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Nama hari sudah digunakan"
                });
            }
        }
        
        // Update data hari
        hari.nama = nama;
        await hari.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: "Data hari berhasil diperbarui",
            data: hari
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data hari berdasarkan ID
export const deleteHari = async (req, res) => {
    try {
        const hari = await Hari.findByPk(req.params.id);
        if (!hari) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Hari tidak ditemukan'
            });
        }
        
        await hari.destroy();
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Data hari berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};