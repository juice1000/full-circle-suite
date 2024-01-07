export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getMonthName(month: number) {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Augt',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return monthNames[month];
}

export function getWeek(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const passedDays: number = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const firstDayOfYear = startOfYear.getDay();
  const weekNumber = Math.ceil((passedDays + firstDayOfYear) / 7);

  return weekNumber;
}
