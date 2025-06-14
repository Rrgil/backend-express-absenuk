import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Setup koneksi Sequelize
const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres", // fallback jaga-jaga
    port: process.env.DB_PORT || 5432,
    logging: process.env.DB_LOGGING === "true" ? console.log : false, // bisa matiin logging di production
    define: {
      timestamps: false,        // nggak auto bikin createdAt/updatedAt
      freezeTableName: true     // biar nama tabel gak diubah jadi jamak
    }
  }
);

// Tes koneksi
try {
  await db.authenticate();
  console.log("✅ Database connected successfully (Sequelize)");
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
}

export default db;
