import React from 'react';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import ForgotPasswordStep1 from './ForgotPasswordStep1';
import ForgotPasswordOTPVerification from './ForgotPasswordOTPVerification';
import ForgotPasswordReset from './ForgotPasswordReset';

const ForgotPassword: React.FC = () => {
  const passwordResetHook = usePasswordReset();
  const { passwordResetState } = passwordResetHook;

  const renderStep = () => {
    switch (passwordResetState.currentStep) {
      case 1:
        return <ForgotPasswordStep1 passwordResetHook={passwordResetHook} />;
      case 2:
        return <ForgotPasswordOTPVerification passwordResetHook={passwordResetHook} />;
      case 3:
        return <ForgotPasswordReset passwordResetHook={passwordResetHook} />;
      default:
        return <ForgotPasswordStep1 passwordResetHook={passwordResetHook} />;
    }
  };

  return renderStep();
};

export default ForgotPassword; 