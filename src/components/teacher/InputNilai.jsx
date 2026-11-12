import React, { useState, useEffect } from 'react';
import { Edit3, Download, UploadCloud, FileSpreadsheet, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button, Select, Input, Modal } from '../ui/SharedUI';
import { supabase } from '../../lib/supabase'; // Import koneksi Supabase

export default function InputNilai({ userData }) {
  const { currentTheme } = useTheme();
  
  // Opsi Dropdown dari Profil Guru
  const kelasOptions = userData?.kelas ? userData.kelas.split(',').map(k => k.trim()) : [];
  const mapelOptions = userData?.mapel ? userData.mapel.split(',').map(m => m.trim()) : [];

  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [bobotSumatif, setBobotSumatif] = useState(60);
  const [bobotAsas, setBobotAsas] = useState(40);

  // Data dari Supabase
  const [muridList, setMuridList] = useState([]);
  const [tps, setTps] = useState([]);
  const [existingNilai, setExistingNilai] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // State Modal Penilaian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMurid, setActiveMurid] = useState(null);
  const [grades, setGrades] = useState({ asas: 0, tps: {} });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Tarik Data Murid, TP, dan Nilai saat Kelas/Mapel dipilih
  useEffect(() => {
    if (selectedKelas && selectedMapel) {
      fetchMasterData();
    } else {
      setMuridList([]); setTps([]); setExistingNilai([]);
    }
  }, [selectedKelas, selectedMapel]);

  const fetchMasterData = async () => {
    setIsLoadingData(true);
    // Tarik Murid sesuai kelas
    const { data: dataMurid } = await supabase.from('murid').select('*').eq('kelas', selectedKelas).order('nama', { ascending: true });
    // Tarik TP sesuai kelas dan mapel
    const { data: dataTp } = await supabase.from('tujuan_pembelajaran').select('*').eq('kelas', selectedKelas).eq('mapel', selectedMapel);
    // Tarik Nilai yang sudah ada untuk mapel ini
    const { data: dataNilai } = await supabase.from('nilai').select('*').eq('mapel', selectedMapel);
    
    setMuridList(dataMurid || []);
    setTps(dataTp || []);
    setExistingNilai(dataNilai || []);
    setIsLoadingData(false);
  };

  // 2. Buka Modal dan Siapkan Form Nilai
  const handleOpenGradeModal = (murid) => {
    setActiveMurid(murid);
    const initialTps = {};
    let nilaiAsasSiswa = '';

    tps.forEach(tp => {
      // Cari apakah nilai untuk TP ini sudah pernah disimpan
      const record = existingNilai.find(n => n.nisn === murid.nisn && n.tp_id === tp.id);
      if (record) {
        initialTps[tp.id] = { formatif: record.formatif || [''], sumatif: record.sumatif || '' };
        nilaiAsasSiswa = record.asas || ''; // Ambil ASAS dari record yang ada
      } else {
        initialTps[tp.id] = { formatif: [''], sumatif: '' }; // Default kosong
      }
    });

    setGrades({ asas: nilaiAsasSiswa, tps: initialTps });
    setIsModalOpen(true);
  };

  // 3. Fungsi Tambah/Hapus Kolom Formatif
  const addFormatif = (tpId) => {
    const updated = { ...grades };
    updated.tps[tpId].formatif.push('');
    setGrades(updated);
  };
  
  const removeFormatif = (tpId, index) => {
    const updated = { ...grades };
    updated.tps[tpId].formatif.splice(index, 1);
    setGrades(updated);
  };

  // 4. Update Angka di Kolom Input
  const handleGradeChange = (tpId, type, index, value) => {
    const updated = { ...grades };
    if (type === 'formatif') updated.tps[tpId].formatif[index] = value;
    else updated.tps[tpId].sumatif = value;
    setGrades(updated);
  };

  // 5. Simpan Data ke Database Supabase
  const handleSaveNilai = async () => {
    setIsSaving(true);
    for (const tp of tps) {
      const tpGrades = grades.tps[tp.id];
      const recordToSave = {
        nisn: activeMurid.nisn,
        tp_id: tp.id,
        mapel: selectedMapel,
        formatif: tpGrades.formatif,
        sumatif: tpGrades.sumatif === '' ? 0 : Number(tpGrades.sumatif),
        asas: grades.asas === '' ? 0 : Number(grades.asas)
      };

      // Cek apakah data sudah ada (Update) atau belum (Insert)
      const existingRecord = existingNilai.find(n => n.nisn === activeMurid.nisn && n.tp_id === tp.id);
      
      if (existingRecord) {
        await supabase.from('nilai').update(recordToSave).eq('id', existingRecord.id);
      } else {
        await supabase.from('nilai').insert([recordToSave]);
      }
    }
    
    alert(`Data nilai ${activeMurid.nama} berhasil disimpan!`);
    setIsSaving(false);
    setIsModalOpen(false);
    fetchMasterData(); // Refresh data untuk mengupdate status di tabel
  };

  // --- LOGIKA PERHITUNGAN REAL-TIME (TAMPILAN) ---
  const rataSumatif = tps.reduce((acc, tp) => acc + (Number(grades.tps[tp.id]?.sumatif) || 0), 0) / (tps.length || 1);
  const nilaiAsas = Number(grades.asas) || 0;
  const nilaiAkhir = ((rataSumatif * (bobotSumatif/100)) + (nilaiAsas * (bobotAsas/100))).toFixed(1);
  const isTuntas = nilaiAkhir >= 75; // Asumsi KKTP sekolah 75

  const generateDeskripsi = () => {
    if(tps.length === 0) return <li className="text-sm text-gray-500">Belum ada TP untuk mapel ini.</li>;
    return tps.map(tp => {
      const formatives = grades.tps[tp.id]?.formatif.map(Number).filter(n => n > 0) || [];
      const rataFormatif = formatives.length ? formatives.reduce((a, b) => a + b, 0) / formatives.length : 0;
      let statusDesc = rataFormatif >= 75 ? "Menunjukkan penguasaan yang sangat baik dalam " : "Perlu bimbingan lebih lanjut dalam hal ";
      return (
        <li key={tp.id} className="text-sm text-gray-300 mb-1">
          <span className="font-bold text-white">{tp.kode_tp}:</span> {statusDesc} {tp.deskripsi.toLowerCase()}.
        </li>
      );
    });
  };

  // Cek Status Pengisian Siswa
  const checkStatus = (nisn) => {
    const isGraded = existingNilai.some(n => n.nisn === nisn);
    if (isGraded) return <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Sudah Dinilai</span>;
    return <span className="px-3 py-1 text-xs rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Belum Dinilai</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit3 className={`text-${currentTheme.primary}`} /> Input & Rekapitulasi Nilai
          </h2>
          <p className="text-gray-400 text-sm mt-1">Pembelajaran Mendalam Berbasis Kurikulum Merdeka.</p>
        </div>
      </div>

      <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select label="Pilih Kelas" options={kelasOptions} value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} />
          <Select label="Pilih Mata Pelajaran" options={mapelOptions} value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} />
          <Input label="Bobot Sumatif (%)" type="number" value={bobotSumatif} onChange={e => setBobotSumatif(e.target.value)} />
          <Input label="Bobot ASAS (%)" type="number" value={bobotAsas} onChange={e => setBobotAsas(e.target.value)} />
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-950 text-gray-400 uppercase font-semibold border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 w-24">NISN</th>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4 text-center">Status Data</th>
              <th className="px-6 py-4 text-center">Aksi Penilaian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(!selectedKelas || !selectedMapel) ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Pilih kelas dan mapel terlebih dahulu.</td></tr>
            ) : isLoadingData ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Memuat data murid dan nilai...</td></tr>
            ) : muridList.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Belum ada murid di kelas ini.</td></tr>
            ) : (
              muridList.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/30 text-white">
                  <td className="px-6 py-4 font-mono text-gray-400">{m.nisn}</td>
                  <td className="px-6 py-4 font-medium">{m.nama}</td>
                  <td className="px-6 py-4 text-center">{checkStatus(m.nisn)}</td>
                  <td className="px-6 py-4 text-center">
                    <Button onClick={() => handleOpenGradeModal(m)} className="mx-auto text-xs py-1.5 px-3">Input Nilai</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Input Nilai Spesifik Siswa */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Penilaian: ${activeMurid?.nama}`}>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {tps.length === 0 ? (
            <div className="text-center py-6 text-gray-400 border border-gray-800 rounded-xl bg-gray-900">
              Belum ada Tujuan Pembelajaran. Silakan buat TP terlebih dahulu di menu "Tujuan Pembelajaran".
            </div>
          ) : (
            tps.map((tp) => (
              <div key={tp.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-white">{tp.kode_tp}</h4>
                  <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => addFormatif(tp.id)} icon={Plus}>Formatif</Button>
                </div>
                <p className="text-xs text-gray-400 mb-4">{tp.deskripsi}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900 p-3 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400">Nilai Formatif</label>
                    <div className="flex flex-wrap gap-2">
                      {grades.tps[tp.id]?.formatif.map((val, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
                          <input type="number" className="w-12 bg-transparent text-white text-center text-sm focus:outline-none" placeholder={`F${idx+1}`} value={val} onChange={(e) => handleGradeChange(tp.id, 'formatif', idx, e.target.value)} />
                          {idx > 0 && <button onClick={() => removeFormatif(tp.id, idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1">Nilai Sumatif Akhir TP</label>
                    <input type="number" className={`w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-${currentTheme.primary} focus:outline-none`} placeholder="Nilai Sumatif" value={grades.tps[tp.id]?.sumatif || ''} onChange={(e) => handleGradeChange(tp.id, 'sumatif', null, e.target.value)} />
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch border-t border-gray-800 pt-6">
            <div className="space-y-4">
              <Input label="Nilai ASAS / ASAT" type="number" placeholder="Masukkan nilai ujian akhir..." value={grades.asas} onChange={e => setGrades({...grades, asas: e.target.value})} className="text-xl" />
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <p className="text-sm font-semibold text-gray-400 mb-2">Deskripsi Capaian per TP:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {generateDeskripsi()}
                </ul>
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${isTuntas ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} backdrop-blur-sm relative overflow-hidden`}>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Nilai Akhir Rapor</p>
              <h1 className={`text-6xl font-black mb-4 ${isTuntas ? 'text-green-400' : 'text-red-400'} drop-shadow-2xl`}>
                {isNaN(nilaiAkhir) ? '0' : nilaiAkhir}
              </h1>
              
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${isTuntas ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-red-500/20 border-red-500/50 text-red-300'}`}>
                {isTuntas ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="font-bold">{isTuntas ? 'TUNTAS' : 'TIDAK TUNTAS'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800 mt-4">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
          <Button onClick={handleSaveNilai} disabled={isSaving || tps.length === 0}>
            {isSaving ? 'Menyimpan...' : 'Simpan Nilai Ke Database'}
          </Button>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
      `}} />
    </div>
  );
}