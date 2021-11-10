import { differenceInCalendarDays, formatISO, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

export const getBeginningOfLastWeek = (date) => formatISO(startOfWeek(subWeeks(date, 1)));
export const getEndOfLastWeek = (date) => formatISO(endOfWeek(subWeeks(date, 1)));
export const getToday = (date) => formatISO(date);

export const getDaysUntilLabel = (dateString, now) => {
  const days = differenceInCalendarDays(new Date(dateString), now);

  switch (days) {
    case 0:
      return 'today';
    case 1:
      return 'tomorrow';
    default:
      return `in ${days} days`;
  }
};
