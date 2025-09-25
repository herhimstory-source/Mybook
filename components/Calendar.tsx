import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelect }) => {
  const getInitialDate = () => {
    if (selectedDate && !isNaN(new Date(selectedDate).getTime())) {
        // Safari handles 'YYYY-MM-DD' differently, adding timezone offset.
        // By adding T00:00:00 we ensure it's parsed as local time midnight.
        return new Date(selectedDate + 'T00:00:00');
    }
    return new Date();
  }

  const [currentDate, setCurrentDate] = useState(getInitialDate());

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  
  const years = useMemo(() => {
    const endYear = new Date().getFullYear() + 5;
    const startYear = 1950;
    const yearArray = [];
    for (let i = endYear; i >= startYear; i--) {
        yearArray.push(i);
    }
    return yearArray;
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);


  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }
    return grid;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = newDate.toISOString().split('T')[0]; // YYYY-MM-DD
    onSelect(formattedDate);
  }

  const selectedDateObj = getInitialDate();
  const today = new Date();
  
  const selectStyle = "font-semibold text-gray-800 dark:text-gray-100 bg-transparent rounded-md p-1 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500";


  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 w-full max-w-xs">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center space-x-1">
          <select
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
            className={`${selectStyle} dark:bg-slate-800`}
            aria-label="연도 선택"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
          <select
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
            className={`${selectStyle} dark:bg-slate-800`}
            aria-label="월 선택"
          >
            {months.map(month => (
              <option key={month} value={month}>{month + 1}월</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {daysOfWeek.map(day => <div key={day} className="font-medium text-gray-500 dark:text-gray-400 w-8 h-8 flex items-center justify-center">{day}</div>)}
        {calendarGrid.flat().map((day, index) => (
          <div key={index} className="py-1 flex justify-center items-center">
            {day ? (
              <button
                type="button"
                onClick={() => handleDateClick(day)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${
                    selectedDate &&
                    selectedDateObj.getFullYear() === currentDate.getFullYear() &&
                    selectedDateObj.getMonth() === currentDate.getMonth() &&
                    selectedDateObj.getDate() === day
                      ? 'bg-sky-600 text-white font-bold'
                      : 'hover:bg-sky-100 dark:hover:bg-sky-700 text-gray-700 dark:text-gray-200'
                  }
                  ${
                    !selectedDate || selectedDateObj.getDate() !== day
                    ? (
                        today.getFullYear() === currentDate.getFullYear() &&
                        today.getMonth() === currentDate.getMonth() &&
                        today.getDate() === day ? 'ring-2 ring-sky-500' : ''
                      )
                    : ''
                  }
                `}
              >
                {day}
              </button>
            ) : <div className="w-8 h-8" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;