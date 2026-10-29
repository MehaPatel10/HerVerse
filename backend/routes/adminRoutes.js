const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { dashboardStats, groqUsage, listUsers, updateUser, deleteUser, cleanupOrphanedData, reportActivity } = require('../controllers/adminController');
const { listPricingAdmin, updatePricing } = require('../controllers/pricingController');
const { listAllAdmin, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { listPayments } = require('../controllers/paymentController');
const { listBlogsAdmin, createBlog, updateBlog, deleteBlog, listFaqsAdmin, createFaq, updateFaq, deleteFaq } = require('../controllers/contentController');
const { getAdminStatus, updateMaintenance } = require('../controllers/maintenanceController');

router.use(protect, adminOnly);

router.get('/dashboard', asyncHandler(dashboardStats));
router.get('/groq-usage', asyncHandler(groqUsage));

router.get('/users', asyncHandler(listUsers));
router.put('/users/:id', asyncHandler(updateUser));
router.delete('/users/:id', asyncHandler(deleteUser));
router.post('/cleanup-orphaned-data', asyncHandler(cleanupOrphanedData));

router.get('/pricing', asyncHandler(listPricingAdmin));
router.put('/pricing/:tier', asyncHandler(updatePricing));

router.get('/testimonials', asyncHandler(listAllAdmin));
router.post('/testimonials', asyncHandler(createTestimonial));
router.put('/testimonials/:id', asyncHandler(updateTestimonial));
router.delete('/testimonials/:id', asyncHandler(deleteTestimonial));

router.get('/report-activity', asyncHandler(reportActivity));
router.get('/blogs', asyncHandler(listBlogsAdmin));
router.post('/blogs', asyncHandler(createBlog));
router.put('/blogs/:id', asyncHandler(updateBlog));
router.delete('/blogs/:id', asyncHandler(deleteBlog));

router.get('/faqs', asyncHandler(listFaqsAdmin));
router.post('/faqs', asyncHandler(createFaq));
router.put('/faqs/:id', asyncHandler(updateFaq));
router.delete('/faqs/:id', asyncHandler(deleteFaq));

router.get('/payments', asyncHandler(listPayments));

router.get('/maintenance', asyncHandler(getAdminStatus));
router.put('/maintenance', asyncHandler(updateMaintenance));

module.exports = router;
