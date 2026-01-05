import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Trash2 } from 'lucide-react';
import type { ActionItem } from '../types';
import { useToast } from '../hooks/useToast';

interface RunningListProps {
  items: ActionItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const RunningList = ({ items, onRemove, onClear }: RunningListProps) => {
  const { showToast } = useToast();

  const handleCopyAll = () => {
    const text = items.map((item) => `- ${item.text}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast('Running list copied to clipboard');
  };

  return (
    <aside className="lg:h-screen lg:sticky lg:top-0 bg-white border-t lg:border-t-0 lg:border-l border-neutral-200 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-neutral-900">Running List</h2>
          {items.length > 0 && (
            <span className="text-sm text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
              {items.length}
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
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400">
            <p className="text-sm">Your running list is empty</p>
            <p className="text-xs mt-1">Click tasks to add them here</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05 }}
                className="mb-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-1 text-sm text-neutral-700 leading-relaxed">
                    {item.text}
                  </span>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-all flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
};
