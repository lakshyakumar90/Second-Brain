import React from 'react';
import { useAppSelector } from '../../store/hooks';
import RegisterStep1 from './RegisterStep1';
import OTPVerification from './OTPVerification';
import RegisterStep2 from './RegisterStep2';
import RegisterStep3 from './RegisterStep3';

const Register: React.FC = () => {
  const registrationState = useAppSelector((state) => state.registration);

  const renderStep = () => {
    switch (registrationState.currentStep) {
      case 1:
        return <RegisterStep1 />;
      case 2:
        return <OTPVerification />;
      case 3:
        return <RegisterStep2 />;
      case 4:
        return <RegisterStep3 />;
      default:
        return <RegisterStep1 />;
    }
  };

  return renderStep();
};

export default Register; 