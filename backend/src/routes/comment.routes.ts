import { Router } from "express";
import { createComment, getComments, getComment, updateComment, deleteComment, replyToComment, addReaction, removeReaction, resolveComment } from "../controllers/comment.controller";
import { authMiddleware, registrationCompleteMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.use(registrationCompleteMiddleware);

router.post("/", createComment);
router.get("/", getComments);
router.get("/:commentId", getComment);
router.patch("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);
router.post("/:commentId/reply", replyToComment);
router.post("/:commentId/reaction", addReaction);
router.delete("/:commentId/reaction", removeReaction);
router.patch("/:commentId/resolve", resolveComment);

export default router; 