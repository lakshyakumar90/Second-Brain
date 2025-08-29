import express from 'express';
import { authMiddleware, registrationCompleteMiddleware } from '../middlewares/authMiddleware';
import {
  searchItems,
  searchPages,
  searchGlobal,
  searchByCategory,
  searchByTags,
  semanticSearch,
  getSearchSuggestions,
  saveSearchQuery,
  getSearchHistory,
} from '../controllers/search.controller';

const router = express.Router();

router.get('/items', authMiddleware, registrationCompleteMiddleware, searchItems);
router.get('/pages', authMiddleware, registrationCompleteMiddleware, searchPages);
router.get('/global', searchGlobal);
router.get('/category/:categoryId', authMiddleware, registrationCompleteMiddleware, searchByCategory);
router.get('/tags', authMiddleware, registrationCompleteMiddleware, searchByTags);
router.post('/semantic', authMiddleware, registrationCompleteMiddleware, semanticSearch);
router.get('/suggestions', authMiddleware, registrationCompleteMiddleware, getSearchSuggestions);
router.post('/history', authMiddleware, registrationCompleteMiddleware, saveSearchQuery);
router.get('/history', authMiddleware, registrationCompleteMiddleware, getSearchHistory);

export default router; 