import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const DataTypes = Sequelize;

const Prodi = db.define("prodi", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    slug: {
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

export default Prodi;
