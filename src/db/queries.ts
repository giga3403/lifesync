import { db } from './schema';

export interface Task {
  id: number;
  title: string;
  type: 'routine' | 'todo' | 'goal';
  lastDoneDate: string | null;
  nextDueDate: string | null;
  periodValue: number | null;
  periodUnit: 'days' | 'weeks' | 'months' | null;
  isImportant: number;
  routineType: 'fixed' | 'relative';
}

export const getAllTasks = (): Task[] => {
  return db.getAllSync<Task>('SELECT * FROM tasks');
};

export const addTask = (
  title: string,
  type: string,
  nextDueDate: string | null,
  periodValue: number | null,
  periodUnit: string | null,
  isImportant: number = 0,
  routineType: string = 'relative'
) => {
  db.runSync(
    'INSERT INTO tasks (title, type, nextDueDate, periodValue, periodUnit, isImportant, routineType) VALUES (?, ?, ?, ?, ?, ?, ?)',
    title, type, nextDueDate, periodValue, periodUnit, isImportant, routineType
  );
};

export const updateTaskDates = (id: number, lastDoneDate: string, nextDueDate: string | null) => {
  db.runSync(
    'UPDATE tasks SET lastDoneDate = ?, nextDueDate = ? WHERE id = ?',
    lastDoneDate, nextDueDate, id
  );
};

export const clearAllTasks = () => {
  db.runSync('DELETE FROM tasks');
};
