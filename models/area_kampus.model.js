import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const { DataTypes } = Sequelize;

const AreaKampus = db.define("area_kampus", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nama area lokasi, contoh: Kampus Utama"
    },
    polygon: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "Array JSON berisi titik-titik koordinat [{lat, lng}] yang membentuk batas area"
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
}, {
    tableName: 'area_kampus',
    freezeTableName: true
});

export default AreaKampus;
