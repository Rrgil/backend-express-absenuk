import Jadwal from "../models/jadwal.model.js";

// Fungsi untuk mengambil semua data jadwal
export const getAllJadwal = async (req, res) => {
    try {
        const jadwal = await Jadwal.findAll();
        res.status(200).json(jadwal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
