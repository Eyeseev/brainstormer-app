import { useState, useEffect, useRef } from 'react';
import { ToastProvider } from './hooks/useToast';
import { Workspace } from './components/Workspace';
import { RunningList } from './components/RunningList';
import type { ActionItem } from './types';
import { loadRunningList, saveRunningList, clearRunningList as clearStorage } from './utils/storage';
import './App.css';

function App() {
  const [runningList, setRunningList] = useState<ActionItem[]>(() => loadRunningList());
  const isInitialMount = useRef(true);

  // Save to localStorage whenever runningList changes (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (runningList.length > 0) {
      saveRunningList(runningList);
    } else {
      clearStorage();
    }
  }, [runningList]);

  const handleAddToRunningList = (text: string) => {
    const newItem: ActionItem = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
    };
    setRunningList((prev) => [...prev, newItem]);
  };

  const handleRemoveFromRunningList = (id: string) => {
    setRunningList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearRunningList = () => {
    setRunningList([]);
    clearStorage();
  };

  const handleToggleComplete = (id: string) => {
    setRunningList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleClearCompleted = () => {
    setRunningList((prev) => prev.filter((item) => !item.completed));
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral">
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 p-4 lg:p-8">
          <main className="flex-1 min-w-0">
            <Workspace onAddToRunningList={handleAddToRunningList} />
          </main>
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <RunningList
              items={runningList}
              onAdd={handleAddToRunningList}
              onRemove={handleRemoveFromRunningList}
              onClear={handleClearRunningList}
              onToggleComplete={handleToggleComplete}
              onClearCompleted={handleClearCompleted}
            />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
