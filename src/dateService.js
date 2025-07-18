import { differenceInCalendarDays, endOfWeek, formatISO9075, startOfDay, startOfWeek, subWeeks } from 'date-fns';

export const getBeginningOfLastWeek = (date) => formatISO9075(startOfWeek(subWeeks(date, 1)));
export const getEndOfLastWeek = (date) => formatISO9075(endOfWeek(subWeeks(date, 1)));
export const getToday = (date) => formatISO9075(startOfDay(date));

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
