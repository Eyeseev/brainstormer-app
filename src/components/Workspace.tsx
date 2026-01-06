import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X } from 'lucide-react';
import type { ActionSection } from '../types';
import { generatePlan } from '../utils/mockDataGenerator';
import { ActionCard } from './ActionCard';

interface WorkspaceProps {
  onAddToRunningList: (text: string) => void;
}

export const Workspace = ({ onAddToRunningList }: WorkspaceProps) => {
  const [input, setInput] = useState('');
  const [sections, setSections] = useState<ActionSection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDistill = useCallback(async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setSections([]);
    
    try {
      const plan = await generatePlan(input);
      setSections(plan.sections);
    } catch (error) {
      console.error('Error processing:', error);
      setSections([]);
    } finally {
      setIsProcessing(false);
    }
  }, [input]);

  const handlePaste = () => {
    // Auto-distill feature disabled
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to distill
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (input.trim() && !isProcessing) {
          handleDistill();
        }
      }
      
      // Esc to clear focus
      if (e.key === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, isProcessing, handleDistill]);


  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 container mx-auto px-6 py-8 max-w-4xl relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-text mb-4">
            Brain Dump
          </h1>
          {showHelp && (
            <div className="inline-block relative bg-surface border border-border rounded-card p-4 mb-4">
              <p className="text-text text-sm font-medium">
                Transform your thoughts into structured, actionable plans
              </p>
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-2 p-1 text-muted hover:text-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="bg-surface border border-border rounded-card flex flex-col">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder="Type your brain dump here or paste text... The AI will automatically organize it into actionable tasks."
              className="w-full h-48 px-4 py-3 bg-transparent border-0 focus:outline-none resize-none text-text placeholder-muted relative z-10 text-base focus-ring rounded-t-card"
            />
            <div className="sticky-textarea-footer px-4 py-3 border-t border-border bg-surface flex items-center justify-end rounded-b-card">
              <motion.button
                onClick={handleDistill}
                disabled={isProcessing || !input.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-control font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-ring"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Break it down
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Results Zone - Only show when sections exist */}
        {sections.length > 0 && (
          <div className="results-zone">
            <AnimatePresence mode="wait">
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-text mb-2">
                  Action Cards
                </h2>
                <div className="space-y-6">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ActionCard section={section} onAddToRunningList={onAddToRunningList} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
