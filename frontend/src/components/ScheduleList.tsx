import React from 'react';
import { ScheduleResponse, ScheduleSession } from '../types';

interface ScheduleListProps {
  schedule: ScheduleResponse;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ schedule }) => {
  const calculateDDay = (examDate: string | null): number | null => {
    if (!examDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays : null;
  };

  const isDeadlineNear = (closeDate: string | null): boolean => {
    if (!closeDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(closeDate);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
  };

  const renderSession = (session: ScheduleSession, index: number) => {
    const dDay = calculateDDay(session.examDate);
    const isNearDeadline = isDeadlineNear(session.applicationCloseDate);

    return (
      <div key={session.id || index} className="bg-white overflow-hidden shadow rounded-lg mb-4">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">회차 {index + 1}</h3>
              {dDay !== null && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  D-{dDay}
                </div>
              )}
            </div>
            {isNearDeadline && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                마감 임박
              </span>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">접수 기간</p>
              <p className="mt-1 text-sm text-gray-900">
                {session.applicationOpenDate && session.applicationCloseDate ? (
                  `${session.applicationOpenDate} ~ ${session.applicationCloseDate}`
                ) : (
                  <span className="text-gray-400">확인 필요</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">시험일</p>
              <p className="mt-1 text-sm text-gray-900">
                {session.examDate || <span className="text-gray-400">확인 필요</span>}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">결과 발표일</p>
              <p className="mt-1 text-sm text-gray-900">
                {session.resultDate || <span className="text-gray-400">확인 필요</span>}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">공식 출처</p>
              <p className="mt-1 text-sm text-gray-900">
                {session.officialSourceUrl ? (
                  <a href={session.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    공식 사이트
                  </a>
                ) : (
                  <span className="text-gray-400">확인 필요</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (schedule.status === 'unavailable') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.218 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-red-800">시험 일정 불러오기 실패</h3>
          <p className="mt-1 text-sm text-red-600">잠시 후 다시 시도해 주세요</p>
          <button
            type="button"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => window.location.reload()}
          >
            재시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">시험 일정</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              출처: {schedule.source.provider} · {schedule.source.portal}
              {schedule.status === 'fallback' && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  저장된 정보
                </span>
              )}
            </p>
          </div>
          {schedule.status === 'fallback' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              최신 정보 아님
            </span>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {schedule.sessions.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 일정이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">공식 사이트에서 확인해 주세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.sessions.map(renderSession)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;