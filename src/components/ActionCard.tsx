import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Sparkles, Plus } from 'lucide-react';
import type { ActionSection } from '../types';
import { expandSection } from '../utils/mockDataGenerator';
import { useToast } from '../hooks/useToast';

interface ActionCardProps {
  section: ActionSection;
  onAddToRunningList: (text: string) => void;
}

export const ActionCard = ({ section, onAddToRunningList }: ActionCardProps) => {
  const { showToast } = useToast();
  const [items, setItems] = useState(section.items);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleCopySection = () => {
    const text = items.map((item) => `- ${item.text}`).join('\n');
    navigator.clipboard.writeText(text);
    showToast('Section copied to clipboard');
  };

  const handleExpand = () => {
    setIsExpanding(true);
    setTimeout(() => {
      const newItems = expandSection({ ...section, items });
      setItems((prev) => [...prev, ...newItems]);
      setIsExpanding(false);
      showToast('Expanded with AI suggestions');
    }, 800);
  };

  const handleToggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-card overflow-hidden"
    >
      <div className="p-6 border-b border-border bg-neutral relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text">
            {section.title}
          </h3>
          <div className="flex gap-3">
            <motion.button
              onClick={handleCopySection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 text-text hover:bg-surface border border-border rounded-control transition-all focus-ring"
              title="Copy section"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={handleExpand}
              disabled={isExpanding}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 text-text hover:bg-surface border border-border rounded-control transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 focus-ring"
              title="Expand with AI suggestions"
            >
              {isExpanding ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-surface relative z-10">
        <ul className="space-y-4">
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-4 group"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleComplete(item.id)}
                className="mt-1 w-5 h-5 border border-border rounded control accent-primary cursor-pointer flex-shrink-0 focus-ring"
              />
              <button
                onClick={() => {
                  onAddToRunningList(item.text);
                  window.dispatchEvent(new Event('runningListAdd'));
                }}
                className="flex-1 text-left text-sm text-text hover:text-primary transition-colors leading-relaxed font-medium"
              >
                <span className={item.completed ? 'line-through text-muted' : ''}>
                  {item.text}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
