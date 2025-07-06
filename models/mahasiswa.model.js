import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import JenisKelamin from "./jenis_kelamin.model.js";
import Semester from "./semester.model.js";
import Prodi from "./prodi.model.js";

const DataTypes = Sequelize; 

const Mahasiswa = db.define("mahasiswa", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nim: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_jenis_kelamin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: JenisKelamin,
            key: 'id'
        }
    },
    id_semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Semester,
            key: 'id'
        }
    },
    id_prodi: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Prodi,
            key: 'id'
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    face_embedding: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('face_embedding');
            return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
            this.setDataValue('face_embedding', value ? JSON.stringify(value) : null);
        }
    },
    no_wa: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tempat_lahir: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tanggal_lahir: {
        type: DataTypes.DATE,
        allowNull: false
    },
    alamat: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
})

// Relasi Mahasiswa dengan JenisKelamin
Mahasiswa.belongsTo(JenisKelamin, {
    foreignKey: 'id_jenis_kelamin',
    as: 'jenis_kelamin'
})

// Relasi Mahasiswa dengan Semester
Mahasiswa.belongsTo(Semester, {
    foreignKey: 'id_semester',
    as: 'semester'
})

// Relasi Mahasiswa dengan Prodi
Mahasiswa.belongsTo(Prodi, {
    foreignKey: 'id_prodi',
    as: 'prodi'
})

export default Mahasiswa;