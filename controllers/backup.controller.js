import { Parser } from 'json2csv';
import Presensi from '../models/presensi.model.js';
import Mahasiswa from '../models/mahasiswa.model.js';
import Jadwal from '../models/jadwal.model.js';
import Prodi from '../models/prodi.model.js';
import MataKuliah from '../models/mata_kuliah.model.js';
import Dosen from '../models/dosen.model.js';
import Hari from '../models/hari.model.js';
import Kelas from '../models/kelas.model.js';
import Semester from '../models/semester.model.js';

export const backupPresensi = async (req, res) => {
    try {
        const presensiData = await Presensi.findAll({
            include: [
                {
                    model: Mahasiswa,
                    as: 'mahasiswa',
                    attributes: ['nim', 'nama'],
                    include: [{
                        model: Prodi,
                        as: 'prodi',
                        attributes: ['nama_prodi']
                    }]
                },
                {
                    model: Jadwal,
                    as: 'jadwal',
                    attributes: ['jam_mulai', 'jam_selesai'],
                    include: [
                        { model: MataKuliah, as: 'mata_kuliah', attributes: ['nama_mata_kuliah'] },
                        { model: Dosen, as: 'dosen', attributes: ['nama'] },
                        { model: Hari, as: 'hari', attributes: ['nama_hari'] },
                        { model: Kelas, as: 'kelas', attributes: ['nama_kelas'] },
                        { model: Semester, as: 'semester', attributes: ['nama_semester'] }
                    ]
                }
            ],
            order: [
                ['id', 'ASC']
            ],
            raw: true,
            nest: true
        });

        if (presensiData.length === 0) {
            return res.status(404).json({ msg: "Tidak ada data presensi untuk di-backup." });
        }

        const flattenedData = presensiData.map(p => ({
            'ID Presensi': p.id,
            'NIM': p.mahasiswa.nim,
            'Nama Mahasiswa': p.mahasiswa.nama,
            'Program Studi': p.mahasiswa.prodi.nama_prodi,
            'Mata Kuliah': p.jadwal.mata_kuliah.nama_mata_kuliah,
            'Dosen': p.jadwal.dosen.nama,
            'Kelas': p.jadwal.kelas.nama_kelas,
            'Semester': p.jadwal.semester.nama_semester,
            'Hari': p.jadwal.hari.nama_hari,
            'Jam Mulai': p.jadwal.jam_mulai,
            'Jam Selesai': p.jadwal.jam_selesai,
            'Tanggal Masuk': p.masuk_date,
            'Latitude Masuk': p.masuk_lat,
            'Longitude Masuk': p.masuk_lng,
            'Gambar Masuk': p.masuk_image,
            'Tanggal Keluar': p.keluar_date,
            'Latitude Keluar': p.keluar_lat,
            'Longitude Keluar': p.keluar_lng,
            'Gambar Keluar': p.keluar_image,
            'Status': p.status === 1 ? 'Hadir' : (p.status === 2 ? 'Izin' : (p.status === 3 ? 'Sakit' : 'Alpa')),
        }));

        const fields = [
            'ID Presensi', 'NIM', 'Nama Mahasiswa', 'Program Studi', 'Mata Kuliah', 
            'Dosen', 'Kelas', 'Semester', 'Hari', 'Jam Mulai', 'Jam Selesai',
            'Tanggal Masuk', 'Latitude Masuk', 'Longitude Masuk', 'Gambar Masuk',
            'Tanggal Keluar', 'Latitude Keluar', 'Longitude Keluar', 'Gambar Keluar', 'Status'
        ];
        
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(flattenedData);

        const date = new Date().toISOString().slice(0, 10);
        const filename = `backup-presensi-${date}.csv`;

        res.header('Content-Type', 'text/csv');
        res.attachment(filename);
        res.status(200).send(csv);

    } catch (error) {
        console.error("Error saat backup data presensi:", error);
        res.status(500).json({ msg: "Gagal melakukan backup data", error: error.message });
    }
};