import { StudyPlan } from '../types';

const STORAGE_KEY_PREFIX = 'cert-plan:v1:';

export class LocalPlanStorage {
  savePlan(plan: StudyPlan): void {
    const key = `${STORAGE_KEY_PREFIX}${plan.certificateId}`;
    localStorage.setItem(key, JSON.stringify(plan));
  }

  getPlan(certificateId: string): StudyPlan | null {
    const key = `${STORAGE_KEY_PREFIX}${certificateId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as StudyPlan;
    } catch (error) {
      console.error('플랜 파싱 실패:', error);
      return null;
    }
  }

  updateTaskCompletion(certificateId: string, taskId: string, completed: boolean): boolean {
    const plan = this.getPlan(certificateId);
    if (!plan) {
      return false;
    }

    for (const week of plan.weeks) {
      for (const task of week.tasks) {
        if (task.id === taskId) {
          task.completed = completed;
          this.savePlan(plan);
          return true;
        }
      }
    }

    return false;
  }

  getProgress(certificateId: string): number {
    const plan = this.getPlan(certificateId);
    if (!plan) {
      return 0;
    }

    let totalTasks = 0;
    let completedTasks = 0;

    for (const week of plan.weeks) {
      for (const task of week.tasks) {
        totalTasks++;
        if (task.completed) {
          completedTasks++;
        }
      }
    }

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  deletePlan(certificateId: string): void {
    const key = `${STORAGE_KEY_PREFIX}${certificateId}`;
    localStorage.removeItem(key);
  }
}

export const localPlanStorage = new LocalPlanStorage();