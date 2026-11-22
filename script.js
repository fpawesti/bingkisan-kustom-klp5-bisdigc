// ============================================================
// BAGIAN MAUL (SOFTWARE ENGINEER)
// Kalkulator: harga paket × jumlah kotak, validasi, interaksi form
// ============================================================

const form = document.getElementById('form-kalkulator');
const selectPaket = document.getElementById('paket');
const inputJumlah = document.getElementById('jumlah');
const inputKode = document.getElementById('kode-promo');
const pesanError = document.getElementById('pesan-error');
const kotakHasil = document.getElementById('hasil');
const wadahRincian = document.getElementById('rincian-harga');

// Format angka ke Rupiah, contoh: 125000 -> Rp 125.000
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
}

// Fungsi utama: harga paket × jumlah kotak
function hitungTotal(hargaPaket, jumlahKotak) {
  return hargaPaket * jumlahKotak;
}

function tampilkanError(teks) {
  pesanError.textContent = teks;
  pesanError.hidden = false;
  kotakHasil.hidden = true;
}

function sembunyikanError() {
  pesanError.hidden = true;
}


// ============================================================
// BAGIAN SYAFA (SOFTWARE ENGINEER)
// Kode promo/diskon & rincian harga (harga awal, potongan, total bayar)
// Aturan: diskon 10% jika memakai kode PARCELIN ATAU beli minimal 3 kotak
// (tidak ditumpuk, maksimal tetap 10%)
// ============================================================

const KODE_PROMO = 'PARCELIN';
const PERSEN_DISKON = 10;
const MIN_KOTAK_DISKON = 3;

// Cek apakah pembeli berhak diskon (via kode promo ATAU minimal kotak)
function cekDiskon(kodeInput, jumlahKotak) {
  const kode = (kodeInput || '').trim().toUpperCase();
  const kodeValid = kode === KODE_PROMO;
  const kodeSalah = kode !== '' && !kodeValid;
  const memenuhiMinimal = jumlahKotak >= MIN_KOTAK_DISKON;

  let dapatDiskon = false;
  let keterangan = '';

  if (kodeValid && memenuhiMinimal) {
    dapatDiskon = true;
    keterangan = 'Kode promo ' + KODE_PROMO + ' valid & pembelian minimal ' + MIN_KOTAK_DISKON + ' kotak';
  } else if (kodeValid) {
    dapatDiskon = true;
    keterangan = 'Kode promo ' + KODE_PROMO + ' berhasil dipakai';
  } else if (memenuhiMinimal) {
    dapatDiskon = true;
    keterangan = 'Diskon karena pembelian minimal ' + MIN_KOTAK_DISKON + ' kotak';
    if (kodeSalah) keterangan += ' (kode promo tidak valid)';
  } else if (kodeSalah) {
    keterangan = 'Kode promo tidak valid';
  }

  return { dapatDiskon: dapatDiskon, kodeSalah: kodeSalah, keterangan: keterangan };
}

// Hitung rincian: harga awal, potongan diskon, total bayar
function hitungRincian(hargaPerKotak, jumlahKotak, kodeInput) {
  const hargaAwal = hitungTotal(hargaPerKotak, jumlahKotak); // pakai fungsi Maul
  const info = cekDiskon(kodeInput, jumlahKotak);
  const potongan = info.dapatDiskon
    ? Math.round((hargaAwal * PERSEN_DISKON) / 100)
    : 0;

  return {
    hargaPerKotak: hargaPerKotak,
    jumlahKotak: jumlahKotak,
    hargaAwal: hargaAwal,
    potongan: potongan,
    totalBayar: hargaAwal - potongan,
    dapatDiskon: info.dapatDiskon,
    kodeSalah: info.kodeSalah,
    keterangan: info.keterangan
  };
}

// Tampilkan rincian ke elemen HTML
function tampilkanRincian(rincian, namaPaket, container) {
  container.innerHTML = '';

  function baris(label, nilai, kelas) {
    const div = document.createElement('div');
    div.className = 'rincian-baris' + (kelas ? ' ' + kelas : '');
    const kiri = document.createElement('span');
    const kanan = document.createElement('span');
    kiri.textContent = label;
    kanan.textContent = nilai;
    div.appendChild(kiri);
    div.appendChild(kanan);
    return div;
  }

  if (rincian.keterangan) {
    const info = document.createElement('p');
    info.className = 'promo-info ' + (rincian.dapatDiskon ? 'promo-sukses' : 'promo-gagal');
    info.textContent = rincian.keterangan;
    container.appendChild(info);
  }

  container.appendChild(baris(
    'Harga awal (' + namaPaket + ': ' + formatRupiah(rincian.hargaPerKotak) + ' × ' + rincian.jumlahKotak + ' kotak)',
    formatRupiah(rincian.hargaAwal)
  ));
  container.appendChild(baris(
    'Potongan diskon (' + (rincian.dapatDiskon ? PERSEN_DISKON : 0) + '%)',
    '- ' + formatRupiah(rincian.potongan)
  ));
  container.appendChild(baris(
    'Total bayar',
    formatRupiah(rincian.totalBayar),
    'rincian-total'
  ));
}


// ============================================================
// PROSES UTAMA (validasi Maul -> rincian Syafa)
// ============================================================

function prosesHitung() {
  const opsi = selectPaket.options[selectPaket.selectedIndex];
  const hargaPaket = Number(opsi.dataset.harga);
  const jumlahKotak = Number(inputJumlah.value);

  if (!selectPaket.value) {
    tampilkanError('Pilih paket bingkisan terlebih dahulu.');
    return;
  }
  if (!Number.isInteger(jumlahKotak) || jumlahKotak < 1) {
    tampilkanError('Jumlah kotak harus berupa bilangan bulat minimal 1.');
    return;
  }
  if (jumlahKotak > Number(inputJumlah.max)) {
    tampilkanError('Jumlah kotak maksimal ' + inputJumlah.max + '.');
    return;
  }

  sembunyikanError();

  const rincian = hitungRincian(hargaPaket, jumlahKotak, inputKode.value);
  tampilkanRincian(rincian, opsi.textContent, wadahRincian);
  kotakHasil.hidden = false;
}

// Hitung saat tombol ditekan
form.addEventListener('submit', function (e) {
  e.preventDefault();
  prosesHitung();
});

// Hitung ulang otomatis kalau hasil sudah tampil dan input berubah
[selectPaket, inputJumlah, inputKode].forEach(function (el) {
  el.addEventListener('input', function () {
    if (!kotakHasil.hidden) prosesHitung();
  });
});

// Atur ulang form
form.addEventListener('reset', function () {
  sembunyikanError();
  kotakHasil.hidden = true;
  wadahRincian.innerHTML = '';
});

// Tombol "Pilih paket" di katalog mengisi form kalkulator
document.querySelectorAll('[data-pilih]').forEach(function (tombol) {
  tombol.addEventListener('click', function () {
    selectPaket.value = tombol.dataset.pilih;
    document.getElementById('calc-section').scrollIntoView({ behavior: 'smooth' });
    inputJumlah.focus({ preventScroll: true });
    if (!kotakHasil.hidden) prosesHitung();
  });
});

