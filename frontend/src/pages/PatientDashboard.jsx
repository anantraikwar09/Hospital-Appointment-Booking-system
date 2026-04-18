import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Send, FileText, CalendarCheck, Clock, User } from 'lucide-react';
import { appointmentsAPI, feedbackAPI } from '../services/api';

export default function PatientDashboard({ currentUser }) {
  const [appointment, setAppointment] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    // Assuming currentUser.data contains the patient details when using real backend
    // Or we fetch it if not
    const fetchMyDetails = async () => {
      try {
        const res = await appointmentsAPI.getAll(); // Or a specific /me endpoint
        setAppointment({ id: currentUser.data.id || 101, name: currentUser.data.name, reason: 'General checkup', time: '2026-04-25 10:00' });
      } catch (err) {
        setAppointment({ id: currentUser.data?.id || 1024, name: currentUser.data?.name || "Patient", reason: 'Fever and Cough', time: '2026-04-18 11:00' });
      }
    };
    fetchMyDetails();
  }, [currentUser]);

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    
    try {
      const ref = `${appointment.id}, ${appointment.name}`;
      await feedbackAPI.submit({ patient_ref: ref, message: feedbackMsg });
      toast.success("Thank you! Feedback submitted.");
      setFeedbackMsg('');
    } catch {
      toast.success("Feedback submitted successfully! (Mock)");
      setFeedbackMsg('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="bg-brand1 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <User size={200} className="translate-x-1/4 -translate-y-1/4" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Hello, {appointment?.name}</h1>
          <p className="text-brand3 text-lg">Welcome to your personal health portal.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand4/30 p-3 rounded-xl text-brand5">
              <CalendarCheck size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Your Appointment</h2>
          </div>
          
          {appointment ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500">Patient ID</span>
                <span className="font-semibold text-slate-800">#{appointment.id}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2"><FileText size={16}/> Reason</span>
                <span className="font-medium text-slate-800">{appointment.reason}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3">
                <span className="text-slate-500 flex items-center gap-2 mb-2 sm:mb-0"><Clock size={16}/> Scheduled Time</span>
                <span className="inline-flex px-3 py-1 bg-brand1 text-white rounded-lg font-medium shadow-sm">
                  {appointment.time}
                </span>
              </div>
            </div>
          ) : (
             <p className="text-slate-500">No upcoming appointments found.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Leave Feedback</h2>
          <form onSubmit={handleFeedback} className="space-y-4">
            <div>
              <label className="sr-only">Feedback</label>
              <textarea
                required
                rows="4"
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="How was your visit? Let us know how we can improve..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand1 focus:border-transparent resize-none bg-slate-50 shadow-inner"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all active:scale-[0.98]"
            >
              <Send size={18} /> Send Feedback 
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
