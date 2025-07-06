import express from 'express';
import JenisKelamin from '../models/jenis_kelamin.model.js';
import Semester from '../models/semester.model.js';
import Hari from '../models/hari.model.js';
import Dosen from '../models/dosen.model.js';
import Kelas from '../models/kelas.model.js';
import Prodi from '../models/prodi.model.js';
import Mahasiswa from '../models/mahasiswa.model.js';
import MataKuliah from '../models/mata_kuliah.model.js';
import Jadwal from '../models/jadwal.model.js';

const router = express.Router();

// GET all Jenis Kelamin
router.get('/jenis_kelamin', async (req, res) => {
  try {
    const data = await JenisKelamin.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jenis kelamin', error: error.message });
  }
});

// GET all Semester
router.get('/semester', async (req, res) => {
  try {
    const data = await Semester.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching semester', error: error.message });
  }
});

// GET all Hari
router.get('/hari', async (req, res) => {
  try {
    const data = await Hari.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hari', error: error.message });
  }
});



// GET all Dosen
router.get('/dosen', async (req, res) => {
  try {
    const data = await Dosen.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dosen', error: error.message });
  }
});

// GET all Kelas
router.get('/kelas', async (req, res) => {
  try {
    const data = await Kelas.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching kelas', error: error.message });
  }
});

// GET all Prodi
router.get('/prodi', async (req, res) => {
  try {
    const data = await Prodi.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prodi', error: error.message });
  }
});

// GET all Mahasiswa
router.get('/mahasiswa', async (req, res) => {
  try {
    const data = await Mahasiswa.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mahasiswa', error: error.message });
  }
});

// GET all Mata Kuliah
router.get('/mata_kuliah', async (req, res) => {
  try {
    const data = await MataKuliah.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mata kuliah', error: error.message });
  }
});

// GET all Jadwal
router.get('/jadwal', async (req, res) => {
  try {
    const data = await Jadwal.findAll();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jadwal', error: error.message });
  }
});

export default router;
