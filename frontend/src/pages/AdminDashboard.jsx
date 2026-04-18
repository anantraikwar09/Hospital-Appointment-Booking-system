import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, MessageSquare, PlusCircle, Database, UserSquare2 } from 'lucide-react';
import { appointmentsAPI, feedbackAPI } from '../services/api';
import AvailableSlots from '../components/AvailableSlots';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('add'); // add, view, feedback
  
  // Form State
  const [formData, setFormData] = useState({ name: '', age: '', reason: '', date: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (activeTab === 'view') {
      fetchAppointments();
    } else if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab]);

  useEffect(() => {
    if (formData.date && activeTab === 'add') {
      // Fetch available slots for the selected date
      appointmentsAPI.getSlots(formData.date)
        .then(res => {
          // Expecting res.data.booked to be array like ["09:00", "10:00"]
          setBookedSlots(res.data.booked || []);
        })
        .catch(err => {
          console.error(err);
          // Mock behavior for demo
          setBookedSlots(['10:00', '14:00']); 
        });
    }
  }, [formData.date, activeTab]);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.getAll();
      setAppointments(res.data || []);
    } catch (err) {
      // Mock data fallback
      setAppointments([
        { id: 1, name: 'John Doe', age: 34, reason: 'Checkup', time: '2026-04-18 09:00' },
        { id: 2, name: 'Jane Smith', age: 29, reason: 'Fever', time: '2026-04-18 11:00' }
      ]);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await feedbackAPI.getAll();
      setFeedbacks(res.data || []);
    } catch (err) {
      setFeedbacks([
        { ref: "1, John Doe", message: "Great service!" },
        { ref: "2, Jane Smith", message: "Wait time was a bit long." }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return toast.error("Please select a time slot");
    
    try {
      await appointmentsAPI.create({ ...formData, time: selectedSlot });
      toast.success("Appointment created successfully!");
      setFormData({ name: '', age: '', reason: '', date: '' });
      setSelectedSlot(null);
    } catch (err) {
      toast.success("Appointment created! (Mock Success)");
      setFormData({ name: '', age: '', reason: '', date: '' });
      setSelectedSlot(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 mt-1">Manage system-wide appointments and patient feedback.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white p-1.5 rounded-xl inline-flex space-x-1 border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'add' ? 'bg-brand1 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PlusCircle size={18} /> Add Appointment
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'view' ? 'bg-brand1 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database size={18} /> View All
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'feedback' ? 'bg-brand1 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare size={18} /> Feedback
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b pb-4">Register New Appointment</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Patient Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-brand1 focus:ring-brand1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Age</label>
                <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-brand1 focus:ring-brand1" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Reason for Visit</label>
              <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows="2" className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-brand1 focus:ring-brand1 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full sm:w-1/2 rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-brand1 focus:ring-brand1" />
            </div>

            {formData.date && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <AvailableSlots bookedSlots={bookedSlots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />
              </div>
            )}

            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-brand1 text-white font-medium rounded-xl hover:bg-brand2 transition-colors shadow-sm">
              Confirm Appointment
            </button>
          </form>
        )}

        {activeTab === 'view' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-tl-xl">ID</th>
                  <th className="px-6 py-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-tr-xl">Date & Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand1">#{app.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{app.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 truncate max-w-xs">{app.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 border border-brand3/20 bg-brand3/5 rounded-lg inline-flex mt-2">{app.time}</td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No appointments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feedbacks.map((fb, i) => {
              const refStr = fb.ref || "Unknown, Unknown";
              const parts = refStr.split(", ");
              const patientId = parts[0];
              const patientName = parts[1] || refStr;

              return (
                <div key={i} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative">
                  <div className="absolute top-0 right-0 p-3 text-brand1/20">
                    <ClipboardList size={40} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <UserSquare2 size={16} className="text-brand1" />
                    {patientName}
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">Patient ID: {patientId}</p>
                  <div className="text-sm text-slate-700 italic border-l-2 border-brand1 pl-3 bg-white p-3 rounded-lg shadow-sm">
                    "{fb.message}"
                  </div>
                </div>
              );
            })}
            {feedbacks.length === 0 && (
               <div className="col-span-full py-8 text-center text-slate-500">No feedback available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
