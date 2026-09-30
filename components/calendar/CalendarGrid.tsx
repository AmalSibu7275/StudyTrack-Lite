"use client";

import { CalendarDayData } from "./Calendar";
import CalendarDay from "./CalendarDay";

type Props = {
  currentMonth: Date;
  calendarData: Record<
    string,
    CalendarDayData
  >;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

export default function CalendarGrid({
  currentMonth,
  calendarData,
  selectedDate,
  onSelectDate,
}: Props) {
  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay = new Date(
    year,
    month,
    1
  );

  const lastDay = new Date(
    year,
    month + 1,
    0
  );

  /*
   * JavaScript:
   * Sunday = 0
   * Monday = 1
   *
   * We want Monday as the first
   * day of the calendar.
   */
  let startingDay =
    firstDay.getDay();

  startingDay =
    startingDay === 0
      ? 6
      : startingDay - 1;

  const daysInMonth =
    lastDay.getDate();

  const cells: Array<
    Date | null
  > = [];

  for (
    let i = 0;
    i < startingDay;
    i++
  ) {
    cells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push(
      new Date(year, month, day)
    );
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weekdays = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  function createDateKey(date: Date) {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  }

  function isSelected(date: Date) {
    if (!selectedDate) {
      return false;
    }

    return (
      date.getFullYear() ===
        selectedDate.getFullYear() &&
      date.getMonth() ===
        selectedDate.getMonth() &&
      date.getDate() ===
        selectedDate.getDate()
    );
  }

  return (
    <div>

      {/* Weekday header */}

      <div className="grid grid-cols-7 border-b border-gray-100">

        {weekdays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400"
          >
            {day}
          </div>
        ))}

      </div>

      {/* Days */}

      <div className="grid grid-cols-7">

        {cells.map((date, index) => {

          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[120px] border-r border-b border-gray-100 bg-gray-50/50"
              />
            );
          }

          const key =
            createDateKey(date);

          const dayData =
            calendarData[key];

          return (
            <CalendarDay
              key={key}
              date={date}
              data={dayData}
              selected={isSelected(date)}
              onClick={() =>
                onSelectDate(date)
              }
            />
          );
        })}

      </div>

    </div>
  );
}