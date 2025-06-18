import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mendapatkan root direktori project
const rootDir = path.join(__dirname, '..');

/**
 * Fungsi untuk membuat storage berdasarkan path tujuan
 * @param {string} uploadPath - Path tujuan upload (relatif ke root)
 * @param {string} prefix - Prefix untuk nama file (optional)
 * @returns {multer.StorageEngine}
 */
const createStorage = (uploadPath, prefix = '') => {
    const fullPath = path.join(rootDir, uploadPath);
    return multer.diskStorage({
        destination: function (req, file, cb) {
            // Buat direktori jika belum ada
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            // Memaksa awalan 'config-' untuk path konfigurasi untuk memastikan konsistensi
            if (uploadPath === 'uploads/configurasi') {
                cb(null, 'config-' + uniqueSuffix + ext);
            } else {
                cb(null, prefix + uniqueSuffix + ext);
            }
        }
    });
};

// Filter file untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Hanya file gambar yang diperbolehkan!'));
};

// Definisi path untuk setiap jenis upload
const uploadPaths = {
    users: 'public/uploads/users',
    mahasiswa: 'public/uploads/mahasiswa',
    dosen: 'public/uploads/dosen',
    informasi: 'public/uploads/informasi',
    configurasi: 'public/uploads/configurasi'
};

// Buat storage untuk setiap jenis upload
const userStorage = createStorage(uploadPaths.users, 'user-');
const mahasiswaStorage = createStorage(uploadPaths.mahasiswa, 'mahasiswa-');
const dosenStorage = createStorage(uploadPaths.dosen, 'dosen-');
const informasiStorage = createStorage(uploadPaths.informasi, 'informasi-');
const configurasiStorage = createStorage(uploadPaths.configurasi, 'config-');

// Konfigurasi multer untuk setiap jenis upload
const userUpload = multer({
    storage: userStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Maksimal 2MB
    }
});

const mahasiswaUpload = multer({
    storage: mahasiswaStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Maksimal 2MB
    }
});

const dosenUpload = multer({
    storage: dosenStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Maksimal 2MB
    }
});

const informasiUpload = multer({
    storage: informasiStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Maksimal 5MB untuk informasi (mungkin berisi gambar lebih besar)
    }
});

const configurasiUpload = multer({
    storage: configurasiStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Maksimal 2MB untuk icon konfigurasi
    }
});

// Konfigurasi default untuk upload umum
const defaultStorage = createStorage('public/uploads/temp', 'temp-');
const upload = multer({
    storage: defaultStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Maksimal 2MB
    }
});

// Fungsi untuk upload single file dengan field name yang berbeda
export const uploadSingle = (fieldName) => upload.single(fieldName);

// Fungsi untuk upload single file khusus untuk tipe tertentu
export const uploadUserSingle = (fieldName) => userUpload.single(fieldName);
export const uploadMahasiswaSingle = (fieldName) => mahasiswaUpload.single(fieldName);
export const uploadDosenSingle = (fieldName) => dosenUpload.single(fieldName);
export const uploadInformasiSingle = (fieldName) => informasiUpload.single(fieldName);
export const uploadConfigurasiSingle = (fieldName) => configurasiUpload.single(fieldName);

// Fungsi untuk upload multiple file dengan field name yang berbeda
export const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);
export const uploadUserMultiple = (fieldName, maxCount) => userUpload.array(fieldName, maxCount);
export const uploadMahasiswaMultiple = (fieldName, maxCount) => mahasiswaUpload.array(fieldName, maxCount);
export const uploadDosenMultiple = (fieldName, maxCount) => dosenUpload.array(fieldName, maxCount);
export const uploadInformasiMultiple = (fieldName, maxCount) => informasiUpload.array(fieldName, maxCount);
export const uploadConfigurasiMultiple = (fieldName, maxCount) => configurasiUpload.array(fieldName, maxCount);

// Fungsi untuk upload multiple file dengan field name yang berbeda-beda
export const uploadFields = (fields) => upload.fields(fields);

export default upload;