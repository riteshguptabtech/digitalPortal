import { BellElectric } from 'lucide-react';
import { useApp } from './context/AppContext.jsx';
import Login from './pages/Login.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './App.css';

export default function App() {
  const { currentUser, isBooting } = useApp();

  if (isBooting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
          <BellElectric className="mx-auto h-8 w-8 text-cyan-700" />
          <p className="mt-3 text-sm font-semibold text-slate-700">Connecting to the billing database...</p>
        </div>
      </main>
    );
  }

  if (!currentUser) return <Login />;

  return currentUser.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}
