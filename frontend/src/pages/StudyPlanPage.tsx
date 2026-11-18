import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OfficialNotice } from '../components/OfficialNotice';
import { apiClient } from '../services/apiClient';
import { localPlanStorage } from '../services/localPlanStorage';
import { CertificateDetailResponse, PlanRequest, StudyPlan } from '../types';

const StudyPlanPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [detailData, setDetailData] = useState<CertificateDetailResponse | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    examDate: '',
    dailyStudyMinutes: 120,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    weakSubjects: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!certificateId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // 저장된 플랜 로드
        const savedPlan = localPlanStorage.getPlan(certificateId);
        if (savedPlan) {
          setPlan(savedPlan);
        }

        // 자격증 상세 정보 로드 (과목 정보 확인용)
        // TODO: 실제 API 호출
        // const detail = await apiClient.getCertificateDetail(certificateId);
        // setDetailData(detail);
        
        // 임시 데이터
        setDetailData({
          certificateId,
          qualification: {
            status: 'available',
            source: {
              type: 'manual-json',
              provider: '한국산업인력공단',
              portal: '공공데이터포털',
            },
            data: {
              certificateId,
              name: certificateId === 'engineer-information-processing' ? '정보처리기사' : '정보처리산업기사',
              overview: null,
              jobDescription: null,
              history: null,
              howToAcquire: null,
              eligibility: null,
              subjects: null,
              passingCriteria: null,
              officialSourceUrl: null,
            },
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

      } catch (err) {
        console.error('데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [certificateId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.examDate) {
      newErrors.examDate = '시험일을 선택해 주세요';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const examDate = new Date(formData.examDate);
      if (examDate <= today) {
        newErrors.examDate = '오늘 이후의 시험일을 선택해 주세요';
      }
    }

    if (formData.dailyStudyMinutes <= 0) {
      newErrors.dailyStudyMinutes = '학습 시간은 0보다 커야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePlan = async () => {
    if (!certificateId || !validateForm()) return;

    try {
      setGenerating(true);

      const request: PlanRequest = {
        operation: 'plan',
        certificateId,
        examDate: formData.examDate,
        dailyStudyMinutes: formData.dailyStudyMinutes,
        level: formData.level,
        weakSubjects: formData.weakSubjects,
      };

      // TODO: 실제 API 호출
      // const generatedPlan = await apiClient.generateStudyPlan(request);
      
      // 임시 생성된 플랜
      const generatedPlan: StudyPlan = {
        ...request,
        weeks: [
          {
            week: 1,
            goal: '기초 개념 학습 및 주요 과목 이해',
            tasks: [
              {
                id: 'week-1-task-1',
                subject: null,
                title: '개요 및 기본 개념 학습',
                estimatedMinutes: 60,
                completed: false,
              },
              {
                id: 'week-1-task-2',
                subject: null,
                title: '중요 용어 정리 및 이해',
                estimatedMinutes: 90,
                completed: false,
              },
            ],
          },
          {
            week: 2,
            goal: '심화 개념 학습 및 문제풀이',
            tasks: [
              {
                id: 'week-2-task-1',
                subject: null,
                title: '심화 개념 학습',
                estimatedMinutes: 120,
                completed: false,
              },
              {
                id: 'week-2-task-2',
                subject: null,
                title: '기본 문제풀이 연습',
                estimatedMinutes: 90,
                completed: false,
              },
            ],
          },
        ],
        generatedAt: new Date().toISOString(),
      };

      setPlan(generatedPlan);
      localPlanStorage.savePlan(generatedPlan);
      
    } catch (err) {
      console.error('플랜 생성 실패:', err);
      alert('플랜 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    if (!plan || !certificateId) return;

    const task = plan.weeks.flatMap(week => week.tasks).find(t => t.id === taskId);
    if (task) {
      const updated = localPlanStorage.updateTaskCompletion(certificateId, taskId, !task.completed);
      if (updated) {
        const updatedPlan = localPlanStorage.getPlan(certificateId);
        setPlan(updatedPlan);
      }
    }
  };

  const handleDeletePlan = () => {
    if (!certificateId) return;
    
    if (window.confirm('저장된 학습 플랜을 삭제하시겠습니까?')) {
      localPlanStorage.deletePlan(certificateId);
      setPlan(null);
      setFormData({
        examDate: '',
        dailyStudyMinutes: 120,
        level: 'beginner',
        weakSubjects: [],
      });
    }
  };

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

  const progress = plan ? localPlanStorage.getProgress(certificateId!) : 0;
  const hasSubjects = detailData?.qualification.data?.subjects && detailData.qualification.data.subjects.length > 0;

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
                  <Link
                    to={`/certificates/${certificateId}`}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {certificateId === 'engineer-information-processing' ? '정보처리기사' : '정보처리산업기사'}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">학습 플랜</span>
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
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
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

        {plan ? (
          <div className="grid grid-cols-1 gap-8">
            {/* 진행률 표시 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">학습 진행률</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      플랜 생성일: {new Date(plan.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeletePlan}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    플랜 삭제
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">전체 진행률</span>
                    <span className="text-sm font-medium text-gray-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{plan.dailyStudyMinutes}</p>
                    <p className="text-sm text-gray-500">일일 학습 시간(분)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{plan.weeks.length}</p>
                    <p className="text-sm text-gray-500">총 주차</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{plan.level === 'beginner' ? '초급' : plan.level === 'intermediate' ? '중급' : '고급'}</p>
                    <p className="text-sm text-gray-500">수준</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 주차별 플랜 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">주차별 학습 플랜</h2>
              <div className="space-y-6">
                {plan.weeks.map((week) => (
                  <div key={week.week} className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {week.week}주차: {week.goal}
                      </h3>
                    </div>
                    <div className="border-t border-gray-200">
                      <ul className="divide-y divide-gray-200">
                        {week.tasks.map((task) => (
                          <li key={task.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleTaskToggle(task.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex justify-between">
                                  <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {task.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    예상 시간: {task.estimatedMinutes}분
                                  </p>
                                </div>
                                {task.subject && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    과목: {task.subject}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDeletePlan}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                새 플랜 생성하기
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">학습 플랜 생성</h3>
                  <p className="mt-1 text-sm text-gray-500">AI를 활용한 개인 맞춤형 학습 플랜을 생성합니다</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="examDate" className="block text-sm font-medium text-gray-700">
                        시험일
                      </label>
                      <input
                        type="date"
                        id="examDate"
                        value={formData.examDate}
                        onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                        className={`mt-1 block w-full border ${
                          errors.examDate ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {errors.examDate && (
                        <p className="mt-2 text-sm text-red-600">{errors.examDate}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="dailyStudyMinutes" className="block text-sm font-medium text-gray-700">
                        일일 학습 시간 (분)
                      </label>
                      <input
                        type="number"
                        id="dailyStudyMinutes"
                        min="1"
                        value={formData.dailyStudyMinutes}
                        onChange={(e) => setFormData({ ...formData, dailyStudyMinutes: parseInt(e.target.value) })}
                        className={`mt-1 block w-full border ${
                          errors.dailyStudyMinutes ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                      {errors.dailyStudyMinutes && (
                        <p className="mt-2 text-sm text-red-600">{errors.dailyStudyMinutes}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">수준</label>
                      <div className="mt-2 space-x-4">
                        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                          <label key={level} className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={formData.level === level}
                              onChange={() => setFormData({ ...formData, level })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {level === 'beginner' ? '초급' : level === 'intermediate' ? '중급' : '고급'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">취약 과목</label>
                      {hasSubjects ? (
                        <div className="mt-2 space-y-2">
                          {detailData?.qualification.data?.subjects?.map((subject) => (
                            <label key={subject.id} className="inline-flex items-center mr-4">
                              <input
                                type="checkbox"
                                checked={formData.weakSubjects.includes(subject.id)}
                                onChange={(e) => {
                                  const newSubjects = e.target.checked
                                    ? [...formData.weakSubjects, subject.id]
                                    : formData.weakSubjects.filter(id => id !== subject.id);
                                  setFormData({ ...formData, weakSubjects: newSubjects });
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{subject.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">
                          과목 정보는 공식 사이트에서 확인해 주세요
                        </p>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleGeneratePlan}
                        disabled={generating}
                        className="inline-flex justify-center w-full py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            생성 중...
                          </>
                        ) : (
                          '학습 플랜 생성하기'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-blue-900">플랜 생성 안내</h4>
                <ul className="mt-4 space-y-3 text-sm text-blue-800">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2">시험일을 기준으로 주차별 학습 계획을 생성합니다</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2">선택한 취약 과목에 집중한 학습 내용을 포함합니다</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2">생성된 플랜은 브라우저에 저장되며 진행률을 추적할 수 있습니다</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanPage;