import React, { useState } from 'react';
import {
  TabType,
  ToastMessage,
  Client,
  TimeEntry,
  Invoice,
  LearningMission,
  StudentProfile,
  VirtualPet,
  AcademicRecord,
  StudentAccount,
} from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  INITIAL_CLIENTS,
  INITIAL_TIME_ENTRIES,
  INITIAL_INVOICES,
  INITIAL_LEARNING_MISSIONS,
  INITIAL_STUDENT_PROFILE,
  INITIAL_VIRTUAL_PET,
  INITIAL_ACADEMIC_RECORDS,
  INITIAL_STUDENT_ACCOUNTS,
} from './data/seedData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CoreOperationsView } from './components/CoreOperationsView';
import { RecordsView } from './components/RecordsView';
import { SettingsView } from './components/SettingsView';
import { PreviewReportModal } from './components/PreviewReportModal';
import { StudentProfileSwitcherModal } from './components/StudentProfileSwitcherModal';
import { SupabaseAuthModal } from './components/SupabaseAuthModal';
import { ShareAppModal } from './components/ShareAppModal';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { ToastContainer } from './components/Toast';
import { stopSpeaking } from './services/speechService';

export function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useLocalStorage<TabType>('aventura_tab', 'dashboard');

  // Domain State backed by useLocalStorage (Zero External Friction)
  const [clients, setClients] = useLocalStorage<Client[]>('aventura_clients', INITIAL_CLIENTS);
  const [timeEntries, setTimeEntries] = useLocalStorage<TimeEntry[]>('aventura_time_entries', INITIAL_TIME_ENTRIES);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('aventura_invoices', INITIAL_INVOICES);
  const [missions, setMissions] = useLocalStorage<LearningMission[]>('aventura_missions', INITIAL_LEARNING_MISSIONS);
  const [student, setStudent] = useLocalStorage<StudentProfile>('aventura_student', INITIAL_STUDENT_PROFILE);
  const [pet, setPet] = useLocalStorage<VirtualPet>('aventura_pet', INITIAL_VIRTUAL_PET);
  const [records, setRecords] = useLocalStorage<AcademicRecord[]>('aventura_records', INITIAL_ACADEMIC_RECORDS);

  // Multi-Student Accounts System (Independent spaces for each child)
  const [accounts, setAccounts] = useLocalStorage<StudentAccount[]>(
    'aventura_student_accounts',
    INITIAL_STUDENT_ACCOUNTS
  );
  const [activeAccountId, setActiveAccountId] = useLocalStorage<string>(
    'aventura_active_account_id',
    INITIAL_STUDENT_ACCOUNTS[0].id
  );
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { user, profile } = useSupabaseAuth();

  // Keep active account synchronized in accounts list
  React.useEffect(() => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === activeAccountId
          ? {
              ...acc,
              name: student.name,
              avatar: student.avatar,
              age: student.age,
              profile: student,
              pet,
              missions,
              records,
            }
          : acc
      )
    );
  }, [student, pet, missions, records, activeAccountId]);

  // Handle switching active student account
  const handleSelectAccount = (targetAccount: StudentAccount) => {
    setActiveAccountId(targetAccount.id);
    setStudent(targetAccount.profile);
    setPet(targetAccount.pet);
    setMissions(targetAccount.missions);
    setRecords(targetAccount.records);
  };

  const handleCreateAccount = (newAccount: StudentAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
    setActiveAccountId(newAccount.id);
    setStudent(newAccount.profile);
    setPet(newAccount.pet);
    setMissions(newAccount.missions);
    setRecords(newAccount.records);
  };

  const handleDeleteAccount = (accountId: string) => {
    const remaining = accounts.filter((a) => a.id !== accountId);
    setAccounts(remaining);
    if (activeAccountId === accountId) {
      if (remaining.length > 0) {
        handleSelectAccount(remaining[0]);
      } else {
        setActiveAccountId('');
        setStudent(INITIAL_STUDENT_PROFILE);
        setRecords([]);
      }
    }
    addToast('Alumno Eliminado', 'Se ha eliminado el alumno correctamente', 'info');
  };

  const handleDeleteAllAccounts = () => {
    setAccounts([]);
    setActiveAccountId('');
    setStudent(INITIAL_STUDENT_PROFILE);
    setRecords([]);
    localStorage.removeItem('aventura_student_accounts');
    localStorage.removeItem('aventura_student');
    localStorage.removeItem('aventura_records');
    addToast('Alumnos Eliminados', 'Todos los alumnos han sido eliminados del sistema', 'success');
  };

  // Immediate purge of all previous demo accounts upon request
  React.useEffect(() => {
    const hasDemoAccounts = accounts.some(
      (a) =>
        a.id === 'student-mateo' ||
        a.id === 'student-sofia' ||
        a.id === 'student-lucas' ||
        a.name === 'Mateo González'
    );
    if (hasDemoAccounts || student.name === 'Mateo González') {
      handleDeleteAllAccounts();
    }
  }, []);

  // Active Selected Mission for Core Operations
  const [activeMissionId, setActiveMissionId] = useState<string>(
    INITIAL_LEARNING_MISSIONS[0]?.id || 'math-1'
  );

  // Auto-upgrade missions and ensure arcade playtime is set to 1 minute (60s)
  React.useEffect(() => {
    if (missions.length < 100 || !missions.some((m) => m.subject === 'grammar')) {
      const merged = INITIAL_LEARNING_MISSIONS.map((g) => {
        const existing = missions.find((m) => m.id === g.id);
        return existing ? { ...g, completed: existing.completed, stars: existing.stars } : g;
      });
      setMissions(merged);
    }

    // Ensure student arcade playtime is lowered to 1 min (60 seconds)
    if (student.arcadeTimeSecondsRemaining === undefined || student.arcadeTimeSecondsRemaining > 60) {
      setStudent((prev) => ({
        ...prev,
        arcadeTimeSecondsRemaining: 60,
      }));
    }
  }, []);

  // Preview / Export Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset All Seed Data
  const handleResetSeedData = () => {
    setClients(INITIAL_CLIENTS);
    setTimeEntries(INITIAL_TIME_ENTRIES);
    setInvoices(INITIAL_INVOICES);
    setMissions(INITIAL_LEARNING_MISSIONS);
    setStudent(INITIAL_STUDENT_PROFILE);
    setPet(INITIAL_VIRTUAL_PET);
    setRecords(INITIAL_ACADEMIC_RECORDS);
    setActiveMissionId('game-1');

    addToast(
      'Datos Semilla Restablecidos',
      'Se han recargado todos los registros, misiones y gemas originales de prueba',
      'success'
    );
  };

  // Sound Toggle Handler
  const handleToggleSound = () => {
    setStudent((prev) => {
      const nextSound = !prev.soundEnabled;
      if (!nextSound) {
        stopSpeaking();
      }
      addToast(
        nextSound ? 'Sonido y Voz Activados' : 'Sonido Silenciado',
        nextSound ? 'Lumi leerá las preguntas en voz alta' : 'Audio detenido y silenciado',
        'info'
      );
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const panelBg = student.panelBackground || pet.habitatBackground || 'nebula';

  return (
    <div
      className={`min-h-screen text-slate-100 flex flex-col selection:bg-violet-500 selection:text-white transition-colors duration-700 relative overflow-x-hidden ${
        panelBg === 'meadow'
          ? 'bg-gradient-to-b from-slate-950 via-emerald-950/25 to-slate-950'
          : panelBg === 'cyberpunk'
          ? 'bg-gradient-to-b from-slate-950 via-cyan-950/25 to-fuchsia-950/20'
          : panelBg === 'ocean'
          ? 'bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-950'
          : panelBg === 'castle'
          ? 'bg-gradient-to-b from-slate-950 via-amber-950/30 to-purple-950/20'
          : panelBg === 'volcano'
          ? 'bg-gradient-to-b from-slate-950 via-rose-950/30 to-amber-950/20'
          : 'bg-slate-950'
      }`}
    >
      {/* Dynamic Themed Ambient Floating Effects */}
      {panelBg === 'cyberpunk' && (
        <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] [background-size:32px_32px] z-0" />
      )}
      {panelBg === 'meadow' && (
        <div className="fixed inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] z-0" />
      )}
      {panelBg === 'ocean' && (
        <div className="fixed inset-0 pointer-events-none opacity-15 bg-gradient-to-t from-cyan-900/30 via-transparent to-blue-950/20 animate-pulse z-0" />
      )}
      {panelBg === 'volcano' && (
        <div className="fixed inset-0 pointer-events-none opacity-15 bg-gradient-to-t from-rose-950/40 via-transparent to-amber-950/20 z-0" />
      )}

      {/* Primary Sticky Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          addToast('Navegación', `Sección ${tab.toUpperCase()} activa`, 'info');
        }}
        onResetSeedData={handleResetSeedData}
        student={student}
        onToggleSound={handleToggleSound}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isCloudAuthenticated={Boolean(user)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            student={student}
            missions={missions}
            pet={pet}
            invoices={invoices}
            timeEntries={timeEntries}
            records={records}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onSelectMission={(id) => {
              setActiveMissionId(id);
              setCurrentTab('operations');
            }}
          />
        )}

        {currentTab === 'operations' && (
          <CoreOperationsView
            missions={missions}
            onUpdateMissions={setMissions}
            student={student}
            onUpdateStudent={setStudent}
            pet={pet}
            onUpdatePet={setPet}
            activeMissionId={activeMissionId}
            onSelectMission={setActiveMissionId}
            onAddToast={addToast}
            onAddRecord={(rec) => setRecords((prev) => [rec, ...prev])}
          />
        )}

        {currentTab === 'records' && (
          <RecordsView
            records={records}
            onUpdateRecords={setRecords}
            clients={clients}
            invoices={invoices}
            onUpdateInvoices={setInvoices}
            onAddToast={addToast}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            student={student}
            onUpdateStudent={setStudent}
            onResetSeedData={handleResetSeedData}
            onAddToast={addToast}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AventuraEduca · Pre-MVP Local Interactivo para Clientes e Inversores</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-violet-400 hover:text-violet-300"
            >
              Exportar Reporte
            </button>
            <span className="text-slate-600">·</span>
            <span>Tutoría Socrática Gemini & Gamificación</span>
          </div>
        </div>
      </footer>

      {/* Preview and Export Modal */}
      <PreviewReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        student={student}
        missions={missions}
        records={records}
        invoice={invoices[0]}
        onAddToast={addToast}
      />

      {/* Student Profile Switcher Modal with simple PIN */}
      <StudentProfileSwitcherModal
        isOpen={isProfileSwitcherOpen}
        onClose={() => setIsProfileSwitcherOpen(false)}
        accounts={accounts}
        activeAccountId={activeAccountId}
        onSelectAccount={handleSelectAccount}
        onCreateAccount={handleCreateAccount}
        onDeleteAccount={handleDeleteAccount}
        onDeleteAllAccounts={handleDeleteAllAccounts}
        onAddToast={addToast}
      />

      {/* Supabase Cloud Authentication & Sync Modal */}
      <SupabaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentGems={student.gems}
        currentStudentName={student.name}
        onSyncGemsFromCloud={(newGems) =>
          setStudent((prev) => ({ ...prev, gems: Math.max(prev.gems, newGems) }))
        }
        onAddToast={addToast}
      />

      {/* Share Public App Link Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onAddToast={addToast}
      />

      {/* Toast Notification Stream */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
