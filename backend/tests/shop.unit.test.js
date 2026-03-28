const shopService = require('../src/modules/shops/shop.service');
const shopRepository = require('../src/modules/shops/shop.repository');
const userRepository = require('../src/modules/users/user.repository');
const itemRepository = require('../src/modules/items/item.repository');
const { sendEmail } = require('../src/utils/email');

jest.mock('../src/modules/shops/shop.repository');
jest.mock('../src/modules/users/user.repository');
jest.mock('../src/modules/items/item.repository');
jest.mock('../src/utils/email');

describe('Shop Service Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerShop', () => {
        it('should throw error if shop already exists and is not incomplete', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue({ status: 'pending' });
            await expect(shopService.registerShop(1, {})).rejects.toThrow('You already have a registered shop');
        });

        it('should update shop if it exists and is incomplete', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue({ id: 10, status: 'incomplete' });
            shopRepository.updateShop.mockResolvedValue({ id: 10, name: 'Updated Shop' });

            const result = await shopService.registerShop(1, { name: 'Updated Shop' });
            expect(shopRepository.updateShop).toHaveBeenCalled();
            expect(result.name).toBe('Updated Shop');
        });

        it('should create a new shop with status incomplete if details are missing', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue(null);
            shopRepository.createShop.mockResolvedValue({ id: 11, status: 'incomplete' });

            const result = await shopService.registerShop(1, { name: 'New Shop' });
            expect(shopRepository.createShop).toHaveBeenCalled();
            expect(result.status).toBe('incomplete');
        });

        it('should create a new shop with status pending if all details are present', async () => {
            shopRepository.findShopByOwnerId.mockResolvedValue(null);
            const fullData = {
                name: 'Full Shop',
                address: '123 St', city: 'City', state: 'State', pincode: '123456',
                govt_id_url: 'id.jpg', shop_license_url: 'lic.jpg',
                bank_account_name: 'Name', bank_account_number: '123', bank_ifsc: 'IFSC', bank_name: 'Bank'
            };
            shopRepository.createShop.mockResolvedValue({ ...fullData, status: 'pending' });

            const result = await shopService.registerShop(1, fullData);
            expect(result.status).toBe('pending');
        });
    });

    describe('approveShop', () => {
        it('should approve shop and update user role', async () => {
            const mockShop = { id: 10, owner_id: 1, name: 'Test Shop', email: 'owner@test.com' };
            shopRepository.updateShopStatus.mockResolvedValue(mockShop);
            userRepository.updateUserRole.mockResolvedValue(true);

            const result = await shopService.approveShop(10, [1, 2]);

            expect(shopRepository.updateShopStatus).toHaveBeenCalledWith(10, 'approved');
            expect(shopRepository.setPermittedCategories).toHaveBeenCalledWith(10, [1, 2]);
            expect(userRepository.updateUserRole).toHaveBeenCalledWith(1, 'shop_owner');
            expect(sendEmail).toHaveBeenCalled();
            expect(result).toEqual(mockShop);
        });
    });
});
