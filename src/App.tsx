import { useState, useEffect, useRef } from 'react';
import { ToastProvider } from './hooks/useToast';
import { Workspace } from './components/Workspace';
import { RunningList } from './components/RunningList';
import type { ActionItem } from './types';
import { loadRunningList, saveRunningList, clearRunningList as clearStorage } from './utils/storage';

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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50">
        <div className="flex flex-col lg:flex-row">
          <main className="flex-1 min-w-0">
            <Workspace onAddToRunningList={handleAddToRunningList} />
          </main>
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <RunningList
              items={runningList}
              onRemove={handleRemoveFromRunningList}
              onClear={handleClearRunningList}
            />
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;