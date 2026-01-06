import { useState, useMemo } from 'react';
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

  // Separate active and completed items
  const { activeItems, completedItems } = useMemo(() => {
    const active = items.filter((item) => !item.completed);
    const completed = items.filter((item) => item.completed);
    return { activeItems: active, completedItems: completed };
  }, [items]);

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
    <aside className="lg:h-screen lg:sticky lg:top-0 bg-white border-t lg:border-t-0 lg:border-l border-neutral-200 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-neutral-900">Running List</h2>
          {activeItems.length > 0 && (
            <span className="text-sm text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
              {activeItems.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleCopyAll}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy all
            </button>
            <button
              onClick={onClear}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        )}
        {completedItems.length > 0 && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              {showCompleted ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide completed ({completedItems.length})
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show completed ({completedItems.length})
                </>
              )}
            </button>
            <button
              onClick={() => {
                onClearCompleted();
                showToast('Completed tasks cleared');
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-neutral-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-700 placeholder-neutral-400"
          />
          <motion.button
            onClick={handleAddTask}
            disabled={!inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400">
            <p className="text-sm">Your running list is empty</p>
            <p className="text-xs mt-1">Add tasks manually or click tasks from action cards</p>
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
                      className="mb-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors group cursor-pointer"
                      onClick={() => onToggleComplete(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                        <span className="flex-1 text-sm text-neutral-700 leading-relaxed">
                          {item.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-all flex-shrink-0"
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
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
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
                      className="mb-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors group cursor-pointer opacity-75"
                      onClick={() => onToggleComplete(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="flex-1 text-sm text-neutral-500 leading-relaxed line-through">
                          {item.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-all flex-shrink-0"
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
