import { Question } from '../types';

// 정적 문제 데이터 로드
export class QuestionService {
  private questions: Record<string, Question[]> = {};

  async loadQuestions(certificateId: string): Promise<Question[]> {
    if (this.questions[certificateId]) {
      return this.questions[certificateId];
    }

    try {
      // 실제 구현에서는 API 호출 또는 정적 파일 로드
      // 임시로 빈 배열 반환
      this.questions[certificateId] = [];
      return this.questions[certificateId];
    } catch (error) {
      console.error(`문제 로드 실패 (${certificateId}):`, error);
      return [];
    }
  }

  getRandomQuestion(certificateId: string): Question | null {
    const questions = this.questions[certificateId];
    if (!questions || questions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  getAllQuestions(certificateId: string): Question[] {
    return this.questions[certificateId] || [];
  }
}

export const questionService = new QuestionService();