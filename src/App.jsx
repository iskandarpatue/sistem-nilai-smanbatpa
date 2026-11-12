import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Input, Button } from './components/ui/SharedUI';
import { User, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase';

import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Username dan Password wajib diisi!');
      setIsLoggingIn(false); return;
    }

    if (cleanUsername === 'ISKANDAR' && cleanPassword === 'admin1190') {
      setUserData({ nama: 'Administrator', username: 'ISKANDAR' });
      setIsLoggedIn(true); setUserRole('admin'); setIsLoggingIn(false); return;
    } 

    const { data: guruData } = await supabase.from('guru').select('*').eq('username', cleanUsername).eq('password', cleanPassword).single();
    if (guruData) {
      setUserData(guruData);
      setIsLoggedIn(true); setUserRole('teacher'); setIsLoggingIn(false); return;
    }

    const { data: muridData } = await supabase.from('murid').select('*').eq('nisn', cleanUsername).single();
    if (muridData && cleanPassword === 'siswa123') {
      setUserData(muridData);
      setIsLoggedIn(true); setUserRole('student'); setIsLoggingIn(false); return;
    }

    setError('Kredensial tidak valid. Silakan coba lagi.');
    setIsLoggingIn(false);
  };

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] p-4 relative overflow-hidden font-sans">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse duration-10000"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse duration-7000 delay-1000"></div>
            <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[90px]"></div>
          </div>

          <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative z-10">
            
            <div className="w-full md:w-5/12 p-10 flex flex-col justify-between relative bg-gradient-to-br from-blue-600/20 to-purple-600/10 border-b md:border-b-0 md:border-r border-white/10">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  {/* UPDATE PNG DI SINI */}
                  <img 
                    src="/logo-sekolah.png" 
                    alt="Logo SMAN 1 Batudaa Pantai" 
                    className="h-16 w-16 object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">SMAN 1</h2>
                  <p className="text-xs text-blue-300 font-bold tracking-widest uppercase mt-0.5">Batudaa Pantai</p>
                </div>
              </div>

              <div className="relative z-10 my-12 md:my-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-tight mb-4">
                  Sistem Perekapan<br/>Nilai Digital
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                  Portal terintegrasi Kurikulum Merdeka. Kelola Tujuan Pembelajaran, input nilai formatif, dan pantau progres siswa secara real-time.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-2 text-xs text-gray-500">
                <Sparkles size={14} className="text-purple-400" />
                <span>Pembelajaran Mendalam & Transparan</span>
              </div>
            </div>

            <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-gray-950/40 relative">
              <div className="max-w-sm w-full mx-auto">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Selamat Datang Kembali</h3>
                  <p className="text-gray-400 text-sm">Silakan masuk menggunakan kredensial Anda.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-1.5">
                    <Input 
                      label="Username / NISN" 
                      placeholder="Masukkan ID Anda..." 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      className="bg-white/95 text-gray-900 placeholder-gray-400 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Input 
                      label="Password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="bg-white/95 text-gray-900 placeholder-gray-400 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all duration-300 transform hover:-translate-y-1 rounded-xl text-base" disabled={isLoggingIn}>
                    <span className="flex items-center justify-center gap-2 font-bold tracking-wide">
                      {isLoggingIn ? 'Mengautentikasi...' : <><User size={18}/> Masuk ke Sistem</>}
                    </span>
                  </Button>
                </form>

                <div className="mt-12 text-center border-t border-white/5 pt-6">
                  <p className="text-[11px] text-gray-500 tracking-wider">
                    DEVELOPED BY<br/>
                    <span className="text-gray-300 font-semibold mt-1 inline-block">By. Pk Guru Iskandar-TimItSmanbatPan & Gemini AI</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {userRole === 'admin' && <AdminDashboard onLogout={() => setIsLoggedIn(false)} />}
      {userRole === 'teacher' && <TeacherDashboard userData={userData} onLogout={() => setIsLoggedIn(false)} />}
      {userRole === 'student' && <StudentDashboard userData={userData} onLogout={() => setIsLoggedIn(false)} />}
    </ThemeProvider>
  );
}