import { Outlet, useNavigate } from 'react-router-dom';
import { Activity, LogOut, User } from 'lucide-react';

export default function Layout({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand1 p-2 rounded-lg text-white">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">MedPro Care</span>
            </div>
            {currentUser && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
                  <User size={16} />
                  <span className="capitalize">{currentUser.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium text-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
