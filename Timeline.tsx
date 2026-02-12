
import React, { useEffect, useState, useMemo } from 'react';
import { Clock, RefreshCw, Loader2, MessageCircle, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TaskUpdate } from '../types';

const Timeline: React.FC = () => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();
    
    // Fix: Adding schema: 'public' to match the RealtimePostgresChangesFilter type definition
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_updates' },
        () => {
          fetchUpdates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUpdates = async () => {
    try {
      // Fetch updates with tasks and their encounters to get the token
      const { data, error } = await supabase
        .from('task_updates')
        .select(`
          *,
          task:tasks (
            *,
            encounter:encounters (
              token
            )
          )
        `)
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
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="text-blue-600" /> Operational Timeline
        </h2>
        <button 
          onClick={fetchUpdates}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          title="Refresh timeline"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="space-y-10">
          {groupedUpdates.groupOrder.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <MessageCircle className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500">No task updates yet.</p>
            </div>
          ) : (
            groupedUpdates.groupOrder.map((token) => (
              <div key={token} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 text-white text-xs font-black px-3 py-1 rounded flex items-center gap-1 shadow-sm">
                    <Hash size={12} /> {token}
                  </div>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-8 before:w-px before:bg-slate-200">
                  {groupedUpdates.groups[token].map((update, idx) => (
                    <div 
                      key={update.id} 
                      className="relative pl-16 pb-6 animate-in slide-in-from-left-4 duration-300" 
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Dot */}
                      <div className="absolute left-6 top-2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-sm z-10"></div>
                      
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {update.task?.type || 'Update'}
                            </span>
                            {update.status && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                update.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                              }`}>
                                {update.status}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} /> {formatDate(update.created_at)}
                          </span>
                        </div>
                        
                        {/* Fix: Property 'update_text' does not exist on type 'TaskUpdate'. Corrected to 'message'. */}
                        <p className="text-slate-900 font-medium mb-1">
                          {update.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                          {update.task && (
                            <div className="text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">Task:</span> {update.task.title}
                            </div>
                          )}
                          {update.updated_by && (
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              By: {update.updated_by}
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
