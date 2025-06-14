import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import db from './config/db.config.js';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Percayai proxy pertama saat menggunakan reverse proxy seperti ngrok
app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

// Konfigurasi helmet dengan kebijakan cross-origin yang benar
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Multi-origin CORS support
const allowedOrigins = process.env.CORS_ORIGIN.split(',');
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX),
  message: 'Terlalu banyak request, coba lagi nanti.'
});
app.use(limiter);



// Import models
// First import models with no dependencies
import GroupUser from './models/group_users.model.js';
import Prodi from './models/prodi.model.js';
import JenisKelamin from './models/jenis_kelamin.model.js';
import Kelas from './models/kelas.model.js';
import Hari from './models/hari.model.js';
import MataKuliah from './models/mata_kuliah.model.js';
import Dosen from './models/dosen.model.js';
import Informasi from './models/informasi.model.js';
// Then import models that depend on previous models
import User from './models/users.model.js';
import Mahasiswa from './models/mahasiswa.model.js';
import Jadwal from './models/jadwal.model.js';
// Finally import models that depend on multiple other models
import Presensi from './models/presensi.model.js';
import Sidebar from './models/sidebar.model.js';
import SidebarAkses from './models/sidebar_akses.model.js';
import ConfigurasiUmum from './models/configurasi_umum.model.js';

// Sync models
try {
  await db.sync({ alter: true });
  console.log('✅ Models synchronized!');
} catch (error) {
  console.error('❌ Error synchronizing models:', error);
}

// Import routes
import usersRoutes from './routes/users.route.js';
import groupUsersRoutes from './routes/group_users.route.js';
import prodiRoutes from './routes/prodi.route.js';
import kelasRoutes from './routes/kelas.route.js';
import mahasiswaRoutes from './routes/mahasiswa.route.js';
import dosenRoutes from './routes/dosen.route.js';
import hariRoutes from './routes/hari.route.js';
import mataKuliahRoutes from './routes/mata_kuliah.route.js';
import jadwalRoutes from './routes/jadwal.route.js';
import informasiRoutes from './routes/informasi.route.js';
import presensiRoutes from './routes/presensi.route.js';
import configurasiUmumRoutes from './routes/configurasi_umum.route.js';
import sidebarRoutes from './routes/sidebar.route.js';
import sidebarAksesRoutes from './routes/sidebar_akses.route.js';

// Use routes
app.use('/api/users', usersRoutes);
app.use('/api/group_users', groupUsersRoutes);
app.use('/api/prodis', prodiRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/dosen', dosenRoutes);
app.use('/api/hari', hariRoutes);
app.use('/api/mata_kuliah', mataKuliahRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/informasi', informasiRoutes);
app.use('/api/presensi', presensiRoutes);
app.use('/api/configurasi_umum', configurasiUmumRoutes);
app.use('/api/sidebar', sidebarRoutes);
app.use('/api/sidebar_akses', sidebarAksesRoutes);

// DB check
try {
  await db.authenticate();
  console.log('✅ Database connected!');
} catch (error) {
  console.error('❌ Database error:', error);
}

app.get('/', (req, res) => {
  res.send('API ready 🚀');
});

// Endpoint dinamis untuk mengakses gambar dengan error handling
app.get('/uploads/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  
  const options = {
    root: path.join(__dirname, 'uploads', folder),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  res.sendFile(filename, options, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      if (!res.headersSent) {
        res.status(404).json({
          statusCode: 404,
          message: 'File tidak ditemukan atau tidak dapat dibaca.',
          error: err.message
        });
      }
    }
  });
});

const PORT = process.env.PORT || 7000;
const HOST = process.env.HOST || '0.0.0.0'; // Gunakan 0.0.0.0 agar bisa diakses semua IP

// Get local network IP (IPv4)
const interfaces = os.networkInterfaces();
let localIP = 'localhost';

for (const name in interfaces) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIP = iface.address;
      break;
    }
  }
}

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at:`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → http://${localIP}:${PORT}`);
});
