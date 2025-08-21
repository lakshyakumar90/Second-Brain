import { Router } from 'express';
import { authMiddleware, registrationCompleteMiddleware } from '../middlewares/authMiddleware';
import { createPage, getPages, getPage, updatePage, deletePage } from '../controllers/page.controller';

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post('/create', createPage);
router.get('/all', getPages);
router.get('/:pageId', getPage);
router.put('/:pageId', updatePage);
router.delete('/:pageId', deletePage);

export default router;


