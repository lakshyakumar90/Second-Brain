import { Router } from 'express';
import { authMiddleware, registrationCompleteMiddleware } from '../middlewares/authMiddleware';
import { createPage, getPages, getPage, updatePage, deletePage, uploadAttachment, deleteAttachment } from '../controllers/page.controller';
import upload from '../middlewares/uploadMiddleware';
import { requireViewAccess, requireEditAccess, checkWorkspacePermission } from '../middlewares/workspacePermissionMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post('/create', requireEditAccess, createPage);
router.get('/all', getPages);
router.get('/:pageId', checkWorkspacePermission({ checkWorkspaceParam: 'pageId' }), getPage);
router.put('/:pageId', checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'pageId' }), updatePage);
router.delete('/:pageId', checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'pageId' }), deletePage);

// Attachment routes
router.post('/:pageId/attachments', upload.single('file'), checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'pageId' }), uploadAttachment);
router.delete('/:pageId/attachments/:attachmentId', checkWorkspacePermission({ requiredRole: 'edit', checkWorkspaceParam: 'pageId' }), deleteAttachment);

export default router;


