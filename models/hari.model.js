import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const DataTypes = Sequelize;

const Hari = db.define("hari", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

export default Hari;
