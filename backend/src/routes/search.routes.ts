import express from 'express';
import {
  searchItems,
  searchGlobal,
  searchByCategory,
  searchByTags,
  semanticSearch,
  getSearchSuggestions,
  saveSearchQuery,
  getSearchHistory,
} from '../controllers/search.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/items', authMiddleware, searchItems);
router.get('/global', searchGlobal);
router.get('/category/:categoryId', authMiddleware, searchByCategory);
router.get('/tags', authMiddleware, searchByTags);
router.post('/semantic', authMiddleware, semanticSearch);
router.get('/suggestions', authMiddleware, getSearchSuggestions);
router.post('/history', authMiddleware, saveSearchQuery);
router.get('/history', authMiddleware, getSearchHistory);

export default router; 