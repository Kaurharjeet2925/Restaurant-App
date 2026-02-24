import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DatePicker = ({ selected, onChange, dateFormat = "dd-MM-yyyy" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(selected ? new Date(selected) : new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1));
  };

  const handleMonthChange = (e) => {
    setMonth(new Date(month.getFullYear(), parseInt(e.target.value)));
  };

  const handleYearChange = (e) => {
    setMonth(new Date(parseInt(e.target.value), month.getMonth()));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(month.getFullYear(), month.getMonth(), day);
    onChange(newDate);
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return "Select date";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    if (dateFormat === "dd-MM-yyyy") return `${d}-${m}-${y}`;
    if (dateFormat === "yyyy-MM-dd") return `${y}-${m}-${d}`;
    return date.toLocaleDateString();
  };

  const daysInMonth = getDaysInMonth(month);
  const firstDay = getFirstDayOfMonth(month);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="relative inline-block w-full">
      <div
        className="border border-gray-300 px-3 py-2 rounded cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{formatDate(selected)}</span>
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
          {/* Month/Year Selectors */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              <select
                value={month.getMonth()}
                onChange={handleMonthChange}
                className="border px-2 py-1 rounded text-sm"
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={month.getFullYear()}
                onChange={handleYearChange}
                className="border px-2 py-1 rounded text-sm"
              >
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i).map(
                  (y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  )
                )}
              </select>
            </div>

            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => day && handleDateClick(day)}
                className={`py-2 text-sm rounded font-medium transition ${
                  day === null
                    ? "text-transparent"
                    : selected &&
                      day === selected.getDate() &&
                      month.getMonth() === selected.getMonth() &&
                      month.getFullYear() === selected.getFullYear()
                    ? "bg-blue-600 text-white"
                    : new Date().getDate() === day &&
                      new Date().getMonth() === month.getMonth() &&
                      new Date().getFullYear() === month.getFullYear()
                    ? "bg-blue-100 text-blue-700 font-bold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                disabled={day === null}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
