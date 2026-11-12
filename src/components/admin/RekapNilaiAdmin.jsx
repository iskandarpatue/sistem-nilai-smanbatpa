import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button, Select } from '../ui/SharedUI';
import { supabase } from '../../lib/supabase';

export default function RekapNilaiAdmin() {
  const { currentTheme } = useTheme();
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  
  const [rekapData, setRekapData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ambil daftar kelas unik
  useEffect(() => {
    const fetchKelas = async () => {
      const { data } = await supabase.from('murid').select('kelas');
      if (data) {
        const unique = [...new Set(data.map(d => d.kelas))];
        setKelasOptions(unique);
      }
    };
    fetchKelas();
  }, []);

  // Ambil daftar mapel saat kelas dipilih
  useEffect(() => {
    if (selectedKelas) {
      const fetchMapel = async () => {
        const { data } = await supabase.from('tujuan_pembelajaran').select('mapel').eq('kelas', selectedKelas);
        if (data) {
          const unique = [...new Set(data.map(d => d.mapel))];
          setMapelOptions(unique);
        }
      };
      fetchMapel();
    }
  }, [selectedKelas]);

  // Tarik dan Gabungkan Nilai
  useEffect(() => {
    if (selectedKelas && selectedMapel) fetchRekap();
  }, [selectedKelas, selectedMapel]);

  const fetchRekap = async () => {
    setIsLoading(true);
    // 1. Ambil murid di kelas ini
    const { data: murids } = await supabase.from('murid').select('*').eq('kelas', selectedKelas).order('nama');
    // 2. Ambil nilai di mapel ini
    const { data: nilais } = await supabase.from('nilai').select('*').eq('mapel', selectedMapel);
    // 3. Ambil total TP untuk pembagi
    const { data: tps } = await supabase.from('tujuan_pembelajaran').select('id').eq('kelas', selectedKelas).eq('mapel', selectedMapel);

    const totalTp = tps?.length || 1;

    // 4. Kalkulasi per murid
    const rekap = (murids || []).map(m => {
      const nilaiSiswa = (nilais || []).filter(n => n.nisn === m.nisn);
      
      let totalSumatif = 0;
      let asasTerakhir = 0;

      nilaiSiswa.forEach(ns => {
        totalSumatif += (ns.sumatif || 0);
        if (ns.asas > 0) asasTerakhir = ns.asas; // Ambil nilai ASAS
      });

      const rataSumatif = totalSumatif / totalTp;
      const nilaiAkhir = ((rataSumatif * 0.6) + (asasTerakhir * 0.4)).toFixed(1); // Default bobot 60/40

      return {
        ...m,
        status: nilaiSiswa.length > 0 ? 'Ada Data' : 'Kosong',
        rataSumatif: rataSumatif.toFixed(1),
        asas: asasTerakhir,
        nilaiAkhir: isNaN(nilaiAkhir) ? 0 : nilaiAkhir
      };
    });

    setRekapData(rekap);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className={`text-${currentTheme.primary}`} /> Pantau Rekapitulasi Nilai
          </h2>
          <p className="text-gray-400 text-sm mt-1">Lihat ringkasan nilai akhir dari seluruh kelas dan mata pelajaran.</p>
        </div>
      </div>

      <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl flex gap-4">
        <Select label="Filter Kelas" options={kelasOptions} value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} />
        <Select label="Filter Mata Pelajaran" options={mapelOptions} value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} />
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">NISN / Nama</th>
              <th className="px-6 py-4 text-center">Rata-rata Sumatif</th>
              <th className="px-6 py-4 text-center">Nilai ASAS</th>
              <th className="px-6 py-4 text-center">Nilai Akhir Rapor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {!selectedKelas || !selectedMapel ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Pilih Kelas dan Mata Pelajaran di atas.</td></tr>
            ) : isLoading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Mengkalkulasi nilai sekolah...</td></tr>
            ) : rekapData.map(m => (
              <tr key={m.id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4">
                  <p className="font-bold text-white">{m.nama}</p>
                  <p className="text-xs text-gray-500">{m.nisn}</p>
                </td>
                <td className="px-6 py-4 text-center font-mono text-gray-400">{m.status === 'Kosong' ? '-' : m.rataSumatif}</td>
                <td className="px-6 py-4 text-center font-mono text-gray-400">{m.status === 'Kosong' ? '-' : m.asas}</td>
                <td className="px-6 py-4 text-center">
                  {m.status === 'Kosong' ? (
                    <span className="text-xs px-2 py-1 bg-gray-800 rounded-md">Belum Dinilai</span>
                  ) : (
                    <span className={`font-bold text-lg ${m.nilaiAkhir >= 75 ? 'text-green-400' : 'text-red-400'}`}>{m.nilaiAkhir}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}