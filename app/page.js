'use client';

import { useEffect, useMemo, useState } from 'react';

const emptyForm = { name: '', description: '', price: '' };

const formatRupiah = (value) =>
new Intl.NumberFormat('id-ID', {
style: 'currency',
currency: 'IDR',
maximumFractionDigits: 0,
}).format(Number(value) || 0);

export default function Home() {
const [products, setProducts] = useState([]);
const [form, setForm] = useState(emptyForm);
const [editingId, setEditingId] = useState(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [deletingId, setDeletingId] = useState(null);
const [error, setError] = useState('');
const [search, setSearch] = useState('');
const [showForm, setShowForm] = useState(false);
const [activeMenu, setActiveMenu] = useState('products');

async function loadProducts() {
setLoading(true);
setError('');

try {
  const res = await fetch('/api/products');
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Gagal memuat data');
  if (!Array.isArray(data)) throw new Error('Format data produk tidak sesuai');

  setProducts(data);
} catch (err) {
  setError(err.message || 'Terjadi kesalahan saat memuat data');
} finally {
  setLoading(false);
}

}

useEffect(() => {
loadProducts();
}, []);

const filteredProducts = useMemo(() => {
const keyword = search.toLowerCase().trim();

return products.filter((product) =>
  [product.name, product.description]
    .some((value) => String(value || '').toLowerCase().includes(keyword))
);

}, [products, search]);

const totalValue = products.reduce(
(total, product) =>
total + (Number(product.price) || 0),
0
);

function handleChange(e) {
const { name, value } = e.target;
setForm((prev) => ({ ...prev, [name]: value }));
}

function openAddForm() {
setEditingId(null);
setForm(emptyForm);
setError('');
setShowForm(true);
}

function startEdit(product) {
setEditingId(product.id);
setForm({
name: product.name || '',
description: product.description || '',
price: product.price ?? '',
});
setError('');
setShowForm(true);
window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
setEditingId(null);
setForm(emptyForm);
setShowForm(false);
setError('');
}

async function handleSubmit(e) {
e.preventDefault();
setSaving(true);
setError('');

try {
  const url = editingId
    ? `/api/products/${editingId}`
    : '/api/products';

  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...form,
      price: Number(form.price),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Gagal menyimpan data');
  }

  setForm(emptyForm);
  setEditingId(null);
  setShowForm(false);
  await loadProducts();
} catch (err) {
  setError(err.message || 'Terjadi kesalahan saat menyimpan');
} finally {
  setSaving(false);
}

}

async function handleDelete(id) {
if (!window.confirm('Yakin ingin menghapus produk ini?')) return;

setDeletingId(id);
setError('');

try {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Gagal menghapus data');
  }

  await loadProducts();
} catch (err) {
  setError(err.message || 'Terjadi kesalahan saat menghapus');
} finally {
  setDeletingId(null);
}

}

return (
<div className="app-shell">
<aside className="sidebar">
<a href="#" className="brand">
<span className="brand-icon">
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
<path d="m4.5 7.5 7.5 4.3 7.5-4.3M12 12v8.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
</svg>
</span>
<span>Stockify<span className="brand-dot">.</span></span>
</a>

    <div className="sidebar-label">MENU UTAMA</div>

    <nav className="sidebar-nav">
      <button
        className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveMenu('dashboard')}
      >
        <span className="nav-icon">▦</span>
        Dashboard
      </button>

      <button
        className={`nav-item ${activeMenu === 'products' ? 'active' : ''}`}
        onClick={() => {
          setActiveMenu('products');
          document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="nav-icon">▤</span>
        Produk
        <span className="nav-count">{products.length}</span>
      </button>

      <button
        className={`nav-item ${activeMenu === 'reports' ? 'active' : ''}`}
        onClick={() => setActiveMenu('reports')}
      >
        <span className="nav-icon">▥</span>
        Laporan
      </button>
    </nav>

    <div className="sidebar-label sidebar-label-bottom">PREFERENSI</div>

    <nav className="sidebar-nav">
      <button
        className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveMenu('settings')}
      >
        <span className="nav-icon">⚙</span>
        Pengaturan
      </button>
    </nav>

    <div className="sidebar-bottom">
      <div className="sidebar-help-icon">?</div>
      <div>
        <strong>Butuh bantuan?</strong>
        <p>Kelola inventaris lebih mudah.</p>
      </div>
    </div>
  </aside>

  <main className="main-content">
    <header className="topbar">
      <div className="breadcrumb">
        Workspace <span>/</span> <strong>Inventaris</strong>
      </div>

      <div className="topbar-right">
        <span className="online-indicator" />
        <span className="system-status">Database terhubung melalui API</span>
        <div className="avatar">S</div>
      </div>
    </header>

    <section className="page-heading">
      <div>
        <div className="eyebrow">INVENTORY MANAGEMENT</div>
        <h1>
          {activeMenu === 'dashboard'
            ? 'Dashboard'
            : activeMenu === 'reports'
              ? 'Laporan Inventaris'
              : activeMenu === 'settings'
                ? 'Pengaturan'
                : 'Manajemen Produk'}
        </h1>
        <p className="subtitle">
          Pantau dan kelola inventaris barangmu dalam satu tempat.
        </p>
      </div>

      <button className="btn-primary" onClick={openAddForm}>
        <span className="plus-icon">+</span>
        Tambah Produk
      </button>
    </section>

    {error && (
      <div className="error-box" role="alert">
        <span>⚠</span>
        {error}
        <button className="error-dismiss" onClick={() => setError('')} aria-label="Tutup pesan error">×</button>
      </div>
    )}

    <section className="stats-grid">
      <article className="stat-card">
        <div className="stat-top">
          <span className="stat-label">Total Produk</span>
          <span className="stat-icon green">▤</span>
        </div>
        <div className="stat-value">{loading ? '—' : products.length}</div>
        <div className="stat-note">Produk tersimpan di database</div>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span className="stat-label">Total Nilai Produk</span>
          <span className="stat-icon blue">↗</span>
        </div>
        <div className="stat-value stat-money">
          {loading ? '—' : formatRupiah(totalValue)}
        </div>
        <div className="stat-note">Akumulasi harga seluruh produk</div>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span className="stat-label">Rata-rata Harga</span>
          <span className="stat-icon purple">◎</span>
        </div>
        <div className="stat-value stat-money">
          {loading
            ? '—'
            : formatRupiah(products.length ? totalValue / products.length : 0)}
        </div>
        <div className="stat-note">Rata-rata harga per produk</div>
      </article>
    </section>

    {showForm && (
      <section className="card form-card" id="product-form">
        <div className="section-heading">
          <div>
            <h2>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <p>Lengkapi informasi produk di bawah ini.</p>
          </div>
          <button
            className="close-button"
            type="button"
            onClick={cancelEdit}
            aria-label="Tutup form"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="name">Nama Produk <span>*</span></label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Keyboard Mechanical"
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="price">Harga Produk (Rp) <span>*</span></label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="Contoh: 250000"
                required
              />
            </div>

            <div className="form-row full-width">
              <label htmlFor="description">Deskripsi Produk</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Tuliskan informasi singkat mengenai produk..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </section>
    )}

    <section className="card products-card" id="products-section">
      <div className="section-heading products-heading">
        <div>
          <h2>Daftar Produk</h2>
          <p>Semua produk yang tercatat dalam inventarismu.</p>
        </div>

        <button className="btn-outline" onClick={loadProducts} disabled={loading}>
          <span className="refresh-icon">↻</span>
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      <div className="table-toolbar">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="search"
            placeholder="Cari nama atau deskripsi produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari produk"
          />
        </div>

        <span className="result-count">
          Menampilkan <strong>{filteredProducts.length}</strong> dari {products.length} produk
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PRODUK</th>
              <th>DESKRIPSI</th>
              <th>HARGA</th>
              <th className="action-column">AKSI</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <div className={`product-avatar product-color-${index % 5}`}>
                      {String(product.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="product-name-wrap">
                      <strong>{product.name}</strong>
                      <span>ID: {product.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="description-text">
                    {product.description || 'Tidak ada deskripsi'}
                  </span>
                </td>
                <td>
                  <strong className="price-text">{formatRupiah(product.price)}</strong>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => startEdit(product)}
                      aria-label={`Edit ${product.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      aria-label={`Hapus ${product.name}`}
                    >
                      {deletingId === product.id ? '...' : 'Hapus'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="empty">
          <div className="empty-icon">▤</div>
          <strong>{search ? 'Produk tidak ditemukan' : 'Belum ada produk'}</strong>
          <p>
            {search
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : 'Tambahkan produk pertamamu untuk mulai mengelola inventaris.'}
          </p>
          {!search && (
            <button className="btn-primary" onClick={openAddForm}>
              + Tambah Produk
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <span className="loading-spinner" />
          Memuat data produk...
        </div>
      )}

      <div className="table-footer">
        <span>Stockify Inventory System</span>
        <span>{products.length} produk tercatat</span>
      </div>
    </section>

    <footer className="page-footer">
      <span>© {new Date().getFullYear()} Stockify</span>
      <span>Kelola stok. Lebih terorganisir.</span>
    </footer>
  </main>
</div>

);
}