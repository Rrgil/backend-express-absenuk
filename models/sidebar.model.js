import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const DataTypes = Sequelize;

const Sidebar = db.define("sidebar", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    sidebar_parent_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sidebar_nama: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sidebar_route: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sidebar_kode: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sidebar_icon: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    sidebar_index: {
        type: DataTypes.INTEGER,
        allowNull: false
    },    
    status: {
        type: DataTypes.SMALLINT,
        allowNull: false
    }
});

export default Sidebar;
