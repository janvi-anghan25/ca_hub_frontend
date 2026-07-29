import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { taskApi } from '../../api/taskApi';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { format, isPast } from 'date-fns';
import { Clock, CheckSquare, MessageSquare, User, Calendar, Tag, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSocket } from '../../utils/socket';

const TaskDetailModal = ({ taskId, onClose, onRefresh }) => {
  const currentUser = useSelector((s) => s.auth.user);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actualHoursInput, setActualHoursInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const commentsEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const fetchDetails = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await taskApi.getTaskById(taskId);
      setTask(res.data.data);
      if (!silent) setActualHoursInput(res.data.data.actualHours || '');
    } catch {
      if (!silent) {
        toast.error('Failed to load task details');
        onClose();
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial data load + Socket.io room subscription
  useEffect(() => {
    if (!taskId) return;
    fetchDetails();

    const socket = getSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    setIsConnected(socket.connected);

    // Join this task's discussion room
    socket.emit('task:join', taskId);

    // Listen for new comments from other users
    const handleNewComment = (comment) => {
      setTask((prev) => {
        if (!prev) return prev;
        const exists = prev.comments?.some((c) => String(c._id) === String(comment._id));
        if (exists) return prev;
        return { ...prev, comments: [...(prev.comments || []), comment] };
      });
    };

    // Listen for typing indicators
    const handleTyping = ({ userId, userName, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.find((u) => u.userId === userId)) return prev;
          return [...prev, { userId, userName }];
        }
        return prev.filter((u) => u.userId !== userId);
      });
    };

    socket.on('task:newComment', handleNewComment);
    socket.on('task:typing', handleTyping);

    return () => {
      socket.emit('task:leave', taskId);
      socket.off('task:newComment', handleNewComment);
      socket.off('task:typing', handleTyping);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [taskId]);

  // Auto-scroll to latest message
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [task?.comments?.length, typingUsers.length]);

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const res = await taskApi.toggleSubtask(taskId, subtaskId);
      setTask(res.data.data);
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to update checklist item');
    }
  };

  const handleTypingChange = (e) => {
    setCommentText(e.target.value);
    const socket = getSocket();
    // Emit typing start
    socket.emit('task:typing', { taskId, isTyping: true });
    // Debounce typing stop after 2s
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('task:typing', { taskId, isTyping: false });
    }, 2000);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    // Stop typing indicator immediately on send
    clearTimeout(typingTimerRef.current);
    getSocket().emit('task:typing', { taskId, isTyping: false });
    try {
      const res = await taskApi.addComment(taskId, { text: commentText.trim() });
      setTask(res.data.data);
      setCommentText('');
      window.dispatchEvent(new Event('notificationRead'));
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveHours = async () => {
    try {
      await taskApi.updateTask(taskId, { actualHours: Number(actualHoursInput) });
      toast.success('Hours updated');
      fetchDetails();
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Failed to update hours');
    }
  };

  const completedSubtasksCount = task?.subtasks?.filter((st) => st.isCompleted).length || 0;
  const totalSubtasksCount = task?.subtasks?.length || 0;
  const checklistProgress = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={task ? task.title : 'Task Details'}
      size="lg"
      footer={<button className="btn-secondary" onClick={onClose}>Close</button>}
    >
      {loading || !task ? (
        <div className="py-12 text-center text-forest-400">Loading task details...</div>
      ) : (
        <div className="space-y-6">
          {/* Header Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-forest-100 dark:border-forest-800">
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <span className={`badge ${
                task.priority === 'Urgent' || task.priority === 'High' ? 'badge-red' : task.priority === 'Medium' ? 'badge-yellow' : 'badge-green'
              }`}>
                {task.priority} Priority
              </span>
              {task.category && <span className="badge badge-gray">{task.category}</span>}
            </div>
            <div className="text-sm text-forest-400 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Due: </span>
              <strong className={task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done' ? 'text-red-600' : ''}>
                {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy') : 'No due date'}
              </strong>
            </div>
          </div>

          {/* Details & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-forest-50/50 dark:bg-forest-900/30 p-4 rounded-xl">
            <div>
              <p className="text-xs text-forest-400 font-medium">Assigned Client</p>
              <p className="text-sm font-semibold text-forest mt-0.5">{task.client?.clientName || 'General Task (No Client)'}</p>
            </div>
            <div>
              <p className="text-xs text-forest-400 font-medium">Assigned Employee</p>
              <p className="text-sm font-semibold text-forest mt-0.5 flex items-center gap-1.5">
                <User size={14} /> {task.assignedTo?.name || 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Task Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-bold text-forest-400 uppercase tracking-wider mb-1">Description / Instructions</h4>
              <p className="text-sm text-forest bg-white dark:bg-forest-950 p-3 rounded-lg border border-forest-100 dark:border-forest-800">
                {task.description}
              </p>
            </div>
          )}

          {/* Hours Tracking */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-forest-100 dark:border-forest-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-forest">
              <Clock size={16} className="text-amber-500" />
              <span>Est. Hours: <strong>{task.estimatedHours || '—'} hrs</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-forest">Actual Spent:</span>
              <input
                type="number"
                step="0.5"
                className="input py-1 px-2.5 w-24 text-sm"
                value={actualHoursInput}
                onChange={(e) => setActualHoursInput(e.target.value)}
                placeholder="hrs"
              />
              <button type="button" onClick={handleSaveHours} className="btn-secondary text-xs py-1 px-2.5">
                Save
              </button>
            </div>
          </div>

          {/* Subtask Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-forest flex items-center gap-1.5">
                <CheckSquare size={16} className="text-emerald-500" /> Subtask Checklist ({completedSubtasksCount}/{totalSubtasksCount})
              </h4>
              {totalSubtasksCount > 0 && <span className="text-xs text-forest-400 font-semibold">{checklistProgress}% Complete</span>}
            </div>

            {totalSubtasksCount > 0 && (
              <div className="w-full bg-forest-100 dark:bg-forest-800 h-1.5 rounded-full mb-3 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${checklistProgress}%` }} />
              </div>
            )}

            {totalSubtasksCount === 0 ? (
              <p className="text-xs text-forest-400 italic">No checklist items created for this task.</p>
            ) : (
              <div className="space-y-2">
                {task.subtasks.map((st) => (
                  <label
                    key={st._id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-forest-100 dark:border-forest-800 hover:bg-forest-50/50 dark:hover:bg-forest-900/40 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleToggleSubtask(st._id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className={`text-sm ${st.isCompleted ? 'line-through text-forest-400' : 'text-forest font-medium'}`}>
                      {st.title}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Discussion Chat Stream */}
          <div className="pt-2 border-t border-forest-100 dark:border-forest-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-forest flex items-center gap-1.5">
                <MessageSquare size={16} className="text-emerald-500" /> Live Discussion ({task.comments?.length || 0})
              </h4>
              {isConnected ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Connecting...
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-3 p-3 rounded-xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-forest-800">
              {(!task.comments || task.comments.length === 0) ? (
                <p className="text-xs text-forest-400 italic text-center py-4">No messages yet. Send an update below to start discussing.</p>
              ) : (
                task.comments.map((c, i) => {
                  const isMe = String(c.user?._id || c.user) === String(currentUser?._id || currentUser?.id);
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-forest-400 mb-0.5 px-1">
                        <span className="font-semibold text-forest-500">{isMe ? 'You' : c.user?.name || 'Team Member'}</span>
                        <span>•</span>
                        <span>{c.createdAt ? format(new Date(c.createdAt), 'dd MMM, HH:mm') : 'Just now'}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                          isMe
                            ? 'bg-forest text-white rounded-br-none'
                            : 'bg-white dark:bg-forest-800 text-forest border border-forest-100 dark:border-forest-700 rounded-bl-none'
                        }`}
                      >
                        {c.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-forest-400 italic mb-1 px-1">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>{typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…</span>
              </div>
            )}

            {/* Comment / Discussion Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                className="input flex-1 text-sm rounded-xl"
                placeholder="Type a message or project update..."
                value={commentText}
                onChange={handleTypingChange}
              />
              <button type="submit" disabled={submittingComment || !commentText.trim()} className="btn-primary text-sm py-2 px-4 rounded-xl flex items-center gap-1.5">
                <Send size={14} /> Send
              </button>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetailModal;
