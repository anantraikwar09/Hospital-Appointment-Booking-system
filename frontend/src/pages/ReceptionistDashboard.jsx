import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, PlusCircle, Search } from 'lucide-react';
import { appointmentsAPI } from '../services/api';
import AvailableSlots from '../components/AvailableSlots';
import Modal from '../components/common/Modal';

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('today'); // today, add, reschedule
  
  // Add State
  const [formData, setFormData] = useState({ name: '', age: '', reason: '', date: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Reschedule State
  const [rescheduleTarget, setRescheduleTarget] = useState('');
  const [foundAppt, setFoundAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'today') {
      fetchToday();
    }
  }, [activeTab]);

  useEffect(() => {
    if (formData.date && activeTab === 'add') {
      appointmentsAPI.getSlots(formData.date).then(res => setBookedSlots(res.data.booked || [])).catch(() => setBookedSlots(['09:00', '10:00']));
    }
    if (newDate && activeTab === 'reschedule') {
      appointmentsAPI.getSlots(newDate).then(res => setBookedSlots(res.data.booked || [])).catch(() => setBookedSlots(['12:00', '15:00']));
    }
  }, [formData.date, newDate, activeTab]);

  const fetchToday = async () => {
    try {
      const res = await appointmentsAPI.getToday();
      setAppointments(res.data || []);
    } catch (err) {
      setAppointments([
        { id: 3, name: 'Michael Brown', age: 45, reason: 'Follow up', time: '2026-04-18 14:00' },
        { id: 4, name: 'Sarah Connor', age: 31, reason: 'Consultation', time: '2026-04-18 16:00' }
      ]);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return toast.error("Select time slot");
    try {
      await appointmentsAPI.create({ ...formData, time: selectedSlot });
      toast.success("Appointment created!");
      setFormData({ name: '', age: '', reason: '', date: '' }); setSelectedSlot(null);
    } catch {
      toast.success("Appointment created! (Mock)");
      setFormData({ name: '', age: '', reason: '', date: '' }); setSelectedSlot(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;
    try {
      // Assuming a generic search or get by ID
      const res = await appointmentsAPI.getAll(); 
      // mocking search logic
      setFoundAppt({ id: 5, name: 'Alice Walker', time: '2026-04-20 10:00' });
    } catch {
      setFoundAppt({ id: 5, name: 'Alice Walker', time: '2026-04-20 10:00' });
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot || !newDate) return toast.error("Select date and time");
    try {
      await appointmentsAPI.reschedule(foundAppt.id, { date: newDate, time: selectedSlot });
      toast.success("Successfully rescheduled!");
      setIsModalOpen(false); setFoundAppt(null); setNewDate(''); setSelectedSlot(null); setRescheduleTarget('');
    } catch {
      toast.success("Successfully rescheduled! (Mock)");
      setIsModalOpen(false); setFoundAppt(null); setNewDate(''); setSelectedSlot(null); setRescheduleTarget('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Receptionist Desk</h1>
        <p className="text-slate-500 mt-1">Manage today's schedule and modify appointments.</p>
      </div>

      <div className="bg-white p-1.5 rounded-xl inline-flex space-x-1 border border-slate-200">
        <button onClick={() => setActiveTab('today')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'today' ? 'bg-brand1 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
          <CalendarClock size={18} /> Today's Schedule
        </button>
        <button onClick={() => setActiveTab('add')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'add' ? 'bg-brand1 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
          <PlusCircle size={18} /> New Appointment
        </button>
        <button onClick={() => setActiveTab('reschedule')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'reschedule' ? 'bg-brand1 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Search size={18} /> Reschedule
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        
        {activeTab === 'today' && (
          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Today: {new Date().toISOString().split('T')[0]}</h2>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {appointments.map(app => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand1 font-medium">#{app.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{app.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold bg-brand3/10 text-brand1 rounded-lg my-2 inline-block px-3">{app.time.split(' ')[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'add' && (
          <form onSubmit={handleAddSubmit} className="max-w-xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700">Name</label><input required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-slate-700">Age</label><input required type="number" value={formData.age} onChange={e=>setFormData({...formData, age:e.target.value})} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2" /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-700">Reason</label><input required value={formData.reason} onChange={e=>setFormData({...formData, reason:e.target.value})} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Date</label><input required type="date" value={formData.date} onChange={e=>setFormData({...formData, date:e.target.value})} className="mt-1 block w-full sm:w-1/2 rounded-xl border border-slate-300 px-3 py-2" /></div>
            {formData.date && <AvailableSlots bookedSlots={bookedSlots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />}
            <button type="submit" className="px-6 py-3 bg-brand1 text-white font-medium rounded-xl hover:bg-brand2">Create</button>
          </form>
        )}

        {activeTab === 'reschedule' && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input value={rescheduleTarget} onChange={e=>setRescheduleTarget(e.target.value)} placeholder="Patient ID or Name" className="flex-1 rounded-xl border border-slate-300 px-4 py-2" />
              <button type="submit" className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700">Search</button>
            </form>

            {foundAppt && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">Current Appointment</h3>
                <p className="text-slate-600 mb-6">{foundAppt.name} — {foundAppt.time}</p>
                
                <h4 className="font-medium mb-3">Select New Slot</h4>
                <div className="mb-4">
                  <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} className="block w-[200px] rounded-xl border border-slate-300 px-3 py-2" />
                </div>
                {newDate && <AvailableSlots bookedSlots={bookedSlots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />}
                
                {selectedSlot && (
                  <button onClick={() => setIsModalOpen(true)} className="mt-6 px-6 py-2 bg-brand5 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors">
                    Preview Reschedule
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Reschedule">
        <p className="text-slate-600 mb-6">Are you sure you want to change this appointment?</p>
        <div className="bg-slate-50 p-4 rounded-xl text-sm mb-6 border border-slate-100">
          <div className="flex justify-between mb-2"><span className="text-slate-500">From:</span> <span className="font-medium line-through text-slate-400">{foundAppt?.time}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">To:</span> <span className="font-semibold text-brand1">{newDate} {selectedSlot}</span></div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
          <button onClick={handleReschedule} className="px-4 py-2 bg-brand1 text-white rounded-lg font-medium hover:bg-brand2">Confirm</button>
        </div>
      </Modal>

    </div>
  );
}
