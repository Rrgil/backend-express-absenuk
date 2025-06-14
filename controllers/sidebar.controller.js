import Sidebar from '../models/sidebar.model.js';

// Mendapatkan semua menu sidebar
export const getAllSidebar = async (req, res) => {
    try {
        const sidebar = await Sidebar.findAll({
            attributes: [
                'id',
                'sidebar_parent_id',
                'sidebar_nama',
                'sidebar_route',
                'sidebar_kode',
                'sidebar_icon',
                'sidebar_index',
                'status'
            ],
            where: {
                status: 1
            },
            order: [
                ['sidebar_parent_id', 'ASC'],
                ['sidebar_index', 'ASC']
            ],
            raw: true
        });

        // Fungsi untuk menyusun menu hirarki
        const buildHierarchy = (items) => {
            const itemMap = {};
            const roots = [];

            // Buat map untuk akses cepat
            items.forEach(item => {
                itemMap[item.id] = { ...item, children: [] };
            });

            // Susun hirarki
            items.forEach(item => {
                if (item.sidebar_parent_id === 0) {
                    roots.push(itemMap[item.id]);
                } else {
                    const parent = itemMap[item.sidebar_parent_id];
                    if (parent) {
                        parent.children.push(itemMap[item.id]);
                    }
                }
            });

            return roots;
        };

        const hierarchicalMenu = buildHierarchy(sidebar);

        res.json({
            status: 'success',
            data: hierarchicalMenu
        });
    } catch (error) {
        console.error('Error in getAllSidebar:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Mendapatkan menu sidebar berdasarkan hak akses user
export const getUserSidebar = async (req, res) => {
    try {
        const { userAccess } = req.body;

        const sidebar = await Sidebar.findAll({
            attributes: [
                'id',
                'sidebar_parent_id',
                'sidebar_nama',
                'sidebar_route',
                'sidebar_kode',
                'sidebar_icon',
                'sidebar_index',
                'status'
            ],
            order: [
                ['sidebar_parent_id', 'ASC'],
                ['sidebar_index', 'ASC']
            ],
            where: {
                sidebar_kode: userAccess
            },
            raw: true
        });

        res.json({
            status: 'success',
            data: sidebar
        });
    } catch (error) {
        console.error('Error in getUserSidebar:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};