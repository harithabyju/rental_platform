const itemService = require('./item.service');

const addItem = async (req, res) => {
    try {
        const item = await itemService.addItem(req.user.id, req.body);
        res.status(201).json({ message: 'Item added successfully', item });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const item = await itemService.updateItem(req.user.id, req.params.id, req.body);
        res.status(200).json({ message: 'Item updated successfully', item });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        await itemService.deleteItem(req.user.id, req.params.id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getItemsByShop = async (req, res) => {
    try {
        const items = await itemService.getItemsByShop(req.params.shopId);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getItemById = async (req, res) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addItem,
    updateItem,
    deleteItem,
    getItemsByShop,
    getItemById
};
