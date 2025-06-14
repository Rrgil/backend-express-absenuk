import Users from '../models/users.models.js';
// import Opd from '../models/opd.models.js';
import Mahasiswa from '../models/mahasiswa.models.js';
// import Device from '../models/device.models.js';
import Jadwal from '../models/jadwal.models.js';
// import Jabatan from '../models/jabatan.models.js';

// Mendapatkan jumlah data untuk dashboard
export const getDashboardData = async (req, res) => {
  try {
    // Hitung jumlah data dari setiap tabel
    const usersCount = await Users.count();
    // const opdCount = await Opd.count();
    const mahasiswaCount = await Mahasiswa.count();
    // const deviceCount = await Device.count();
    const jadwalCount = await Jadwal.count();
    // const jabatanCount = await Jabatan.count();

    // Kirim response dengan semua data
    res.status(200).json({
      StatusCode: 200,
      message: "Data ditemukan",
      data: {
        users: usersCount,
        // opd: opdCount,
        mahasiswa: mahasiswaCount,
        // device: deviceCount,
        jadwal: jadwalCount,
        // jabatan: jabatanCount
      },
    });
  } catch (error) {
    res.status(500).json({
      StatusCode: 500,
      message: error.message || "Terjadi kesalahan pada Server",
      data: null
    });
  }
};