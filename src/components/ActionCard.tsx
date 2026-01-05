import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Sparkles, Plus } from 'lucide-react';
import type { ActionSection, ActionItem } from '../types';
import { useToast } from '../hooks/useToast';
import { expandSection } from '../utils/mockDataGenerator';

interface ActionCardProps {
  section: ActionSection;
  onAddToRunningList: (text: string) => void;
}

export const ActionCard = ({ section, onAddToRunningList }: ActionCardProps) => {
  const [items, setItems] = useState<ActionItem[]>(section.items);
  const [isExpanding, setIsExpanding] = useState(false);
  const { showToast } = useToast();

  const handleCopySection = () => {
    const text = `${section.title}\n\n${items.map((item) => `• ${item.text}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    showToast('Section copied to clipboard');
  };

  const handleExpand = async () => {
    setIsExpanding(true);
    // Simulate API call delay
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
      className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-5 border-b border-neutral-200 bg-neutral-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-neutral-900">{section.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopySection}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded-lg transition-colors"
              title="Copy section"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleExpand}
              disabled={isExpanding}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
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
                  <Sparkles className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <ul className="space-y-3">
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 group"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleComplete(item.id)}
                className="mt-1 w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              />
              <button
                onClick={() => onAddToRunningList(item.text)}
                className="flex-1 text-left text-sm text-neutral-700 hover:text-neutral-900 transition-colors leading-relaxed"
              >
                <span className={item.completed ? 'line-through text-neutral-400' : ''}>
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
