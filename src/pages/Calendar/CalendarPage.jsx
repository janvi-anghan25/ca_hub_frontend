import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, FileText, ClipboardList, AlertTriangle,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, isPast,
} from 'date-fns';
import { gstApi } from '../../api/gstApi';
import { itrApi } from '../../api/itrApi';
import { taskApi } from '../../api/taskApi';
import { SectionLoader } from '../../components/common/LoadingSpinner';

const EVENT_TYPES = {
  gst: {
    label: 'GST Return',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    bgLight: 'bg-blue-50',
  },
  itr: {
    label: 'ITR Return',
    dotColor: 'bg-violet-500',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    bgLight: 'bg-violet-50',
  },
  task: {
    label: 'Task',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    bgLight: 'bg-amber-50',
  },
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isFiled = (status) => ['filed', 'late filed'].includes(String(status || '').toLowerCase());

/** Build a readable label from a GST return's period object ({ month, quarter, year }). */
const formatGSTPeriod = (period) => {
  if (!period || typeof period !== 'object') return '';
  const { month, quarter, year } = period;
  if (month) return `${MONTHS[month] || month} ${year || ''}`.trim();
  if (quarter) return `Q${quarter} ${year || ''}`.trim();
  if (year) return String(year);
  return '';
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [gstRes, itrRes, taskRes] = await Promise.allSettled([
          gstApi.getReturns({ limit: 300, status: undefined }),
          itrApi.getReturns({ limit: 300 }),
          taskApi.getTasks({ limit: 300 }),
        ]);

        const allEvents = [];

        if (gstRes.status === 'fulfilled') {
          const list = gstRes.value?.data?.data || [];
          list.forEach((r) => {
            if (r.dueDate && !isFiled(r.status)) {
              allEvents.push({
                id: r._id,
                type: 'gst',
                title: `${r.returnType || 'GST'} — ${r.client?.clientName || 'Client'}`,
                date: r.dueDate,
                status: r.status,
                subtitle: formatGSTPeriod(r.period),
              });
            }
          });
        }

        if (itrRes.status === 'fulfilled') {
          const list = itrRes.value?.data?.data || [];
          list.forEach((r) => {
            if (r.dueDate && !isFiled(r.status)) {
              allEvents.push({
                id: r._id,
                type: 'itr',
                title: `ITR — ${r.client?.clientName || 'Client'}`,
                date: r.dueDate,
                status: r.status,
                subtitle: r.assessmentYear ? `AY ${r.assessmentYear}` : '',
              });
            }
          });
        }

        if (taskRes.status === 'fulfilled') {
          const list = taskRes.value?.data?.data || [];
          list.forEach((t) => {
            if (t.dueDate && String(t.status).toLowerCase() !== 'completed') {
              allEvents.push({
                id: t._id,
                type: 'task',
                title: t.title,
                date: t.dueDate,
                status: t.status,
                subtitle: t.priority ? `Priority: ${t.priority}` : '',
              });
            }
          });
        }

        setEvents(allEvents);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day) =>
    events.filter((e) => {
      try {
        return isSameDay(parseISO(e.date), day);
      } catch {
        return false;
      }
    });

  const prevMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const isEventOverdue = (e) => {
    try {
      const d = parseISO(e.date);
      return isPast(d) && !isSameDay(d, new Date());
    } catch {
      return false;
    }
  };

  // Show overdue first (most urgent), then the nearest upcoming deadlines.
  const upcomingEvents = [...events]
    .filter((e) => {
      try {
        return !Number.isNaN(parseISO(e.date).getTime());
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 12);

  const totalEvents = events.length;
  const overdueCount = events.filter((e) => {
    try {
      return isPast(parseISO(e.date)) && !isSameDay(parseISO(e.date), new Date());
    } catch {
      return false;
    }
  }).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Calendar</h1>
          <p className="text-sm text-forest-400 mt-0.5">
            {totalEvents} deadlines tracked · {overdueCount > 0 && (
              <span className="text-red-500 font-medium">{overdueCount} overdue</span>
            )}
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(EVENT_TYPES).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${val.dotColor}`} />
              <span className="text-forest-500 hidden sm:inline">{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <SectionLoader />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Calendar grid ── */}
          <div className="lg:col-span-2 card">
            {/* Month header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-forest">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-600 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goToday}
                  className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-forest-100 text-forest-500 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-400 hover:text-forest-600 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-forest-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 border-l border-t border-forest-100 rounded-lg overflow-hidden">
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const inMonth = isSameMonth(day, currentDate);
                const hasOverdue = dayEvents.some((e) => e.status === 'overdue');

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() =>
                      setSelectedDay(selectedDay && isSameDay(day, selectedDay) ? null : day)
                    }
                    className={[
                      'min-h-[70px] p-2 border-r border-b border-forest-100 text-left flex flex-col gap-1 transition-colors',
                      !inMonth ? 'opacity-30' : '',
                      isSelected
                        ? 'bg-forest-50 ring-2 ring-inset ring-forest-400'
                        : 'hover:bg-forest-50/60',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0',
                        isToday(day)
                          ? 'bg-forest text-white'
                          : 'text-forest-500',
                      ].join(' ')}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Event dots */}
                    {dayEvents.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 4).map((ev) => (
                          <div
                            key={ev.id}
                            className={[
                              'w-2 h-2 rounded-full',
                              EVENT_TYPES[ev.type]?.dotColor || 'bg-gray-400',
                              hasOverdue && ev.status === 'overdue' ? 'ring-1 ring-red-400' : '',
                            ].join(' ')}
                          />
                        ))}
                        {dayEvents.length > 4 && (
                          <span className="text-[9px] text-forest-400 leading-2">
                            +{dayEvents.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Side panel ── */}
          <div className="card flex flex-col gap-4">
            {selectedDay ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="section-title mb-0">
                    {format(selectedDay, 'EEEE, MMMM d')}
                  </h3>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-xs text-forest-400 hover:text-forest-600"
                  >
                    Clear
                  </button>
                </div>
                {selectedDayEvents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10">
                    <Calendar size={32} className="text-forest-200 mb-2" />
                    <p className="text-sm text-forest-400">No events on this day</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto">
                    {selectedDayEvents.map((ev) => {
                      const typeInfo = EVENT_TYPES[ev.type];
                      const isOverdue =
                        ev.status === 'overdue' ||
                        (isPast(parseISO(ev.date)) && !isSameDay(parseISO(ev.date), new Date()));
                      return (
                        <div
                          key={ev.id}
                          className={`p-3 rounded-xl border ${typeInfo?.bgLight} ${typeInfo?.borderColor}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`mt-0.5 p-1.5 rounded-lg ${typeInfo?.bgLight} flex-shrink-0`}
                            >
                              {ev.type === 'task' ? (
                                <ClipboardList size={12} className={typeInfo?.textColor} />
                              ) : (
                                <FileText size={12} className={typeInfo?.textColor} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[10px] font-semibold uppercase tracking-wide ${typeInfo?.textColor}`}
                              >
                                {typeInfo?.label}
                              </p>
                              <p className="text-sm font-medium text-forest mt-0.5 truncate">
                                {ev.title}
                              </p>
                              {ev.subtitle && (
                                <p className="text-xs text-forest-400 mt-0.5">{ev.subtitle}</p>
                              )}
                              <span
                                className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                                  isOverdue
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {isOverdue ? 'Overdue' : ev.status}
                              </span>
                            </div>
                            {isOverdue && (
                              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="section-title">Deadlines</h3>
                {upcomingEvents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10">
                    <Calendar size={32} className="text-forest-200 mb-2" />
                    <p className="text-sm text-forest-400">No deadlines tracked</p>
                    <p className="text-xs text-forest-300 mt-1">
                      All caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingEvents.map((ev) => {
                      const typeInfo = EVENT_TYPES[ev.type];
                      const overdue = isEventOverdue(ev);
                      return (
                        <button
                          key={ev.id}
                          onClick={() => {
                            const d = parseISO(ev.date);
                            setCurrentDate(startOfMonth(d));
                            setSelectedDay(d);
                          }}
                          className={`w-full p-3 rounded-xl border text-left hover:opacity-80 transition-opacity ${typeInfo?.bgLight} ${typeInfo?.borderColor}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeInfo?.dotColor}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-forest truncate">
                                {ev.title}
                              </p>
                              <p className="text-[10px] text-forest-400 mt-0.5">
                                {format(parseISO(ev.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize flex-shrink-0 ${
                                overdue
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {overdue ? 'Overdue' : ev.status}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
