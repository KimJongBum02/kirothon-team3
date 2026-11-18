import React from 'react';
import { QualificationResponse } from '../types';

interface QualificationInfoProps {
  qualification: QualificationResponse;
}

export const QualificationInfo: React.FC<QualificationInfoProps> = ({ qualification }) => {
  if (qualification.status === 'unavailable' || !qualification.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.218 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-red-800">자격증 정보 불러오기 실패</h3>
          <p className="mt-1 text-sm text-red-600">공식 사이트에서 확인</p>
        </div>
      </div>
    );
  }

  const data = qualification.data;
  const fields = [
    { label: '개요', value: data.overview },
    { label: '수행직무', value: data.jobDescription },
    { label: '변천과정', value: data.history },
    { label: '취득방법', value: data.howToAcquire },
    { label: '응시 자격', value: data.eligibility },
    { label: '합격 기준', value: data.passingCriteria },
  ];

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{data.name}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          출처: {qualification.source.provider} · {qualification.source.portal}
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {fields.map((field) => (
            <div key={field.label} className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${field.value === null ? 'bg-gray-50' : ''}`}>
              <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {field.value === null ? (
                  <span className="text-gray-400 italic">공식 사이트에서 확인</span>
                ) : (
                  field.value
                )}
              </dd>
            </div>
          ))}
          
          {/* 과목 정보 */}
          <div className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${!data.subjects ? 'bg-gray-50' : ''}`}>
            <dt className="text-sm font-medium text-gray-500">과목</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {!data.subjects ? (
                <span className="text-gray-400 italic">공식 사이트에서 확인</span>
              ) : data.subjects.length === 0 ? (
                <span className="text-gray-400 italic">과목 정보 없음</span>
              ) : (
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {data.subjects.map((subject) => (
                    <li key={subject.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">{subject.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};