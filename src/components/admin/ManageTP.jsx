import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, BookOpen, Download, UploadCloud } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Input, Button, Modal } from '../ui/SharedUI';
import { supabase } from '../../lib/supabase';

export default function ManageTP() {
  const { currentTheme } = useTheme();
  const fileInputRef = useRef(null);
  const [tps, setTps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ kode_tp: '', deskripsi: '', mapel: '', kelas: '' });

  useEffect(() => { fetchTPs(); }, []);
  const fetchTPs = async () => {
    const { data } = await supabase.from('tujuan_pembelajaran').select('*').order('created_at', { ascending: false });
    setTps(data || []);
  };

  const handleOpenModal = (data = null) => {
    if (data) { setEditingId(data.id); setFormData(data); } 
    else { setEditingId(null); setFormData({ kode_tp: '', deskripsi: '', mapel: '', kelas: '' }); }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) await supabase.from('tujuan_pembelajaran').update(formData).eq('id', editingId);
    else await supabase.from('tujuan_pembelajaran').insert([formData]);
    setIsModalOpen(false); fetchTPs();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus TP ini?')) { await supabase.from('tujuan_pembelajaran').delete().eq('id', id); fetchTPs(); }
  };

  // FITUR TEMPLATE & UPLOAD
  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Kode TP,Kelas,Mata Pelajaran,Deskripsi Capaian Pembelajaran\nTP-01,X-1,Fisika,Peserta didik mampu...";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_TP.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) alert(`Simulasi: File ${e.target.files[0].name} siap diproses.`);
  };

  const filteredTPs = tps.filter(t => t.kode_tp.toLowerCase().includes(searchTerm.toLowerCase()) || t.mapel.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen className={`text-${currentTheme.primary}`} /> Master TP</h2>
          <p className="text-gray-400 text-sm mt-1">Kelola daftar TP sekolah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Download} onClick={handleDownloadTemplate}>Template</Button>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button variant="secondary" icon={UploadCloud} onClick={() => fileInputRef.current?.click()}>Upload</Button>
          <Button icon={Plus} onClick={() => handleOpenModal()}>Tambah</Button>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
            <tr><th className="px-6 py-4">Kode TP</th><th className="px-6 py-4">Mapel & Kelas</th><th className="px-6 py-4">Deskripsi</th><th className="px-6 py-4">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredTPs.map((tp) => (
              <tr key={tp.id}>
                <td className="px-6 py-4 font-bold text-white">{tp.kode_tp}</td>
                <td className="px-6 py-4">{tp.mapel} ({tp.kelas})</td>
                <td className="px-6 py-4">{tp.deskripsi}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleOpenModal(tp)} className="p-2 hover:text-white"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(tp.id)} className="p-2 text-red-400"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit TP" : "Tambah TP"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><Input label="Kode TP" required value={formData.kode_tp} onChange={e => setFormData({...formData, kode_tp: e.target.value})} /><Input label="Kelas" required value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} /></div>
          <Input label="Mata Pelajaran" required value={formData.mapel} onChange={e => setFormData({...formData, mapel: e.target.value})} />
          <textarea required value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className="w-full h-32 bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2" placeholder="Deskripsi..."/>
          <div className="flex justify-end"><Button type="submit">Simpan</Button></div>
        </form>
      </Modal>
    </div>
  );
}