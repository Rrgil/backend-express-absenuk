import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import Kelas from "./kelas.model.js";
import MataKuliah from "./mata_kuliah.model.js";
import Dosen from "./dosen.model.js";
import Hari from "./hari.model.js";
import Semester from "./semester.model.js";
import Prodi from "./prodi.model.js";

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
    },
    id_mata_kuliah: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_dosen: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_hari: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_prodi: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    tableName: 'jadwal',
    freezeTableName: true
});

// Definisikan asosiasi
Jadwal.belongsTo(Kelas, { foreignKey: 'id_kelas', as: 'kelas' });
Jadwal.belongsTo(MataKuliah, { foreignKey: 'id_mata_kuliah', as: 'mata_kuliah' });
Jadwal.belongsTo(Dosen, { foreignKey: 'id_dosen', as: 'dosen' });
Jadwal.belongsTo(Hari, { foreignKey: 'id_hari', as: 'hari' });
Jadwal.belongsTo(Semester, { foreignKey: 'id_semester', as: 'semester' });
Jadwal.belongsTo(Prodi, { foreignKey: 'id_prodi', as: 'prodi' });

Kelas.hasMany(Jadwal, { foreignKey: 'id_kelas' });
MataKuliah.hasMany(Jadwal, { foreignKey: 'id_mata_kuliah' });
Dosen.hasMany(Jadwal, { foreignKey: 'id_dosen' });
Hari.hasMany(Jadwal, { foreignKey: 'id_hari' });
Semester.hasMany(Jadwal, { foreignKey: 'id_semester' });
Prodi.hasMany(Jadwal, { foreignKey: 'id_prodi' });

export default Jadwal;