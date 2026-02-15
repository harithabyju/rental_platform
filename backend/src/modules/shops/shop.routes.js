const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

// Shop Owner Routes
router.post('/register', protect, shopController.registerShop);
router.get('/my', protect, shopController.getMyShop);

// Public Routes
router.get('/:id', shopController.getShopById);

// Admin Routes
router.patch('/admin/approve/:id', protect, authorize('admin'), shopController.approveShop); // Updated path key to match requirement but keeping controller logic
// Actually user asked for PATCH /admin/shops/approve/:id
// Since this file will likely be mounted at /shops, the admin route might need to be carefully placed or mounted differently.
// However, the request says "PATCH /admin/shops/approve/:id".
// If I mount this router at /shops, then it becomes /shops/admin/approve/:id which is fine if I adjust the main server mount.
// OR I can put admin routes in a separate router or same router but handle prefixes in server.js.
// Let's stick to the module routes being self-contained usually.
// Request: PATCH /admin/shops/approve/:id.
// If I use a global route structure, I can define it there.
// But following modular architecture:
// I'll add the route here as `/approve/:id` and ensure `server.js` or `index.js` mounts it correctly or I just use absolute paths if the framework allows (express doesn't easily without root router).

// Let's assume this router is mounted at `/shops`.
// Then `router.patch('/approve/:id'...)` -> `/shops/approve/:id`.
// The user asked for `/admin/shops/approve/:id`.
// So I might need a separate admin route or just handle it here.
// I'll add `router.patch('/:id/approve', ...)` which makes it `/shops/:id/approve`.
// Wait, user requirement: `PATCH /admin/shops/approve/:id`
// This looks like a top level admin route.
// I will keep it here for now but generic.
// Actually, I'll recommend the user that we mount this router at `/` and define full paths, OR mount at `/shops` and adhere to REST like `/shops/:id/approve`.
// BUT, to strictly follow `PATCH /admin/shops/approve/:id`, I should probably mount a specific admin router or just add it to the main `routes/index.js` if it exists.
// Let's see `routes/index.js` if it exists.
// I saw `server.js` requires `userRoutes` and mounts at `/`.
// So I can define `/shops/...` here.

router.post('/shops/register', protect, shopController.registerShop);
router.get('/shops/my', protect, shopController.getMyShop);
router.get('/shops/:id', shopController.getShopById);

router.patch('/admin/shops/approve/:id', protect, authorize('admin'), shopController.approveShop);
router.get('/admin/shops', protect, authorize('admin'), shopController.getAllShops); 

module.exports = router;
