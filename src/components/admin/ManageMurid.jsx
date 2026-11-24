import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, GraduationCap, UploadCloud, Info, Download, Printer, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Input, Button, Modal, Select } from '../ui/SharedUI';
import { supabase } from '../../lib/supabase'; 

export default function ManageMurid() {
  const { currentTheme } = useTheme();
  const fileInputRef = useRef(null);
  const [murid, setMurid] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nama: '', nisn: '', kelas: '', jenis_kelamin: ''
  });

  useEffect(() => {
    fetchMurid();
  }, []);

  const fetchMurid = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('murid').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error fetching data:", error);
    else setMurid(data || []);
    setIsLoading(false);
  };

  const handleOpenModal = (data = null) => {
    if (data) {
      setEditingId(data.id);
      setFormData({ nama: data.nama, nisn: data.nisn, kelas: data.kelas, jenis_kelamin: data.jenis_kelamin });
    } else {
      setEditingId(null);
      setFormData({ nama: '', nisn: '', kelas: '', jenis_kelamin: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('murid').update(formData).eq('id', editingId);
      if (error) alert("Gagal mengupdate: " + error.message);
    } else {
      const { error } = await supabase.from('murid').insert([formData]);
      if (error) alert("Gagal menyimpan: " + error.message);
    }
    setIsModalOpen(false);
    fetchMurid();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data murid ini?')) {
      const { error } = await supabase.from('murid').delete().eq('id', id);
      if (error) alert("Gagal menghapus: " + error.message);
      else fetchMurid();
    }
  };

  const handleDownloadTemplate = () => {
    const csv = "data:text/csv;charset=utf-8,NISN,Nama Lengkap,Kelas,Jenis Kelamin\n0012345678,Ahmad Siswa,X-1,Laki-laki";
    const link = document.createElement("a"); 
    link.setAttribute("href", encodeURI(csv)); 
    link.setAttribute("download", "Template_Murid.csv"); 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        
        if (rows.length <= 1) {
          alert("File kosong atau hanya berisi judul (header).");
          return;
        }

        const dataToInsert = [];
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(',').map(col => col.trim());
          if (cols.length >= 4) {
            dataToInsert.push({ nisn: cols[0], nama: cols[1], kelas: cols[2], jenis_kelamin: cols[3] });
          }
        }

        if (dataToInsert.length > 0) {
          setIsLoading(true);
          const { error } = await supabase.from('murid').insert(dataToInsert);
          if (error) alert("Gagal menyimpan ke database: " + error.message);
          else { alert(`Sukses! ${dataToInsert.length} data murid ditambahkan.`); fetchMurid(); }
        } else {
          alert("Tidak ada data valid yang bisa dibaca. Pastikan format sesuai template.");
        }
      } catch (error) {
        alert("Terjadi kesalahan saat membaca file.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  // FITUR CETAK KARTU PDF (Layout 10 Kartu per A4)
  const handlePrintKartu = () => {
    if (filteredMurid.length === 0) return alert('Tidak ada data murid untuk dicetak.');
    
    let kartuHTML = '';
    filteredMurid.forEach((m) => {
      kartuHTML += `
        <div class="kartu">
          <div class="header">
            <strong>SMAN 1 BATUDAA PANTAI</strong><br/>
            KARTU LOGIN SISTEM NILAI
          </div>
          <div class="content">
            <table>
              <tr><td width="70">Nama</td><td width="10">:</td><td><strong>${m.nama}</strong></td></tr>
              <tr><td>Kelas</td><td>:</td><td>${m.kelas}</td></tr>
              <tr><td>Username</td><td>:</td><td><strong>${m.nisn}</strong></td></tr>
              <tr><td>Password</td><td>:</td><td><strong>siswa123</strong></td></tr>
            </table>
          </div>
        </div>
      `;
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Kartu Login</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 12px; margin: 0; padding: 0; }
            .container { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; }
            .kartu { width: 48%; border: 2px solid #000; border-radius: 8px; margin-bottom: 15px; box-sizing: border-box; overflow: hidden; page-break-inside: avoid; }
            .header { text-align: center; background-color: #f0f0f0; padding: 8px; border-bottom: 2px solid #000; font-size: 14px; }
            .content { padding: 10px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 4px 0; vertical-align: top; }
          </style>
        </head>
        <body>
          <div class="container">${kartuHTML}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // FITUR EXPORT KARTU KE MICROSOFT WORD
  const handleExportWord = () => {
    if (filteredMurid.length === 0) return alert('Tidak ada data murid untuk diexport.');
    
    let tableRows = '';
    for (let i = 0; i < filteredMurid.length; i += 2) {
      const m1 = filteredMurid[i];
      const m2 = filteredMurid[i + 1];
      
      const kartu1 = `
        <div style="border: 2px solid #000; padding: 0; border-radius: 8px; width: 100%;">
          <div style="text-align: center; background-color: #e0f2fe; padding: 10px; border-bottom: 2px solid #000;">
            <b style="font-size: 14pt;">SMAN 1 BATUDAA PANTAI</b><br/>
            <span>KARTU LOGIN SISTEM NILAI</span>
          </div>
          <div style="padding: 10px;">
            <table style="width: 100%; font-size: 12pt;">
              <tr><td width="30%">Nama</td><td width="5%">:</td><td><b>${m1.nama}</b></td></tr>
              <tr><td>Kelas</td><td>:</td><td>${m1.kelas}</td></tr>
              <tr><td>Username</td><td>:</td><td><b>${m1.nisn}</b></td></tr>
              <tr><td>Password</td><td>:</td><td><b>siswa123</b></td></tr>
            </table>
          </div>
        </div>
      `;
      
      const kartu2 = m2 ? `
        <div style="border: 2px solid #000; padding: 0; border-radius: 8px; width: 100%;">
          <div style="text-align: center; background-color: #e0f2fe; padding: 10px; border-bottom: 2px solid #000;">
            <b style="font-size: 14pt;">SMAN 1 BATUDAA PANTAI</b><br/>
            <span>KARTU LOGIN SISTEM NILAI</span>
          </div>
          <div style="padding: 10px;">
            <table style="width: 100%; font-size: 12pt;">
              <tr><td width="30%">Nama</td><td width="5%">:</td><td><b>${m2.nama}</b></td></tr>
              <tr><td>Kelas</td><td>:</td><td>${m2.kelas}</td></tr>
              <tr><td>Username</td><td>:</td><td><b>${m2.nisn}</b></td></tr>
              <tr><td>Password</td><td>:</td><td><b>siswa123</b></td></tr>
            </table>
          </div>
        </div>
      ` : '';

      tableRows += `
        <tr>
          <td style="width: 50%; padding: 10px; vertical-align: top;">${kartu1}</td>
          <td style="width: 50%; padding: 10px; vertical-align: top;">${kartu2}</td>
        </tr>
      `;
    }

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Kartu Login Murid</title>
        <style>
          body { font-family: 'Times New Roman', serif; }
        </style>
      </head>
      <body>
        <table style="width: 100%; border-collapse: collapse;">
          ${tableRows}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Kartu_Login_Siswa.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMurid = murid.filter(m => 
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nisn.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className={`text-${currentTheme.primary}`} /> Manajemen Data Murid
          </h2>
          <p className="text-gray-400 text-sm mt-1">Kelola data siswa, NISN, dan rombongan belajar.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          <div className="relative w-full md:w-48 mb-2 md:mb-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" placeholder="Cari..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>
          
          <Button variant="secondary" icon={FileText} onClick={handleExportWord} title="Export ke Word">Word</Button>
          <Button variant="secondary" icon={Printer} onClick={handlePrintKartu} title="Cetak / Simpan PDF">Cetak</Button>
          
          <div className="h-6 w-px bg-gray-700 mx-1 hidden md:block"></div>

          <Button variant="secondary" icon={Download} onClick={handleDownloadTemplate} title="Download Template CSV"></Button>
          
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button variant="secondary" icon={UploadCloud} onClick={() => fileInputRef.current?.click()}>Upload</Button>
          <Button icon={Plus} onClick={() => handleOpenModal()}>Tambah</Button>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-blue-400 font-semibold text-sm">Informasi Akun Login Murid</h4>
          <p className="text-gray-400 text-xs mt-1">
            Gunakan fitur pencarian untuk memfilter kartu mana saja yang ingin dicetak atau diexport. 
            Murid dapat login menggunakan <strong>Username: [NISN]</strong> dan <strong>Password: siswa123</strong>.
          </p>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">NISN / Nama Lengkap</th>
                <th className="px-6 py-4">Kelas (L/P)</th>
                <th className="px-6 py-4">Info Akun Login</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Memuat data murid...</td></tr>
              ) : filteredMurid.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Belum ada data murid.</td></tr>
              ) : (
                filteredMurid.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{m.nama}</p>
                      <p className="font-mono text-xs text-gray-500">{m.nisn}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-800 border border-gray-700">{m.kelas}</span>
                      <span className="ml-2 text-xs text-gray-400">{m.jenis_kelamin}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-gray-950 border border-gray-800 rounded-lg p-2 inline-block">
                        <p className="text-xs text-gray-400">User: <span className="text-white font-mono">{m.nisn}</span></p>
                        <p className="text-xs text-gray-400">Pass: <span className="text-white font-mono">siswa123</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleOpenModal(m)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg" title="Edit Data"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 rounded-lg" title="Hapus Data"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Data Murid" : "Tambah Murid Baru"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="NISN (Digunakan sebagai Username Login)" required value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} placeholder="0012345678" />
          <Input label="Nama Lengkap" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} placeholder="Nama Siswa" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kelas" required value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} placeholder="X-1" />
            <Select label="Jenis Kelamin" required options={['Laki-laki', 'Perempuan']} value={formData.jenis_kelamin} onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})} />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">{editingId ? 'Simpan Perubahan' : 'Simpan Murid'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
