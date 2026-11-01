let allAccounts = [];

window.onload = async function() {
    await fetchPublicAccounts();
    loadOrders();
};

async function fetchPublicAccounts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = `<div class="col-span-3 py-16 text-center text-gray-400 text-xs">Memuat data dari database Supabase...</div>`;

    const { data, error } = await _supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        grid.innerHTML = `<div class="col-span-3 py-16 text-center text-red-400 text-xs">Gagal memuat data: ${error.message}</div>`;
        return;
    }

    allAccounts = data || [];
    renderCatalog(allAccounts);
}

function renderCatalog(accounts) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    if (accounts.length === 0) {
        grid.innerHTML = `<div class="col-span-3 py-16 text-center text-gray-500 text-xs">Tidak ada akun ditemukan.</div>`;
        return;
    }

    accounts.forEach(acc => {
        const isReady = acc.status === 'available';
        const statusBadge = acc.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : (acc.status === 'reserved' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30');
        const statusText = acc.status === 'available' ? 'Tersedia' : (acc.status === 'reserved' ? 'Dipesan' : 'Terjual');
        
        const card = document.createElement('div');
        card.className = "rounded-2xl bg-navy-900 border border-gray-800 overflow-hidden hover:border-cyan-500/50 transition flex flex-col justify-between animate-fade-in";

        card.innerHTML = `
            <div class="cursor-pointer" onclick="openModal('${acc.account_code}')">
                <div class="relative aspect-video overflow-hidden bg-navy-950">
                    <img src="${acc.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'" class="w-full h-full object-cover">
                    <span class="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-navy-950/80 text-cyan-400 text-[10px] font-bold uppercase font-mono">${acc.account_code}</span>
                    <span class="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge}">${statusText}</span>
                </div>
                <div class="p-4 space-y-2">
                    <h3 class="font-bold text-sm text-white">${acc.title}</h3>
                    <div class="text-xs text-gray-400 space-y-1">
                        <p>🏆 Rank: <strong class="text-white">${acc.rank}</strong> (Lv. ${acc.level || 1})</p>
                        <p>🎨 Jumlah Skin: <strong class="text-white">${acc.skins || 0}</strong></p>
                        ${acc.dp_enabled && acc.dp_amount > 0 ? `<p class="text-cyan-400 font-semibold">⚡ Bisa DP: Rp${Number(acc.dp_amount).toLocaleString('id-ID')}</p>` : ''}
                    </div>
                </div>
            </div>
            <div class="p-4 pt-0 space-y-3">
                <div class="flex items-center justify-between border-t border-gray-800/80 pt-3">
                    <span class="text-xs text-gray-400">Harga Total</span>
                    <span class="text-cyan-400 font-black text-base font-mono">Rp${Number(acc.price).toLocaleString('id-ID')}</span>
                </div>
                ${isReady ? `
                <button onclick="buyWhatsApp('${acc.account_code}')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-electric-600 to-cyan-500 text-navy-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow hover:brightness-110 transition">
                    <i class="fa-brands fa-whatsapp text-sm"></i><span>Beli / Hubungi Admin</span>
                </button>` : `
                <button disabled class="w-full py-2.5 rounded-xl bg-gray-800 text-gray-500 text-xs font-bold cursor-not-allowed">
                    Akun Tidak Tersedia
                </button>`}
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterCatalog() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    const rank = document.getElementById('filterRank').value;

    const filtered = allAccounts.filter(acc => {
        const matchQ = acc.title.toLowerCase().includes(q) || acc.account_code.toLowerCase().includes(q);
        const matchStatus = status ? acc.status === status : true;
        const matchRank = rank ? acc.rank.toLowerCase().includes(rank.toLowerCase()) : true;
        return matchQ && matchStatus && matchRank;
    });

    renderCatalog(filtered);
}

function openModal(code) {
    const acc = allAccounts.find(a => a.account_code === code);
    if (!acc) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <img src="${acc.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}" class="w-full aspect-video rounded-2xl object-cover border border-gray-800">
        <div class="space-y-1">
            <span class="font-mono text-xs text-cyan-400 font-bold">${acc.account_code}</span>
            <h3 class="text-xl font-bold text-white">${acc.title}</h3>
        </div>
        <div class="bg-navy-950 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
            <p class="text-gray-300">🏆 <strong>Rank Game:</strong> ${acc.rank}</p>
            <p class="text-gray-300">⭐ <strong>Level Akun:</strong> ${acc.level || 1}</p>
            <p class="text-gray-300">🎨 <strong>Total Skin:</strong> ${acc.skins || 0}</p>
            ${acc.dp_enabled ? `<p class="text-cyan-400 font-bold">⚡ Opsi DP Tersedia: Rp${Number(acc.dp_amount).toLocaleString('id-ID')}</p>` : ''}
        </div>
        <p class="text-xs text-gray-300 leading-relaxed"><strong>Deskripsi:</strong><br>${acc.description || '-'}</p>
        <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
            <span class="text-sm text-gray-400">Harga: <strong class="text-cyan-400 text-base font-mono">Rp${Number(acc.price).toLocaleString('id-ID')}</strong></span>
            <button onclick="buyWhatsApp('${acc.account_code}')" class="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-extrabold text-xs flex items-center space-x-2">
                <i class="fa-brands fa-whatsapp text-sm"></i><span>Pesan via WhatsApp</span>
            </button>
        </div>
    `;
    document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function buyWhatsApp(code) {
    const acc = allAccounts.find(a => a.account_code === code);
    if (!acc) return;

    const orderCode = 'ZVX-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toLocaleString('id-ID');
    const waNumber = acc.contact_whatsapp || CONFIG.WHATSAPP_ADMIN;

    let orders = [];
    try { orders = JSON.parse(localStorage.getItem('zyvex_orders')) || []; } catch(e) { orders = []; }

    orders.unshift({ code: orderCode, name: acc.title, method: 'Pembayaran Penuh', price: `Rp${Number(acc.price).toLocaleString('id-ID')}`, date: now, status: 'Menunggu' });
    localStorage.setItem('zyvex_orders', JSON.stringify(orders));
    loadOrders();
    closeModal();

    const msg = `Halo Admin ZYVEX.ID, saya ingin memesan akun:\n\n• Kode Pesanan: ${orderCode}\n• Akun: ${acc.title} (${acc.account_code})\n• Harga: Rp${Number(acc.price).toLocaleString('id-ID')}\n\nMohon instruksi pembayaran selanjutnya.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}

function loadOrders() {
    const tbody = document.getElementById('orderTableBody');
    if (!tbody) return;

    let orders = [];
    try { orders = JSON.parse(localStorage.getItem('zyvex_orders')) || []; } catch(e) { orders = []; }

    tbody.innerHTML = orders.length === 0 ? `<tr><td colspan="6" class="p-4 text-center text-gray-500 text-xs">Belum ada pesanan.</td></tr>` : '';

    orders.forEach(o => {
        tbody.innerHTML += `
            <tr class="border-b border-gray-800">
                <td class="p-3 font-mono text-cyan-400 font-bold">${o.code}</td>
                <td class="p-3 font-bold text-white">${o.name}</td>
                <td class="p-3 text-gray-300">${o.method}</td>
                <td class="p-3 font-bold text-cyan-400 font-mono">${o.price}</td>
                <td class="p-3 text-gray-400 text-[11px]">${o.date}</td>
                <td class="p-3"><span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px]">${o.status}</span></td>
            </tr>
        `;
    });
}
