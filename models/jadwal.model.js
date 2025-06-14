import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import Kelas from "./kelas.model.js";
import MataKuliah from "./mata_kuliah.model.js";
import Dosen from "./dosen.model.js";
import Hari from "./hari.model.js";

const DataTypes = Sequelize;

const Jadwal = db.define("jadwal", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    id_kelas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Kelas,
            key: 'id'
        }
    },
    id_mata_kuliah: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MataKuliah,
            key: 'id'
        }
    },
    id_dosen: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Dosen,
            key: 'id'
        }
    },
    id_hari: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Hari,
            key: 'id'
        }
    },
    jam_mulai: {
        type: DataTypes.TIME,
        allowNull: false
    },
    jam_selesai: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
})

// Relasi Jadwal dengan Kelas
Jadwal.belongsTo(Kelas, {
    foreignKey: 'id_kelas'
})

// Relasi Jadwal dengan MataKuliah
Jadwal.belongsTo(MataKuliah, {
    foreignKey: 'id_mata_kuliah'
})

// Relasi Jadwal dengan Dosen
Jadwal.belongsTo(Dosen, {
    foreignKey: 'id_dosen'
})

// Relasi Jadwal dengan Hari
Jadwal.belongsTo(Hari, {
    foreignKey: 'id_hari'
})

export default Jadwal;