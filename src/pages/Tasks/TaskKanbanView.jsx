import { useState } from 'react';
import { format, isPast } from 'date-fns';
import { Clock, CheckSquare, MessageSquare, User, ArrowRight, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const COLUMNS = [
  { id: 'Todo', title: 'To Do', color: 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30' },
  { id: 'In Progress', title: 'In Progress', color: 'border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20' },
  { id: 'Review', title: 'Review', color: 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/20' },
  { id: 'Done', title: 'Done', color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/20' },
];

const NEXT_STATUS = { 'Todo': 'In Progress', 'In Progress': 'Review', 'Review': 'Done' };
const PREV_STATUS = { 'In Progress': 'Todo', 'Review': 'In Progress', 'Done': 'Review' };

const TaskKanbanView = ({ tasks, onSelectTask, onStatusChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className={`rounded-xl border p-3 flex flex-col min-h-[500px] ${col.color}`}>
            <div className="flex items-center justify-between pb-3 border-b border-forest-100 dark:border-forest-800 mb-3 px-1">
              <h3 className="font-bold text-sm text-forest flex items-center gap-2">
                <span>{col.title}</span>
                <span className="text-xs bg-white dark:bg-forest-900 text-forest-400 font-semibold px-2 py-0.5 rounded-full border border-forest-200 dark:border-forest-800">
                  {columnTasks.length}
                </span>
              </h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-forest-400 border border-dashed border-forest-200 dark:border-forest-800 rounded-lg">
                  No tasks in {col.title}
                </div>
              ) : (
                columnTasks.map((t) => {
                  const completedSubtasks = t.subtasks?.filter((st) => st.isCompleted).length || 0;
                  const totalSubtasks = t.subtasks?.length || 0;

                  return (
                    <div
                      key={t._id}
                      className="bg-white dark:bg-forest-950 border border-forest-100 dark:border-forest-800 hover:border-emerald-500 dark:hover:border-emerald-600 rounded-xl p-3.5 shadow-sm hover:shadow transition-all cursor-pointer group"
                      onClick={() => onSelectTask(t._id)}
                    >
                      {/* Priority & Category */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`badge text-[10px] py-0 px-2 ${
                          t.priority === 'Urgent' || t.priority === 'High' ? 'badge-red' : t.priority === 'Medium' ? 'badge-yellow' : 'badge-green'
                        }`}>
                          {t.priority}
                        </span>
                        {t.category && (
                          <span className="text-[11px] font-medium text-forest-400 bg-forest-50 dark:bg-forest-900 px-2 py-0.5 rounded">
                            {t.category}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-sm text-forest group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1.5">
                        {t.title}
                      </h4>

                      {/* Client */}
                      {t.client && (
                        <p className="text-xs text-forest-400 font-medium mb-2.5 truncate">
                          🏢 {t.client.clientName}
                        </p>
                      )}

                      {/* Subtask & Comment Indicators */}
                      <div className="flex items-center gap-3 text-xs text-forest-400 mb-3">
                        {totalSubtasks > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare size={12} className={completedSubtasks === totalSubtasks ? 'text-emerald-500' : ''} />
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                        )}
                        {t.comments?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} /> {t.comments.length}
                          </span>
                        )}
                        {t.dueDate && (
                          <span className={`ml-auto font-medium ${isPast(new Date(t.dueDate)) && t.status !== 'Done' ? 'text-red-500' : ''}`}>
                            {format(new Date(t.dueDate), 'dd MMM')}
                          </span>
                        )}
                      </div>

                      {/* Footer & Quick Move Buttons */}
                      <div className="pt-2 border-t border-forest-50 dark:border-forest-900 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                        <span className="text-forest-400 flex items-center gap-1 font-medium truncate max-w-[120px]">
                          <User size={12} /> {t.assignedTo?.name || 'Unassigned'}
                        </span>

                        <div className="flex items-center gap-1">
                          {PREV_STATUS[t.status] && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(t._id, PREV_STATUS[t.status])}
                              className="p-1 hover:bg-forest-100 dark:hover:bg-forest-800 rounded text-forest-400 hover:text-forest"
                              title={`Move back to ${PREV_STATUS[t.status]}`}
                            >
                              <ArrowLeft size={13} />
                            </button>
                          )}
                          {NEXT_STATUS[t.status] && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(t._id, NEXT_STATUS[t.status])}
                              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded text-forest-400 hover:text-emerald-600 font-bold"
                              title={`Move to ${NEXT_STATUS[t.status]}`}
                            >
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanbanView;
