import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

import Sidebar from "./sidebar.model.js";
import Groups from "./group_users.model.js";

const DataTypes = Sequelize;

const SidebarAkses = db.define("sidebar_akses", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    sidebar_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sidebar,
            key: 'id'
        }
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Groups,
            key: 'id'
        }
    },
    read: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    create: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    update: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    delete: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
});

// Relasi SidebarAkses dengan Sidebar
SidebarAkses.belongsTo(Sidebar, {
    foreignKey: 'id'
});

Sidebar.hasMany(SidebarAkses, {
    foreignKey: 'id'
});

// Relasi SidebarAkses dengan Groups
SidebarAkses.belongsTo(Groups, {
    foreignKey: 'id'
});

Groups.hasMany(SidebarAkses, {
    foreignKey: 'id'
});

export default SidebarAkses;