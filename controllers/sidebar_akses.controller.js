import SidebarAkses from '../models/sidebar_akses.model.js';

// Get sidebar akses by group_id
export const getSidebarAksesByGroup = async (req, res) => {
    try {
        const { group_id } = req.params;
        
        const sidebarAkses = await SidebarAkses.findAll({
            where: {
                group_id: group_id
            }
        });

        res.json({
            status: 'success',
            data: sidebarAkses
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update sidebar akses
export const updateSidebarAkses = async (req, res) => {
    try {
        const { group_id } = req.params;
        const { sidebar_id, read, create, update: updateValue, delete: deleteAccess } = req.body;

        // Validasi input
        if (!group_id || !sidebar_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak valid'
            });
        }

        // Update atau buat akses baru
        const [sidebarAkses, created] = await SidebarAkses.findOrCreate({
            where: { 
                group_id: group_id,
                sidebar_id: sidebar_id
            },
            defaults: {
                read: typeof read === 'number' ? read : 0,
                create: typeof create === 'number' ? create : 0,
                update: typeof updateValue === 'number' ? updateValue : 0,
                delete: typeof deleteAccess === 'number' ? deleteAccess : 0
            }
        });

        // Jika record sudah ada, update nilainya
        if (!created) {
            const updateData = {};
            
            if (typeof read === 'number') updateData.read = read;
            if (typeof create === 'number') updateData.create = create;
            if (typeof updateValue === 'number') updateData.update = updateValue;
            if (typeof deleteAccess === 'number') updateData.delete = deleteAccess;

            await sidebarAkses.update(updateData);
        }

        res.json({
            status: 'success',
            message: 'Akses berhasil diperbarui'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};