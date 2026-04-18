import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserSquare2, ArrowRight, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import Spinner from '../components/common/Spinner';

export default function Home({ onLogin, currentUser }) {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({ username: '', password: '', identifier: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  if (currentUser) {
    navigate(`/${currentUser.role}`);
    return null;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let res;
      if (role === 'admin') {
        res = await authAPI.loginAdmin({ username: formData.username, password: formData.password });
        onLogin({ role: 'admin', data: res.data });
        navigate('/admin');
        toast.success('Welcome back, Admin!');
      } else if (role === 'receptionist') {
        res = await authAPI.loginReceptionist({ username: formData.username, password: formData.password });
        onLogin({ role: 'receptionist', data: res.data });
        navigate('/receptionist');
        toast.success('Welcome back, Receptionist!');
      } else {
        res = await authAPI.loginPatient({ idOrName: formData.identifier });
        onLogin({ role: 'patient', data: res.data });
        navigate('/patient');
        toast.success('Welcome back!');
      }
    } catch (error) {
      console.error(error);
      const isNetworkError = error.message === 'Network Error';
      if (isNetworkError) {
        toast.error('Cannot connect to server. Using mock mode.');
        // MOCK LOGIN
        onLogin({ role, data: { name: formData.username || formData.identifier || 'Test User', id: 1 } });
        navigate(`/${role}`);
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand3/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand2/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-brand1 mb-4 animate-bounce">
          <HeartPulse size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          MedPro Care System
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          Sign in to manage appointments & patient care
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setRole('patient')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${role === 'patient' ? 'bg-white text-brand1 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserSquare2 size={16} /> Patient
            </button>
            <button
              onClick={() => setRole('receptionist')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${role === 'receptionist' ? 'bg-white text-brand1 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users size={16} /> Reception
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${role === 'admin' ? 'bg-white text-brand1 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Shield size={16} /> Admin
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {(role === 'admin' || role === 'receptionist') ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Username</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand1 focus:border-brand1 sm:text-sm transition-shadow bg-slate-50/50"
                      placeholder="Enter username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand1 focus:border-brand1 sm:text-sm transition-shadow bg-slate-50/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700">Patient ID or Name</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                    className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand1 focus:border-brand1 sm:text-sm transition-shadow bg-slate-50/50"
                    placeholder="e.g. 1024 or John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm leading-5 text-sm font-semibold text-white bg-brand1 hover:bg-brand2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand1 transition-colors disabled:opacity-70 group"
              >
                {isLoading ? <Spinner className="text-white border-white border-t-transparent" /> : (
                  <div className="flex items-center gap-2">
                    Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
