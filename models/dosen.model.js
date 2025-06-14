import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const DataTypes = Sequelize;

const Dosen = db.define("dosen", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nip: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kode_dosen: {
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

export default Dosen;