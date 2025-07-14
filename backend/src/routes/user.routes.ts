import { Router } from 'express';
import { 
    getProfile, 
    updateProfile, 
    updateProfilePreferences, 
    changePassword, 
    deleteAccount, 
    getUsageStats,
    uploadAvatar 
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadAvatar as uploadAvatarMiddleware, handleUploadError } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/profile/:userId', getProfile);

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/preferences', updateProfilePreferences);

// Avatar upload route
router.post('/avatar', uploadAvatarMiddleware, handleUploadError, uploadAvatar);

// Password management
router.put('/password', changePassword);

// Account management
router.delete('/account', deleteAccount);

// Usage statistics
router.get('/usage', getUsageStats);

export default router; 