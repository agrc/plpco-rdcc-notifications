import * as dateService from './dateService.js';

process.env.TZ = 'UTC';

test('canGetBeginningOfLastWeekFromMonday', () => {
  const monday = Date.parse('2021-10-25T05:00:00Z');
  const date = dateService.getBeginningOfLastWeek(monday);

  expect(date).toBe('2021-10-17T00:00:00Z');
});

test('canGetEndOfLastWeekFromMonday', () => {
  const monday = Date.parse('2021-10-25T05:00:00Z');
  const date = dateService.getEndOfLastWeek(monday);

  expect(date).toBe('2021-10-23T23:59:59Z');
});
