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

// Apply registration complete middleware to routes that require completed registration
router.use(registrationCompleteMiddleware);

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