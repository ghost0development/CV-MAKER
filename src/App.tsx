import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Landing } from './components/Landing';
import { Editor } from './components/Editor/Editor';
import { createEmptyResume, type Resume } from './hooks/useResumes';

type View = 'landing' | 'editor';

const RESUME_KEY = 'cvcraft_editor_resume';

function AppContent() {
  const { userId } = useAuth();
  const [view, setView] = useState<View>(() => {
    try {
      if (localStorage.getItem(RESUME_KEY)) return 'editor';
    } catch {}
    return 'landing';
  });
  const [editingResume, setEditingResume] = useState<Resume | null>(() => {
    try {
      const saved = localStorage.getItem(RESUME_KEY);
      if (saved) return JSON.parse(saved) as Resume;
    } catch {}
    return null;
  });

  const handleGetStarted = () => {
    if (!userId) return;
    const empty = createEmptyResume();
    setEditingResume({
      ...empty,
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setView('editor');
  };

  const handleBackFromEditor = () => {
    setEditingResume(null);
    setView('landing');
  };

  if (view === 'editor' && editingResume) {
    return <Editor resume={editingResume} onBack={handleBackFromEditor} />;
  }

  return <Landing onGetStarted={handleGetStarted} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
