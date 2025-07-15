import { Router } from "express";
import { createComment, getComments, getComment, updateComment, deleteComment, replyToComment, addReaction, removeReaction, resolveComment } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.post("/create", createComment);
router.get("/item/:itemId", getComments);
router.get("/:commentId", getComment);
router.patch('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);
router.post('/reply', replyToComment);
router.post('/:commentId/reaction', addReaction);
router.delete('/:commentId/reaction', removeReaction);
router.patch('/:commentId/resolve', resolveComment);

export default router; 