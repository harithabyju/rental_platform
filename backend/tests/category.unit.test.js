const categoryService = require('../src/modules/categories/category.service');
const categoryRepository = require('../src/modules/categories/category.repository');

jest.mock('../src/modules/categories/category.repository');

describe('Category Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a category', async () => {
        const mockCategoryData = { name: 'Electronics', description: 'Gadgets and devices' };
        const mockCreatedCategory = { id: 1, ...mockCategoryData };
        
        categoryRepository.createCategory.mockResolvedValue(mockCreatedCategory);

        const result = await categoryService.createCategory(mockCategoryData);

        expect(categoryRepository.createCategory).toHaveBeenCalledWith(mockCategoryData);
        expect(result).toEqual(mockCreatedCategory);
    });

    it('should get all categories', async () => {
        const mockCategories = [
            { id: 1, name: 'Books' },
            { id: 2, name: 'Toys' }
        ];
        
        categoryRepository.getAllCategories.mockResolvedValue(mockCategories);

        const result = await categoryService.getAllCategories();

        expect(categoryRepository.getAllCategories).toHaveBeenCalled();
        expect(result).toHaveLength(2);
        expect(result).toEqual(mockCategories);
    });

    it('should get a category by ID', async () => {
        const mockCategory = { id: 1, name: 'Tools' };
        
        categoryRepository.getCategoryById.mockResolvedValue(mockCategory);

        const result = await categoryService.getCategoryById(1);

        expect(categoryRepository.getCategoryById).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockCategory);
    });

    it('should update a category', async () => {
        const mockUpdateData = { name: 'Health & Beauty' };
        const mockUpdatedCategory = { id: 1, ...mockUpdateData };
        
        categoryRepository.updateCategory.mockResolvedValue(mockUpdatedCategory);

        const result = await categoryService.updateCategory(1, mockUpdateData);

        expect(categoryRepository.updateCategory).toHaveBeenCalledWith(1, mockUpdateData);
        expect(result).toEqual(mockUpdatedCategory);
    });

    it('should delete a category', async () => {
        categoryRepository.deleteCategory.mockResolvedValue(true);

        const result = await categoryService.deleteCategory(1);

        expect(categoryRepository.deleteCategory).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
    });
});
