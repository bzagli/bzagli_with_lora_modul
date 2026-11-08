/**
 * Interactive Enhancements & Professional UI Interactions
 * Foliar & Agricultural Management System
 * Includes Centralized Page Visibility & Access Control System
 */

// Master Catalog of Controllable Pages in the Agricultural Suite
const SYSTEM_PAGE_CATALOG = [
    { id: 'products.html', title: 'Stok Listesi & Depo', category: 'Ürün & Stok', icon: 'bi-box-seam', desc: 'İlaç, gübre ve kimyasal stok takibi' },
    { id: 'bku_dashboard.html', title: 'BKÜ Dashboard & Ruhsat', category: 'Ürün & Stok', icon: 'bi-shield-check', desc: 'Bakanlık ruhsatlı bitki koruma ürünleri' },
    { id: 'bku_offline_app.html', title: 'BKÜ Çevrimdışı Rehber', category: 'Ürün & Stok', icon: 'bi-database-check', desc: 'İnternetsiz BKÜ arama ve etiket veritabanı' },

    { id: 'treatments.html', title: 'İlaçlama Kayıtları', category: 'Uygulamalar & Zirai Mücadele', icon: 'bi-clipboard2-pulse', desc: 'Geçmiş ve aktif ilaçlama saha kayıtları' },
    { id: 'schedule.html', title: 'İlaçlama Programı & Takvim', category: 'Uygulamalar & Zirai Mücadele', icon: 'bi-calendar-week', desc: 'Detaylı sezonluk ilaçlama planı ve reçeteler' },
    { id: 'program.html', title: 'Basit İlaçlama Takvimi', category: 'Uygulamalar & Zirai Mücadele', icon: 'bi-calendar2-range', desc: 'Hızlı ilaçlama takip çizelgesi' },
    { id: 'spray.html', title: 'Karışım & Nozul Asistanı', category: 'Uygulamalar & Zirai Mücadele', icon: 'bi-droplet-half', desc: 'Tank karışım sırası ve nozul kalibrasyonu' },
    { id: 'recommendations.html', title: 'Tavsiye & İletişim Portalı', category: 'Uygulamalar & Zirai Mücadele', icon: 'bi-chat-left-quote', desc: 'Ziraat mühendisi tavsiyeleri, reçete ve sohbet' },

    { id: 'irrigation_fertilization_records.html', title: 'Sulama & Gübreleme Kayıtları', category: 'Sulama & Gübreleme', icon: 'bi-moisture', desc: 'Sayaç, vana ve gübreleme tankı uygulamaları' },
    { id: 'irrigation_schedule.html', title: 'Sulama Programı & Uygulamaları', category: 'Sulama & Gübreleme', icon: 'bi-water', desc: 'Parsel bazlı sulama takvimi ve planı' },

    { id: 'garden_map.html', title: 'Bahçe & Çeşit Haritası', category: 'Haritalar & Saha', icon: 'bi-map', desc: 'İnteraktif parsel, vana ve ağaç çeşit haritası' },
    { id: 'herbicide_map.html', title: 'Herbisit (Ot İlacı) Haritası', category: 'Haritalar & Saha', icon: 'bi-signpost-split', desc: 'Ot ilacı uygulama ve planlama haritası' },

    { id: 'cari.html', title: 'Cari & Maliyet Hesabı', category: 'İşletme, Maliyet & Puantaj', icon: 'bi-wallet2', desc: 'Gelir, gider ve ürün maliyet muhasebesi' },
    { id: 'puantaj.html', title: 'Puantaj & İşçilik Takibi', category: 'İşletme, Maliyet & Puantaj', icon: 'bi-people', desc: 'Personel yevmiye ve çalışma saatleri' },
    { id: 'agenda.html', title: 'Çiftlik Ajandası & Notlar', category: 'İşletme, Maliyet & Puantaj', icon: 'bi-journal-bookmark', desc: 'Günlük çiftlik görev ve hatırlatıcıları' },
    { id: 'agenda_list.html', title: 'Ajanda Liste Görünümü', category: 'İşletme, Maliyet & Puantaj', icon: 'bi-journal-text', desc: 'Tüm ajanda kayıtlarının toplu listesi' },

    { id: 'analiz.html', title: 'Toprak / Yaprak / Su Analizi', category: 'İstasyon & Analiz', icon: 'bi-flask', desc: 'Laboratuvar analiz yorumları ve gübre önerileri' },
    { id: 'meteo.html', title: 'Meteoroloji İstasyonu & Don', category: 'İstasyon & Analiz', icon: 'bi-cloud-sun', desc: 'Saha istasyonu, don ve hastalık risk modeli' },

    { id: 'apple.html', title: 'Elma Zirai Takvimi', category: 'Zirai Takvimler', icon: 'bi-apple', desc: 'Elma fenolojik dönemleri ve ilaçlamaları' },
    { id: 'cherry.html', title: 'Kiraz Zirai Takvimi', category: 'Zirai Takvimler', icon: 'bi-tree', desc: 'Kiraz fenolojik dönemleri ve ilaçlamaları' },
    { id: 'apricot.html', title: 'Kayısı Zirai Takvimi', category: 'Zirai Takvimler', icon: 'bi-brightness-high', desc: 'Kayısı fenolojik dönemleri ve ilaçlamaları' },
    { id: 'peach.html', title: 'Şeftali Zirai Takvimi', category: 'Zirai Takvimler', icon: 'bi-sun', desc: 'Şeftali fenolojik dönemleri ve ilaçlamaları' },

    { id: 'apple_scab_guide.html', title: 'Elma Karaleke Rehberi', category: 'Mücadele Rehberleri', icon: 'bi-book', desc: 'Karaleke biyolojisi ve etken maddeler' },
    { id: 'codling_moth_guide.html', title: 'Elma İç Kurdu Rehberi', category: 'Mücadele Rehberleri', icon: 'bi-bug', desc: 'İç kurdu döl takibi ve ilaçlama zamanları' },
    { id: 'peach_management_guide.html', title: 'Şeftali Mücadele Rehberi', category: 'Mücadele Rehberleri', icon: 'bi-journal-medical', desc: 'Şeftali hastalık ve zararlıları' },
    { id: 'apricot_management_guide.html', title: 'Kayısı İlaçlama Programı & Rehberi', category: 'Mücadele Rehberleri', icon: 'bi-shield-fill-check', desc: 'Kayısı monilya, yaprak delen ve ilaçlama takvimi' },

    { id: 'gardens.html', title: 'Bahçe & Parsel Tanımları', category: 'Yönetim', icon: 'bi-geo-alt', desc: 'Bahçe alanları ve blok ayarları' },
    { id: 'activity_logs.html', title: 'Sistem İşlem Günlükleri', category: 'Yönetim', icon: 'bi-list-check', desc: 'Kullanıcı giriş ve işlem logları' }
];

document.addEventListener('DOMContentLoaded', () => {
    initUnifiedNavigation();
    initPageVisibilitySystem();
    initScrollToTop();
    initAnimatedTankCalculator();
    initQuickCalendarSearch();
    initCardMicroInteractions();
    updateAllBrandGardenNames();
    window.addEventListener('storage', (e) => {
        if (e.key === 'selected_garden_name' || e.key === 'selected_garden_id' || e.key === 'allowed_gardens') {
            updateAllBrandGardenNames();
        }
    });
    window.addEventListener('gardenChanged', () => {
        updateAllBrandGardenNames();
    });
});

// Run early enforcement to prevent content flash for hidden pages
tryEarlyEnforcement();

function getCurrentPageFilename() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return filename.split('?')[0].split('#')[0].toLowerCase();
}

// Global state for multi-scope page visibility
window.PAGE_VISIBILITY_DATA = {
    hidden_for_non_admins: [],
    user_visibility: {},
    garden_visibility: {},
    user_garden_visibility: {},
    users: [],
    gardens: []
};

window.CURRENT_VIS_SCOPE = {
    user: '__all__',    // '__all__' or username (e.g. 'Icachem')
    garden: '__all__'   // '__all__' or gardenId (e.g. 'g_1777800763460')
};

function getFullVisibilityData() {
    try {
        const raw = localStorage.getItem('system_page_visibility_full');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return Object.assign({}, window.PAGE_VISIBILITY_DATA, parsed);
            }
        }
    } catch (e) {}
    return window.PAGE_VISIBILITY_DATA;
}

function setFullVisibilityData(data) {
    window.PAGE_VISIBILITY_DATA = Object.assign({}, window.PAGE_VISIBILITY_DATA, data);
    try {
        localStorage.setItem('system_page_visibility_full', JSON.stringify(window.PAGE_VISIBILITY_DATA));
        if (Array.isArray(window.PAGE_VISIBILITY_DATA.hidden_for_non_admins)) {
            localStorage.setItem('system_hidden_pages', JSON.stringify(window.PAGE_VISIBILITY_DATA.hidden_for_non_admins));
        }
    } catch (e) {}
}

function getSystemHiddenPages() {
    const data = getFullVisibilityData();
    return data.hidden_for_non_admins || [];
}

function setSystemHiddenPages(list) {
    const clean = Array.from(new Set(list || []));
    const data = getFullVisibilityData();
    data.hidden_for_non_admins = clean;
    setFullVisibilityData(data);
    return clean;
}

// Compute union of hidden pages for the current user and active garden
function getEffectiveHiddenPagesForCurrentUser() {
    const userRole = localStorage.getItem('userRole') || '';
    if (userRole === 'admin') return []; // Admins have full access to everything

    const data = getFullVisibilityData();
    const uname = localStorage.getItem('userName') || '';
    const gid = localStorage.getItem('selected_garden_id') || '';

    // 1. Global hidden for non-admins
    const baseHidden = data.hidden_for_non_admins || [];
    // 2. User-specific hidden
    const userHidden = (data.user_visibility && data.user_visibility[uname]) || [];
    // 3. Garden-specific hidden
    const gardenHidden = (data.garden_visibility && data.garden_visibility[gid]) || [];
    // 4. User + Garden combination hidden
    const userGardenKey = `${uname}::${gid}`;
    const userGardenHidden = (data.user_garden_visibility && data.user_garden_visibility[userGardenKey]) || [];

    // 5. User permissions stored from login
    let loginHidden = [];
    try {
        const up = JSON.parse(localStorage.getItem('userPermissions') || '{}');
        if (Array.isArray(up.hidden)) loginHidden = up.hidden;
    } catch (e) {}

    return Array.from(new Set([
        ...baseHidden,
        ...userHidden,
        ...gardenHidden,
        ...userGardenHidden,
        ...loginHidden
    ]));
}

function tryEarlyEnforcement() {
    const cur = getCurrentPageFilename();
    if (cur === 'login.html' || cur === 'index.html' || !cur.endsWith('.html')) return;

    const userRole = localStorage.getItem('userRole') || '';
    if (userRole === 'admin') return; // Admins are never blocked

    const allHidden = getEffectiveHiddenPagesForCurrentUser();
    if (allHidden.includes(cur)) {
        // Add early style to hide body until DOM is ready to show blocked screen
        const style = document.createElement('style');
        style.id = 'early-hide-style';
        style.textContent = 'body { display: none !important; }';
        document.head.appendChild(style);
    }
}

function getActiveGardenDisplayName() {
    // 1. localStorage'da doğrudan kayıtlı bahçe adı
    const storedName = localStorage.getItem('selected_garden_name');
    if (storedName && storedName.trim() && storedName !== 'null' && storedName !== 'undefined') {
        return storedName.trim().toLocaleUpperCase('tr-TR');
    }

    // 2. Bahçe ID'si üzerinden arama
    const storedId = localStorage.getItem('selected_garden_id');
    let gardens = [];
    try {
        gardens = JSON.parse(localStorage.getItem('user_gardens') || '[]');
    } catch (e) {}

    if (!Array.isArray(gardens) || gardens.length === 0) {
        gardens = [
            { id: "g_1777800763460", name: "Icachem" },
            { id: "g_1777800773728", name: "Muzaffer Yılmaz" },
            { id: "g_1779966957541", name: "Uni Tarim" },
            { id: "g_1780131414919", name: "Baharsun" },
            { id: "g_1788581916394", name: "Metin Tarım" },
            { id: "g_1788892593240", name: "Örnek" }
        ];
    }

    if (storedId) {
        const found = gardens.find(g => g.id === storedId);
        if (found && found.name) {
            localStorage.setItem('selected_garden_name', found.name);
            return found.name.toLocaleUpperCase('tr-TR');
        }
    }

    // 3. Kullanıcının izinli bahçesi üzerinden arama
    try {
        const allowed = JSON.parse(localStorage.getItem('allowed_gardens') || '[]');
        if (Array.isArray(allowed) && allowed.length > 0) {
            const found = gardens.find(g => g.id === allowed[0]);
            if (found && found.name) {
                localStorage.setItem('selected_garden_id', found.id);
                localStorage.setItem('selected_garden_name', found.name);
                return found.name.toLocaleUpperCase('tr-TR');
            }
        }
    } catch (e) {}

    // 4. Kullanıcı adı bilinen bir bahçe adı ile eşleşiyor mu?
    const uname = localStorage.getItem('userName');
    if (uname) {
        const foundByName = gardens.find(g => g.name.toLowerCase() === uname.toLowerCase());
        if (foundByName) {
            localStorage.setItem('selected_garden_id', foundByName.id);
            localStorage.setItem('selected_garden_name', foundByName.name);
            return foundByName.name.toLocaleUpperCase('tr-TR');
        }
    }

    // 5. Varsayılan
    return "BAHÇE YÖNETİMİ";
}

function updateAllBrandGardenNames() {
    const activeName = getActiveGardenDisplayName();
    document.querySelectorAll('.site-brand-mark').forEach(el => {
        const textSpan = el.querySelector('.site-brand-name-text');
        if (textSpan) {
            textSpan.textContent = activeName;
        } else {
            const spans = Array.from(el.querySelectorAll('span')).filter(s => !s.classList.contains('site-brand-icon'));
            if (spans.length > 0) {
                spans[spans.length - 1].textContent = activeName;
            }
        }
    });

    document.querySelectorAll('.site-brand-title').forEach(el => {
        const textSpan = el.querySelector('.site-brand-name-text');
        if (textSpan) {
            textSpan.textContent = activeName;
        } else {
            const spans = Array.from(el.querySelectorAll('span')).filter(s => !s.classList.contains('site-brand-icon'));
            if (spans.length > 0) {
                spans[spans.length - 1].textContent = activeName;
            }
        }
    });
}

function initUnifiedNavigation() {
    const navbar = document.querySelector('nav.navbar');
    if (!navbar || navbar.closest('.site-nav-shell')) {
        updateAllBrandGardenNames();
        return;
    }

    const currentBrandName = getActiveGardenDisplayName();

    const shell = document.createElement('header');
    shell.className = 'site-nav-shell sticky-top mb-4';

    const brandRow = document.createElement('div');
    brandRow.className = 'site-brand-row d-flex align-items-center justify-content-between flex-wrap gap-2';
    brandRow.innerHTML = `
        <div class="d-flex align-items-center gap-3">
            <a class="site-brand-mark" href="index.html" aria-label="Ana sayfa">
                <span class="site-brand-icon" aria-hidden="true"><i class="bi bi-flower1"></i></span>
                <span class="site-brand-name-text">${currentBrandName}</span>
            </a>
            <div class="site-brand-tagline d-none d-md-block">Planlama · Uygulama · Takip</div>
        </div>
    `;

    navbar.parentNode.insertBefore(shell, navbar);
    shell.appendChild(brandRow);
    shell.appendChild(navbar);
    navbar.classList.remove('sticky-top', 'shadow-sm', 'mb-4');

    updateAllBrandGardenNames();
}

/**
 * Centralized Page Visibility & Access Control Engine
 */
async function initPageVisibilitySystem() {
    injectPageVisibilityStyles();

    // 1. Sync full visibility from server
    await syncPageVisibilityFromServer();

    const userRole = localStorage.getItem('userRole') || '';
    const isAdmin = userRole === 'admin';
    const curPage = getCurrentPageFilename();

    // Remove early hide style if present
    const earlyStyle = document.getElementById('early-hide-style');
    if (earlyStyle) earlyStyle.remove();

    if (!isAdmin) {
        // Enforce access control for non-admin users
        enforceNonAdminVisibility(curPage);
    } else {
        // Build Admin Quick Control Controls on this page
        setupAdminPageControls(curPage);
    }
}

async function syncPageVisibilityFromServer() {
    try {
        const res = await fetch('api/get_page_visibility.php', { cache: 'no-cache' });
        if (res.ok) {
            const data = await res.json();
            if (data && data.status === 'success') {
                setFullVisibilityData(data);
            }
        }
    } catch (e) {
        // Network or offline fallback: relies on localStorage
    }
}

function enforceNonAdminVisibility(curPage) {
    const allHidden = getEffectiveHiddenPagesForCurrentUser();

    // 1. Hide navigation links pointing to hidden pages
    hideNavAndDashboardLinks(allHidden);

    // 2. Check if current page is restricted
    if (curPage !== 'index.html' && curPage !== 'login.html' && allHidden.includes(curPage)) {
        showAccessRestrictedScreen(curPage);
    }
}

function hideNavAndDashboardLinks(hiddenPages) {
    if (!hiddenPages || hiddenPages.length === 0) return;

    hiddenPages.forEach(page => {
        // Find navbar links across all navbars and headers
        const navLinks = document.querySelectorAll(`nav a[href*="${page}"], .navbar a[href*="${page}"], header a[href*="${page}"]`);
        navLinks.forEach(link => {
            const li = link.closest('li') || link.closest('.nav-item') || link.closest('.dropdown-item') || link;
            li.style.setProperty('display', 'none', 'important');
        });

        // Find dashboard cards on index.html and other overview pages
        const cardLinks = document.querySelectorAll(`main a[href*="${page}"], a[href*="${page}"]`);
        cardLinks.forEach(card => {
            if (card.closest('nav') || card.closest('header')) return; // ignore nav links handled above
            const subCol = card.closest('[class*="col-"]') || card.closest('.dashboard-card') || card.closest('.card');
            if (subCol) {
                subCol.style.setProperty('display', 'none', 'important');
            }
        });
    });

    // Clean up empty dropdowns if all children hidden
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        const visibleItems = Array.from(menu.children).filter(child => {
            return child.style.display !== 'none' && !child.classList.contains('dropdown-divider') && !child.classList.contains('dropdown-header');
        });
        if (visibleItems.length === 0) {
            const parentDropdown = menu.closest('.dropdown, .nav-item');
            if (parentDropdown) parentDropdown.style.setProperty('display', 'none', 'important');
        }
    });
}

function showAccessRestrictedScreen(pageFilename) {
    const pageItem = SYSTEM_PAGE_CATALOG.find(p => p.id === pageFilename);
    const pageTitle = pageItem ? pageItem.title : pageFilename;

    // Clear content safely
    document.body.innerHTML = `
        <div class="access-restricted-wrapper">
            <div class="access-restricted-card">
                <div class="access-icon-bubble">
                    <i class="bi bi-shield-lock-fill"></i>
                </div>
                <h2 class="access-title">Erişim Kısıtlandı</h2>
                <div class="page-pill mb-3">
                    <i class="bi ${pageItem ? pageItem.icon : 'bi-file-earmark-lock'} me-1"></i>
                    <span>${pageTitle} (${pageFilename})</span>
                </div>
                <p class="access-desc">
                    Bu sayfa sistem yöneticisi tarafından normal kullanıcı erişimine geçici olarak kapatılmıştır.
                    Yetki veya bilgi almak için lütfen çiftlik yöneticisiyle iletişime geçin.
                </p>
                <div class="access-actions">
                    <a href="index.html" class="btn btn-primary px-4 py-2 fw-semibold">
                        <i class="bi bi-house-door-fill me-2"></i>Ana Sayfaya Dön
                    </a>
                </div>
            </div>
        </div>
    `;
    document.title = "⛔ Erişim Kısıtlandı | Bahçe Yönetimi";
}

/**
 * Admin Features:
 * Master Page Visibility Management Modal (yönetim merkezi olarak Kullanıcılar sayfasından yapılır)
 */
function setupAdminPageControls(curPage) {
    // Master Yönetim Modalı openGlobalPageVisibilityModal() çağrıldığında oluşturulur;
    // sayfa yüklenirken eklemek bootstrap CSS'i olmayan sayfalarda (ör. meteo.html) stilsiz görünür.
}

function injectFloatingAdminBadge(curPage, isManageable, isCurrentlyHidden, pageMeta) {
    if (document.getElementById('adminFloatingVisPill')) return;

    const pill = document.createElement('div');
    pill.id = 'adminFloatingVisPill';
    pill.className = 'admin-floating-vis-pill';

    if (isManageable) {
        pill.innerHTML = `
            <div class="admin-pill-badge ${isCurrentlyHidden ? 'bg-danger text-white' : 'bg-success text-white'}" id="adminFloatingBadgeBtn" title="Sayfa Görünürlüğü (Yönetici Kontrolü)">
                <i class="bi ${isCurrentlyHidden ? 'bi-lock-fill' : 'bi-unlock-fill'}"></i>
                <span class="pill-text">${isCurrentlyHidden ? 'Kullanıcılara Gizli' : 'Kullanıcılara Açık'}</span>
            </div>
            <div class="admin-pill-menu shadow-lg">
                <div class="admin-pill-header">
                    <strong>${pageMeta ? pageMeta.title : curPage}</strong>
                    <small class="text-muted d-block">${curPage}</small>
                </div>
                <div class="p-2 d-flex flex-column gap-2">
                    <button type="button" class="btn btn-sm ${isCurrentlyHidden ? 'btn-success' : 'btn-danger'} w-100 fw-bold" onclick="window.toggleCurrentPageVisibility('${curPage}')">
                        <i class="bi ${isCurrentlyHidden ? 'bi-eye-fill me-1' : 'bi-eye-slash-fill me-1'}"></i>
                        ${isCurrentlyHidden ? 'Sayfayı Herkese AÇ' : 'Sayfayı Herkese GİZLE'}
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary w-100 fw-semibold" onclick="window.openGlobalPageVisibilityModal()">
                        <i class="bi bi-sliders2-vertical me-1"></i>Kullanıcı & Bahçeye Göre Özelleştir...
                    </button>
                </div>
            </div>
        `;
    } else {
        pill.innerHTML = `
            <div class="admin-pill-badge bg-dark text-white" onclick="window.openGlobalPageVisibilityModal()" title="Kullanıcı ve Bahçeye Göre Görünürlükleri Yönet">
                <i class="bi bi-sliders2-vertical"></i>
                <span class="pill-text">Görünürlük</span>
            </div>
        `;
    }

    document.body.appendChild(pill);

    // Toggle menu dropdown on click
    const badgeBtn = document.getElementById('adminFloatingBadgeBtn');
    if (badgeBtn) {
        badgeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pill.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!pill.contains(e.target)) {
                pill.classList.remove('active');
            }
        });
    }
}

// Global toggle for current page
window.toggleCurrentPageVisibility = async function(pageId) {
    let currentList = getSystemHiddenPages();
    const isNowHidden = !currentList.includes(pageId);

    if (isNowHidden) {
        currentList.push(pageId);
    } else {
        currentList = currentList.filter(p => p !== pageId);
    }

    setSystemHiddenPages(currentList);
    updateAdminControlsUI(pageId, isNowHidden);

    // Save to server (global)
    await saveVisibilityToServer('global', '', '', currentList);

    // Show stylish toast
    const pageMeta = SYSTEM_PAGE_CATALOG.find(p => p.id === pageId);
    const pageName = pageMeta ? pageMeta.title : pageId;
    showAdminToast(
        isNowHidden ? 'bi-eye-slash-fill' : 'bi-eye-fill',
        isNowHidden ? 'Sayfa Gizlendi!' : 'Sayfa Açıldı!',
        `<strong>${pageName}</strong> (${pageId}) artık tüm normal kullanıcılara ${isNowHidden ? '<span class="text-danger fw-bold">GİZLİ</span>' : '<span class="text-success fw-bold">AÇIK</span>'}.`,
        isNowHidden ? 'danger' : 'success'
    );
};

function updateAdminControlsUI(pageId, isHidden) {
    // 1. Update header button
    const btnToggle = document.getElementById('btnAdminPageVisToggle');
    if (btnToggle) {
        btnToggle.className = `btn ${isHidden ? 'btn-danger' : 'btn-success'} fw-semibold d-flex align-items-center gap-1`;
        btnToggle.innerHTML = `
            <i class="bi ${isHidden ? 'bi-eye-slash-fill' : 'bi-eye-fill'}"></i>
            <span class="d-none d-sm-inline">Kullanıcılara:</span>
            <strong>${isHidden ? 'GİZLİ' : 'AÇIK'}</strong>
        `;
    }

    // 2. Update floating pill
    const floatingBadge = document.getElementById('adminFloatingBadgeBtn');
    if (floatingBadge) {
        floatingBadge.className = `admin-pill-badge ${isHidden ? 'bg-danger text-white' : 'bg-success text-white'}`;
        floatingBadge.innerHTML = `
            <i class="bi ${isHidden ? 'bi-lock-fill' : 'bi-unlock-fill'}"></i>
            <span class="pill-text">${isHidden ? 'Kullanıcılara Gizli' : 'Kullanıcılara Açık'}</span>
        `;
    }

    // 3. Update floating menu button
    const pill = document.getElementById('adminFloatingVisPill');
    if (pill) {
        const toggleBtn = pill.querySelector('.admin-pill-menu button');
        if (toggleBtn) {
            toggleBtn.className = `btn btn-sm ${isHidden ? 'btn-success' : 'btn-danger'} w-100 fw-bold`;
            toggleBtn.innerHTML = `
                <i class="bi ${isHidden ? 'bi-eye-fill me-1' : 'bi-eye-slash-fill me-1'}"></i>
                ${isHidden ? 'Sayfayı Herkese AÇ' : 'Sayfayı Herkese GİZLE'}
            `;
        }
    }

    // 4. Update modal checkboxes if open
    const modalCheckbox = document.getElementById(`vis_switch_${pageId.replace('.', '_')}`);
    if (modalCheckbox) {
        modalCheckbox.checked = !isHidden; // checked = open
        const statusBadge = document.getElementById(`vis_badge_${pageId.replace('.', '_')}`);
        if (statusBadge) {
            statusBadge.className = `badge ${isHidden ? 'bg-danger' : 'bg-success'}`;
            statusBadge.textContent = isHidden ? 'GİZLİ' : 'AÇIK';
        }
    }
    updateModalStats();
}

async function saveVisibilityToServer(scopeType, targetUser, targetGarden, hiddenList) {
    try {
        const adminName = localStorage.getItem('userName') || 'admin';
        const res = await fetch('api/save_page_visibility.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scope_type: scopeType || 'global',
                target_user: targetUser || '',
                target_garden: targetGarden || '',
                hidden_pages: hiddenList,
                user: adminName
            })
        });
        if (res.ok) {
            const result = await res.json();
            if (result && result.data) {
                setFullVisibilityData(result.data);
            }
        }
    } catch (e) {
        console.warn("Sunucuya kaydedilemedi, yerel hafızaya yazıldı.", e);
    }
}

/**
 * Helper: get hidden list for any scope
 */
function getHiddenListForScope(uScope, gScope) {
    const data = getFullVisibilityData();
    if (uScope === '__all__' && gScope === '__all__') {
        return data.hidden_for_non_admins || [];
    } else if (uScope !== '__all__' && gScope === '__all__') {
        return (data.user_visibility && data.user_visibility[uScope]) || [];
    } else if (uScope === '__all__' && gScope !== '__all__') {
        return (data.garden_visibility && data.garden_visibility[gScope]) || [];
    } else {
        const key = `${uScope}::${gScope}`;
        return (data.user_garden_visibility && data.user_garden_visibility[key]) || [];
    }
}

/**
 * Master Modal: Full Page Visibility Management (User & Garden Scoped)
 */
function injectMasterPageVisibilityModal() {
    if (document.getElementById('globalPageVisibilityModal')) return;

    const modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'globalPageVisibilityModal';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-labelledby', 'globalPageVisModalLabel');
    modalEl.setAttribute('aria-hidden', 'true');

    modalEl.innerHTML = `
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 18px; overflow: hidden;">
                <div class="modal-header bg-dark text-white p-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-primary p-2 rounded-3 text-white">
                            <i class="bi bi-shield-lock-fill fs-5"></i>
                        </div>
                        <div>
                            <h5 class="modal-title fw-bold mb-0" id="globalPageVisModalLabel">Sayfa Görünürlük & Erişim Yönetimi</h5>
                            <small class="text-white-50">Kullanıcı ve bahçe bazında menü ve sayfa erişimlerini özelleştirin</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Kapat"></button>
                </div>

                <div class="modal-body p-4 bg-light">
                    <!-- Scope selector card (User & Garden Selector) -->
                    <div class="card border-0 shadow-sm p-3 mb-3 rounded-3 bg-white border-start border-4 border-primary">
                        <div class="row g-2 align-items-center">
                            <div class="col-md-5">
                                <label class="form-label fw-bold text-dark small mb-1 d-flex align-items-center gap-1">
                                    <i class="bi bi-person-gear text-primary"></i>
                                    <span>Hedef Kullanıcı:</span>
                                </label>
                                <select id="visModalUserSelect" class="form-select form-select-sm shadow-xs fw-semibold" onchange="window.handleScopeChange()">
                                    <option value="__all__">🏢 Genel (Tüm Normal Kullanıcılar)</option>
                                </select>
                            </div>
                            <div class="col-md-5">
                                <label class="form-label fw-bold text-dark small mb-1 d-flex align-items-center gap-1">
                                    <i class="bi bi-tree text-success"></i>
                                    <span>Hedef Bahçe:</span>
                                </label>
                                <select id="visModalGardenSelect" class="form-select form-select-sm shadow-xs fw-semibold" onchange="window.handleScopeChange()">
                                    <option value="__all__">🌐 Tüm Bahçeler (Genel)</option>
                                </select>
                            </div>
                            <div class="col-md-2 d-flex align-items-end">
                                <button type="button" class="btn btn-outline-secondary btn-sm w-100 fw-semibold" onclick="window.resetScopeToCurrent()" title="Varsayılan Genel Kapsama Dön">
                                    <i class="bi bi-arrow-repeat me-1"></i>Sıfırla
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Scope Info Banner -->
                    <div class="alert alert-primary py-2 px-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2 border-0 shadow-xs rounded-3" id="visScopeBanner">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary px-2 py-1 fs-6"><i class="bi bi-sliders"></i></span>
                            <div>
                                <strong id="visScopeBadgeTitle">Genel Kullanıcı Ayarları</strong>
                                <small class="text-muted d-block" id="visScopeBadgeDesc">Yapılan ayarlar tüm kullanıcılar ve bahçeler için geçerlidir.</small>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-white text-dark border px-2 py-1 fw-bold" id="visScopeStatsBadge">0 Gizli</span>
                        </div>
                    </div>

                    <!-- Top search & batch action bar -->
                    <div class="card border-0 shadow-sm p-3 mb-4 rounded-3 bg-white">
                        <div class="row g-3 align-items-center">
                            <div class="col-md-5">
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
                                    <input type="text" id="visModalSearch" class="form-control border-start-0 ps-0" placeholder="Sayfa adı veya dosya ara (örn: gübreleme, map, cari)...">
                                </div>
                            </div>
                            <div class="col-md-7 d-flex justify-content-md-end align-items-center gap-2 flex-wrap">
                                <div id="visModalStats" class="d-flex gap-2 me-2">
                                    <!-- Rendered dynamically -->
                                </div>
                                <button type="button" class="btn btn-outline-success btn-sm fw-semibold" onclick="window.setAllPagesVisibility(false)">
                                    <i class="bi bi-check-all me-1"></i>Bu Kapsamda Tümünü Aç
                                </button>
                                <button type="button" class="btn btn-outline-danger btn-sm fw-semibold" onclick="window.hideCriticalPages()">
                                    <i class="bi bi-shield-x me-1"></i>Kritik Sayfaları Gizle
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Category Groups Container -->
                    <div id="visCategoryContainer" class="row g-3">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <div class="modal-footer bg-white border-top p-3 d-flex justify-content-between">
                    <small class="text-muted">
                        <i class="bi bi-info-circle me-1"></i>Seçilen kullanıcı veya bahçeye ait ayarlar anında kaydedilir ve sisteme yansıtılır.
                    </small>
                    <button type="button" class="btn btn-primary px-4 fw-bold" data-bs-dismiss="modal">
                        <i class="bi bi-check-lg me-1"></i>Tamamla
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalEl);

    // Ensure dismiss buttons work in all environments
    modalEl.querySelectorAll('[data-bs-dismiss="modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            modalEl.classList.remove('show');
            modalEl.style.display = 'none';
            document.body.classList.remove('modal-open');
            document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        });
    });

    // Event listener for search filter
    const searchInput = document.getElementById('visModalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterModalPages(e.target.value.toLowerCase().trim());
        });
    }
}

window.openGlobalPageVisibilityModal = async function(targetUser, targetGarden) {
    injectMasterPageVisibilityModal();

    // Ensure freshest data from server
    await syncPageVisibilityFromServer();

    const data = getFullVisibilityData();

    // Populate User Dropdown
    const userSel = document.getElementById('visModalUserSelect');
    if (userSel) {
        let uHtml = '<option value="__all__">🏢 Genel (Tüm Normal Kullanıcılar)</option>';
        if (Array.isArray(data.users)) {
            data.users.forEach(u => {
                if (u.role !== 'admin') {
                    uHtml += `<option value="${u.username}">👤 ${u.username} (${u.role})</option>`;
                }
            });
        }
        userSel.innerHTML = uHtml;
    }

    // Populate Garden Dropdown
    const gardenSel = document.getElementById('visModalGardenSelect');
    if (gardenSel) {
        let gHtml = '<option value="__all__">🌐 Tüm Bahçeler (Genel)</option>';
        if (Array.isArray(data.gardens)) {
            data.gardens.forEach(g => {
                gHtml += `<option value="${g.id}">🌿 ${g.name}</option>`;
            });
        }
        gardenSel.innerHTML = gHtml;
    }

    // Set scope
    if (targetUser && targetUser !== '__all__') {
        window.CURRENT_VIS_SCOPE.user = targetUser;
    }
    if (targetGarden && targetGarden !== '__all__') {
        window.CURRENT_VIS_SCOPE.garden = targetGarden;
    }

    if (userSel) userSel.value = window.CURRENT_VIS_SCOPE.user;
    if (gardenSel) gardenSel.value = window.CURRENT_VIS_SCOPE.garden;

    updateScopeBannerAndRender();

    const modalEl = document.getElementById('globalPageVisibilityModal');
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    } else if (modalEl) {
        modalEl.classList.add('show');
        modalEl.style.display = 'block';
        modalEl.style.backgroundColor = 'rgba(0,0,0,0.6)';
        document.body.classList.add('modal-open');
    }
};

window.handleScopeChange = function() {
    const userSel = document.getElementById('visModalUserSelect');
    const gardenSel = document.getElementById('visModalGardenSelect');

    window.CURRENT_VIS_SCOPE.user = userSel ? userSel.value : '__all__';
    window.CURRENT_VIS_SCOPE.garden = gardenSel ? gardenSel.value : '__all__';

    updateScopeBannerAndRender();
};

window.resetScopeToCurrent = function() {
    window.CURRENT_VIS_SCOPE.user = '__all__';
    window.CURRENT_VIS_SCOPE.garden = '__all__';

    const userSel = document.getElementById('visModalUserSelect');
    const gardenSel = document.getElementById('visModalGardenSelect');
    if (userSel) userSel.value = '__all__';
    if (gardenSel) gardenSel.value = '__all__';

    updateScopeBannerAndRender();
};

function updateScopeBannerAndRender() {
    const u = window.CURRENT_VIS_SCOPE.user;
    const g = window.CURRENT_VIS_SCOPE.garden;
    const data = getFullVisibilityData();

    const badgeTitle = document.getElementById('visScopeBadgeTitle');
    const badgeDesc = document.getElementById('visScopeBadgeDesc');
    const statsBadge = document.getElementById('visScopeStatsBadge');

    const gardenObj = (data.gardens || []).find(x => x.id === g);
    const gardenName = gardenObj ? gardenObj.name : g;

    if (u === '__all__' && g === '__all__') {
        if (badgeTitle) badgeTitle.textContent = "Genel Kullanıcı Ayarları";
        if (badgeDesc) badgeDesc.textContent = "Yönetici harici tüm kullanıcılar ve tüm bahçeler için geçerli varsayılan ayarlar.";
    } else if (u !== '__all__' && g === '__all__') {
        if (badgeTitle) badgeTitle.textContent = `Kullanıcıya Özel: ${u}`;
        if (badgeDesc) badgeDesc.textContent = `Yalnızca "${u}" kullanıcısı için geçerli sayfa görünürlük ayarları (tüm bahçelerde).`;
    } else if (u === '__all__' && g !== '__all__') {
        if (badgeTitle) badgeTitle.textContent = `Bahçeye Özel: ${gardenName}`;
        if (badgeDesc) badgeDesc.textContent = `Kullanıcılar "${gardenName}" bahçesini seçtiğinde geçerli olacak sayfa gizlemeleri.`;
    } else {
        if (badgeTitle) badgeTitle.textContent = `Özel Kapsam: ${u} @ ${gardenName}`;
        if (badgeDesc) badgeDesc.textContent = `"${u}" kullanıcısı yalnızca "${gardenName}" bahçesindeyken geçerli olacak görünürlük ayarları.`;
    }

    const currentScopeHidden = getHiddenListForScope(u, g);
    if (statsBadge) {
        statsBadge.textContent = `${currentScopeHidden.length} Gizli Sayfa`;
        statsBadge.className = `badge ${currentScopeHidden.length > 0 ? 'bg-danger text-white' : 'bg-success text-white'} px-2 py-1 fw-bold`;
    }

    renderMasterPageVisibilityContent();
}

function renderMasterPageVisibilityContent() {
    const container = document.getElementById('visCategoryContainer');
    if (!container) return;

    const u = window.CURRENT_VIS_SCOPE.user;
    const g = window.CURRENT_VIS_SCOPE.garden;
    const scopeHidden = getHiddenListForScope(u, g);

    // Group by category
    const categories = {};
    SYSTEM_PAGE_CATALOG.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    let html = '';
    for (const [catName, items] of Object.entries(categories)) {
        html += `
            <div class="col-12 vis-category-block" data-category="${catName.toLowerCase()}">
                <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                    <div class="card-header bg-white py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                        <span class="fw-bold text-dark fs-6">${catName}</span>
                        <span class="badge bg-light text-muted border">${items.length} Sayfa</span>
                    </div>
                    <div class="card-body p-2">
                        <div class="row g-2">
        `;

        items.forEach(item => {
            const isHidden = scopeHidden.includes(item.id);
            const inputId = `vis_switch_${item.id.replace('.', '_')}`;
            const badgeId = `vis_badge_${item.id.replace('.', '_')}`;

            html += `
                <div class="col-md-6 col-lg-4 vis-page-item" data-search="${item.title.toLowerCase()} ${item.id.toLowerCase()} ${item.desc.toLowerCase()}">
                    <div class="p-2 border rounded-3 bg-white h-100 d-flex align-items-center justify-content-between gap-2 shadow-xs hover-shadow transition">
                        <div class="d-flex align-items-center gap-2 overflow-hidden">
                            <div class="p-2 rounded-2 ${isHidden ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} fs-5">
                                <i class="bi ${item.icon}"></i>
                            </div>
                            <div class="overflow-hidden">
                                <div class="fw-bold text-truncate text-dark" style="font-size: 0.92rem;">${item.title}</div>
                                <div class="text-muted text-truncate" style="font-size: 0.75rem;"><code>${item.id}</code></div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-2 flex-shrink-0">
                            <span class="badge ${isHidden ? 'bg-danger' : 'bg-success'}" id="${badgeId}" style="font-size: 0.72rem;">
                                ${isHidden ? 'GİZLİ' : 'AÇIK'}
                            </span>
                            <div class="form-check form-switch mb-0">
                                <input class="form-check-input vis-switch-input" type="checkbox" id="${inputId}" ${!isHidden ? 'checked' : ''} onchange="window.handleModalPageSwitch('${item.id}', this.checked)">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    updateModalStats();
}

window.handleModalPageSwitch = async function(pageId, isChecked) {
    // isChecked = true means VISIBLE, false means HIDDEN
    const u = window.CURRENT_VIS_SCOPE.user;
    const g = window.CURRENT_VIS_SCOPE.garden;
    let currentList = Array.from(getHiddenListForScope(u, g));

    if (isChecked) {
        currentList = currentList.filter(p => p !== pageId);
    } else {
        if (!currentList.includes(pageId)) currentList.push(pageId);
    }

    let scopeType = 'global';
    let targetUser = '';
    let targetGarden = '';

    const data = getFullVisibilityData();

    if (u === '__all__' && g === '__all__') {
        scopeType = 'global';
        data.hidden_for_non_admins = currentList;
    } else if (u !== '__all__' && g === '__all__') {
        scopeType = 'user';
        targetUser = u;
        if (!data.user_visibility) data.user_visibility = {};
        data.user_visibility[u] = currentList;
    } else if (u === '__all__' && g !== '__all__') {
        scopeType = 'garden';
        targetGarden = g;
        if (!data.garden_visibility) data.garden_visibility = {};
        data.garden_visibility[g] = currentList;
    } else {
        scopeType = 'user_garden';
        targetUser = u;
        targetGarden = g;
        if (!data.user_garden_visibility) data.user_garden_visibility = {};
        data.user_garden_visibility[`${u}::${g}`] = currentList;
    }

    setFullVisibilityData(data);

    // Update switch UI
    const badge = document.getElementById(`vis_badge_${pageId.replace('.', '_')}`);
    if (badge) {
        badge.className = `badge ${!isChecked ? 'bg-danger' : 'bg-success'}`;
        badge.textContent = !isChecked ? 'GİZLİ' : 'AÇIK';
    }
    updateModalStats();

    // Update banner stats badge
    const statsBadge = document.getElementById('visScopeStatsBadge');
    if (statsBadge) {
        statsBadge.textContent = `${currentList.length} Gizli Sayfa`;
        statsBadge.className = `badge ${currentList.length > 0 ? 'bg-danger text-white' : 'bg-success text-white'} px-2 py-1 fw-bold`;
    }

    await saveVisibilityToServer(scopeType, targetUser, targetGarden, currentList);

    const pageMeta = SYSTEM_PAGE_CATALOG.find(p => p.id === pageId);
    const pageName = pageMeta ? pageMeta.title : pageId;
    let scopeLabel = "Tüm Normal Kullanıcılar";
    if (targetUser && !targetGarden) scopeLabel = `Kullanıcı: ${targetUser}`;
    else if (!targetUser && targetGarden) scopeLabel = `Bahçe: ${targetGarden}`;
    else if (targetUser && targetGarden) scopeLabel = `${targetUser} @ ${targetGarden}`;

    showAdminToast(
        !isChecked ? 'bi-eye-slash-fill' : 'bi-eye-fill',
        !isChecked ? 'Sayfa Gizlendi!' : 'Sayfa Açıldı!',
        `<strong>${pageName}</strong> için ayar kaydedildi (${scopeLabel}): ${!isChecked ? '<span class="text-danger fw-bold">GİZLİ</span>' : '<span class="text-success fw-bold">AÇIK</span>'}.`,
        !isChecked ? 'danger' : 'success'
    );
};

window.setAllPagesVisibility = async function(hideAll) {
    const u = window.CURRENT_VIS_SCOPE.user;
    const g = window.CURRENT_VIS_SCOPE.garden;
    let newList = hideAll ? SYSTEM_PAGE_CATALOG.map(p => p.id) : [];

    let scopeType = 'global';
    let targetUser = '';
    let targetGarden = '';

    const data = getFullVisibilityData();

    if (u === '__all__' && g === '__all__') {
        scopeType = 'global';
        data.hidden_for_non_admins = newList;
    } else if (u !== '__all__' && g === '__all__') {
        scopeType = 'user';
        targetUser = u;
        if (!data.user_visibility) data.user_visibility = {};
        data.user_visibility[u] = newList;
    } else if (u === '__all__' && g !== '__all__') {
        scopeType = 'garden';
        targetGarden = g;
        if (!data.garden_visibility) data.garden_visibility = {};
        data.garden_visibility[g] = newList;
    } else {
        scopeType = 'user_garden';
        targetUser = u;
        targetGarden = g;
        if (!data.user_garden_visibility) data.user_garden_visibility = {};
        data.user_garden_visibility[`${u}::${g}`] = newList;
    }

    setFullVisibilityData(data);
    updateScopeBannerAndRender();

    await saveVisibilityToServer(scopeType, targetUser, targetGarden, newList);

    showAdminToast(
        hideAll ? 'bi-lock-fill' : 'bi-unlock-fill',
        hideAll ? 'Tüm Sayfalar Gizlendi' : 'Tüm Sayfalar Açıldı',
        hideAll ? 'Seçili kapsamda tüm sayfalar gizlendi.' : 'Seçili kapsamda tüm sayfalar açıldı.',
        hideAll ? 'danger' : 'success'
    );
};

window.hideCriticalPages = async function() {
    const critical = [
        'products.html',
        'treatments.html',
        'irrigation_fertilization_records.html',
        'garden_map.html',
        'herbicide_map.html',
        'cari.html',
        'puantaj.html',
        'recommendations.html'
    ];

    const u = window.CURRENT_VIS_SCOPE.user;
    const g = window.CURRENT_VIS_SCOPE.garden;
    let currentList = getHiddenListForScope(u, g);
    currentList = Array.from(new Set([...currentList, ...critical]));

    let scopeType = 'global';
    let targetUser = '';
    let targetGarden = '';

    const data = getFullVisibilityData();

    if (u === '__all__' && g === '__all__') {
        scopeType = 'global';
        data.hidden_for_non_admins = currentList;
    } else if (u !== '__all__' && g === '__all__') {
        scopeType = 'user';
        targetUser = u;
        if (!data.user_visibility) data.user_visibility = {};
        data.user_visibility[u] = currentList;
    } else if (u === '__all__' && g !== '__all__') {
        scopeType = 'garden';
        targetGarden = g;
        if (!data.garden_visibility) data.garden_visibility = {};
        data.garden_visibility[g] = currentList;
    } else {
        scopeType = 'user_garden';
        targetUser = u;
        targetGarden = g;
        if (!data.user_garden_visibility) data.user_garden_visibility = {};
        data.user_garden_visibility[`${u}::${g}`] = currentList;
    }

    setFullVisibilityData(data);
    updateScopeBannerAndRender();

    await saveVisibilityToServer(scopeType, targetUser, targetGarden, currentList);

    showAdminToast(
        'bi-shield-check',
        'Kritik Sayfalar Gizlendi',
        'Stok, İlaçlama, Sulama, Harita, Maliyet, Puantaj ve Tavsiye sayfaları bu kapsamda gizlendi.',
        'warning'
    );
};

function filterModalPages(query) {
    const items = document.querySelectorAll('.vis-page-item');
    items.forEach(item => {
        const text = item.getAttribute('data-search') || '';
        if (!query || text.includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    // Hide empty category blocks
    document.querySelectorAll('.vis-category-block').forEach(cat => {
        const visibleChildren = cat.querySelectorAll('.vis-page-item[style="display: block;"], .vis-page-item:not([style*="display: none"])');
        if (query && visibleChildren.length === 0) {
            cat.style.display = 'none';
        } else {
            cat.style.display = 'block';
        }
    });
}

function updateModalStats() {
    const statsContainer = document.getElementById('visModalStats');
    if (!statsContainer) return;

    const systemHidden = getSystemHiddenPages();
    const total = SYSTEM_PAGE_CATALOG.length;
    const hiddenCount = systemHidden.filter(h => SYSTEM_PAGE_CATALOG.some(p => p.id === h)).length;
    const openCount = total - hiddenCount;

    statsContainer.innerHTML = `
        <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
            <i class="bi bi-eye me-1"></i>${openCount} Açık
        </span>
        <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
            <i class="bi bi-eye-slash me-1"></i>${hiddenCount} Gizli
        </span>
    `;
}

function showAdminToast(icon, title, message, variant = 'primary') {
    let toastContainer = document.getElementById('adminToastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'adminToastContainer';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '99999';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast_' + Date.now();
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${variant} border-0 shadow-lg`;
    toastEl.id = toastId;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
                <i class="bi ${icon} fs-5"></i>
                <div>
                    <strong>${title}</strong>
                    <div style="font-size: 0.85rem;">${message}</div>
                </div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Kapat"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    } else {
        setTimeout(() => toastEl.remove(), 4000);
    }
}

function injectPageVisibilityStyles() {
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
        const iconLink = document.createElement('link');
        iconLink.rel = 'stylesheet';
        iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
        document.head.appendChild(iconLink);
    }

    if (document.getElementById('pageVisibilityStyles')) return;

    const style = document.createElement('style');
    style.id = 'pageVisibilityStyles';
    style.textContent = `
        /* Access Restricted Fullscreen Screen */
        .access-restricted-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 24px;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #f8fafc;
        }
        .access-restricted-card {
            background: #ffffff;
            color: #0f172a;
            max-width: 520px;
            width: 100%;
            border-radius: 20px;
            padding: 40px 32px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            animation: accessCardEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes accessCardEntrance {
            from { opacity: 0; transform: translateY(20px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .access-icon-bubble {
            width: 80px;
            height: 80px;
            background: #fee2e2;
            color: #dc2626;
            font-size: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin: 0 auto 20px;
        }
        .access-title {
            font-weight: 800;
            color: #1e293b;
            font-size: 1.6rem;
            margin-bottom: 8px;
        }
        .page-pill {
            display: inline-flex;
            align-items: center;
            padding: 6px 14px;
            background: #f1f5f9;
            color: #475569;
            border-radius: 50px;
            font-size: 0.88rem;
            font-weight: 600;
        }
        .access-desc {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 28px;
        }

        /* Floating Admin Badge */
        .admin-floating-vis-pill {
            position: fixed;
            bottom: 80px;
            right: 24px;
            z-index: 9998;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .admin-pill-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            border-radius: 30px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
        }
        .admin-pill-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
        }
        .admin-pill-menu {
            display: none;
            position: absolute;
            bottom: 110%;
            right: 0;
            width: 250px;
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            animation: pillMenuIn 0.2s ease;
        }
        .admin-floating-vis-pill.active .admin-pill-menu {
            display: block;
        }
        @keyframes pillMenuIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .admin-pill-header {
            padding: 10px 14px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.88rem;
            color: #1e293b;
        }
        .hover-shadow:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
            border-color: #cbd5e1 !important;
        }
        .transition {
            transition: all 0.2s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 1. Scroll-To-Top Floating Button
 */
function initScrollToTop() {
    if (document.getElementById('scrollTopBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.setAttribute('aria-label', 'Yukarı Çık');
    btn.innerHTML = '<i class="bi bi-arrow-up-short"></i>';
    btn.className = 'scroll-top-btn';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/**
 * 2. Animated Real-time Number Counters for Tank Calculator
 */
function initAnimatedTankCalculator() {
    const tankInputs = document.querySelectorAll('#tank-capacity, .calculator-inputs input');
    tankInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const liters = parseFloat(e.target.value) || 0;
            updateCalculatedDosesWithAnimation(liters);
        });
    });
}

function updateCalculatedDosesWithAnimation(liters) {
    const cards = document.querySelectorAll('.product-card[data-base-dose]');
    cards.forEach(card => {
        const baseDose = parseFloat(card.dataset.baseDose);
        const dosePer = parseFloat(card.dataset.dosePer) || 100;
        const calcValEl = card.querySelector('.calc-val');

        if (calcValEl && !isNaN(baseDose)) {
            const targetVal = Math.round((baseDose * (liters / dosePer)) * 10) / 10;
            animateNumber(calcValEl, parseFloat(calcValEl.textContent) || 0, targetVal, 300);
        }
    });
}

function animateNumber(el, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (range || 1)));
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const val = Math.round(start + (range * progress));
        el.textContent = val;
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = end;
        }
    }
    requestAnimationFrame(step);
}

/**
 * 3. Quick Real-time Search & Instant Filter for Calendar Pages
 */
function initQuickCalendarSearch() {
    if (!document.querySelector('.product-card')) return;
    const filterSection = document.querySelector('.table-controls, .filter-section');
    if (!filterSection || document.getElementById('calendarQuickSearch')) return;

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'quick-search-wrapper my-3';
    searchWrapper.innerHTML = `
        <div class="input-group shadow-sm" style="max-width: 480px;">
            <span class="input-group-text bg-white text-muted border-end-0"><i class="bi bi-search"></i></span>
            <input type="text" id="calendarQuickSearch" class="form-control border-start-0 ps-0" placeholder="Hastalık, zararlı veya etken madde ara (Canlı arama)...">
        </div>
    `;

    filterSection.appendChild(searchWrapper);

    const searchInput = document.getElementById('calendarQuickSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterCalendarCards(query);
        });
    }
}

function filterCalendarCards(query) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!query || text.includes(query)) {
            card.style.display = 'block';
            card.classList.add('search-match-animated');
        } else {
            card.style.display = 'none';
            card.classList.remove('search-match-animated');
        }
    });
}

/**
 * 4. Micro-interactions & Ripple Effects on Interactive Elements
 */
function initCardMicroInteractions() {
    const clickableCards = document.querySelectorAll('.product-card, .nav-card, .stat-card, .btn');
    clickableCards.forEach(card => {
        card.addEventListener('mousedown', function (e) {
            this.style.transform = 'scale(0.98)';
        });
        card.addEventListener('mouseup', function (e) {
            this.style.transform = '';
        });
        card.addEventListener('mouseleave', function (e) {
            this.style.transform = '';
        });
    });
}
