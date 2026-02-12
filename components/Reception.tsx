
import React, { useState, useEffect } from 'react';
import { UserPlus, Phone, Calendar, Loader2, CheckCircle2, Stethoscope, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DEPARTMENTS = [
  'General',
  'Dental',
  'ENT',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Neurology'
];

interface Doctor {
  id: string;
  name: string;
}

const Reception: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phone: '',
  });

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDoctors(selectedDepartment);
    } else {
      setDoctors([]);
      setSelectedDoctorId('');
    }
  }, [selectedDepartment]);

  const fetchDoctors = async (dept: string) => {
    setLoadingDoctors(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('department', dept)
        .eq('is_available', true);
      
      if (error) throw error;
      
      const doctorsData = data || [];
      console.log("Selected department:", dept);
      console.log("Fetched doctors:", doctorsData);
      
      setDoctors(doctorsData);
      
      if (doctorsData.length > 0) {
        setSelectedDoctorId(doctorsData[0].id);
      } else {
        setSelectedDoctorId('');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
      setSelectedDoctorId('');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const generateToken = async () => {
    const { count } = await supabase
      .from('encounters')
      .select('*', { count: 'exact', head: true });
    
    const nextNum = (count || 0) + 1;
    return `E-${nextNum.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert([{
          full_name: formData.fullName,
          age: parseInt(formData.age),
          phone: formData.phone
        }])
        .select()
        .single();

      if (patientError) throw patientError;

      const token = await generateToken();

      const { error: encounterError } = await supabase
        .from('encounters')
        .insert([{
          patient_id: patientData.id,
          token: token,
          status: 'active',
          doctor_id: selectedDoctorId || null,
          department: selectedDepartment || null
        }]);

      if (encounterError) throw encounterError;

      setSuccess(token);
      setFormData({ fullName: '', age: '', phone: '' });
      setSelectedDepartment('');
      setSelectedDoctorId('');
    } catch (error: any) {
      console.error('Error in reception workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-3 mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-yellow-400 tracking-tight gold-heading">Patient Reception</h2>
        <p className="text-white font-medium">Digital intake and clinical specialty assignment system.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors" size={20} />
                <input
                  required
                  type="text"
                  placeholder="Patient Name"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-purple-400/30 bg-black/30 text-white placeholder-white/70 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Age</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors" size={20} />
                  <input
                    required
                    type="number"
                    placeholder="00"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-purple-400/30 bg-black/30 text-white placeholder-white/70 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Contact</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors" size={20} />
                  <input
                    required
                    type="tel"
                    placeholder="+00"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-purple-400/30 bg-black/30 text-white placeholder-white/70 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Specialty</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors" size={20} />
                  <select
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-purple-400/30 bg-black/30 text-white text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all cursor-pointer appearance-none"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="" className="bg-[#1a0b2e] text-white">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept} className="bg-[#1a0b2e] text-white">{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-widest ml-1">Consultant</label>
                <div className="relative group">
                  {loadingDoctors ? (
                    <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 animate-spin" size={20} />
                  ) : (
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors" size={20} />
                  )}
                  <select
                    required
                    disabled={!selectedDepartment || loadingDoctors}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-purple-400/30 bg-black/30 text-white text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all cursor-pointer appearance-none disabled:opacity-30 disabled:cursor-not-allowed"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                  >
                    <option value="" disabled className="bg-[#1a0b2e] text-white">Select Doctor</option>
                    {doctors.length === 0 ? (
                      <option value="" disabled className="bg-[#1a0b2e] text-white">No Doctors Available</option>
                    ) : (
                      doctors.map((doc) => (
                        <option key={doc.id} value={doc.id} className="bg-[#1a0b2e] text-white">{doc.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-800 hover:from-violet-500 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-5 rounded-xl shadow-[0_10px_30px_rgba(139,92,246,0.4)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.6)] hover:scale-105 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle2 className="group-hover:scale-110 transition-transform" size={22} />}
            <span className="text-lg tracking-tight uppercase tracking-widest">{loading ? 'Processing...' : 'Register Patient Arrival'}</span>
          </button>
        </form>

        {success && (
          <div className="px-10 pb-10 animate-in zoom-in duration-500">
            <div className="bg-white/10 border border-white/20 rounded-[2rem] p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                <CheckCircle2 className="text-white" size={32} />
              </div>
              <div>
                <p className="text-white font-black text-xl tracking-tight">Access Token Generated</p>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Patient assigned to wait queue</p>
              </div>
              <div className="text-5xl font-black text-yellow-400 tracking-[0.2em] bg-black/60 inline-block px-12 py-5 rounded-3xl shadow-inner border border-white/10 font-mono">
                {success}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reception;
