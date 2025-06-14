import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const DataTypes = Sequelize;

const GroupUser = db.define("group_users", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    group_nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_aktif: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
})

export default GroupUser;