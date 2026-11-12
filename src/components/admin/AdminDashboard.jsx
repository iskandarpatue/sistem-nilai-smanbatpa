import React, { useState } from 'react';
import { Users, BookOpen, GraduationCap, BarChart3, LogOut, LayoutDashboard, Settings, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

import ManageGuru from './ManageGuru';
import ManageTP from './ManageTP';
import ManageMurid from './ManageMurid';
import RekapNilaiAdmin from './RekapNilaiAdmin';

export default function AdminDashboard({ onLogout }) {
  const { currentTheme, themes, setCurrentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'guru', label: 'Manajemen Guru', icon: Users },
    { id: 'tp', label: 'Tujuan Pembelajaran', icon: BookOpen },
    { id: 'murid', label: 'Data Murid', icon: GraduationCap },
    { id: 'rekap', label: 'Rekapitulasi Nilai', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-blue-900/60 via-purple-900/40 to-[#0a0f1c] border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse duration-10000"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[90px] opacity-20"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10 flex-col md:flex-row gap-6 md:gap-0">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm text-blue-200 font-semibold tracking-wider uppercase shadow-lg">
                    <Sparkles size={16} className="text-yellow-400" /> Admin Control
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/5 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {/* UPDATE PNG DI SINI */}
                      <img 
                        src="/logo-sekolah.png" 
                        alt="Logo SMAN 1 Batudaa Pantai" 
                        className="h-14 w-14 object-contain relative z-10 drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div className="group relative">
                      <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img 
                        src="/logo-provinsi.png" 
                        alt="Logo Provinsi Gorontalo" 
                        className="h-12 w-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] relative z-10 transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-4 leading-tight">
                  Selamat Datang,<br/>Administrator!
                </h2>
                <p className="text-blue-100/70 max-w-2xl text-lg leading-relaxed">
                  Kelola master data sekolah, akun guru dan murid, sinkronisasi Tujuan Pembelajaran, serta pantau rekapitulasi nilai secara terpusat.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               <button onClick={() => setActiveTab('guru')} className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-5 text-left group shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                 <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner relative z-10">
                   <Users size={28} />
                 </div>
                 <div className="relative z-10">
                   <p className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Data Guru</p>
                   <p className="text-gray-400 text-xs">Kelola Akun & Mapel</p>
                 </div>
               </button>
               
               <button onClick={() => setActiveTab('murid')} className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-5 text-left group shadow-lg hover:shadow-emerald-500/20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/10 group-hover:to-teal-600/10 transition-all duration-500"></div>
                 <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner relative z-10">
                   <GraduationCap size={28} />
                 </div>
                 <div className="relative z-10">
                   <p className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">Data Murid</p>
                   <p className="text-gray-400 text-xs">Kelola Siswa & Kelas</p>
                 </div>
               </button>

               <button onClick={() => setActiveTab('rekap')} className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-5 text-left group shadow-lg hover:shadow-purple-500/20 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
                 <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-inner relative z-10">
                   <BarChart3 size={28} />
                 </div>
                 <div className="relative z-10">
                   <p className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">Rekap Nilai</p>
                   <p className="text-gray-400 text-xs">Pantau Hasil Sekolah</p>
                 </div>
               </button>
            </div>
          </div>
        );
      case 'guru': return <ManageGuru />;
      case 'tp': return <ManageTP />;
      case 'murid': return <ManageMurid />;
      case 'rekap': return <RekapNilaiAdmin />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#050810] overflow-hidden font-sans text-gray-100">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] relative">
        <div className="p-8 border-b border-gray-100 flex items-center space-x-4 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-xl">SP</span>
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-gray-900 tracking-tight">Panel Admin</h1>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">Super Administrator</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 bg-gray-50/50">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm font-bold' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-blue-600 animate-pulse' : 'text-gray-400'} />
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-100 space-y-4 bg-white">
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 border border-red-100 hover:shadow-md hover:shadow-red-500/10 font-bold text-sm">
            <LogOut size={20} />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-[#050810]">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[30%] w-[40rem] h-[40rem] bg-blue-600/5 rounded-full mix-blend-screen filter blur-[150px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-purple-600/5 rounded-full mix-blend-screen filter blur-[120px]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">{renderContent()}</div>
      </main>
    </div>
  );
}