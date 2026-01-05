import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
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
  const pasteTimeoutRef = useRef<number | null>(null);

  const handleDistill = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const plan = await generatePlan(input);
      setSections(plan.sections);
    } catch (error) {
      console.error('Error processing:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Check if textarea is empty before paste
    const wasEmpty = !input.trim();
    
    // Clear any existing timeout
    if (pasteTimeoutRef.current) {
      window.clearTimeout(pasteTimeoutRef.current);
    }

    // Get pasted text
    const pastedText = e.clipboardData.getData('text');
    
    // If textarea was empty and pasted text is substantial, auto-distill after paste completes
    if (wasEmpty && pastedText.trim().length > 50) {
      pasteTimeoutRef.current = window.setTimeout(() => {
        handleDistill();
      }, 300); // Delay to allow paste to complete and state to update
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pasteTimeoutRef.current) {
        window.clearTimeout(pasteTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-neutral-50">
      <div className="flex-1 container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
            Brain Dump
          </h1>
          <p className="text-neutral-600">
            Transform your thoughts into structured, actionable plans
          </p>
        </div>

        <div className="mb-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Type your brain dump here or paste text... The AI will automatically organize it into actionable tasks."
            className="w-full h-48 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-neutral-700 placeholder-neutral-400 shadow-sm"
          />
          <div className="mt-4 flex justify-end">
            <motion.button
              onClick={handleDistill}
              disabled={isProcessing || !input.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Distill & Expand
                </>
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {sections.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-heading font-semibold text-neutral-900">
                Action Cards
              </h2>
              <div className="space-y-4">
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
