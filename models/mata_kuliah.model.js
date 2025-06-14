import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import Prodi from "./prodi.model.js";

const DataTypes = Sequelize;

const MataKuliah = db.define("mata_kuliah", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    id_prodi: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model:Prodi,
            key:'id'
        }
    },
    kode_mata_kuliah: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
})

// Relasi MataKuliah dengan Prodi
MataKuliah.belongsTo(Prodi, {
    foreignKey: 'id_prodi'
})

export default MataKuliah;
