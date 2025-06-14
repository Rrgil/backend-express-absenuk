import GroupUsers from "../models/group_users.model.js";
import { Sequelize } from "sequelize";

// Fungsi untuk mengambil semua data group_users
export const getAllGroupUsers = async (req, res) => {
    try {
        const group_users = await GroupUsers.findAll();
        return res.status(200).json({
            statusCode: 200,
            message: "Data group users berhasil diambil",
            data: group_users
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
}

// Fungsi untuk mengambil data group_users berdasarkan id
export const getGroupUsersById = async (req, res) => {
    try {
        const group = await GroupUsers.findOne({
            where: {
                id: req.params.id,
                status: 1
            }
        });
        if (!group) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Group tidak ditemukan'
            });
        }
        return res.status(200).json({
            statusCode: 200,
            message: 'Data group berhasil diambil',
            data: group
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menambahkan data group_users
export const createGroupUsers = async (req, res) => {
    try {
        // Validasi input wajib
        const { group_nama } = req.body;
        
        if (!group_nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama group wajib diisi"
            });
        }
        
        // Cek apakah nama group sudah ada
        const existingGroup = await GroupUsers.findOne({ where: { group_nama: group_nama } });
        if (existingGroup) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama group sudah terdaftar"
            });
        }
        
        // Buat data group baru
        const newGroup = await GroupUsers.create({
            group_nama,
            is_aktif: 1, // Aktif secara default
            status: 1 // Status aktif
        });
        
        return res.status(201).json({
            statusCode: 201,
            message: "Data group berhasil ditambahkan",
            data: newGroup
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk mengupdate data group_users
export const updateGroupUsers = async (req, res) => {
    try {
        const group = await GroupUsers.findOne({
            where: {
                id: req.params.id,
                status: 1
            }
        });
        
        if (!group) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Group tidak ditemukan'
            });
        }
        
        const { group_nama, is_aktif } = req.body;
        
        // Validasi input wajib
        if (!group_nama) {
            return res.status(400).json({
                statusCode: 400,
                message: "Nama group wajib diisi"
            });
        }
        
        // Cek apakah nama group sudah digunakan oleh group lain
        if (group_nama !== group.group_nama) {
            const existingGroup = await GroupUsers.findOne({ 
                where: { group_nama: group_nama, id: { [Sequelize.Op.ne]: req.params.id } }
            });
            if (existingGroup) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Nama group sudah digunakan oleh group lain"
                });
            }
        }

        // Update data group
        group.group_nama = group_nama;
        if (is_aktif !== undefined) group.is_aktif = is_aktif;
        await group.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Data group berhasil diperbarui",
            data: group
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};

// Fungsi untuk menghapus data group_users
export const deleteGroupUsers = async (req, res) => {
    try {
        const group = await GroupUsers.findOne({
            where: {
                id: req.params.id,
                status: 1
            }
        });

        if (!group) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Group tidak ditemukan'
            });
        }

        // Soft delete dengan mengubah status menjadi 0
        group.status = 0;
        await group.save();

        return res.status(200).json({
            statusCode: 200,
            message: 'Group berhasil dihapus'
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
};
