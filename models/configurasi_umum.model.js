import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const DataTypes = Sequelize;

const ConfigurasiUmum = db.define("configurasi_umum", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nama_website: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    singkatan_website: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tagline_website: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    alamat_website: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
});

export default ConfigurasiUmum;