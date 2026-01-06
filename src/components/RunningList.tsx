import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Trash2, Plus, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ActionItem } from '../types';
import { useToast } from '../hooks/useToast';

interface RunningListProps {
  items: ActionItem[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onToggleComplete: (id: string) => void;
  onClearCompleted: () => void;
}

export const RunningList = ({ items, onAdd, onRemove, onClear, onToggleComplete, onClearCompleted }: RunningListProps) => {
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);

  // Separate active and completed items
  const { activeItems, completedItems } = useMemo(() => {
    const active = items.filter((item) => !item.completed);
    const completed = items.filter((item) => item.completed);
    return { activeItems: active, completedItems: completed };
  }, [items]);

  // Listen for teleport animation trigger
  useEffect(() => {
    const handleRunningListAdd = () => {
      setBadgePulse(true);
      setTimeout(() => setBadgePulse(false), 600);
    };
    window.addEventListener('runningListAdd', handleRunningListAdd);
    return () => window.removeEventListener('runningListAdd', handleRunningListAdd);
  }, []);

  const handleCopyAll = () => {
    const text = items.map((item) => `- ${item.text}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast('Running list copied to clipboard');
  };

  const handleAddTask = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onAdd(trimmedValue);
      setInputValue('');
      showToast('Task added to running list');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <aside className="lg:h-screen lg:sticky lg:top-0 bg-surface border-l border-border flex flex-col">
      <div className="p-6 border-b border-border bg-surface relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-text">
              Running List
            </h2>
            {activeItems.length > 0 && (
              <motion.span
                animate={{ scale: badgePulse ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.6 }}
                className="text-sm font-medium text-white bg-primary px-2.5 py-1 rounded-control"
              >
                {activeItems.length}
              </motion.span>
            )}
          </div>
        </div>
        {items.length > 0 && (
          <div className="flex gap-3">
            <motion.button
              onClick={handleCopyAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-text bg-surface border border-border rounded-control transition-all focus-ring"
            >
              <Copy className="w-4 h-4" />
              Copy all
            </motion.button>
            <motion.button
              onClick={onClear}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-danger rounded-control transition-all focus-ring"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </motion.button>
          </div>
        )}
        {completedItems.length > 0 && (
          <div className="mt-4 flex gap-3">
            <motion.button
              onClick={() => setShowCompleted(!showCompleted)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-text bg-surface border border-border rounded-control transition-all focus-ring"
            >
              {showCompleted ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide ({completedItems.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show ({completedItems.length})
                </>
              )}
            </motion.button>
            <motion.button
              onClick={() => {
                onClearCompleted();
                showToast('Completed tasks cleared');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-text bg-surface border border-border rounded-control transition-all focus-ring"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </motion.button>
          </div>
        )}
      </div>

      <div className="p-5 border-b border-border bg-surface relative z-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a task..."
            className="flex-1 px-4 py-2.5 text-sm bg-surface border border-border text-text placeholder-muted rounded-control focus:outline-none focus-ring font-medium"
          />
          <motion.button
            onClick={handleAddTask}
            disabled={!inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 bg-primary text-white rounded-control disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center focus-ring"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-surface relative z-10">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-sm text-muted font-medium">
              Click tasks in cards to add them here.
            </p>
          </div>
        ) : (
          <>
            {/* Active Items */}
            {activeItems.length > 0 && (
              <div className="mb-4">
                <AnimatePresence mode="popLayout">
                  {activeItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-3 p-4 bg-surface border border-border rounded-card hover:bg-neutral transition-colors group cursor-pointer"
                      onClick={() => onToggleComplete(item.id)}
                    >
                      <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 text-text flex-shrink-0" />
                        <span className="flex-1 text-sm text-text leading-relaxed font-medium">
                          {item.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger/80 transition-all flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Completed Items */}
            {showCompleted && completedItems.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-medium text-muted uppercase tracking-wide mb-4">
                  Completed
                </h3>
                <AnimatePresence mode="popLayout">
                  {completedItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-3 p-4 bg-surface border border-border rounded-card hover:bg-bg transition-colors group cursor-pointer opacity-75"
                      onClick={() => onToggleComplete(item.id)}
                    >
                      <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                        <span className="flex-1 text-sm text-muted leading-relaxed line-through font-medium">
                          {item.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-danger hover:text-danger/80 transition-all flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
