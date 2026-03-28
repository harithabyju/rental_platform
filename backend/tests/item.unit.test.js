const itemService = require('../src/modules/items/item.service');
const itemRepository = require('../src/modules/items/item.repository');
const shopRepository = require('../src/modules/shops/shop.repository');
const db = require('../src/config/db');

jest.mock('../src/modules/items/item.repository');
jest.mock('../src/modules/shops/shop.repository');
jest.mock('../src/config/db');

describe('Item Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addItem', () => {
        it('should throw error if shop does not exist', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue(null);
            await expect(itemService.addItem(1, {})).rejects.toThrow('No shop found for this owner');
        });

        it('should throw error if shop is not approved', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue({ status: 'pending' });
            await expect(itemService.addItem(1, {})).rejects.toThrow('Your shop is not yet approved');
        });

        it('should add item successfully if category is permitted', async () => {
            const mockShop = { id: 10, status: 'approved', delivery_enabled: true };
            shopRepository.findShopByOwnerId.mockResolvedValue(mockShop);
            shopRepository.getPermittedCategories.mockResolvedValue([{ id: 1, name: 'Books' }]);
            
            const itemData = { item_name: 'Harry Potter', category_id: 1 };
            itemRepository.createItem.mockResolvedValue({ id: 100, ...itemData });

            const result = await itemService.addItem(1, itemData);

            expect(itemRepository.createItem).toHaveBeenCalledWith(expect.objectContaining({
                item_name: 'Harry Potter',
                shop_id: 10,
                delivery_available: true
            }));
            expect(result.id).toBe(100);
        });
    });

    describe('deleteItem', () => {
        it('should throw error if item has active/confirmed bookings', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue({ id: 10 });
            itemRepository.findItemById.mockResolvedValue({ item_id: 100, shop_id: 10 });
            db.query.mockResolvedValue({ rows: [{ count: '1' }] });

            await expect(itemService.deleteItem(1, 100)).rejects.toThrow('Cannot delete item with active or confirmed rentals');
        });

        it('should delete item if no active bookings exist', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue({ id: 10 });
            itemRepository.findItemById.mockResolvedValue({ item_id: 100, shop_id: 10 });
            db.query.mockResolvedValue({ rows: [{ count: '0' }] });

            await itemService.deleteItem(1, 100);
            expect(itemRepository.deleteItem).toHaveBeenCalledWith(100);
        });
    });
});
