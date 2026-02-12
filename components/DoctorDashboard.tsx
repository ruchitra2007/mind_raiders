
import React, { useEffect, useState } from 'react';
import { Activity, Plus, ClipboardList, Loader2, User, ChevronRight, X, Clock, CheckCircle2, FlaskConical, Pill, Stethoscope, RefreshCw, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Encounter, Task } from '../types';

const DoctorDashboard: React.FC = () => {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [encounterTasks, setEncounterTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskData, setTaskData] = useState({
    type: 'Consultation',
    title: '',
    assigned_to: ''
  });
  const [submittingTask, setSubmittingTask] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchEncounters();
  }, []);

  useEffect(() => {
    if (!selectedEncounter) return;

    const channel = supabase
      .channel(`encounter-tasks-${selectedEncounter.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `encounter_id=eq.${selectedEncounter.id}`
        },
        () => {
          fetchEncounterTasks(selectedEncounter.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEncounter]);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('encounters')
        .select(`
          *,
          patient:patients (*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEncounters(data || []);
    } catch (error) {
      console.error('Error fetching encounters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEncounterTasks = async (encounterId: string) => {
    setLoadingTasks(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_updates (
            *
          )
        `)
        .eq('encounter_id', encounterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEncounterTasks(data || []);
    } catch (error) {
      console.error('Error fetching encounter tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter) return;
    setSubmittingTask(true);
    setSuccessMsg(null);

    try {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          encounter_id: selectedEncounter.id,
          type: taskData.type,
          title: taskData.title,
          assigned_to: taskData.assigned_to,
          status: 'PENDING'
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      const { error: updateError } = await supabase
        .from('task_updates')
        .insert([{
          task_id: task.id,
          message: `Doctor ordered: ${task.title}`,
          updated_by: 'DOCTOR',
          status: 'PENDING'
        }]);

      if (updateError) throw updateError;

      setTaskData({ type: 'Consultation', title: '', assigned_to: '' });
      setSuccessMsg(`Order successfully transmitted.`);
      
      await fetchEncounterTasks(selectedEncounter.id);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error: any) {
      console.error('Error creating task:', error);
    } finally {
      setSubmittingTask(false);
    }
  };

  const openEncounterPanel = (encounter: Encounter) => {
    setSelectedEncounter(encounter);
    setEncounterTasks([]);
    setIsPanelOpen(true);
    fetchEncounterTasks(encounter.id);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'DONE':
        return <span className="px-3 py-1 rounded-lg bg-green-500/30 text-white border border-green-500/50 text-[9px] font-black uppercase tracking-widest">Completed</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 rounded-lg bg-yellow-500/30 text-white border border-yellow-500/50 text-[9px] font-black uppercase tracking-widest">Active</span>;
      default:
        return <span className="px-3 py-1 rounded-lg bg-red-500/30 text-white border border-red-500/50 text-[9px] font-black uppercase tracking-widest">Queued</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lab test': return <FlaskConical size={14} className="text-yellow-400" />;
      case 'pharmacy': return <Pill size={14} className="text-white" />;
      default: return <Stethoscope size={14} className="text-white" />;
    }
  };

  const getLabReport = (task: Task) => {
    if (!task.task_updates) return null;
    const labUpdate = task.task_updates
      .filter(u => u.updated_by === 'LAB' && u.message.startsWith('Lab result:'))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    if (!labUpdate) return null;
    return labUpdate.message.replace('Lab result:', 'Report:');
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-yellow-400 tracking-tight flex items-center gap-4 gold-heading">
            <Activity className="text-yellow-400" /> Patient Stream
          </h2>
          <p className="text-white font-medium mt-1">Real-time encounter management and diagnostic control.</p>
        </div>
        <button 
          onClick={fetchEncounters}
          className="bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 shadow-xl backdrop-blur-md active:scale-95"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh Registry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {encounters.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white/10 rounded-[3rem] border border-dashed border-white/20 backdrop-blur-md">
              <ClipboardList className="mx-auto text-yellow-400/20 mb-6" size={64} />
              <p className="text-white font-bold tracking-tight text-lg">No active patient encounters detected.</p>
            </div>
          ) : (
            encounters.map((enc) => (
              <div 
                key={enc.id} 
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-8 hover:bg-white/15 hover:border-yellow-400/50 hover:scale-[1.02] transition-all group cursor-pointer shadow-2xl relative overflow-hidden"
                onClick={() => openEncounterPanel(enc)}
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-600/20 blur-[60px] rounded-full group-hover:bg-purple-600/40 transition-all"></div>
                
                <div className="flex justify-between items-start mb-8">
                  <span className="bg-yellow-400 text-black text-[10px] font-black px-4 py-1.5 rounded-lg border border-white/10 tracking-[0.2em] shadow-lg">
                    {enc.token}
                  </span>
                  <div className="p-2 bg-white/10 rounded-full group-hover:bg-yellow-400 group-hover:text-black transition-all duration-300">
                    <ChevronRight size={20} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-yellow-400 transition-colors">{enc.patient?.full_name}</h3>
                <div className="flex items-center gap-4 text-white/80 text-sm font-bold">
                  <span className="flex items-center gap-2"><User size={16} className="text-yellow-400" /> {enc.patient?.age} yrs</span>
                  <span className="w-2 h-2 bg-white/20 rounded-full"></span>
                  <span className="flex items-center gap-2 font-mono">{enc.patient?.phone}</span>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{enc.department}</span>
                  <button className="text-white text-sm font-extrabold flex items-center gap-2 bg-purple-600/30 px-4 py-2 rounded-xl group-hover:bg-purple-600/50 transition-all border border-white/10">
                    Open Record
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Futuristic Side Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end p-0 bg-black/70 backdrop-blur-md transition-opacity">
          <div className="bg-black/60 backdrop-blur-[50px] w-full max-w-2xl h-full shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in slide-in-from-right duration-700 border-l border-white/20">
            <div className="px-10 pt-12 pb-8 border-b border-white/10 relative">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="bg-yellow-400 text-black text-[11px] font-black px-4 py-1.5 rounded-xl tracking-[0.2em] shadow-lg">{selectedEncounter?.token}</span>
                    <h3 className="text-3xl font-black text-yellow-400 tracking-tight gold-heading">{selectedEncounter?.patient?.full_name}</h3>
                  </div>
                  <div className="flex items-center gap-5 text-white/80 text-sm font-bold">
                    <span className="flex items-center gap-2"><User size={16} className="text-yellow-400" /> {selectedEncounter?.patient?.age} yrs</span>
                    <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                    <span className="flex items-center gap-2">Protocol: {selectedEncounter?.patient?.phone}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-2xl transition-all active:scale-95 border border-white/10"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 relative">
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">New Clinical Order</h4>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                {successMsg && (
                  <div className="p-5 bg-green-500/20 border border-green-500/30 text-white text-sm font-bold rounded-xl animate-in zoom-in flex items-center gap-4 shadow-xl">
                    <CheckCircle2 size={20} className="text-green-400" /> {successMsg}
                  </div>
                )}
                
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-white ml-1 uppercase tracking-widest">Protocol Type</label>
                      <select 
                        className="w-full px-5 py-4 rounded-xl border border-purple-400/30 bg-black/40 text-white text-sm font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all cursor-pointer appearance-none"
                        value={taskData.type}
                        onChange={(e) => setTaskData({...taskData, type: e.target.value})}
                      >
                        <option className="bg-[#1a0b2e]">Consultation</option>
                        <option className="bg-[#1a0b2e]">Lab Test</option>
                        <option className="bg-[#1a0b2e]">X-Ray / Imaging</option>
                        <option className="bg-[#1a0b2e]">Pharmacy</option>
                        <option className="bg-[#1a0b2e]">Nursing</option>
                      </select>
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black text-white ml-1 uppercase tracking-widest">Target Unit</label>
                      <input 
                        required
                        placeholder="Unit Code"
                        className="w-full px-5 py-4 rounded-xl border border-purple-400/30 bg-black/40 text-white text-sm font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-white/70"
                        value={taskData.assigned_to}
                        onChange={(e) => setTaskData({...taskData, assigned_to: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-white ml-1 uppercase tracking-widest">Execution Details</label>
                    <input 
                      required
                      placeholder="e.g. STAT Lab Panel"
                      className="w-full px-5 py-4 rounded-xl border border-purple-400/30 bg-black/40 text-white text-sm font-bold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-white/70"
                      value={taskData.title}
                      onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submittingTask}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-800 hover:from-violet-500 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-900 text-white font-black py-5 rounded-xl text-sm transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 uppercase tracking-[0.1em]"
                  >
                    {submittingTask ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    {submittingTask ? 'Transmitting...' : 'Dispatch Clinical Order'}
                  </button>
                </form>
              </section>

              <section className="space-y-8">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Historical Archive</h4>
                  <div className="h-px bg-white/10 flex-1 ml-4"></div>
                </div>

                <div className="space-y-5">
                  {encounterTasks.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No previous operations logged.</p>
                    </div>
                  ) : (
                    encounterTasks.map((task) => {
                      const labReport = getLabReport(task);
                      return (
                        <div key={task.id} className="bg-white/10 rounded-2xl border border-white/10 p-6 shadow-2xl hover:border-yellow-400/30 transition-all group/item">
                          <div className="flex justify-between items-start mb-5">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white/10 text-white rounded-xl border border-white/10 group-hover/item:bg-yellow-400 group-hover/item:text-black transition-all duration-300">
                                {getTypeIcon(task.type)}
                              </div>
                              <div>
                                <h5 className="font-black text-white text-base tracking-tight">{task.title}</h5>
                                <p className="text-[9px] text-yellow-400 font-black uppercase tracking-[0.2em]">{task.type}</p>
                              </div>
                            </div>
                            {getStatusBadge(task.status)}
                          </div>
                          
                          {labReport && (
                            <div className="mb-5 p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20 flex items-start gap-3">
                              <FileText size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                              <p className="text-[12px] font-bold text-white leading-relaxed">
                                {labReport}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-white/50 font-black px-1 mt-4 pt-4 border-t border-white/5 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                              Dest: <span className="text-white">{task.assigned_to}</span>
                            </span>
                            <span className="font-mono">{new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
