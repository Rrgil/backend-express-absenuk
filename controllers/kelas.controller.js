import Kelas from "../models/kelas.model.js";
import { Sequelize } from "sequelize";

// Fungsi untuk mengambil semua data kelas
export const getAllKelas = async (req, res) => {
    try {
        const kelas = await Kelas.findAll();
        return res.status(200).json({
            statusCode: 200,
            message: "Data kelas berhasil diambil",
            data: kelas
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
}

// Fungsi untuk mengambil data kelas berdasarkan ID
export const getKelasById = async (req, res) => {
    try {
        const kelas = await Kelas.findByPk(req.params.id);
        if (kelas) {
            return res.status(200).json({
                statusCode: 200,
                message: "Data kelas berhasil diambil",
                data: kelas
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: 'Kelas tidak ditemukan'
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menambahkan data kelas
export const createKelas = async (req, res) => {
    try {
        // Validasi input wajib
        const { kode_kelas, nama } = req.body;
        
        if (!kode_kelas || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Kode kelas dan nama wajib diisi"
            });
        }
        
        // Cek apakah kode kelas sudah ada
        const existingKode = await Kelas.findOne({ where: { kode_kelas: kode_kelas } });
        if (existingKode) {
            return res.status(400).json({
                statusCode: 400,
                message: "Kode kelas sudah terdaftar"
            });
        }
        
        // Buat data kelas baru
        const kelas = await Kelas.create({
            kode_kelas,
            nama,
            status: 1 // Status aktif
        });
        
        return res.status(201).json({
            statusCode: 201,
            message: "Data kelas berhasil ditambahkan",
            data: kelas
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengupdate data kelas berdasarkan ID
export const updateKelas = async (req, res) => {
    try {
        const kelas = await Kelas.findByPk(req.params.id);
        if (!kelas) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Kelas tidak ditemukan'
            });
        }
        
        const { kode_kelas, nama, status } = req.body;
        
        // Validasi input wajib
        if (!kode_kelas || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Kode kelas dan nama wajib diisi"
            });
        }
        
        // Cek apakah kode kelas sudah digunakan oleh kelas lain
        if (kode_kelas !== kelas.kode_kelas) {
            const existingKode = await Kelas.findOne({ 
                where: { kode_kelas: kode_kelas, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingKode) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Kode kelas sudah digunakan oleh kelas lain"
                });
            }
        }
        
        // Update data kelas
        kelas.kode_kelas = kode_kelas;
        kelas.nama = nama;
        if (status !== undefined) kelas.status = status;
        await kelas.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: "Data kelas berhasil diperbarui",
            data: kelas
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data kelas berdasarkan ID
export const deleteKelas = async (req, res) => {
    try {
        const kelas = await Kelas.findByPk(req.params.id);
        if (!kelas) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Kelas tidak ditemukan'
            });
        }
        
        // Soft delete dengan mengubah status menjadi 0
        kelas.status = 0;
        await kelas.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Data kelas berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};
