import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OfficialNotice } from '../components/OfficialNotice';
import { CertificateConfig } from '../types';

// 임시 자격증 데이터 (실제로는 API에서 로드)
const TEMP_CERTIFICATES: CertificateConfig[] = [
  {
    id: 'engineer-information-processing',
    displayName: '정보처리기사',
    qualificationSource: 'manual-json',
    scheduleSource: 'qnet-api',
    qualificationDataPath: 'data/qualifications.json',
    scheduleFallbackPath: 'data/fallback/schedules.json',
    qnet: {
      itemCode: '<사용자 확인 후 입력>',
      qualificationTypeCode: '<사용자 확인 후 입력>',
    },
  },
  {
    id: 'industrial-engineer-information-processing',
    displayName: '정보처리산업기사',
    qualificationSource: 'manual-json',
    scheduleSource: 'qnet-api',
    qualificationDataPath: 'data/qualifications.json',
    scheduleFallbackPath: 'data/fallback/schedules.json',
    qnet: {
      itemCode: '<사용자 확인 후 입력>',
      qualificationTypeCode: '<사용자 확인 후 입력>',
    },
  },
];

const CertificateListPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateConfig[]>(TEMP_CERTIFICATES);

  // 실제 구현에서는 API에서 certificates.config.json 로드
  useEffect(() => {
    // TODO: API 호출로 실제 데이터 로드
    // fetch('/api/certificates/config')
    //   .then(res => res.json())
    //   .then(data => setCertificates(data.certificates))
    //   .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            자격증 시험 정보
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            정보처리기사 및 정보처리산업기사 시험 일정과 학습 플랜
          </p>
        </div>

        <OfficialNotice />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {certificates.map((certificate) => (
            <Link
              key={certificate.id}
              to={`/certificates/${certificate.id}`}
              className="relative bg-white py-6 px-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {certificate.displayName}
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>시험 일정 확인</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <span>학습 플랜 생성</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>연습문제 풀이</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            모든 정보는 공식 출처를 기준으로 하며, 최신 정보는 공식 사이트에서 확인해 주세요.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            출처: 한국산업인력공단 · 공공데이터포털
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateListPage;