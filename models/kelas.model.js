import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const { DataTypes } = Sequelize;

const Kelas = db.define("kelas", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    kode_kelas: {
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

export default Kelas;
