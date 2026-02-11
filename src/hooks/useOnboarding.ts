import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import onboardingAPI, { CompleteOnboardingData, JoinClinicData, OnboardingResponse } from '../lib/api/onboarding';
import { getErrorMessage } from '../lib/api';
import { toast } from 'sonner';

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const completeOnboarding = async (data: CompleteOnboardingData) => {
    try {
      setLoading(true);
      setError(null);

      const result: OnboardingResponse = await onboardingAPI.completeOnboarding(data);

      // Store tokens and user data
      localStorage.setItem('accessToken', result.tokens.accessToken);
      localStorage.setItem('refreshToken', result.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('practice', JSON.stringify(result.practice));

      toast.success('Welcome to Medicae!', {
        description: `Your clinic "${result.practice.name}" has been set up successfully.`,
      });

      // Navigate to clinic home
      navigate('/clinic');

      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error('Onboarding failed', {
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinClinic = async (data: JoinClinicData) => {
    try {
      setLoading(true);
      setError(null);

      const result: OnboardingResponse = await onboardingAPI.joinClinic(data);

      // Store tokens and user data
      localStorage.setItem('accessToken', result.tokens.accessToken);
      localStorage.setItem('refreshToken', result.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('practice', JSON.stringify(result.practice));

      toast.success('Successfully joined clinic!', {
        description: `Welcome to ${result.practice.name}`,
      });

      // Navigate to clinic home
      navigate('/clinic');

      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error('Join failed', {
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyJoinCode = async (joinCode: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await onboardingAPI.verifyJoinCode(joinCode);

      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error('Invalid join code', {
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    completeOnboarding,
    joinClinic,
    verifyJoinCode,
    loading,
    error,
  };
}
