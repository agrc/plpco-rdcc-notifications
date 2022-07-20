import * as dateService from './dateService.js';

process.env.TZ = 'UTC';

test('canGetBeginningOfLastWeekFromMonday', () => {
  const monday = Date.parse('2021-10-25T05:00:00Z');
  const date = dateService.getBeginningOfLastWeek(monday);

  expect(date).toBe('2021-10-17 00:00:00');
});

test('canGetEndOfLastWeekFromMonday', () => {
  const monday = Date.parse('2021-10-25T05:00:00Z');
  const date = dateService.getEndOfLastWeek(monday);

  expect(date).toBe('2021-10-23 23:59:59');
});
