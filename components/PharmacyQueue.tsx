
import React, { useEffect, useState } from 'react';
import { Pill, Play, CheckCircle2, Loader2, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';

const PharmacyQueue: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchPharmacyTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`*, encounter:encounters (token)`)
        .eq('type', 'Pharmacy')
        .neq('status', 'DONE')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setMessage({ text: 'Neural relay failure. Re-establishing link.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyTasks();
    const channel = supabase.channel('pharmacy-tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchPharmacyTasks()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleUpdateStatus = async (taskId: string, currentStatus: string, taskTitle: string) => {
    const newStatus = currentStatus.toUpperCase() === 'PENDING' ? 'IN_PROGRESS' : 'DONE';
    setUpdatingId(taskId);
    try {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      await supabase.from('task_updates').insert([{ 
        task_id: taskId, 
        message: `Pharmacy Dispense: ${taskTitle} ${newStatus === 'DONE' ? 'completed' : 'ready'}`, 
        updated_by: 'PHARMACY', 
        status: newStatus 
      }]);
      setMessage({ text: `Asset protocol synchronized`, type: 'success' });
      await fetchPharmacyTasks();
    } catch (error: any) {
      console.error('Update error:', error);
      setMessage({ text: 'Access denied. Protocol violation.', type: 'error' });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusDisplay = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'IN_PROGRESS') return { label: 'Asset Ready', color: 'bg-green-500/30 text-white border-green-500/50' };
    return { label: 'Awaiting Fulfillment', color: 'bg-red-500/30 text-white border-red-500/50' };
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-yellow-400 tracking-tight flex items-center gap-4 gold-heading">
            <Pill className="text-yellow-400" /> Pharmacy Hub
          </h2>
          <p className="text-white font-medium mt-1">Dispensing of pharmacological assets and resource management.</p>
        </div>
        <button onClick={fetchPharmacyTasks} className="bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 backdrop-blur-md active:scale-95 shadow-2xl">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sync Assets
        </button>
      </div>

      {message && (
        <div className={`p-5 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-2xl border ${
          message.type === 'success' ? 'bg-green-500/20 text-white border-green-500/30' : 'bg-red-500/20 text-white border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={22} className="text-green-400" /> : <AlertCircle size={22} className="text-red-400" />}
          <span className="text-sm font-black uppercase tracking-[0.2em]">{message.text}</span>
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
              <Pill className="mx-auto text-yellow-400/20 mb-6" size={64} />
              <p className="text-white font-bold tracking-tight text-lg">Pharmacology queue is clear.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const statusInfo = getStatusDisplay(task.status);
              const normalizedStatus = task.status.toUpperCase();
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
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-yellow-400 transition-colors">{task.title}</h3>
                    <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 bg-white/5 inline-block px-3 py-1 rounded-lg">Dispensing Authorization Active</p>
                  </div>
                  <div className="pt-10 mt-10 border-t border-white/10">
                    <button
                      disabled={updatingId === task.id}
                      onClick={() => handleUpdateStatus(task.id, task.status, task.title)}
                      className={`w-full font-black py-5 rounded-xl text-[11px] transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.2em] shadow-2xl ${
                        normalizedStatus === 'PENDING' 
                          ? 'bg-gradient-to-r from-violet-600 to-purple-800 text-white border border-white/20' 
                          : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {updatingId === task.id ? <Loader2 size={18} className="animate-spin" /> : normalizedStatus === 'PENDING' ? <Play size={18} /> : <CheckCircle2 size={18} />}
                      {normalizedStatus === 'PENDING' ? 'Ready for Collection' : 'Confirm Asset Handover'}
                    </button>
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

// Fix: Added missing default export
export default PharmacyQueue;
