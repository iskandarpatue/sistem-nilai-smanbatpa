import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, Download, UploadCloud } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Input, Button, Modal } from '../ui/SharedUI';
import { supabase } from '../../lib/supabase';

export default function ManageGuru() {
  const { currentTheme } = useTheme();
  const fileInputRef = useRef(null);
  const [gurus, setGurus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ nama: '', username: '', password: '', mapel: '', kelas: '' });

  useEffect(() => { fetchGurus(); }, []);

  const fetchGurus = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('guru').select('*').order('created_at', { ascending: false });
    setGurus(data || []);
    setIsLoading(false);
  };

  const handleOpenModal = (guru = null) => {
    if (guru) {
      setEditingId(guru.id); setFormData({ nama: guru.nama, username: guru.username, password: guru.password, mapel: guru.mapel, kelas: guru.kelas });
    } else {
      setEditingId(null); setFormData({ nama: '', username: '', password: '', mapel: '', kelas: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('guru').update(formData).eq('id', editingId);
    } else {
      await supabase.from('guru').insert([formData]);
    }
    setIsModalOpen(false); fetchGurus();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data guru ini?')) {
      await supabase.from('guru').delete().eq('id', id); fetchGurus();
    }
  };

  // FITUR TEMPLATE & UPLOAD
  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,Username,Password,Mata Pelajaran,Kelas yang Diajar\nBudi Santoso S.Pd,budi123,guru123,\"Fisika, Informatika\",\"X-1, X-2\"";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Guru.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) alert(`Simulasi: File ${e.target.files[0].name} siap diproses. (Logika simpan massal menyusul)`);
  };

  const filteredGurus = gurus.filter(g => g.nama.toLowerCase().includes(searchTerm.toLowerCase()) || g.mapel.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className={`text-${currentTheme.primary}`} /> Manajemen Data Guru
          </h2>
          <p className="text-gray-400 text-sm mt-1">Kelola akun, mata pelajaran, dan kelas yang diajar.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" placeholder="Cari guru..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none" />
          </div>
          <Button variant="secondary" icon={Download} onClick={handleDownloadTemplate} title="Unduh Format">Template</Button>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button variant="secondary" icon={UploadCloud} onClick={() => fileInputRef.current?.click()}>Upload</Button>
          <Button icon={Plus} onClick={() => handleOpenModal()}>Tambah</Button>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Akun (Username)</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Kelas Diajar</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Memuat data...</td></tr> : filteredGurus.map((guru) => (
                <tr key={guru.id} className="hover:bg-gray-800/30 text-gray-300">
                  <td className="px-6 py-4 font-medium text-white">{guru.nama}</td>
                  <td className="px-6 py-4">{guru.username}</td>
                  <td className="px-6 py-4">{guru.mapel}</td>
                  <td className="px-6 py-4">{guru.kelas}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleOpenModal(guru)} className="p-2 text-gray-400 hover:text-white"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(guru.id)} className="p-2 text-red-400 hover:text-white"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Guru" : "Tambah Guru"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nama Lengkap" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <Input label="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <Input label="Mata Pelajaran (Pisahkan koma)" required value={formData.mapel} onChange={e => setFormData({...formData, mapel: e.target.value})} />
          <Input label="Kelas yang Diajar (Pisahkan koma)" required value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} />
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800"><Button type="submit">Simpan</Button></div>
        </form>
      </Modal>
    </div>
  );
}