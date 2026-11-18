import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OfficialNotice } from '../components/OfficialNotice';
import { QualificationInfo } from '../components/QualificationInfo';
import ScheduleList from '../components/ScheduleList';
import { apiClient } from '../services/apiClient';
import { CertificateDetailResponse } from '../types';

const CertificateDetailPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [data, setData] = useState<CertificateDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!certificateId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getCertificateDetail(certificateId);
        setData(response);
        setError(null);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
        
        // 임시 데이터로 폴백 (실제 구현에서는 이렇게 하지 않음)
        setData({
          certificateId,
          qualification: {
            status: 'unavailable',
            source: {
              type: 'manual-json',
              provider: '한국산업인력공단',
              portal: '공공데이터포털',
            },
            data: null,
          },
          schedule: {
            status: 'unavailable',
            source: {
              type: 'qnet-api',
              provider: '한국산업인력공단',
              portal: '공공데이터포털',
            },
            sessions: [],
          },
          fetchedAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.218 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">데이터를 불러올 수 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">{error || '알 수 없는 오류가 발생했습니다'}</p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  <svg className="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">홈</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <Link to="/" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    자격증 목록
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    {data.certificateId === 'engineer-information-processing' ? '정보처리기사' : '정보처리산업기사'}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <OfficialNotice />

        {/* 네비게이션 탭 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link
              to={`/certificates/${certificateId}`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              상세 정보
            </Link>
            <Link
              to={`/certificates/${certificateId}/plan`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              학습 플랜
            </Link>
            <Link
              to={`/certificates/${certificateId}/practice`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              연습문제
            </Link>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* 자격증 정보 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">자격증 정보</h2>
            <QualificationInfo qualification={data.qualification} />
          </div>

          {/* 시험 일정 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">시험 일정</h2>
            <ScheduleList schedule={data.schedule} />
          </div>

          {/* 메타 정보 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">정보 출처</h3>
              <p className="mt-1 text-sm text-gray-500">데이터 불러온 시간: {new Date(data.fetchedAt).toLocaleString()}</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">자격증 정보 출처</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {data.qualification.source.provider} · {data.qualification.source.portal}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">시험 일정 출처</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {data.schedule.source.provider} · {data.schedule.source.portal}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end space-x-4">
          <Link
            to={`/certificates/${certificateId}/plan`}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            학습 플랜 생성하기
          </Link>
          <Link
            to={`/certificates/${certificateId}/practice`}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            연습문제 풀기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailPage;