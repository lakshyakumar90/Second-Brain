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
import { authMiddleware, registrationCompleteMiddleware } from '../middlewares/authMiddleware';
import { uploadAvatar as uploadAvatarMiddleware, handleUploadError } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/profile/:userId', getProfile);

// Apply auth middleware to all routes below
router.use(authMiddleware);

// Routes that don't require completed registration
router.get('/profile', getProfile); // Users need to access their profile during registration
router.post('/avatar', uploadAvatarMiddleware, handleUploadError, uploadAvatar); // Avatar upload during registration

// Routes that require completed registration - apply middleware individually
router.put('/profile', registrationCompleteMiddleware, updateProfile);
router.put('/profile/preferences', registrationCompleteMiddleware, updateProfilePreferences);
// Password management
router.put('/password', registrationCompleteMiddleware, changePassword);
// Account management
router.delete('/account', registrationCompleteMiddleware, deleteAccount);
// Usage statistics
router.get('/usage', registrationCompleteMiddleware, getUsageStats);

export default router; 