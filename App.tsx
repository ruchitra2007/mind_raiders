
import React, { useState } from 'react';
import { LayoutDashboard, Users, Activity, Clock, TestTube, Pill } from 'lucide-react';
import Reception from './components/Reception';
import DoctorDashboard from './components/DoctorDashboard';
import Timeline from './components/Timeline';
import LabQueue from './components/LabQueue';
import PharmacyQueue from './components/PharmacyQueue';

type View = 'reception' | 'doctor' | 'lab' | 'pharmacy' | 'timeline';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('reception');

  const navItems = [
    { id: 'reception', label: 'Reception', icon: <Users size={18} /> },
    { id: 'doctor', label: 'Doctor', icon: <Activity size={18} /> },
    { id: 'lab', label: 'Lab', icon: <TestTube size={18} /> },
    { id: 'pharmacy', label: 'Pharmacy', icon: <Pill size={18} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-purple-500/30 selection:text-white">
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-violet-600 to-purple-800 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-yellow-400 tracking-tight">
                MedFlow <span className="text-white">Clinic</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">Health OS v2.5</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  currentView === item.id
                    ? 'bg-white/15 text-white border border-white/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {currentView === 'reception' && <Reception />}
          {currentView === 'doctor' && <DoctorDashboard />}
          {currentView === 'lab' && <LabQueue />}
          {currentView === 'pharmacy' && <PharmacyQueue />}
          {currentView === 'timeline' && <Timeline />}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-black/60 backdrop-blur-2xl border border-white/20 px-4 py-3 flex justify-around items-center rounded-3xl shadow-2xl z-50 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 ${
              currentView === item.id 
                ? 'text-white bg-purple-600/50 px-4 scale-110 shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-white/20' 
                : 'text-white/40'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
