import Jadwal from "../models/jadwal.model.js";
import Kelas from "../models/kelas.model.js";
import MataKuliah from "../models/mata_kuliah.model.js";
import Dosen from "../models/dosen.model.js";
import Hari from "../models/hari.model.js";
import Prodi from "../models/prodi.model.js";
import Semester from "../models/semester.model.js";
import { Sequelize } from "sequelize";
import Mahasiswa from "../models/mahasiswa.model.js";

// Helper untuk cek konflik jadwal
const checkConflict = async (id_kelas, id_hari, jam_mulai, jam_selesai, excludeId = null) => {
    const whereClause = {
        id_kelas,
        id_hari,
        status: 1,
        [Sequelize.Op.or]: [
            { jam_mulai: { [Sequelize.Op.between]: [jam_mulai, jam_selesai] } },
            { jam_selesai: { [Sequelize.Op.between]: [jam_mulai, jam_selesai] } },
            { 
                [Sequelize.Op.and]: [
                    { jam_mulai: { [Sequelize.Op.lt]: jam_selesai } },
                    { jam_selesai: { [Sequelize.Op.gt]: jam_mulai } }
                ]
            }
        ]
    };

    if (excludeId) {
        whereClause.id = { [Sequelize.Op.ne]: excludeId };
    }

    return await Jadwal.findOne({ where: whereClause });
};

// Mengambil semua jadwal
export const getAllJadwal = async (req, res) => {
    try {
        const jadwal = await Jadwal.findAll({
            where: { status: 1 },
            include: [
                { model: Kelas, as: 'kelas', attributes: ['id', 'nama'] },
                { model: MataKuliah, as: 'mata_kuliah', attributes: ['id', 'nama'] },
                { model: Dosen, as: 'dosen', attributes: ['id', 'nama'] },
                { model: Hari, as: 'hari', attributes: ['id', 'nama'] },
                { model: Prodi, as: 'prodi', attributes: ['id', 'nama'] },
                { model: Semester, as: 'semester', attributes: ['id', 'nama'] }
            ],
            order: [['id', 'DESC']]
        });
        return res.status(200).json({
            statusCode: 200,
            message: "Data jadwal berhasil diambil",
            data: jadwal
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

// Mengambil jadwal by ID
export const getJadwalById = async (req, res) => {
    try {
        const jadwal = await Jadwal.findByPk(req.params.id, {
            include: [
                { model: Kelas, as: 'kelas' }, 
                { model: MataKuliah, as: 'mata_kuliah' }, 
                { model: Dosen, as: 'dosen' }, 
                { model: Hari, as: 'hari' },
                { model: Prodi, as: 'prodi' },
                { model: Semester, as: 'semester' }
            ]
        });
        if (!jadwal) return res.status(404).json({ statusCode: 404, message: 'Jadwal tidak ditemukan' });
        return res.status(200).json({ statusCode: 200, message: "Data jadwal berhasil diambil", data: jadwal });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

// Membuat jadwal baru
export const createJadwal = async (req, res) => {
    const { id_kelas, id_mata_kuliah, id_dosen, id_hari, jam_mulai, jam_selesai, id_prodi, id_semester } = req.body;

    if (!id_kelas || !id_mata_kuliah || !id_dosen || !id_hari || !jam_mulai || !jam_selesai || !id_prodi || !id_semester) {
        return res.status(400).json({ statusCode: 400, message: "Semua field wajib diisi." });
    }
    if (jam_mulai >= jam_selesai) {
        return res.status(400).json({ statusCode: 400, message: "Jam mulai harus lebih awal dari jam selesai." });
    }

    try {
        const conflict = await checkConflict(id_kelas, id_hari, jam_mulai, jam_selesai);
        if (conflict) {
            return res.status(409).json({ statusCode: 409, message: "Jadwal bentrok dengan jadwal lain di kelas dan hari yang sama." });
        }

        const newJadwal = await Jadwal.create(req.body);
        return res.status(201).json({ statusCode: 201, message: "Jadwal berhasil ditambahkan", data: newJadwal });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

// Memperbarui jadwal
export const updateJadwal = async (req, res) => {
    const { id } = req.params;
    const { id_kelas, id_mata_kuliah, id_dosen, id_hari, jam_mulai, jam_selesai, id_prodi, id_semester } = req.body;

    if (!id_kelas || !id_mata_kuliah || !id_dosen || !id_hari || !jam_mulai || !jam_selesai || !id_prodi || !id_semester) {
        return res.status(400).json({ statusCode: 400, message: "Semua field wajib diisi." });
    }
    if (jam_mulai >= jam_selesai) {
        return res.status(400).json({ statusCode: 400, message: "Jam mulai harus lebih awal dari jam selesai." });
    }

    try {
        const jadwal = await Jadwal.findByPk(id);
        if (!jadwal) return res.status(404).json({ statusCode: 404, message: "Jadwal tidak ditemukan." });

        const conflict = await checkConflict(id_kelas, id_hari, jam_mulai, jam_selesai, id);
        if (conflict) {
            return res.status(409).json({ statusCode: 409, message: "Jadwal bentrok dengan jadwal lain di kelas dan hari yang sama." });
        }

        await jadwal.update(req.body);
        return res.status(200).json({ statusCode: 200, message: "Jadwal berhasil diperbarui", data: jadwal });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

// Endpoint untuk Mobile: Mengambil jadwal berdasarkan prodi dan semester
export const getJadwalForMobile = async (req, res) => {
    const { prodiId, semesterId } = req.query;

    if (!prodiId || !semesterId) {
        return res.status(400).json({ statusCode: 400, message: "Parameter prodiId dan semesterId diperlukan." });
    }

    try {
        const jadwal = await Jadwal.findAll({
            where: {
                id_prodi: prodiId,
                id_semester: semesterId,
                status: 1
            },
            include: [
                { model: Kelas, as: 'kelas', attributes: ['id', 'nama'] },
                { model: MataKuliah, as: 'mata_kuliah', attributes: ['id', 'nama'] },
                { model: Dosen, as: 'dosen', attributes: ['id', 'nama'] },
                { model: Hari, as: 'hari', attributes: ['id', 'nama'] },
            ],
            order: [['id_hari', 'ASC'], ['jam_mulai', 'ASC']]
        });

        return res.status(200).json({
            statusCode: 200,
            message: "Data jadwal berhasil diambil",
            data: jadwal
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

// Mengambil jadwal spesifik untuk mahasiswa pada hari ini (untuk mobile)
export const getJadwalHariIniForMahasiswa = async (req, res) => {
    const { id_mahasiswa } = req.params;

    if (!id_mahasiswa) {
        return res.status(400).json({ statusCode: 400, message: "ID Mahasiswa diperlukan." });
    }

    try {
        // 1. Dapatkan data mahasiswa untuk mengetahui prodi dan semesternya
        // 1. Dapatkan data mahasiswa untuk mengetahui prodi dan semesternya
        const mahasiswa = await Mahasiswa.findByPk(id_mahasiswa);
        if (!mahasiswa || !mahasiswa.id_prodi || !mahasiswa.id_semester) {
            return res.status(404).json({ statusCode: 404, message: "Data prodi atau semester untuk mahasiswa ini tidak ditemukan." });
        }

        // 2. Dapatkan nama hari ini (dalam bahasa Indonesia, contoh: 'Senin')
        const namaHariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' });

        // 3. Cari ID hari dari tabel Hari berdasarkan nama hari
        const hari = await Hari.findOne({ where: { nama: namaHariIni } });
        if (!hari) {
            return res.status(200).json({
                statusCode: 200,
                message: `Tidak ada jadwal untuk hari ${namaHariIni}.`,
                data: []
            });
        }

        // 4. Cari semua jadwal yang cocok dengan prodi, semester, dan hari mahasiswa
        // 4. Cari semua jadwal yang cocok dengan prodi, semester, dan hari mahasiswa
        const jadwal = await Jadwal.findAll({
            where: {
                id_prodi: mahasiswa.id_prodi,
                id_semester: mahasiswa.id_semester,
                id_hari: hari.id,
                status: 1 // Hanya jadwal yang aktif
            },
            include: [
                { model: MataKuliah, as: 'mata_kuliah', attributes: ['id', 'nama'] },
                { model: Dosen, as: 'dosen', attributes: ['id', 'nama'] },
                { model: Kelas, as: 'kelas', attributes: ['id', 'nama'] }, // Kelas masih bisa di-include untuk info tambahan
                { model: Hari, as: 'hari', attributes: ['id', 'nama'] },
            ],
            order: [['jam_mulai', 'ASC']] // Urutkan berdasarkan jam mulai
        });

        return res.status(200).json({
            statusCode: 200,
            message: "Data jadwal hari ini berhasil diambil",
            data: jadwal
        });

    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};

// Menghapus jadwal (soft delete)
export const deleteJadwal = async (req, res) => {
    try {
        const jadwal = await Jadwal.findByPk(req.params.id);
        if (!jadwal) return res.status(404).json({ statusCode: 404, message: "Jadwal tidak ditemukan." });

        await jadwal.update({ status: 0 });
        return res.status(200).json({ statusCode: 200, message: "Jadwal berhasil dihapus (dinonaktifkan)." });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: error.message });
    }
};
