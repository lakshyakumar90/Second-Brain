import { Router } from 'express';
import { authMiddleware, registrationCompleteMiddleware } from '../middlewares/authMiddleware';
import { createPage, getPages, getPage, updatePage, deletePage, uploadAttachment, deleteAttachment } from '../controllers/page.controller';
import upload from '../middlewares/uploadMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post('/create', createPage);
router.get('/all', getPages);
router.get('/:pageId', getPage);
router.put('/:pageId', updatePage);
router.delete('/:pageId', deletePage);

// Attachment routes
router.post('/:pageId/attachments', upload.single('file'), uploadAttachment);
router.delete('/:pageId/attachments/:attachmentId', deleteAttachment);

export default router;


