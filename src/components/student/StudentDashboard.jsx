import React, { useState, useEffect } from 'react';
import { LogOut, CheckCircle2, BookOpen, Search, Target } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button, Select } from '../ui/SharedUI';
import { supabase } from '../../lib/supabase'; 

export default function StudentDashboard({ userData, onLogout }) {
  const { currentTheme } = useTheme();
  
  const [mapelOptions, setMapelOptions] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
  const [evaluasi, setEvaluasi] = useState({ formatif: [], sumatif: [] });
  const [isLoading, setIsLoading] = useState(false);

  const kktpSekolah = 75; // Standar Kelulusan Minimum

  useEffect(() => {
    if (userData?.kelas) {
      fetchMapelOptions();
    }
  }, [userData]);

  const fetchMapelOptions = async () => {
    const { data, error } = await supabase
      .from('tujuan_pembelajaran')
      .select('mapel')
      .eq('kelas', userData.kelas);
    
    if (data) {
      const uniqueMapels = [...new Set(data.map(item => item.mapel))]; 
      setMapelOptions(uniqueMapels);
      if (uniqueMapels.length > 0) {
        setSelectedMapel(uniqueMapels[0]);
      }
    }
  };

  useEffect(() => {
    if (selectedMapel && userData?.nisn) {
      fetchNilai();
    }
  }, [selectedMapel]);

  const fetchNilai = async () => {
    setIsLoading(true);
    
    const { data: tps } = await supabase.from('tujuan_pembelajaran')
      .select('*').eq('kelas', userData.kelas).eq('mapel', selectedMapel);
      
    const { data: nilais } = await supabase.from('nilai')
      .select('*').eq('nisn', userData.nisn).eq('mapel', selectedMapel);

    const hasilFormatif = [];
    const hasilSumatif = [];

    (tps || []).forEach(tp => {
      const record = (nilais || []).find(n => n.tp_id === tp.id);
      
      if (!record) {
         hasilFormatif.push({ id: tp.id, tp: tp.kode_tp + ': ' + tp.deskripsi, status: "Belum Dinilai Guru", type: "warning" });
         hasilSumatif.push({ id: tp.id, tp: tp.kode_tp, nilai: '-', status: "Belum Ada Nilai", type: "warning" });
      } else {
         // --- Evaluasi Formatif (Tampilkan Semua TP) ---
         const fArr = record.formatif || [];
         const jumlahTugas = fArr.length;
         const tugasKosong = fArr.filter(val => val === '' || val === null).length;

         if (jumlahTugas === 0 || tugasKosong === jumlahTugas) {
             hasilFormatif.push({ id: tp.id, tp: tp.kode_tp + ': ' + tp.deskripsi, status: "Seluruh Tugas Kosong", type: "danger" });
         } else if (tugasKosong > 0) {
             hasilFormatif.push({ id: tp.id, tp: tp.kode_tp + ': ' + tp.deskripsi, status: `Kurang ${tugasKosong} Tugas`, type: "warning" });
         } else {
             const sum = fArr.reduce((acc, val) => acc + Number(val), 0);
             const avg = sum / jumlahTugas;
             if (avg < kktpSekolah) {
                 hasilFormatif.push({ id: tp.id, tp: tp.kode_tp + ': ' + tp.deskripsi, status: `Remedial (Skor: ${avg.toFixed(1)})`, type: "danger" });
             } else {
                 hasilFormatif.push({ id: tp.id, tp: tp.kode_tp + ': ' + tp.deskripsi, status: `Tuntas (Skor: ${avg.toFixed(1)})`, type: "success" });
             }
         }

         // --- Evaluasi Sumatif (Tampilkan Semua TP) ---
         if (record.sumatif === null || record.sumatif === 0 || record.sumatif === '') {
             hasilSumatif.push({ id: tp.id, tp: tp.kode_tp, nilai: '-', status: "Belum Ujian", type: "warning" });
         } else if (record.sumatif < kktpSekolah) {
             hasilSumatif.push({ id: tp.id, tp: tp.kode_tp, nilai: record.sumatif, status: "Wajib Remedial", type: "danger" });
         } else {
             hasilSumatif.push({ id: tp.id, tp: tp.kode_tp, nilai: record.sumatif, status: "Tuntas", type: "success" });
         }
      }
    });

    setEvaluasi({ formatif: hasilFormatif, sumatif: hasilSumatif });
    setIsLoading(false);
  };

  // Fungsi pembantu warna
  const getColorClasses = (type) => {
    if (type === 'success') return 'border-l-green-500 bg-gray-950';
    if (type === 'warning') return 'border-l-orange-500 bg-gray-950';
    if (type === 'danger') return 'border-l-red-500 bg-gray-950';
    return 'border-l-gray-500 bg-gray-950';
  };

  const getBadgeClasses = (type) => {
    if (type === 'success') return 'bg-green-500/10 border-green-500/20 text-green-400';
    if (type === 'warning') return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    if (type === 'danger') return 'bg-red-500/10 border-red-500/20 text-red-400';
    return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 text-white font-sans selection:bg-gray-800">
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        <div className={`p-6 rounded-3xl bg-${currentTheme.bg} border border-${currentTheme.border} relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div className={`absolute top-0 right-0 w-64 h-64 bg-${currentTheme.primary} rounded-full mix-blend-multiply filter blur-3xl opacity-10`}></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Halo, {userData?.nama}</h1>
            <p className={`text-${currentTheme.primary} font-medium`}>NISN: {userData?.nisn} | Kelas: {userData?.kelas}</p>
          </div>
          <Button variant="danger" icon={LogOut} onClick={onLogout} className="relative z-10">Keluar</Button>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
          <Search className="text-gray-500 hidden md:block ml-2" size={24} />
          <div className="w-full md:w-1/2">
             <Select 
               options={mapelOptions} 
               value={selectedMapel} 
               onChange={e => setSelectedMapel(e.target.value)} 
             />
          </div>
          <p className="text-sm text-gray-400 w-full md:w-auto">
            Silakan pilih mata pelajaran untuk memantau status ketuntasan nilai Anda.
          </p>
        </div>

        {isLoading ? (
           <div className="text-center py-12 text-gray-400">Sedang menarik data dari database sekolah...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Panel Formatif */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-6 border-b border-gray-800 pb-4">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Target size={24} /></div>
                <h2 className="text-xl font-bold">Status Nilai Formatif</h2>
              </div>
              
              {evaluasi.formatif.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Belum ada Tujuan Pembelajaran yang diinput oleh Guru.</div>
              ) : (
                <div className="space-y-4">
                  {evaluasi.formatif.map((item, idx) => (
                    <div key={idx} className={`p-4 border border-gray-800 rounded-xl border-l-4 ${getColorClasses(item.type)}`}>
                      <p className="text-xs text-gray-400 font-bold mb-1">{selectedMapel}</p>
                      <p className="text-sm font-medium text-gray-200 mb-2">{item.tp}</p>
                      <span className={`text-xs px-2 py-1 border rounded-md font-semibold ${getBadgeClasses(item.type)}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Sumatif */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-6 border-b border-gray-800 pb-4">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><BookOpen size={24} /></div>
                <h2 className="text-xl font-bold">Status Nilai Sumatif</h2>
              </div>

              {evaluasi.sumatif.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Belum ada Tujuan Pembelajaran yang diinput oleh Guru.</div>
              ) : (
                <div className="space-y-4">
                  {evaluasi.sumatif.map((item, idx) => (
                    <div key={idx} className={`p-4 border border-gray-800 rounded-xl border-l-4 flex justify-between items-center ${getColorClasses(item.type)}`}>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedMapel} ({item.tp})</p>
                        <p className="text-xs text-gray-400">KKTP: {kktpSekolah}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{item.nilai}</p>
                        <span className={`text-[10px] px-2 py-1 border rounded-md font-semibold ${getBadgeClasses(item.type)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}