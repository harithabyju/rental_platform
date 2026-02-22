const db = require('../../config/db');

const createCategory = async (category) => {
    const { name, description, icon_url, is_active } = category;
    const slug = category.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = await db.query(
        'INSERT INTO categories (name, description, icon_url, slug, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, icon_url, slug, is_active !== undefined ? is_active : true]
    );
    return result.rows[0];
};

const getAllCategories = async () => {
    const result = await db.query('SELECT * FROM categories ORDER BY id ASC');
    return result.rows;
};

const getCategoryById = async (id) => {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
};

const updateCategory = async (id, category) => {
    const { name, description, icon_url, is_active, slug } = category;
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = await db.query(
        'UPDATE categories SET name = $1, description = $2, icon_url = $3, is_active = $4, slug = $5 WHERE id = $6 RETURNING *',
        [name, description, icon_url, is_active !== undefined ? is_active : true, finalSlug, id]
    );
    return result.rows[0];
};

const deleteCategory = async (id) => {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
