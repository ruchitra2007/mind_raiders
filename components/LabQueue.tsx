
import React, { useEffect, useState } from 'react';
import { TestTube, Play, CheckCircle2, Loader2, RefreshCw, FlaskConical, Hash, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';

const LabQueue: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [labDrafts, setLabDrafts] = useState<Record<string, { result: string, notes: string }>>({});

  const fetchLabTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, encounter:encounters (token)`)
        .ilike('type', '%lab%')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setMessage({ text: 'Neural link interrupted. Retrying...', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTasks();
    const channel = supabase.channel('lab-tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchLabTasks()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: 'IN_PROGRESS' | 'DONE') => {
    setUpdatingId(taskId);
    setMessage(null);
    try {
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .select()
        .single();
      
      if (updateError) throw updateError;

      let updateMessage = '';
      if (newStatus === 'IN_PROGRESS') {
        updateMessage = `Lab sample processing: ${updatedTask.title}`;
      } else {
        const report = labDrafts[taskId] || { result: 'POSITIVE', notes: '' };
        updateMessage = `Lab result: ${report.result}${report.notes ? " — " + report.notes : ""}`;
      }

      const { error: logError } = await supabase
        .from('task_updates')
        .insert([{ 
          task_id: taskId, 
          message: updateMessage, 
          updated_by: 'LAB', 
          status: newStatus 
        }]);
      
      if (logError) throw logError;

      setMessage({ text: `Protocol successfully synchronized`, type: 'success' });
      
      if (newStatus === 'DONE') {
        setLabDrafts(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
      
      await fetchLabTasks();
    } catch (error: any) {
      console.error('Update error:', error);
      setMessage({ text: 'Data transmission error', type: 'error' });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateDraft = (taskId: string, field: 'result' | 'notes', value: string) => {
    setLabDrafts(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || { result: 'POSITIVE', notes: '' }),
        [field]: value
      }
    }));
  };

  const getStatusDisplay = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'IN_PROGRESS': return { label: 'Analysis Active', color: 'bg-yellow-500/30 text-white border-yellow-500/50' };
      case 'DONE': return { label: 'Finalized', color: 'bg-green-500/30 text-white border-green-500/50' };
      default: return { label: 'Awaiting', color: 'bg-red-500/30 text-white border-red-500/50' };
    }
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-yellow-400 tracking-tight flex items-center gap-4 gold-heading">
            <FlaskConical className="text-yellow-400" /> Laboratory Stream
          </h2>
          <p className="text-white font-medium mt-1">Diagnostic execution and molecular analysis management.</p>
        </div>
        <button onClick={fetchLabTasks} className="bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 backdrop-blur-md active:scale-95 shadow-2xl">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sync Stream
        </button>
      </div>

      {message && (
        <div className={`p-5 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500 shadow-2xl border ${
          message.type === 'success' ? 'bg-green-500/20 text-white border-green-500/30' : 'bg-red-500/20 text-white border-red-500/30'
        }`}>
          <CheckCircle2 size={20} />
          <span className="text-sm font-black uppercase tracking-widest">{message.text}</span>
        </div>
      )}

      {loading && !tasks.length ? (
        <div className="flex justify-center py-32">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tasks.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white/10 rounded-[3rem] border border-dashed border-white/20 backdrop-blur-md">
              <TestTube className="mx-auto text-yellow-400/20 mb-6" size={64} />
              <p className="text-white font-bold tracking-tight text-lg">Diagnostic stream is currently idle.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const statusInfo = getStatusDisplay(task.status);
              const normalizedStatus = task.status.toUpperCase();
              const draft = labDrafts[task.id] || { result: 'POSITIVE', notes: '' };

              return (
                <div key={task.id} className="bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-8 hover:bg-white/15 hover:border-yellow-400/40 transition-all flex flex-col justify-between group shadow-2xl relative overflow-hidden">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <span className="bg-yellow-400 text-black text-[10px] font-black px-4 py-1.5 rounded-xl tracking-[0.2em] border border-white/10 shadow-lg">
                          {task.encounter?.token || '???'}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-white/50 font-black flex items-center gap-2 font-mono uppercase tracking-widest">
                        <Clock size={16} className="text-yellow-400/40" /> {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-yellow-400 transition-colors">{task.title}</h3>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                      Directive: <span className="text-white">{task.assigned_to}</span>
                    </p>

                    {normalizedStatus === 'IN_PROGRESS' && (
                      <div className="space-y-6 mb-8 animate-in fade-in zoom-in duration-500 p-6 bg-black/40 rounded-2xl border border-purple-400/30">
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-white uppercase tracking-[0.3em] ml-1">Molecular Result</label>
                          <select 
                            className="w-full px-4 py-3 text-sm font-bold rounded-xl border border-purple-400/30 bg-black/30 text-white focus:border-purple-500 outline-none transition-all cursor-pointer appearance-none"
                            value={draft.result}
                            onChange={(e) => updateDraft(task.id, 'result', e.target.value)}
                          >
                            <option className="bg-[#1a0b2e]" value="POSITIVE">POSITIVE (+)</option>
                            <option className="bg-[#1a0b2e]" value="NEGATIVE">NEGATIVE (-)</option>
                          </select>
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-white uppercase tracking-[0.3em] ml-1">Clinical Remarks</label>
                          <input 
                            type="text"
                            placeholder="Enter findings..."
                            className="w-full px-4 py-3 text-sm font-bold rounded-xl border border-purple-400/30 bg-black/30 text-white placeholder:text-white/70 focus:border-purple-500 outline-none transition-all"
                            value={draft.notes}
                            onChange={(e) => updateDraft(task.id, 'notes', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    {normalizedStatus === 'DONE' ? (
                      <div className="w-full bg-green-500/20 text-white font-black py-4 px-6 rounded-xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-green-500/30">
                        <CheckCircle2 size={18} /> Analysis Sync Complete
                      </div>
                    ) : (
                      <button
                        disabled={updatingId === task.id}
                        onClick={() => handleUpdateStatus(task.id, normalizedStatus === 'PENDING' ? 'IN_PROGRESS' : 'DONE')}
                        className={`w-full font-black py-5 px-6 rounded-xl text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl ${
                          normalizedStatus === 'PENDING' 
                            ? 'bg-gradient-to-r from-violet-600 to-purple-800 text-white border border-white/20' 
                            : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                        }`}
                      >
                        {updatingId === task.id ? <Loader2 size={18} className="animate-spin" /> : normalizedStatus === 'PENDING' ? <Play size={18} /> : <CheckCircle2 size={18} />}
                        {normalizedStatus === 'PENDING' ? 'Activate Protocol' : 'Sync Result & Finalize'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default LabQueue;
