import api, { ApiResponse } from '../api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  practiceId: string;
  isActive: boolean;
}

export interface Practice {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinicType: 'general' | 'dental' | 'audiology' | 'mixed';
  modules: string[];
  joinCode: string;
  onboardingCompleted: boolean;
}

export interface OnboardingResponse {
  user: User;
  practice: Practice;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface CompleteOnboardingData {
  role: string;
  clinicName: string;
  clinicType: 'general' | 'dental' | 'audiology' | 'mixed';
  modules: string[];
  firstName: string;
  lastName: string;
  userEmail: string;
  password: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface JoinClinicData {
  joinCode: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface VerifyJoinCodeResponse {
  valid: boolean;
  practiceName: string;
  practiceType: string;
}

class OnboardingAPI {
  async completeOnboarding(data: CompleteOnboardingData): Promise<OnboardingResponse> {
    const response = await api.post<ApiResponse<OnboardingResponse>>(
      '/onboarding/complete',
      data
    );
    return response.data.data;
  }

  async joinClinic(data: JoinClinicData): Promise<OnboardingResponse> {
    const response = await api.post<ApiResponse<OnboardingResponse>>(
      '/onboarding/join',
      data
    );
    return response.data.data;
  }

  async verifyJoinCode(joinCode: string): Promise<VerifyJoinCodeResponse> {
    const response = await api.get<ApiResponse<VerifyJoinCodeResponse>>(
      `/onboarding/verify/${joinCode}`
    );
    return response.data.data;
  }
}

export default new OnboardingAPI();
