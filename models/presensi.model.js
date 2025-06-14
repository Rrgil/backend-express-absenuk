import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import Mahasiswa from "./mahasiswa.model.js";
import Jadwal from "./jadwal.model.js";

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
        type: DataTypes.STRING,
        allowNull: false
    },
    keluar_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    keluar_lat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    keluar_lng: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    keluar_image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
})

// Relasi Presensi dengan Mahasiswa
Presensi.belongsTo(Mahasiswa, {
    foreignKey: 'id'
})

// Relasi Presensi dengan Jadwal
Presensi.belongsTo(Jadwal, {
    foreignKey: 'id'
})

export default Presensi;