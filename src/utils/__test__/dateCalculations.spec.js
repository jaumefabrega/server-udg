const { daysSinceDate } = require('../dateCalculations.ts');

describe('test', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('Computes properly if hour is provided and no Timezone is provided', () => {
    jest.useFakeTimers().setSystemTime(new Date('2021-12-20').getTime());

    const dates = [
      'Fri Nov 19 2021 00:05:00 GMT+0100',
      'Fri Nov 19 2021 12:05:00 GMT+0100',
      'Fri Nov 19 2021 22:00:00 GMT+0100',
    ];

    dates.forEach((date) => {
      expect(daysSinceDate(date)).toEqual(31);
    });
  });

  test('If a TimeZone is provided should make use of it', () => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2021-12-20T08:30:00').getTime());

    const dateOne = 'Wed Oct 20 2021 04:05:00 GMT+0100';

    expect(daysSinceDate(dateOne, { timeZone: 'Australia/Melbourne' })).toEqual(
      61,
    ); // +10h
    expect(daysSinceDate(dateOne, { timeZone: 'Europe/Madrid' })).toEqual(61); // +1h
    expect(daysSinceDate(dateOne, { timeZone: 'America/New_York' })).toEqual(
      62,
    ); // -5h
    expect(daysSinceDate(dateOne, { timeZone: 'Pacific/Midway' })).toEqual(61); // -11h

    jest.setSystemTime(new Date('2021-12-20T10:30:00').getTime());

    const dateTwo = 'Fri Dec 15 2021 20:05:00 GMT+0100';

    expect(daysSinceDate(dateTwo, { timeZone: 'Australia/Melbourne' })).toEqual(
      4,
    ); // +10h
    expect(daysSinceDate(dateTwo, { timeZone: 'Europe/Madrid' })).toEqual(5); // +1h
    expect(daysSinceDate(dateTwo, { timeZone: 'America/New_York' })).toEqual(5); // -5h
    expect(daysSinceDate(dateTwo, { timeZone: 'Pacific/Midway' })).toEqual(4); // -11h
  });

  test('should make use of "untilDate" if any is provided', () => {
    const dateOne = 'Tue Dec 28 2021 00:05:00 GMT+0100';
    const dateTwo = 'Tue Nov 30 2021 00:05:00 GMT+0100';
    const untilDate = 'Wed Jan 12 2022 00:05:00 GMT+0100';

    expect(daysSinceDate(dateOne, { untilDate })).toEqual(15);
    expect(daysSinceDate(dateTwo, { untilDate })).toEqual(43);
  });

  test('should make use of "hourOffset" if any is provided', () => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2021-12-31T04:30:00').getTime());

    const dateOne = 'Tue Dec 28 2021 00:05:00 GMT+0100';
    const dateTwo = 'Tue Nov 30 2021 00:05:00 GMT+0100';

    expect(daysSinceDate(dateOne)).toEqual(3);
    expect(daysSinceDate(dateTwo)).toEqual(31);
    expect(daysSinceDate(dateOne, { hourOffset: 5 })).toEqual(2);
    expect(daysSinceDate(dateTwo, { hourOffset: 5 })).toEqual(30);
  });

  test('should make use of "hourOffset" and "timeZone" if both are provided', () => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2021-12-31T11:30:00').getTime());

    const dateOne = 'Tue Dec 28 2021 00:05:00 GMT+0100';
    const dateTwo = 'Tue Nov 30 2021 00:05:00 GMT+0100';

    const options = {
      hourOffset: 5,
      timeZone: 'America/New_York', // -5h
    };

    expect(daysSinceDate(dateOne)).toEqual(3);
    expect(daysSinceDate(dateTwo)).toEqual(31);
    expect(daysSinceDate(dateOne, options)).toEqual(4);
    expect(daysSinceDate(dateTwo, options)).toEqual(32);
  });

  test('should return an error message if date provided is after Date.now()', () => {
    jest.useFakeTimers().setSystemTime(new Date('2021-12-20').getTime());

    const dates = [
      ['Tue Dec 28 2021 00:05:00 GMT+0100', -8],
      ['Fri May 13 2022 12:05:00 GMT+0100', -144],
      ['Fri Jul 14 2023 22:00:00 GMT+0100', -571],
    ];

    dates.forEach((date) => {
      expect(daysSinceDate(date[0])).toEqual(date[1]);
      expect(daysSinceDate(date[0], 'Europe/Madrid')).toEqual(date[1]);
    });
  });
});
