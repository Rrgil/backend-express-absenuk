import path from 'path';
import fs from 'fs';
import db from '../config/db.config.js';
import { Sequelize } from 'sequelize';

// Fungsi untuk membuat backup database
export const createBackup = async (req, res) => {
  try {
    const { startDate, endDate, autoDelete } = req.body;
    
    // Buat nama file dengan timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'temp', backupFileName);

    // Buat direktori temp jika belum ada
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Query untuk mendapatkan data
    let whereClause = '';
    if (startDate && endDate) {
      whereClause = `WHERE created_at BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // Dapatkan data dari tabel absensi
    const results = await db.query(`SELECT * FROM absensi ${whereClause}`, {
      type: Sequelize.QueryTypes.SELECT
    });

    let backupContent = '';
    if (results.length > 0) {
      // Generate SQL INSERT statements
      backupContent += `-- Backup table absensi\n`;
      backupContent += `INSERT INTO absensi (${Object.keys(results[0]).join(', ')}) VALUES\n`;
      
      results.forEach((row, index) => {
        const values = Object.values(row).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          return val;
        });
        
        backupContent += `(${values.join(', ')})${index === results.length - 1 ? ';' : ','}\n`;
      });
    }

    // Jika autoDelete true, hapus data sesuai range tanggal
    if (autoDelete && startDate && endDate) {
      await db.query(`
        DELETE FROM absensi 
        WHERE created_at BETWEEN :startDate AND :endDate
      `, {
        replacements: { startDate, endDate },
        type: Sequelize.QueryTypes.DELETE
      });
    }

    // Tulis ke file
    fs.writeFileSync(backupPath, backupContent);

    // Baca file backup
    const fileContent = fs.readFileSync(backupPath);

    // Hapus file temporary
    fs.unlinkSync(backupPath);

    // Set header untuk download
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename=${backupFileName}`);
    
    // Kirim file
    res.send(fileContent);

  } catch (error) {
    console.error('Error saat backup:', error);
    res.status(500).json({
      StatusCode: 500,
      message: "Gagal membuat backup database",
      error: error.message
    });
  }
};

// Fungsi untuk mendapatkan daftar file backup
export const getBackupFiles = async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Buat direktori jika belum ada
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created); // Urutkan dari yang terbaru

    res.status(200).json({
      StatusCode: 200,
      message: "Berhasil mendapatkan daftar file backup",
      data: files
    });
  } catch (error) {
    console.error('Error saat mengambil daftar backup:', error);
    res.status(500).json({
      StatusCode: 500,
      message: "Gagal mendapatkan daftar file backup",
      error: error.message
    });
  }
};
