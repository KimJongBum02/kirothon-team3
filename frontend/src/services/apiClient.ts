import { CertificateDetailResponse, StudyPlan, PlanRequest, ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message || `API 요청 실패: ${response.status}`);
    }

    return response.json();
  }

  async getCertificateDetail(certificateId: string): Promise<CertificateDetailResponse> {
    return this.request(`/certificates/${certificateId}/detail`);
  }

  async generateStudyPlan(request: PlanRequest): Promise<StudyPlan> {
    return this.request('/ai', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateQuestion(certificateId: string): Promise<any> {
    // 선택 기능: 문제 생성
    return this.request('/ai', {
      method: 'POST',
      body: JSON.stringify({
        operation: 'question',
        certificateId,
      }),
    });
  }
}

export const apiClient = new ApiClient();