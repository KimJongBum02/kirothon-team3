import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OfficialNotice } from '../components/OfficialNotice';
import { questionService } from '../services/questionService';
import { Question } from '../types';

const PracticePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (!certificateId) return;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        // TODO: 실제 문제 데이터 로드
        // const loadedQuestions = await questionService.loadQuestions(certificateId);
        
        // 임시 문제 데이터
        const tempQuestions: Question[] = [
          {
            id: 'q1',
            certificateId: certificateId,
            subject: null,
            difficulty: 'easy',
            question: '정보처리기사 시험에 관한 다음 설명 중 옳은 것은?',
            choices: [
              '연간 4회 실시된다',
              '과목은 총 5개이다',
              '합격 기준은 평균 60점 이상이다',
              '실기 시험만 있는 자격증이다',
            ],
            answerIndex: 0,
            explanation: '정보처리기사는 연간 4회 실시됩니다. 자세한 내용은 공식 사이트를 참고하세요.',
          },
          {
            id: 'q2',
            certificateId: certificateId,
            subject: null,
            difficulty: 'medium',
            question: '다음 중 정보보호와 관련이 없는 용어는?',
            choices: [
              '암호화',
              '방화벽',
              '백업',
              '컴파일',
            ],
            answerIndex: 3,
            explanation: '컴파일은 소스 코드를 기계어로 변환하는 과정으로 정보보호와 직접적인 관련은 없습니다.',
          },
        ];

        setQuestions(tempQuestions);
        if (tempQuestions.length > 0) {
          setCurrentQuestion(tempQuestions[0]);
        }
      } catch (error) {
        console.error('문제 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [certificateId]);

  const handleAnswerSelect = (index: number) => {
    if (showExplanation || !currentQuestion) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const isCorrect = index === currentQuestion.answerIndex;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;
    
    const currentIndex = questions.findIndex(q => q.id === currentQuestion?.id);
    const nextIndex = (currentIndex + 1) % questions.length;
    setCurrentQuestion(questions[nextIndex]);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handlePrevQuestion = () => {
    if (questions.length === 0) return;
    
    const currentIndex = questions.findIndex(q => q.id === currentQuestion?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : questions.length - 1;
    setCurrentQuestion(questions[prevIndex]);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">문제를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 문제가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">문제 준비 중입니다</p>
            <div className="mt-6">
              <Link
                to={`/certificates/${certificateId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                상세 페이지로 돌아가기
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
                  <span className="ml-4 text-sm font-medium text-gray-500">연습문제</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <OfficialNotice type="practice" />

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
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              연습문제
            </Link>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">연습문제</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        currentQuestion?.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800' 
                          : currentQuestion?.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currentQuestion?.difficulty === 'easy' ? '쉬움' : currentQuestion?.difficulty === 'medium' ? '중간' : '어려움'}
                      </span>
                      {currentQuestion?.subject && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {currentQuestion.subject}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    문제 {questions.findIndex(q => q.id === currentQuestion?.id) + 1} / {questions.length}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="mb-8">
                  <p className="text-lg text-gray-900 whitespace-pre-line">
                    {currentQuestion?.question}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {currentQuestion?.choices.map((choice, index) => {
                    let bgColor = 'bg-white';
                    let borderColor = 'border-gray-300';
                    let textColor = 'text-gray-700';
                    
                    if (showExplanation) {
                      if (index === currentQuestion.answerIndex) {
                        bgColor = 'bg-green-50';
                        borderColor = 'border-green-500';
                        textColor = 'text-green-700';
                      } else if (index === selectedAnswer && index !== currentQuestion.answerIndex) {
                        bgColor = 'bg-red-50';
                        borderColor = 'border-red-500';
                        textColor = 'text-red-700';
                      }
                    } else if (index === selectedAnswer) {
                      bgColor = 'bg-blue-50';
                      borderColor = 'border-blue-500';
                      textColor = 'text-blue-700';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showExplanation}
                        className={`w-full text-left p-4 border ${borderColor} ${bgColor} rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:cursor-not-allowed disabled:hover:bg-inherit`}
                      >
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                            showExplanation 
                              ? index === currentQuestion.answerIndex
                                ? 'bg-green-100 text-green-800'
                                : index === selectedAnswer && index !== currentQuestion.answerIndex
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <p className={`${textColor} flex-1`}>{choice}</p>
                          {showExplanation && index === currentQuestion.answerIndex && (
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && currentQuestion && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">해설</h4>
                    <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    이전 문제
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    다음 문제
                    <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 점수판 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">점수</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{score.correct}</p>
                    <p className="text-sm text-gray-500">맞은 문제</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{score.total}</p>
                    <p className="text-sm text-gray-500">풀이한 문제</p>
                  </div>
                </div>
                {score.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">정답률</span>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round((score.correct / score.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(score.correct / score.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 문제 목록 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">문제 목록</h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <ul className="space-y-2">
                  {questions.map((question, index) => (
                    <li key={question.id}>
                      <button
                        onClick={() => {
                          setCurrentQuestion(question);
                          setSelectedAnswer(null);
                          setShowExplanation(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                          currentQuestion?.id === question.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>문제 {index + 1}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            question.difficulty === 'easy' 
                              ? 'bg-green-100 text-green-800' 
                              : question.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty === 'easy' ? '쉬움' : question.difficulty === 'medium' ? '중간' : '어려움'}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 연습문제 안내 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800">연습문제 안내</h4>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                <li>• 기출문제가 아닌 연습용 문제입니다</li>
                <li>• 정확한 정보는 공식 사이트를 확인하세요</li>
                <li>• 문제에 오류가 있을 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;