import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ListTodo, Plus, Trash2, CheckCircle, Circle, Archive, RefreshCw } from 'lucide-react';

export const TodoList: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useApp();
  const [taskText, setTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    addTodo(taskText.trim());
    setTaskText('');
  };

  // Filter tasks
  // Carried over items: not completed, and created originally on another date, but current date is todayStr.
  // Wait, in our context we update the todo.date to todayStr to carry it over.
  // How do we know if it was carried over? We can check if it has a flag or if we just display them all.
  // Let's make sure we show them clearly.
  const activeTasks = todos.filter(t => !t.completed);
  const completedTasks = todos.filter(t => t.completed);

  return (
    <div className="anim-fade-up">
      {/* Header */}
      <h2 className="heading-section" style={{ marginBottom: '20px' }}>
        <ListTodo size={22} color="var(--accent-orange)" />
        Unified Task Pool
      </h2>

      {/* Task input card */}
      <div className="journey-card" style={{ padding: '16px' }}>
        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Add new task (e.g. Pre-workout shake, Stretch, Prep gym bag)"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 16px' }}>
            <Plus size={18} />
          </button>
        </form>
        <p style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginTop: '8px', textAlign: 'center' }}>
          Complete tasks to earn +10 XP | Uncompleted tasks roll over daily
        </p>
      </div>

      {/* Active Tasks Group */}
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-secondary)',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Active Tasks ({activeTasks.length})</span>
        {activeTasks.length > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={10} /> Carryover enabled
          </span>
        )}
      </h3>

      {activeTasks.length === 0 ? (
        <div className="journey-card" style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-secondary)' }}>
          No active tasks. Write down a daily workout ritual or reminder above!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {activeTasks.map((todo) => {
            return (
              <div
                key={todo.id}
                className="journey-card"
                style={{
                  margin: 0,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div
                  onClick={() => toggleTodo(todo.id)}
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', flex: 1 }}
                >
                  {/* Circle outline for checkbox */}
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <Circle size={20} />
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {todo.text}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Today
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="btn-icon"
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Tasks Group */}
      {completedTasks.length > 0 && (
        <>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Archive size={14} />
            Completed Archive ({completedTasks.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completedTasks.map((todo) => (
              <div
                key={todo.id}
                className="journey-card glow-green"
                style={{
                  margin: 0,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0.65,
                  backgroundColor: 'rgba(57, 255, 20, 0.01)',
                  borderColor: 'var(--accent-green-dark)'
                }}
              >
                <div
                  onClick={() => toggleTodo(todo.id)}
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', flex: 1 }}
                >
                  <CheckCircle size={20} color="var(--accent-green-dark)" />
                  <span style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'line-through'
                  }}>
                    {todo.text}
                  </span>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="btn-icon"
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TodoList;
