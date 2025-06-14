import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import GroupUser from "./group_users.model.js";

const DataTypes = Sequelize;

const User = db.define("users", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    id_groups_users: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: GroupUser,
            key: 'id'
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
})

User.belongsTo(GroupUser, {
    foreignKey: 'id'
})

export default User;
