/**
 * Server-side storage for assignment solutions.
 * This file is NEVER sent to the client bundle and is only accessed
 * via the authenticated /api/admin/solution endpoint.
 */

export interface TaskSolution {
  taskId: string;
  title: string;
  explanation: string;
  code: string;
}

export const TASK_SOLUTIONS: Record<string, TaskSolution> = {
  'py-01h': {
    taskId: 'py-01h',
    title: 'Solusi Tugas Praktik: Membuat Program Kalkulator Interaktif',
    explanation: 'Solusi ini mengimplementasikan fungsi matematika modular (tambah, kurang, kali, bagi) dengan penanganan percabangan kondisi khusus untuk mencegah pembagian dengan nol (zero division error handling), serta pemformatan string output menggunakan f-string.',
    code: `# Implementasi Program Kalkulator Modular
def tambah(a, b):
    return a + b

def kurang(a, b):
    return a - b

def kali(a, b):
    return a * b

def bagi(a, b):
    if b == 0:
        return "Error: Pembagian dengan nol tidak diizinkan!"
    return a / b

# Uji Coba Fungsi Kalkulator
angka1 = 48
angka2 = 12

print(f"{angka1} + {angka2} = {tambah(angka1, angka2)}")
print(f"{angka1} - {angka2} = {kurang(angka1, angka2)}")
print(f"{angka1} * {angka2} = {kali(angka1, angka2)}")
print(f"{angka1} / {angka2} = {bagi(angka1, angka2)}")
print(f"{angka1} / 0  = {bagi(angka1, 0)}")`
  },
  'py-02h': {
    taskId: 'py-02h',
    title: 'Solusi Tugas Praktik: Mini Proyek Analisis & Visualisasi Produk',
    explanation: 'Solusi ini mengintegrasikan seluruh konsep Bab 2: pembacaan data CSV menggunakan pd.read_csv, komputasi kolom baru secara vektor dengan operasi matematika langsung, agregasi statistik NumPy (np.sum dan np.mean), visualisasi diagram batang dengan palet warna Seaborn viridis dan penambahan label nilai di atas batang, serta ekspor data ke file CSV baru tanpa indeks bawaan.',
    code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Membaca file CSV
df = pd.read_csv('daftar_produk.csv')

# 2. Kalkulasi kolom baru & agregasi statistik NumPy
df['Total_Nilai'] = df['Harga'] * df['Stok']
total_aset = np.sum(df['Total_Nilai'])
rata_harga = np.mean(df['Harga'])
rata_stok  = np.mean(df['Stok'])

print("Hasil Dataframe:")
print(df[['Kode', 'Produk', 'Harga', 'Stok', 'Total_Nilai']])
print(f"\\nTotal Nilai Aset : Rp {total_aset:,.0f}")
print(f"Rata-rata Harga  : Rp {rata_harga:,.0f}")
print(f"Rata-rata Stok   : {rata_stok:.1f} unit")

# 3. Visualisasi Bar Chart
sns.set_theme(style='whitegrid')
fig, ax = plt.subplots(figsize=(8, 4.5))
palette = sns.color_palette("viridis", len(df))
bars = ax.bar(df['Produk'], df['Total_Nilai'] / 1_000_000, color=palette, edgecolor='black', linewidth=0.8)

ax.set_title("Nilai Total Inventaris per Produk (Juta Rupiah)", fontsize=13, fontweight='bold', pad=12)
ax.set_xlabel("Nama Produk", fontsize=10, fontweight='bold')
ax.set_ylabel("Nilai Total (Juta Rp)", fontsize=10, fontweight='bold')
ax.grid(axis='y', linestyle='--', alpha=0.7)

for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2.0, yval + 2, f"{yval:.1f} jt", ha='center', va='bottom', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.show()

# 4. Ekspor ke file CSV baru
df.to_csv('laporan_inventaris_selesai.csv', index=False)
print("File berhasil diekspor!")`
  }
};
