import Dosen from "../models/dosen.model.js";
import { Sequelize } from "sequelize";

// Fungsi untuk mengambil semua data dosen
export const getAllDosen = async (req, res) => {
    try {
        const dosen = await Dosen.findAll({ where: { status: 1 } });
        return res.status(200).json({
            statusCode: 200,
            message: "Data dosen berhasil diambil",
            data: dosen
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
}

// Fungsi untuk mengambil data dosen berdasarkan ID
export const getDosenById = async (req, res) => {
    try {
        const dosen = await Dosen.findByPk(req.params.id);
        if (dosen) {
            return res.status(200).json({
                statusCode: 200,
                message: "Data dosen berhasil diambil",
                data: dosen
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: 'Dosen tidak ditemukan'
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menambahkan data dosen
export const createDosen = async (req, res) => {
    try {
        // Validasi input wajib
        const { nidn, kode_dosen, nama } = req.body;
        
        if (!nidn || !kode_dosen || !nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "NIDN, kode dosen, dan nama wajib diisi"
            });
        }
        
        // Cek apakah NIDN sudah ada
        const existingNIDN = await Dosen.findOne({ where: { nidn: nidn } });
        if (existingNIDN) {
            return res.status(400).json({
                statusCode: 400,
                message: "NIDN sudah terdaftar"
            });
        }
        
        // Cek apakah kode dosen sudah ada
        const existingKode = await Dosen.findOne({ where: { kode_dosen: kode_dosen } });
        if (existingKode) {
            return res.status(400).json({
                statusCode: 400,
                message: "Kode dosen sudah terdaftar"
            });
        }
        
        // Buat data dosen baru
        const dosen = await Dosen.create({
            nidn,
            kode_dosen,
            nama,
            status: 1 // Status aktif
        });
        
        return res.status(201).json({
            statusCode: 201,
            message: "Data dosen berhasil ditambahkan",
            data: dosen
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengupdate data dosen berdasarkan ID
export const updateDosen = async (req, res) => {
    try {
        const dosen = await Dosen.findByPk(req.params.id);
        if (!dosen) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Dosen tidak ditemukan'
            });
        }
        
        const { nidn, kode_dosen, nama, status } = req.body;
        
        // Cek apakah NIDN sudah digunakan oleh dosen lain
        if (nidn && nidn !== dosen.nidn) {
            const existingNIDN = await Dosen.findOne({ 
                where: { nidn: nidn, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingNIDN) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "NIDN sudah digunakan oleh dosen lain"
                });
            }
        }
        
        // Cek apakah kode dosen sudah digunakan oleh dosen lain
        if (kode_dosen && kode_dosen !== dosen.kode_dosen) {
            const existingKode = await Dosen.findOne({ 
                where: { kode_dosen: kode_dosen, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingKode) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Kode dosen sudah digunakan oleh dosen lain"
                });
            }
        }
        
        // Update data dosen
        if (nidn) dosen.nidn = nidn;
        if (kode_dosen) dosen.kode_dosen = kode_dosen;
        if (nama) dosen.nama = nama;
        if (status !== undefined) dosen.status = status;
        
        await dosen.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: "Data dosen berhasil diperbarui",
            data: dosen
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data dosen berdasarkan ID
export const deleteDosen = async (req, res) => {
    try {
        const dosen = await Dosen.findByPk(req.params.id);
        if (!dosen) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Dosen tidak ditemukan'
            });
        }
        
        dosen.status = 0;
        await dosen.save();
        
        return res.status(200).json({
            statusCode: 200,
            message: 'Data dosen berhasil dinonaktifkan'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};