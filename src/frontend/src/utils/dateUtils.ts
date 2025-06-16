export const getLocalMidnight = (date: Date): Date => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

export const isToday = (date: Date): boolean => {
  const today = getLocalMidnight(new Date());
  const compareDate = getLocalMidnight(date);
  return today.getTime() === compareDate.getTime();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = getLocalMidnight(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const compareDate = getLocalMidnight(date);
  return tomorrow.getTime() === compareDate.getTime();
}; 