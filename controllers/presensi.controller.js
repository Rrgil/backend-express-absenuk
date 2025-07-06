import { Op } from 'sequelize';
import Presensi from '../models/presensi.model.js';
import Mahasiswa from '../models/mahasiswa.model.js';
import Jadwal from '../models/jadwal.model.js';
import StatusAbsen from '../models/status_absen.model.js';
import AreaKampus from '../models/area_kampus.model.js';
import MataKuliah from '../models/mata_kuliah.model.js';

// --- Helper Function for Geolocation ---

/**
 * Memeriksa apakah sebuah titik berada di dalam sebuah poligon.
 * Menggunakan algoritma ray-casting.
 * @param {object} point Titik yang akan diperiksa { latitude, longitude }
 * @param {array} polygon Array dari titik-titik poligon [{ latitude, longitude }]
 * @returns {boolean} True jika titik berada di dalam poligon.
 */
function isPointInPolygon(point, polygon) {
    const { latitude: lat, longitude: lng } = point;
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const { latitude: lat_i, longitude: lng_i } = polygon[i];
        const { latitude: lat_j, longitude: lng_j } = polygon[j];

        const intersect = ((lng_i > lng) !== (lng_j > lng)) &&
            (lat < (lat_j - lat_i) * (lng - lng_i) / (lng_j - lng_i) + lat_i);
        if (intersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}


// Fungsi untuk mengambil semua data presensi dengan paginasi, filter, dan pencarian
export const getAllPresensi = async (req, res) => {
    try {
        const { page = 1, perPage = 10, startDate, endDate, search, isFiltered } = req.query;

        const limit = parseInt(perPage, 10);
        const offset = (parseInt(page, 10) - 1) * limit;

        let whereClause = {};

        // Filter berdasarkan rentang tanggal jika isFiltered true
        if (isFiltered === 'true' && startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            whereClause.masuk_date = {
                [Op.between]: [start, end]
            };
        }

        // Konfigurasi untuk menyertakan model relasi
        let includeClause = [
            {
                model: Mahasiswa,
                as: 'mahasiswa',
                attributes: ['nim', 'nama'],
                // Filter pencarian berdasarkan nama atau NIM mahasiswa
                where: search ? {
                    [Op.or]: [
                        { nama: { [Op.iLike]: `%${search}%` } },
                        { nim: { [Op.iLike]: `%${search}%` } }
                    ]
                } : undefined,
                required: !!search // INNER JOIN jika ada pencarian
            },
            {
                model: Jadwal,
                as: 'jadwal',
                attributes: ['id'],
                include: [
                    {
                        model: MataKuliah,
                        as: 'mata_kuliah',
                        attributes: ['nama']
                    }
                ]
            },
            {
                model: StatusAbsen,
                as: 'status_absen',
                attributes: ['nama']
            }
        ];

        const { count, rows } = await Presensi.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit,
            offset,
            order: [['masuk_date', 'DESC']],
            distinct: true // Penting untuk perhitungan yang benar saat menggunakan include
        });

        res.status(200).json({
            statusCode: 200,
            message: "Data presensi berhasil diambil",
            data: rows,
            total: count
        });

    } catch (error) {
        console.error("Error saat mengambil data presensi:", error);
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};

// Fungsi untuk mengambil riwayat presensi seorang mahasiswa berdasarkan bulan dan tahun
export const getPresensiByMahasiswa = async (req, res) => {
    try {
        const { id_mahasiswa } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Parameter bulan (month) dan tahun (year) diperlukan.'
            });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const presensiRecords = await Presensi.findAll({
            where: {
                id_mahasiswa: id_mahasiswa,
                masuk_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: Jadwal,
                    as: 'jadwal',
                    attributes: ['id'],
                    include: [
                        {
                            model: MataKuliah,
                            as: 'mata_kuliah',
                            attributes: ['nama']
                        }
                    ]
                },
                {
                    model: StatusAbsen,
                    as: 'status_absen',
                    attributes: ['nama']
                }
            ],
            order: [['masuk_date', 'ASC']]
        });

        res.status(200).json({
            statusCode: 200,
            message: 'Data riwayat presensi berhasil diambil.',
            data: presensiRecords
        });

    } catch (error) {
        console.error('Error saat mengambil riwayat presensi:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Terjadi kesalahan pada server.'
        });
    }
};

// Fungsi untuk membuat presensi masuk (dengan validasi lokasi)
export const createPresensiMasuk = async (req, res) => {
    // 1. Ambil data dari request body dan file
    const { id_mahasiswa, id_jadwal, latitude, longitude } = req.body;
    const imagePath = req.file ? `/uploads/presensi/${req.file.filename}` : null;

    // Validasi input dasar
    if (!id_mahasiswa || !id_jadwal || !latitude || !longitude) {
        return res.status(400).json({
            statusCode: 400,
            message: "Data tidak lengkap. Pastikan id_mahasiswa, id_jadwal, latitude, dan longitude disertakan."
        });
    }

    try {
        // 2. Validasi apakah jadwal ada dan aktif
        const jadwal = await Jadwal.findOne({ where: { id: id_jadwal, status: 1 } });
        if (!jadwal) {
            return res.status(404).json({
                statusCode: 404,
                message: "Jadwal tidak ditemukan atau tidak aktif."
            });
        }

        // Cek apakah sudah pernah presensi masuk untuk jadwal ini
        const existingPresensi = await Presensi.findOne({
            where: {
                id_mahasiswa: id_mahasiswa,
                id_jadwal: id_jadwal,
            }
        });

        if (existingPresensi) {
            return res.status(409).json({
                statusCode: 409,
                message: "Anda sudah melakukan presensi masuk untuk jadwal ini."
            });
        }

        // 2. Ambil data area kampus dari database
        const areaKampus = await AreaKampus.findOne();

        if (!areaKampus || !areaKampus.polygon) {
            return res.status(500).json({
                statusCode: 500,
                message: "Konfigurasi area kampus (polygon) tidak ditemukan atau tidak valid."
            });
        }

        // 3. Lakukan validasi lokasi
        const userPoint = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        const polygonPoints = Array.isArray(areaKampus.polygon) ? areaKampus.polygon : JSON.parse(areaKampus.polygon);

        const isLokasiValid = isPointInPolygon(userPoint, polygonPoints);

        // 4. Jika lokasi tidak valid, tolak presensi
        if (!isLokasiValid) {
            return res.status(403).json({
                statusCode: 403,
                message: "Presensi ditolak. Anda berada di luar area yang diizinkan."
            });
        }

        // 5. Jika lokasi valid, simpan data
        const presensiBaru = await Presensi.create({
            id_mahasiswa: id_mahasiswa,
            id_jadwal: id_jadwal,
            masuk_date: new Date(),
            masuk_lat: latitude,
            masuk_lng: longitude,
            masuk_image: imagePath, // Path dari multer
            id_status_absen: 1 // Status 1 = Masuk
        });

        res.status(201).json({
            statusCode: 201,
            message: "Presensi masuk berhasil.",
            data: presensiBaru
        });

    } catch (error) {
        console.error("Error saat membuat presensi:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan pada server saat melakukan presensi."
        });
    }
}

// Fungsi untuk membuat presensi pulang
export const createPresensiPulang = async (req, res) => {
    // 1. Ambil data dari request body dan file
    const { id_mahasiswa, id_jadwal, latitude, longitude } = req.body;
    const imagePath = req.file ? `/uploads/presensi/${req.file.filename}` : null;

    // Validasi input dasar
    if (!id_mahasiswa || !id_jadwal || !latitude || !longitude) {
        return res.status(400).json({
            statusCode: 400,
            message: "Data tidak lengkap. Pastikan id_mahasiswa, id_jadwal, latitude, dan longitude disertakan."
        });
    }

    try {
        // 2. Cari presensi masuk yang sesuai (belum pulang)
        const presensi = await Presensi.findOne({
            where: {
                id_mahasiswa: id_mahasiswa,
                id_jadwal: id_jadwal,
                id_status_absen: 1, // Status 'Masuk'
                keluar_date: null // Pastikan belum pernah presensi pulang
            }
        });

        // 3. Jika tidak ada presensi masuk yang valid, kembalikan error
        if (!presensi) {
            return res.status(404).json({
                statusCode: 404,
                message: "Presensi masuk tidak ditemukan atau Anda sudah melakukan presensi pulang."
            });
        }

        // 4. Update record presensi dengan data pulang
        presensi.keluar_date = new Date();
        presensi.keluar_lat = latitude;
        presensi.keluar_lng = longitude;
        presensi.keluar_image = imagePath; // Path dari multer

        await presensi.save();

        res.status(200).json({
            statusCode: 200,
            message: "Presensi pulang berhasil dicatat.",
            data: presensi
        });

    } catch (error) {
        console.error("Error saat presensi pulang:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Terjadi kesalahan pada server saat presensi pulang."
        });
    }
};
