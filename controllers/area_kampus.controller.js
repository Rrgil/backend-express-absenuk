import AreaKampus from "../models/area_kampus.model.js";

// GET all AreaKampus
export const getAllAreaKampus = async (req, res) => {
    try {
        const areaKampus = await AreaKampus.findAll({ where: { status: 1 } });
        res.status(200).json({
            statusCode: 200,
            message: "Data Area Kampus berhasil diambil",
            data: areaKampus,
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
        });
    }
};

// GET AreaKampus by ID
export const getAreaKampusById = async (req, res) => {
    try {
        const areaKampus = await AreaKampus.findByPk(req.params.id);
        if (areaKampus) {
            res.status(200).json({
                statusCode: 200,
                message: "Data Area Kampus berhasil diambil",
                data: areaKampus,
            });
        } else {
            res.status(404).json({
                statusCode: 404,
                message: "Area Kampus tidak ditemukan",
            });
        }
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
        });
    }
};

// CREATE new AreaKampus
export const createAreaKampus = async (req, res) => {
    const { nama, polygon } = req.body;
    try {
        const newAreaKampus = await AreaKampus.create({ nama, polygon, status: 1 });
        res.status(201).json({
            statusCode: 201,
            message: "Area Kampus berhasil dibuat",
            data: newAreaKampus,
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
        });
    }
};

// UPDATE AreaKampus by ID
export const updateAreaKampus = async (req, res) => {
    const { nama, polygon, status } = req.body;
    try {
        const areaKampus = await AreaKampus.findByPk(req.params.id);
        if (areaKampus) {
            const updateData = { nama, polygon };
            if (status !== undefined) {
                updateData.status = status;
            }
            await areaKampus.update(updateData);
            res.status(200).json({
                statusCode: 200,
                message: "Area Kampus berhasil diperbarui",
                data: areaKampus,
            });
        } else {
            res.status(404).json({
                statusCode: 404,
                message: "Area Kampus tidak ditemukan",
            });
        }
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
        });
    }
};

// DELETE AreaKampus by ID
export const deleteAreaKampus = async (req, res) => {
    try {
        const areaKampus = await AreaKampus.findByPk(req.params.id);
        if (areaKampus) {
            await areaKampus.update({ status: 0 });
            res.status(200).json({
                statusCode: 200,
                message: "Area Kampus berhasil dihapus",
            });
        } else {
            res.status(404).json({
                statusCode: 404,
                message: "Area Kampus tidak ditemukan",
            });
        }
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
        });
    }
};
