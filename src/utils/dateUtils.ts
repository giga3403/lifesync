import { addDays, addWeeks, addMonths, format, differenceInDays, parseISO } from 'date-fns';

export const calculateNextDueDate = (lastDone: Date, value: number, unit: string) => {
  let nextDate = lastDone;
  if (unit === 'days') nextDate = addDays(lastDone, value);
  if (unit === 'weeks') nextDate = addWeeks(lastDone, value);
  if (unit === 'months') nextDate = addMonths(lastDone, value);
  
  return format(nextDate, 'yyyy-MM-dd');
};

export const getTodayString = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getDDayString = (dueDate: string | null) => {
  if (!dueDate) return '';
  const diff = differenceInDays(new Date(), parseISO(dueDate));
  if (diff > 0) return `D+${diff}`; // Past due
  if (diff < 0) return `D${diff}`;  // Upcoming (e.g. D-3)
  return 'D-Day';
};

export const isPastDue = (dueDate: string | null) => {
  if (!dueDate) return false;
  return differenceInDays(new Date(), parseISO(dueDate)) > 0;
};
