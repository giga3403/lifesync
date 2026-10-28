import { create } from 'zustand';
import { parseISO } from 'date-fns';
import { Task, getAllTasks, updateTaskDates } from '../db/queries';
import { calculateNextDueDate, getTodayString } from '../utils/dateUtils';

interface TaskStore {
  tasks: Task[];
  loadTasks: () => void;
  completeTask: (task: Task) => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loadTasks: () => {
    const allTasks = getAllTasks();
    set({ tasks: allTasks });
  },
  completeTask: (task) => {
    const todayStr = getTodayString();
    
    if (task.type === 'routine' && task.periodValue && task.periodUnit) {
      let baseDate = new Date();
      
      // 고정 주기인 경우, 기존의 예정일을 기준으로 다음 날짜 계산
      if (task.routineType === 'fixed' && task.nextDueDate) {
        baseDate = parseISO(task.nextDueDate);
      }
      
      const nextDue = calculateNextDueDate(baseDate, task.periodValue, task.periodUnit);
      updateTaskDates(task.id, todayStr, nextDue);
    } else {
      // Todo나 Goal의 경우 완료 시 다음 예정일 제거 (완료 처리)
      updateTaskDates(task.id, todayStr, null);
    }
    
    get().loadTasks(); // Reload tasks after updating DB
  },
  clearTasks: () => {
    import('../db/queries').then(({ clearAllTasks }) => {
      clearAllTasks();
      get().loadTasks();
    });
  }
}));
