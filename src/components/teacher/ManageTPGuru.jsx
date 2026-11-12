import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Download, UploadCloud, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Input, Button, Modal, Select } from '../ui/SharedUI';
import { supabase } from '../../lib/supabase'; 

export default function ManageTPGuru({ userData }) {
  const { currentTheme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [tps, setTps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ kode_tp: '', deskripsi: '' });

  const kelasOptions = userData?.kelas ? userData.kelas.split(',').map(k => k.trim()) : [];
  const mapelOptions = userData?.mapel ? userData.mapel.split(',').map(m => m.trim()) : [];

  useEffect(() => {
    if (selectedKelas && selectedMapel) {
      fetchTPs();
    } else {
      setTps([]); 
    }
  }, [selectedKelas, selectedMapel]);

  const fetchTPs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tujuan_pembelajaran')
      .select('*')
      .eq('kelas', selectedKelas)
      .eq('mapel', selectedMapel)
      .order('created_at', { ascending: false });
      
    if (error) console.error("Error fetching TP:", error);
    else setTps(data || []);
    setIsLoading(false);
  };

  const handleOpenModal = (data = null) => {
    if (!selectedKelas || !selectedMapel) {
      alert("Silakan pilih Kelas dan Mata Pelajaran terlebih dahulu!"); return;
    }
    if (data) {
      setEditingId(data.id); setFormData({ kode_tp: data.kode_tp, deskripsi: data.deskripsi });
    } else {
      setEditingId(null); setFormData({ kode_tp: '', deskripsi: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const dataToSave = {
      kode_tp: formData.kode_tp,
      deskripsi: formData.deskripsi,
      kelas: selectedKelas,
      mapel: selectedMapel
    };

    if (editingId) {
      const { error } = await supabase.from('tujuan_pembelajaran').update(dataToSave).eq('id', editingId);
      if (error) alert("Gagal mengupdate: " + error.message);
    } else {
      const { error } = await supabase.from('tujuan_pembelajaran').insert([dataToSave]);
      if (error) alert("Gagal menyimpan: " + error.message);
    }
    setIsModalOpen(false);
    fetchTPs(); 
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus TP ini?')) {
      const { error } = await supabase.from('tujuan_pembelajaran').delete().eq('id', id);
      if (error) alert("Gagal menghapus: " + error.message);
      else fetchTPs();
    }
  };

  // FITUR DOWNLOAD TEMPLATE KHUSUS GURU
  const handleDownloadTemplate = () => {
    if (!selectedKelas || !selectedMapel) {
      alert("Silakan pilih Kelas dan Mata Pelajaran terlebih dahulu sebelum mengunduh template!");
      return;
    }
    // Guru hanya perlu mengisi Kode dan Deskripsi (karena kelas dan mapel sudah otomatis dari filter)
    const csvContent = "data:text/csv;charset=utf-8,Kode TP,Deskripsi Capaian Pembelajaran\nTP-01,Peserta didik mampu memahami konsep besaran dan satuan...";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Template_TP_${selectedMapel}_${selectedKelas}.csv`);
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  };

  const handleUploadClick = () => { 
    if (!selectedKelas || !selectedMapel) alert("Pilih Kelas dan Mapel terlebih dahulu!"); 
    else fileInputRef.current?.click(); 
  };
  
  const handleFileUpload = (e) => { 
    if (e.target.files[0]) alert(`Simulasi: File ${e.target.files[0].name} siap diproses.`); 
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* HEADER BANNER - Desain Gradasi Cerah yang Mewah */}
      <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-blue-900/80 via-purple-900/60 to-gray-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full mix-blend-screen filter blur-[60px] opacity-20"></div>
        
        <div className="relative z-10 flex items-center gap-5 w-full">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
            <BookOpen className="text-blue-300" size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 tracking-wide mb-1 flex items-center gap-2">
              Susun Tujuan Pembelajaran <Sparkles className="text-yellow-400" size={20}/>
            </h2>
            <p className="text-blue-200/80 text-sm font-medium">Rancang kurikulum mata pelajaran Anda dengan lebih interaktif dan terstruktur.</p>
          </div>
        </div>
      </div>

      {/* FILTER & KONTROL - Desain Glassmorphism */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row gap-5 items-end relative z-10">
        <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
          <div className="w-full">
            <Select label="Pilih Kelas" options={kelasOptions} value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} />
          </div>
          <div className="w-full">
            <Select label="Pilih Mata Pelajaran" options={mapelOptions} value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} />
          </div>
        </div>
        
        {/* Tombol Aksi yang lebih modern */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button variant="secondary" icon={Download} onClick={handleDownloadTemplate} className="bg-gray-800/50 hover:bg-gray-700 border-white/10 text-gray-200">
            Template
          </Button>
          <input type="file" accept=".csv, .xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button variant="secondary" icon={UploadCloud} onClick={handleUploadClick} className="bg-gray-800/50 hover:bg-gray-700 border-white/10 text-gray-200">
            Upload TP
          </Button>
          <Button icon={Plus} onClick={() => handleOpenModal()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none shadow-lg shadow-blue-500/30">
            Tambah TP Manual
          </Button>
        </div>
      </div>

      {/* TABEL DATA - Estetika Terang di atas Gelap */}
      <div className="bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-5 text-blue-200 font-semibold uppercase tracking-wider text-xs">Kode TP</th>
                <th className="px-6 py-5 text-blue-200 font-semibold uppercase tracking-wider text-xs">Deskripsi Capaian Pembelajaran</th>
                <th className="px-6 py-5 text-blue-200 font-semibold uppercase tracking-wider text-xs text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-400 font-medium animate-pulse">Memuat data Tujuan Pembelajaran...</td></tr>
              ) : tps.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center opacity-60">
                      <BookOpen size={48} className="mb-4 text-gray-500" />
                      <p className="text-gray-400 text-lg">
                        {!selectedKelas || !selectedMapel ? 'Pilih Kelas dan Mapel di atas terlebih dahulu.' : 'Belum ada data TP. Silakan unduh template atau tambah manual.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tps.map((tp) => (
                  <tr key={tp.id} className="hover:bg-white/5 transition-all duration-300 group">
                    <td className="px-6 py-5 font-bold text-white group-hover:text-blue-300 transition-colors w-32 align-top">{tp.kode_tp}</td>
                    <td className="px-6 py-5 text-gray-300 leading-relaxed">{tp.deskripsi}</td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center justify-center space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(tp)} className="p-2.5 text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/30 rounded-xl transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(tp.id)} className="p-2.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit TP" : "Tambah TP Baru"}>
        <form onSubmit={handleSave} className="space-y-5 mt-2">
          <Input label="Kode TP" required value={formData.kode_tp} onChange={e => setFormData({...formData, kode_tp: e.target.value})} placeholder="Contoh: TP-01" className="bg-gray-900/50" />
          <div className="space-y-1.5 w-full">
            <label className="text-sm font-semibold text-gray-300">Deskripsi Capaian Pembelajaran</label>
            <textarea
              required value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})}
              className="w-full h-32 bg-gray-900/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Peserta didik mampu..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800/50 mt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="bg-transparent">Batal</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">{editingId ? 'Simpan Perubahan' : 'Simpan TP'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}