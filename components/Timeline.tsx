
import React, { useEffect, useState, useMemo } from 'react';
import { Clock, RefreshCw, Loader2, MessageCircle, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TaskUpdate } from '../types';

const Timeline: React.FC = () => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
    const channel = supabase
      .channel('timeline-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_updates' }, () => fetchUpdates())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('task_updates')
        .select(`*, task:tasks (*, encounter:encounters (token))`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedUpdates = useMemo(() => {
    const groups: Record<string, TaskUpdate[]> = {};
    const groupOrder: string[] = [];
    updates.forEach((update) => {
      const token = update.task?.encounter?.token || 'Unknown';
      if (!groups[token]) {
        groups[token] = [];
        groupOrder.push(token);
      }
      groups[token].push(update);
    });
    return { groups, groupOrder };
  }, [updates]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold text-yellow-400 tracking-tight flex items-center gap-4 gold-heading">
            <Clock className="text-yellow-400" /> Neural Activity Feed
          </h2>
          <p className="text-white font-medium mt-1">Live synchronized tracking of clinical execution cycles.</p>
        </div>
        <button onClick={fetchUpdates} className="p-3 text-white hover:text-yellow-400 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-all shadow-xl backdrop-blur-md active:scale-95">
          <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && !updates.length ? (
        <div className="flex justify-center py-40">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
        </div>
      ) : (
        <div className="space-y-16">
          {groupedUpdates.groupOrder.length === 0 ? (
            <div className="bg-white/10 p-24 text-center rounded-[3rem] border border-dashed border-white/20 backdrop-blur-md shadow-2xl">
              <MessageCircle className="mx-auto text-yellow-400/20 mb-8" size={64} />
              <p className="text-white font-black uppercase tracking-widest">System activity archives are currently void.</p>
            </div>
          ) : (
            groupedUpdates.groupOrder.map((token) => (
              <div key={token} className="space-y-8 relative">
                <div className="flex items-center gap-6">
                  <div className="bg-black/60 text-yellow-400 text-[11px] font-black px-6 py-2 rounded-xl tracking-[0.3em] flex items-center gap-3 border border-white/10 shadow-2xl">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span>
                    {token}
                  </div>
                  <div className="h-px bg-gradient-to-r from-white/20 to-transparent flex-1"></div>
                </div>

                <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-7 before:w-[2px] before:bg-gradient-to-b before:from-yellow-400/40 before:via-purple-500/20 before:to-transparent">
                  {groupedUpdates.groups[token].map((update, idx) => (
                    <div key={update.id} className="relative pl-16 pb-10 group transition-all">
                      <div className="absolute left-7 top-4 -translate-x-1/2 w-4 h-4 rounded-full border-[3px] border-[#1a0b2e] bg-yellow-400 z-10 group-hover:scale-150 group-hover:shadow-[0_0_15px_rgba(234,179,8,1)] transition-all duration-300"></div>
                      
                      <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 p-7 hover:bg-white/15 hover:border-yellow-400/30 transition-all group-hover:translate-x-2">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white bg-purple-600/30 px-3 py-1.5 rounded-lg border border-white/10">
                              {update.task?.type || 'Update'}
                            </span>
                            {update.status && (
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${
                                update.status === 'PENDING' 
                                  ? 'bg-red-500/30 text-white border-red-500/50' 
                                  : update.status === 'DONE'
                                    ? 'bg-green-500/30 text-white border-green-500/50'
                                    : 'bg-yellow-500/30 text-white border-yellow-500/50'
                              }`}>
                                {update.status}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-black text-white/40 flex items-center gap-2 font-mono uppercase tracking-widest">
                            <Clock size={14} className="text-yellow-400/40" /> {formatDate(update.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-white font-bold tracking-tight text-lg mb-5">
                          {update.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/10">
                          {update.task && (
                            <div className="text-[10px] font-bold text-white/70 flex items-center gap-2 uppercase tracking-widest">
                              <span className="text-yellow-400 font-black">Subject:</span> {update.task.title}
                            </div>
                          )}
                          {update.updated_by && (
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                              Origin: {update.updated_by}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Timeline;
