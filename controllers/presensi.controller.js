import Presensi from "../models/presensi.model.js";

// Fungsi untuk mengambil semua data presensi
export const getAllPresensi = async (req, res) => {
    try {
        const presensi = await Presensi.findAll();
        res.status(200).json(presensi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
