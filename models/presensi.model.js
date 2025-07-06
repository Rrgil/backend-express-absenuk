import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import Mahasiswa from "./mahasiswa.model.js";
import Jadwal from "./jadwal.model.js";
import StatusAbsen from "./status_absen.model.js";

const DataTypes = Sequelize;

const Presensi = db.define("presensi", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    id_mahasiswa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Mahasiswa,
            key: 'id'
        }
    },
    id_jadwal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Jadwal,
            key: 'id'
        }
    },
    id_status_absen: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: StatusAbsen,
            key: 'id'
        }
    },
    masuk_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    masuk_lat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    masuk_lng: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    masuk_image: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    keluar_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    keluar_lat: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    keluar_lng: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    keluar_image: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 1 // 1 for active (not deleted), 0 for soft-deleted
    }
})

// Relasi Presensi dengan Mahasiswa
Presensi.belongsTo(Mahasiswa, {
    foreignKey: 'id_mahasiswa',
    as: 'mahasiswa'
})

// Relasi Presensi dengan Status Absen
Presensi.belongsTo(StatusAbsen, {
    foreignKey: 'id_status_absen',
    as: 'status_absen'
})

// Relasi Presensi dengan Jadwal
Presensi.belongsTo(Jadwal, {
    foreignKey: 'id_jadwal',
    as: 'jadwal'
})

export default Presensi;