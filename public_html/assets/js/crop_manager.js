// Foliar App - Static Crop Pages Card Editor & Persistence Manager

document.addEventListener('DOMContentLoaded', () => {
    // 1. Determine active crop ID from pathname
    const filename = window.location.pathname.split('/').pop();
    const cropId = filename.replace('.html', ''); // 'apple', 'cherry', 'apricot', 'peach'
    
    let isEditMode = false;
    let programs = {};
    let draggedCard = null;
    let wasDragged = false;

    // Load custom database from localStorage if present
    let customBkuDb = [];
    try {
        const cachedCustom = localStorage.getItem("bku_rehberi_db_v1");
        if (cachedCustom) {
            customBkuDb = JSON.parse(cachedCustom);
        }
    } catch (e) {
        console.error("Özel BKÜ veritabanı yüklenirken hata:", e);
    }

    let liveBkuDashboardDb = [];

    // Fetch custom database and live BKÜ dashboard database (5.046 items) from server
    function syncCustomBkuDb() {
        fetch('api/get_bku_custom.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    customBkuDb = data;
                    localStorage.setItem("bku_rehberi_db_v1", JSON.stringify(customBkuDb));
                }
            })
            .catch(err => console.error("Özel BKÜ veritabanı senkronizasyon hatası:", err));

        fetch('api/get_bku_data.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    liveBkuDashboardDb = data;
                    updateTargetDatalist();
                }
            })
            .catch(err => console.error("BKÜ Dashboard veritabanı senkronizasyon hatası:", err));
    }
    syncCustomBkuDb();

    function getUnifiedBkuDatabase() {
        let db = [];
        if (typeof DEFAULT_BKU_DATABASE !== 'undefined' && Array.isArray(DEFAULT_BKU_DATABASE)) {
            db = [...DEFAULT_BKU_DATABASE];
        }

        // Add live BKÜ dashboard dataset (5.046 items)
        if (Array.isArray(liveBkuDashboardDb)) {
            liveBkuDashboardDb.forEach(b => {
                const bitki = b["Bitki"] || b["bitki"] || "";
                const ad = b["Ticari İsim (Ruhsatlı Ürün)"] || b["Ticari Isim (Ruhsatli Urun)"] || b["ad"];
                const aktif = b["Aktif Madde"] || b["aktif"];
                const hedef = b["Zararlı Organizma / Hastalık"] || b["Zararli Organizma / Hastalik"] || b["hedef"] || "";
                const doz = b["Doz"] || b["dozText"] || "";
                const grup = b["FRAC / IRAC Grubu"] || b["Ruhsat Grubu"] || b["grup"] || "";

                if (bitki && ad && aktif) {
                    db.push({
                        bitki: bitki,
                        ad: ad,
                        aktif: aktif,
                        hedef: hedef,
                        dozText: doz,
                        grup: grup,
                        phi: b["Son İlaçlama - Hasat Arası Süre (PHI)"] || b["phi"] || "",
                        uyari: b["Karışabilirlik Durumu"] || b["Etki Mekanizması"] || b["uyari"] || ""
                    });
                }
            });
        }

        customBkuDb.forEach(customItem => {
            if (customItem && customItem.bitki && customItem.ad) {
                const exists = db.some(item => 
                    item.bitki.toUpperCase() === customItem.bitki.toUpperCase() && 
                    item.ad.toUpperCase() === customItem.ad.toUpperCase()
                );
                if (!exists) {
                    db.push(customItem);
                }
            }
        });
        return db;
    }

    function saveProductToCustomBku(record) {
        const existsIndex = customBkuDb.findIndex(item => 
            item.bitki.toUpperCase() === record.bitki.toUpperCase() && 
            item.ad.toUpperCase() === record.ad.toUpperCase()
        );
        
        if (existsIndex > -1) {
            customBkuDb[existsIndex] = record;
        } else {
            customBkuDb.push(record);
        }
        
        localStorage.setItem("bku_rehberi_db_v1", JSON.stringify(customBkuDb));
        
        fetch("api/save_bku_custom.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(customBkuDb)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                showToast("Ürün özel BKÜ rehberine başarıyla kaydedildi.");
            } else {
                console.error("Özel BKÜ kaydedilemedi:", data.message);
            }
        })
        .catch(err => console.error("Özel BKÜ sunucu senkronizasyon hatası:", err));
    }

    // 2. Inject CSS styles for Edit Mode UI elements
    const style = document.createElement('style');
    style.innerHTML = `
        .edit-mode-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: 20px;
            border-left: 1px solid var(--glass-border);
            padding-left: 20px;
        }
        @media (max-width: 768px) {
            .edit-mode-container {
                border-left: none;
                padding-left: 0;
                margin-left: 0;
                width: 100%;
                margin-top: 12px;
            }
        }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(255, 255, 255, 0.1);
            transition: .3s;
            border-radius: 20px;
            border: 1px solid var(--glass-border);
        }
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 12px;
            width: 12px;
            left: 3px;
            bottom: 3px;
            background-color: var(--text-secondary);
            transition: .3s;
            border-radius: 50%;
        }
        input:checked + .toggle-slider {
            background-color: rgba(46, 204, 113, 0.2);
            border-color: var(--accent-green);
        }
        input:checked + .toggle-slider:before {
            transform: translateX(20px);
            background-color: var(--accent-neon-green);
            box-shadow: 0 0 8px var(--accent-neon-green);
        }
        .edit-label {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-secondary);
            cursor: pointer;
            user-select: none;
        }
        input:checked ~ .edit-label {
            color: var(--accent-neon-green);
        }

        /* Card Actions Styling */
        .product-card {
            position: relative;
        }
        .card-actions-overlay {
            position: absolute;
            top: 8px;
            right: 8px;
            display: none;
            gap: 4px;
            z-index: 100;
        }
        .edit-mode-active .card-actions-overlay {
            display: flex;
        }
        .action-btn-custom {
            background: rgba(7, 9, 7, 0.85);
            border: 1px solid var(--glass-border);
            width: 24px;
            height: 24px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 0.72rem;
            transition: all 0.2s ease;
        }
        .action-btn-custom:hover {
            transform: scale(1.1);
        }
        .action-btn-custom.edit:hover {
            color: var(--accent-gold);
            border-color: var(--accent-gold);
        }
        .action-btn-custom.delete:hover {
            color: #e74c3c;
            border-color: #e74c3c;
        }

        /* Add Card Button Styling */
        .add-card-btn-custom {
            background: rgba(46, 204, 113, 0.15);
            border: 1.5px dashed #2ecc71;
            border-radius: var(--border-radius-sm);
            color: #ffffff;
            padding: 12px;
            text-align: center;
            font-size: 0.86rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: none;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
            width: 100%;
        }
        .edit-mode-active .add-card-btn-custom {
            display: flex;
        }
        .add-card-btn-custom:hover {
            background: rgba(46, 204, 113, 0.3);
            border-color: #00ff88;
            color: #ffffff;
            transform: translateY(-1px);
        }

        /* Toast notifications */
        .toast-container {
            position: fixed;
            top: 90px;
            right: 20px;
            z-index: 3000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .custom-toast {
            background: rgba(13, 18, 14, 0.95);
            border: 1px solid var(--accent-green);
            border-left: 5px solid var(--accent-green);
            color: var(--text-primary);
            padding: 12px 24px;
            border-radius: var(--border-radius-sm);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            font-size: 0.88rem;
            font-weight: 500;
        }
        .custom-toast.show {
            transform: translateX(0);
        }
        .custom-toast.error {
            border-color: #e74c3c;
            border-left-color: #e74c3c;
        }

        /* Drag over styles */
        .product-card.dragging {
            opacity: 0.4;
            transform: scale(0.98);
            outline: 2px dashed var(--accent-gold);
        }
        .category-group {
            transition: background-color 0.2s ease, outline 0.2s ease, box-shadow 0.2s ease;
        }
        .category-group.drag-over {
            background: rgba(46, 204, 113, 0.08);
            border-radius: var(--border-radius-sm);
            box-shadow: 0 0 12px rgba(46, 204, 113, 0.2);
            outline: 2px dashed var(--accent-green) !important;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);

    // Create Toast Container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'managerToastContainer';
    document.body.appendChild(toastContainer);

    function showToast(msg, isErr = false) {
        const toast = document.createElement('div');
        toast.className = `custom-toast ${isErr ? 'error' : ''}`;
        toast.innerHTML = `<span style="margin-right: 6px;">${isErr ? '⚠️' : '✅'}</span> <span>${msg}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // 3. Inject Edit Mode toggle switch into controls panel
    const controls = document.querySelector('.program-controls');
    if (controls) {
        const toggleWrapper = document.createElement('div');
        toggleWrapper.className = 'edit-mode-container';
        toggleWrapper.innerHTML = `
            <label class="toggle-switch">
                <input type="checkbox" id="editModeToggleCustom">
                <span class="toggle-slider"></span>
            </label>
            <span class="edit-label" id="editLabelTextCustom">Düzenleme Modu</span>
        `;
        controls.appendChild(toggleWrapper);

        document.getElementById('editModeToggleCustom').addEventListener('change', (e) => {
            isEditMode = e.target.checked;
            toggleEditModeUI();
        });

        document.getElementById('editLabelTextCustom').addEventListener('click', () => {
            const toggle = document.getElementById('editModeToggleCustom');
            toggle.checked = !toggle.checked;
            isEditMode = toggle.checked;
            toggleEditModeUI();
        });
    }

    // Inject custom BKU save checkbox inside modal form
    const modalForm = document.getElementById('edit-product-form');
    if (modalForm && !document.getElementById('save-to-bku-wrapper')) {
        const saveToBkuGroup = document.createElement('div');
        saveToBkuGroup.id = 'save-to-bku-wrapper';
        saveToBkuGroup.className = 'form-group';
        saveToBkuGroup.style.flexDirection = 'row';
        saveToBkuGroup.style.alignItems = 'center';
        saveToBkuGroup.style.gap = '8px';
        saveToBkuGroup.style.marginTop = '10px';
        saveToBkuGroup.innerHTML = `
            <input type="checkbox" id="save-to-bku-checkbox" style="width: 18px; height: 18px; cursor: pointer; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 4px;">
            <label for="save-to-bku-checkbox" style="color: #ffe082; font-size: 0.88rem; font-weight: 700; cursor: pointer; user-select: none; text-transform: none; letter-spacing: 0; margin-bottom: 0;">
                💡 Bu ürünü özel BKÜ rehberine kaydet (Daha sonra seçmek için)
            </label>
        `;
        const modalActions = modalForm.querySelector('.modal-actions');
        if (modalActions) {
            modalForm.insertBefore(saveToBkuGroup, modalActions);
        }
    }

    // Drag & Drop Handlers for Crop Cards
    function handleDragStart(e) {
        if (!isEditMode) return;
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
        wasDragged = false;
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedCard = null;
        document.querySelectorAll('.category-group').forEach(group => {
            group.classList.remove('drag-over');
        });
        wasDragged = true;
        setTimeout(() => {
            wasDragged = false;
        }, 100);
    }

    function handleDragOver(e) {
        if (!isEditMode || !draggedCard) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        if (!isEditMode || !draggedCard) return;
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        if (!isEditMode || !draggedCard) return;
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        if (!isEditMode || !draggedCard) return;
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const afterElement = getDragAfterElement(this, e.clientY);
        if (afterElement == null) {
            const addBtn = this.querySelector('.add-card-btn-custom');
            if (addBtn) {
                this.insertBefore(draggedCard, addBtn);
            } else {
                this.appendChild(draggedCard);
            }
        } else {
            this.insertBefore(draggedCard, afterElement);
        }
        
        const category = this.getAttribute('data-category');
        draggedCard.classList.remove('hastalik-card', 'zararli-card', 'besleme-card');
        draggedCard.classList.add(`${category}-card`);

        // UPDATE THE BADGE INSIDE THE DRAGGED CARD!
        const categoryBadge = draggedCard.querySelector('.category-badge');
        if (categoryBadge) {
            categoryBadge.className = `category-badge badge-${category}`;
            categoryBadge.innerHTML = category === 'hastalik' ? '🛡️ Hastalık Yönetimi' : (category === 'zararli' ? '🐛 Zararlı Yönetimi' : '🌱 Yaprak Besleme');
        }


        saveProgramDOMToServer();
        if (typeof calculateDoses === 'function') {
            calculateDoses();
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.product-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Initialize Edit/Delete overlays and Add buttons
    function initCardsWithActions() {
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            // Setup Drag & Drop attributes
            if (isEditMode) {
                card.setAttribute('draggable', 'true');
            } else {
                card.removeAttribute('draggable');
            }
            
            if (!card.dataset.dragBound) {
                card.addEventListener('dragstart', handleDragStart);
                card.addEventListener('dragend', handleDragEnd);
                card.dataset.dragBound = 'true';
            }

            // Extract and clean tankGroup from target if it exists (for legacy support)
            let targetVal = card.getAttribute('data-card-target') || card.querySelector('.product-name')?.innerText.trim() || '';
            let tankGroupVal = card.getAttribute('data-tank-group') || '1';
            
            const match = targetVal.match(/^(\d+)[\-.\s]+(.*)$/);
            if (match) {
                tankGroupVal = match[1];
                targetVal = match[2];
                
                // Update DOM elements
                card.setAttribute('data-card-target', targetVal);
                card.setAttribute('data-tank-group', tankGroupVal);
                const nameEl = card.querySelector('.product-name');
                if (nameEl) nameEl.textContent = targetVal;
            }

            // Create badges container if it doesn't exist
            let badgeContainer = card.querySelector('.badges-wrapper-custom');
            if (!badgeContainer) {
                badgeContainer = document.createElement('div');
                badgeContainer.className = 'badges-wrapper-custom';
                badgeContainer.style.display = 'flex';
                badgeContainer.style.gap = '6px';
                badgeContainer.style.flexWrap = 'wrap';
                badgeContainer.style.marginBottom = '8px';
                card.insertBefore(badgeContainer, card.firstChild);
            }
            
            // Render category
            let category = 'hastalik';
            if (card.classList.contains('zararli-card')) category = 'zararli';
            else if (card.classList.contains('besleme-card')) category = 'besleme';
            else {
                const parentGroup = card.closest('.category-group');
                if (parentGroup) category = parentGroup.getAttribute('data-category') || 'hastalik';
            }
            
            // Rebuild badges innerHTML
            const tankBadgeHtml = `<span class="tank-badge tank-group-${tankGroupVal}">${tankGroupVal}. Uygulama (Tank ${tankGroupVal})</span>`;
            const categoryBadgeHtml = `<span class="category-badge badge-${category}">${category === 'hastalik' ? '🛡️ Hastalık Yönetimi' : (category === 'zararli' ? '🐛 Zararlı Yönetimi' : '🌱 Yaprak Besleme')}</span>`;
            badgeContainer.innerHTML = tankBadgeHtml + categoryBadgeHtml;

            // Check if action overlay already exists
            if (card.querySelector('.card-actions-overlay')) return;
            
            const overlay = document.createElement('div');
            overlay.className = 'card-actions-overlay';
            overlay.innerHTML = `
                <button type="button" class="action-btn-custom edit" title="Kartı Düzenle">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button type="button" class="action-btn-custom delete" title="Kartı Sil">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            
            // Delete button behavior
            overlay.querySelector('.delete').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm("Bu ilacı/gübreyi listeden silmek istediğinizden emin misiniz?")) {
                    card.remove();
                    saveProgramDOMToServer();
                    if (typeof calculateDoses === 'function') calculateDoses();
                }
            });
            
            // Edit button behavior (triggers delegated click on card which opens edit modal)
            overlay.querySelector('.edit').addEventListener('click', (e) => {
                e.stopPropagation();
                card.click();
            });
            
            card.appendChild(overlay);
        });

        // Add Card buttons
        const catGroups = document.querySelectorAll('.category-group');
        catGroups.forEach(cat => {
            if (cat.querySelector('.add-card-btn-custom')) return;
            
            const addBtn = document.createElement('div');
            addBtn.className = 'add-card-btn-custom';
            addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Yeni İlaç/Gübre Ekle`;
            
            addBtn.addEventListener('click', () => {
                const category = cat.getAttribute('data-category');
                
                // Create dummy card
                const dummy = document.createElement('div');
                dummy.className = `product-card ${category}-card`;
                dummy.setAttribute('data-base-dose', '100');
                dummy.setAttribute('data-dose-unit', 'ml');
                dummy.setAttribute('data-dose-per', '100');
                
                dummy.innerHTML = `
                    <h5 class="product-name">Yeni Ürün</h5>
                    <span class="product-active">Etken: Belirtilmedi</span>
                    <div class="product-dose-wrapper">
                        <span class="product-dose-label">Doz:</span>
                        <span class="product-dose-value">100 ml / 100 L su</span>
                    </div>
                    <div class="calc-result">
                        <span>Depo için:</span>
                        <span class="calc-val">0</span> <span class="calc-unit">ml</span>
                    </div>
                `;
                
                cat.insertBefore(dummy, addBtn);
                
                // Re-bind overlay
                initCardsWithActions();
                
                // Open modal on dummy
                dummy.click();
            });
            
            cat.appendChild(addBtn);
        });
    }

    function toggleEditModeUI() {
        const table = document.getElementById('table-container');
        if (!table) return;
        if (isEditMode) {
            table.classList.add('edit-mode-active');
        } else {
            table.classList.remove('edit-mode-active');
        }

        // Re-initialize cards to set/remove draggable attributes
        initCardsWithActions();
    }

    // Dynamic insertion of Target field in the pre-existing modal
    const prodNameInput = document.getElementById('edit-prod-name');
    if (prodNameInput) {
        const prodNameGroup = prodNameInput.parentElement;
        
        // Relabel Ürün/İlaç Adı field to Commercial Product Name
        const label = prodNameGroup.querySelector('label');
        if (label) {
            label.textContent = "Ticari İlaç / Ürün Adı";
        }
        prodNameInput.placeholder = "Örn: Kocide 2000 (Opsiyonel)";
        prodNameInput.removeAttribute('required'); // Make product name optional
        
        // Add Target input field at the beginning
        if (!document.getElementById('edit-prod-target')) {
            const targetGroup = document.createElement('div');
            targetGroup.className = 'form-group';
            targetGroup.innerHTML = `
                <label for="edit-prod-target">Hedef Hastalık / Zararlı / Amaç</label>
                <input type="text" id="edit-prod-target" list="cropPestTargetDatalist" required placeholder="Örn: Karaleke, İçkurdu, Monilya, Külleme vb.">
            `;
            prodNameGroup.parentElement.insertBefore(targetGroup, prodNameGroup);
        }

        const targetInputEl = document.getElementById('edit-prod-target');
        if (targetInputEl && !targetInputEl.dataset.bkuBound) {
            targetInputEl.setAttribute('list', 'cropPestTargetDatalist');
            const triggerUpdate = () => {
                const currentTarget = targetInputEl.value;
                const currentActive = document.getElementById('edit-prod-active')?.value || '';
                const searchVal = document.getElementById('edit-prod-bku-search')?.value || '';
                updateBkuDropdown(currentTarget, currentActive, searchVal);
            };
            targetInputEl.addEventListener('input', triggerUpdate);
            targetInputEl.addEventListener('change', triggerUpdate);
            targetInputEl.addEventListener('focus', () => {
                updateTargetDatalist();
                triggerUpdate();
            });
            targetInputEl.dataset.bkuBound = 'true';
        }

        // Add Tank Group selection field
        if (!document.getElementById('edit-prod-tank-group')) {
            const tankGroupDiv = document.createElement('div');
            tankGroupDiv.className = 'form-group';
            tankGroupDiv.innerHTML = `
                <label for="edit-prod-tank-group">Uygulama / Tank Sırası</label>
                <select id="edit-prod-tank-group" style="width: 100%;">
                    <option value="1">1. Uygulama (Tank 1)</option>
                    <option value="2">2. Uygulama (Tank 2)</option>
                    <option value="3">3. Uygulama (Tank 3)</option>
                    <option value="4">4. Uygulama (Tank 4)</option>
                </select>
            `;
            const targetInput = document.getElementById('edit-prod-target');
            if (targetInput) {
                targetInput.parentElement.insertAdjacentElement('afterend', tankGroupDiv);
            } else {
                prodNameGroup.parentElement.insertBefore(tankGroupDiv, prodNameGroup);
            }
        }

        // Add BKU search input field above the recommendations select
        const recommendSelect = document.getElementById('edit-prod-recommend');
        if (recommendSelect && !document.getElementById('edit-prod-bku-search')) {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id = 'edit-prod-bku-search';
            searchInput.placeholder = '🔍 İlaç adı, etken madde veya hedef ara...';
            searchInput.style.width = '100%';
            searchInput.style.padding = '8px 12px';
            searchInput.style.marginBottom = '8px';
            searchInput.style.borderRadius = 'var(--border-radius-sm)';
            searchInput.style.border = '1px solid var(--glass-border)';
            searchInput.style.background = 'rgba(255, 255, 255, 0.05)';
            searchInput.style.color = 'var(--text-primary)';
            searchInput.style.fontSize = '0.84rem';

            recommendSelect.parentElement.insertBefore(searchInput, recommendSelect);

            searchInput.addEventListener('input', (e) => {
                const currentTarget = document.getElementById('edit-prod-target')?.value || '';
                const currentActive = document.getElementById('edit-prod-active')?.value || '';
                updateBkuDropdown(currentTarget, currentActive, e.target.value);
            });
        }

        // Bind auto-fill change listener on recommend select
        if (recommendSelect && !recommendSelect.dataset.autoFillBound) {
            recommendSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (!val) return;
                try {
                    const item = JSON.parse(val);
                    const nameInput = document.getElementById('edit-prod-name');
                    const activeInput = document.getElementById('edit-prod-active');
                    const doseInput = document.getElementById('edit-prod-dose');
                    const unitInput = document.getElementById('edit-prod-unit');
                    const perInput = document.getElementById('edit-prod-per');
                    const info = document.getElementById('bku-recommend-info');

                    if (nameInput && item.ad) nameInput.value = item.ad;
                    if (activeInput && item.aktif) activeInput.value = item.aktif;

                    if (item.dozDeger) {
                        if (doseInput) doseInput.value = item.dozDeger;
                        if (unitInput && item.dozBirim) unitInput.value = item.dozBirim;
                        if (perInput && item.dozHacim) perInput.value = item.dozHacim;
                    } else if (item.dozText) {
                        const match = item.dozText.match(/([\d\.,]+)\s*(ml|g|gr|kg|l|lt)\s*\/?\s*([\d]*)/i);
                        if (match) {
                            if (doseInput) doseInput.value = match[1].replace(',', '.');
                            if (unitInput) unitInput.value = match[2].toLowerCase() === 'gr' ? 'g' : (match[2].toLowerCase() === 'lt' ? 'l' : match[2]);
                            if (perInput && match[3]) perInput.value = match[3] || 100;
                        }
                    }

                    if (info) {
                        const phiText = item.phi ? ` | Hasat Arası (PHI): <strong>${item.phi} Gün</strong>` : '';
                        const uyariText = item.uyari ? `<br><span style="color:var(--accent-gold); font-weight:600;">${item.uyari}</span>` : '';
                        info.innerHTML = `✅ <strong>${item.ad}</strong> seçildi. Dozaj: <strong>${item.dozText || 'Belirtilmedi'}</strong>${phiText}${uyariText}`;
                    }
                } catch (err) {
                    console.error("Tavsiye seçim hatası:", err);
                }
            });
            recommendSelect.dataset.autoFillBound = 'true';
        }
    }

    function updateTargetDatalist() {
        let datalist = document.getElementById('cropPestTargetDatalist');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'cropPestTargetDatalist';
            document.body.appendChild(datalist);
        }

        const cropKeyMap = {
            apple: 'ELMA',
            cherry: 'KİRAZ',
            apricot: 'KAYISI',
            peach: 'ŞEFTALİ'
        };
        const pagePlant = cropKeyMap[cropId] || 'ELMA';
        const db = getUnifiedBkuDatabase();

        const targetsMap = new Map();
        db.forEach(item => {
            const itemPlant = (item.bitki || '').toUpperCase();
            if (itemPlant.includes(pagePlant) || pagePlant.includes(itemPlant) || (pagePlant === 'KİRAZ' && itemPlant.includes('KIRAZ')) || (pagePlant === 'ŞEFTALİ' && itemPlant.includes('ŞEFTAL'))) {
                const target = item.hedef;
                if (target && target !== 'Zararlı Yok (-)' && target.length > 2) {
                    const key = target.toLowerCase().trim();
                    if (!targetsMap.has(key)) {
                        targetsMap.set(key, target.trim());
                    }
                }
            }
        });

        datalist.innerHTML = Array.from(targetsMap.values())
            .sort()
            .map(t => `<option value="${t}">`)
            .join('');
    }

    function trNormalize(str) {
        if (!str) return '';
        return str.toString()
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .trim();
    }

    function updateBkuDropdown(cardTarget, cardActive, query = '') {
        const select = document.getElementById('edit-prod-recommend');
        const info = document.getElementById('bku-recommend-info');
        const db = getUnifiedBkuDatabase();
        if (!select || db.length === 0) return;

        const cropKeyMap = {
            apple: 'ELMA',
            cherry: 'KİRAZ',
            apricot: 'KAYISI',
            peach: 'ŞEFTALİ'
        };
        const pagePlant = cropKeyMap[cropId] || 'ELMA';

        const normQuery = trNormalize(query);
        const normTarget = trNormalize(cardTarget);
        const normActive = trNormalize(cardActive);

        const allPlantItems = db.filter(item => {
            const itemPlant = trNormalize(item.bitki);
            const pageNorm = trNormalize(pagePlant);
            return itemPlant.includes(pageNorm) || pageNorm.includes(itemPlant);
        });

        let filteredItems = [];
        if (normQuery) {
            filteredItems = allPlantItems.filter(item => {
                const nameMatch = trNormalize(item.ad).includes(normQuery);
                const activeMatch = trNormalize(item.aktif).includes(normQuery);
                const targetMatch = trNormalize(item.hedef).includes(normQuery);
                const groupMatch = trNormalize(item.grup).includes(normQuery);
                return nameMatch || activeMatch || targetMatch || groupMatch;
            });
            if (info) {
                info.textContent = `"${query}" arama sonucu için ${filteredItems.length} kayıt listelendi.`;
            }
        } else if (normTarget || normActive) {
            filteredItems = allPlantItems.filter(item => {
                const dbTarget = trNormalize(item.hedef);
                const dbActive = trNormalize(item.aktif);

                const targetMatches = normTarget && (
                    normTarget.includes(dbTarget) || 
                    dbTarget.includes(normTarget) ||
                    normTarget.split(/[\s,\.\(\)\-]+/).some(word => word.length >= 3 && dbTarget.includes(word)) ||
                    dbTarget.split(/[\s,\.\(\)\-]+/).some(word => word.length >= 3 && normTarget.includes(word))
                );
                
                const activeMatches = normActive && (normActive.includes(dbActive) || dbActive.includes(normActive));

                return targetMatches || activeMatches;
            });

            if (filteredItems.length > 0) {
                if (info) {
                    info.textContent = `💡 "${cardTarget}" hedef zararlı/hastalığı için veritabanında ${filteredItems.length} adet ruhsatlı BKÜ tavsiyesi eşleşti. Seçerek otomatik doldurabilirsiniz.`;
                }
            } else {
                filteredItems = allPlantItems.slice(0, 150);
                if (info) {
                    if (normTarget) {
                        info.textContent = `ℹ️ "${cardTarget}" için özel hedef eşleşmesi bulunamadı. BKÜ Dashboard listesinden ${pagePlant.toLowerCase()} ruhsatlı ilk 150 ilaç listelenmiştir. Arama yapabilirsiniz.`;
                    } else {
                        info.textContent = `ℹ️ "Hedef Hastalık / Zararlı" alanından hastalık veya zararlı ismi seçtiğinizde BKÜ Dashboard listesinden tavsiye edilen ruhsatlı ilaçlar listelenecektir.`;
                    }
                }
            }
        } else {
            filteredItems = allPlantItems.slice(0, 150);
            if (info) {
                info.textContent = `ℹ️ "Hedef Hastalık / Zararlı" alanından hastalık veya zararlı ismi seçtiğinizde BKÜ Dashboard listesinden tavsiye edilen ruhsatlı ilaçlar listelenecektir.`;
            }
        }

        const countText = filteredItems.length > 0 ? ` (${filteredItems.length} Adet İlaç Listelendi)` : '';
        select.innerHTML = `<option value="">-- BKÜ Dashboard Listesinden Ruhsatlı İlaç Seçin${countText} --</option>`;

        const seenKeys = new Set();
        const uniqueItems = [];
        filteredItems.forEach(item => {
            const key = `${(item.ad || '').trim().toUpperCase()}_${(item.aktif || '').trim().toUpperCase()}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueItems.push(item);
            }
        });

        uniqueItems.forEach(item => {
            const option = document.createElement('option');
            option.value = JSON.stringify(item);
            const dozInfo = item.dozText ? ` - Doz: ${item.dozText}` : '';
            const hedefInfo = item.hedef ? ` [${item.hedef}]` : '';
            option.textContent = `🛡️ ${item.ad} (${item.aktif})${dozInfo}${hedefInfo}`;
            select.appendChild(option);
        });
    }

    // Intercept card clicks in capture phase to prevent editing when edit mode is disabled or dragging completed
    const slider = document.getElementById('table-container');
    if (slider) {
        slider.addEventListener('mousedown', (e) => {
            if (isEditMode && e.target.closest('.product-card')) {
                // Prevent grab-to-scroll when dragging cards in edit mode
                e.stopPropagation();
            }
        }, true); // capturing phase

        slider.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                if (!isEditMode || wasDragged) {
                    // Stop propagation to prevent opening the edit modal
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }, true); // capturing phase

        // Intercept card clicks to populate the new Target field in the modal
        slider.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card || !isEditMode || wasDragged) return;
            
            // Add editing-card helper class to identify the active card being edited
            document.querySelectorAll('.product-card').forEach(c => c.classList.remove('editing-card'));
            card.classList.add('editing-card');

            // Reset the custom BKU save checkbox
            const chk = document.getElementById('save-to-bku-checkbox');
            if (chk) chk.checked = false;
            
            // Wait 50ms for original delegated click handler in the page to finish populating
            setTimeout(() => {
                let target = card.getAttribute('data-card-target') || card.querySelector('.product-name')?.innerText.trim() || '';
                const name = card.getAttribute('data-card-name') || '';
                const active = card.getAttribute('data-card-active') || card.querySelector('.product-active')?.innerText.replace('Etken:', '').replace('Etken: ', '').trim() || '';
                
                let tankGroupVal = card.getAttribute('data-tank-group') || '1';
                
                // Parse legacy prefixes if still present
                const match = target.match(/^(\d+)[\-.\s]+(.*)$/);
                if (match) {
                    tankGroupVal = match[1];
                    target = match[2];
                }
                
                const targetInput = document.getElementById('edit-prod-target');
                const nameInput = document.getElementById('edit-prod-name');
                const activeInput = document.getElementById('edit-prod-active');
                const tankGroupInput = document.getElementById('edit-prod-tank-group');
                
                if (targetInput) targetInput.value = target;
                if (nameInput) nameInput.value = name;
                if (activeInput) activeInput.value = active;
                if (tankGroupInput) tankGroupInput.value = tankGroupVal;

                // Clear the search input
                const searchInput = document.getElementById('edit-prod-bku-search');
                if (searchInput) {
                    searchInput.value = '';
                }
                
                // Trigger dropdown recommendation update if needed
                if (nameInput) {
                    nameInput.dispatchEvent(new Event('input'));
                }
            }, 60);
        });

        // Remove editing-card class on cancel/close
        const closeModalButtons = ['modal-close-x', 'btn-modal-cancel', 'edit-modal-overlay'];
        closeModalButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    // Only trigger if clicking close button, cancel button, or the backdrop of the overlay itself
                    if (id === 'edit-modal-overlay' && e.target !== btn) return;
                    document.querySelectorAll('.product-card.editing-card').forEach(c => c.classList.remove('editing-card'));
                });
            }
        });
    }

    // Intercept edit form submit to rebuild DOM card attributes and visual text
    const editForm = document.getElementById('edit-product-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            // Retrieve activeCard from global scope of the page (original script sets it)
            // Wait 10ms for original submit handler to complete, then override DOM
            setTimeout(() => {
                let targetVal = document.getElementById('edit-prod-target').value.trim();
                const nameVal = document.getElementById('edit-prod-name').value.trim();
                const activeVal = document.getElementById('edit-prod-active').value.trim();
                const tankGroupVal = document.getElementById('edit-prod-tank-group')?.value || '1';

                // Clean manual prefix if user typed it
                const match = targetVal.match(/^(\d+)[\-.\s]+(.*)$/);
                if (match) {
                    targetVal = match[2];
                }

                const activeCard = document.querySelector('.product-card.editing-card');
                
                if (activeCard) {
                    activeCard.setAttribute('data-card-target', targetVal);
                    activeCard.setAttribute('data-card-name', nameVal);
                    activeCard.setAttribute('data-card-active', activeVal);
                    activeCard.setAttribute('data-tank-group', tankGroupVal);
                    
                    const nameEl = activeCard.querySelector('.product-name');
                    const activeEl = activeCard.querySelector('.product-active');
                    
                    if (nameEl) nameEl.textContent = targetVal;

                    // Re-render badges inside badges-wrapper-custom
                    let badgeContainer = activeCard.querySelector('.badges-wrapper-custom');
                    if (!badgeContainer) {
                        badgeContainer = document.createElement('div');
                        badgeContainer.className = 'badges-wrapper-custom';
                        badgeContainer.style.display = 'flex';
                        badgeContainer.style.gap = '6px';
                        badgeContainer.style.flexWrap = 'wrap';
                        badgeContainer.style.marginBottom = '8px';
                        activeCard.insertBefore(badgeContainer, activeCard.firstChild);
                    }
                    
                    let category = 'hastalik';
                    if (activeCard.classList.contains('zararli-card')) category = 'zararli';
                    else if (activeCard.classList.contains('besleme-card')) category = 'besleme';
                    else {
                        const parentGroup = activeCard.closest('.category-group');
                        if (parentGroup) category = parentGroup.getAttribute('data-category') || 'hastalik';
                    }
                    
                    const tankBadgeHtml = `<span class="tank-badge tank-group-${tankGroupVal}">${tankGroupVal}. Uygulama (Tank ${tankGroupVal})</span>`;
                    const categoryBadgeHtml = `<span class="category-badge badge-${category}">${category === 'hastalik' ? '🛡️ Hastalık Yönetimi' : (category === 'zararli' ? '🐛 Zararlı Yönetimi' : '🌱 Yaprak Besleme')}</span>`;
                    badgeContainer.innerHTML = tankBadgeHtml + categoryBadgeHtml;
                    
                    if (activeEl) {
                        let activeText = '';
                        if (nameVal && activeVal) {
                            activeText = `İlaç: ${nameVal} (Etken: ${activeVal})`;
                        } else if (nameVal) {
                            activeText = `İlaç: ${nameVal}`;
                        } else if (activeVal) {
                            activeText = `Etken: ${activeVal}`;
                        }
                        
                        if (activeText) {
                            activeEl.style.display = 'block';
                            activeEl.textContent = activeText;
                        } else {
                            activeEl.style.display = 'none';
                            activeEl.textContent = '';
                        }
                    }

                    // Save custom product details to custom BKU database if checkbox is checked
                    const saveToBkuCheckbox = document.getElementById('save-to-bku-checkbox');
                    if (saveToBkuCheckbox && saveToBkuCheckbox.checked && nameVal) {
                        const cropKeyMap = {
                            apple: 'ELMA',
                            cherry: 'KİRAZ',
                            apricot: 'KAYISI',
                            peach: 'ŞEFTALİ'
                        };
                        const pagePlant = cropKeyMap[cropId] || 'ELMA';
                        
                        const isCalcCard = activeCard.hasAttribute('data-base-dose');
                        let doseVal = 0;
                        let unitVal = 'g';
                        let perVal = 100;
                        let dozText = 'Uygulama Yapılmaz';

                        if (isCalcCard) {
                            doseVal = parseFloat(document.getElementById('edit-prod-dose').value) || 0;
                            unitVal = document.getElementById('edit-prod-unit').value || 'g';
                            perVal = parseFloat(document.getElementById('edit-prod-per').value) || 100;
                            dozText = `${doseVal} ${unitVal} / ${perVal} L su`;
                        } else {
                            const descVal = document.getElementById('edit-prod-desc').value.trim();
                            dozText = descVal || 'Bilgilendirme Notu';
                        }

                        const customRecord = {
                            bitki: pagePlant,
                            ad: nameVal.toUpperCase(),
                            aktif: activeVal,
                            grup: 'ÖZEL',
                            hedef: targetVal,
                            dozText: dozText,
                            dozDeger: doseVal,
                            dozBirim: unitVal,
                            dozHacim: perVal,
                            dozTip: 'hektolitre',
                            phi: 0,
                            tarih: new Date().toISOString().split('T')[0],
                            uyari: 'Kart düzenleyiciden özel eklenmiştir.'
                        };

                        saveProductToCustomBku(customRecord);
                    }

                    activeCard.classList.remove('editing-card');
                }
                
                saveProgramDOMToServer();
            }, 120);
        });
    }

    // 4. Load saved cards from server and render them dynamically
    function loadSavedCards() {
        fetch('api/get_programs.php')
            .then(res => res.json())
            .then(data => {
                programs = data;
                
                if (programs[cropId] && programs[cropId].stages && programs[cropId].stages.length > 0) {
                    // Replace DOM cards with server cards
                    renderCardsFromDatabase(programs[cropId].stages);
                } else {
                    // Initialize database with static crop template parsed from the DOM
                    saveProgramDOMToServer();
                }
            })
            .catch(err => {
                console.error("Dinamik kartlar yüklenirken hata:", err);
                showToast("Kart veritabanı yüklenemedi. Çevrimdışı çalışılıyor.", true);
                initCardsWithActions();
            });
    }

    function renderCardsFromDatabase(stages) {
        stages.forEach(stage => {
            const col = document.getElementById(`col-stage-${stage.id}`);
            if (!col) return;
            
            ['hastalik', 'zararli', 'besleme'].forEach(cat => {
                const catGroup = col.querySelector(`.category-group[data-category="${cat}"]`);
                if (!catGroup) return;
                
                // Remove existing cards
                catGroup.querySelectorAll('.product-card').forEach(c => c.remove());
                
                // Render cards from DB
                const cardsList = stage[cat] || [];
                cardsList.forEach(card => {
                    const cardEl = createCardElement(card, cat);
                    catGroup.appendChild(cardEl);
                });
            });
        });
        
        // Add add-card buttons and edit/delete overlay actions
        initCardsWithActions();
        
        // Recalculate doses
        if (typeof calculateDoses === 'function') {
            calculateDoses();
        }
    }

    function createCardElement(card, category) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `product-card ${category}-card`;
        
        let targetVal = card.target || card.name || '';
        const nameVal = card.target ? (card.name || '') : '';
        const activeVal = card.active || '';
        
        // Retrieve or parse tankGroup
        let tankGroupVal = card.tankGroup || '1';
        const match = targetVal.match(/^(\d+)[\-.\s]+(.*)$/);
        if (match) {
            tankGroupVal = match[1];
            targetVal = match[2]; // clean it up!
        }
        
        cardDiv.setAttribute('data-card-target', targetVal);
        cardDiv.setAttribute('data-card-name', nameVal);
        cardDiv.setAttribute('data-card-active', activeVal);
        cardDiv.setAttribute('data-tank-group', tankGroupVal);
        
        let subtitleText = '';
        if (nameVal && activeVal) {
            subtitleText = `İlaç: ${nameVal} (Etken: ${activeVal})`;
        } else if (nameVal) {
            subtitleText = `İlaç: ${nameVal}`;
        } else if (activeVal) {
            subtitleText = `Etken: ${activeVal}`;
        }
        
        const tankBadgeHtml = `<span class="tank-badge tank-group-${tankGroupVal}">${tankGroupVal}. Uygulama (Tank ${tankGroupVal})</span>`;
        const categoryBadgeHtml = `<span class="category-badge badge-${category}">${category === 'hastalik' ? '🛡️ Hastalık Yönetimi' : (category === 'zararli' ? '🐛 Zararlı Yönetimi' : '🌱 Yaprak Besleme')}</span>`;
        const badgesHtml = `<div class="badges-wrapper-custom" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">${tankBadgeHtml}${categoryBadgeHtml}</div>`;
        
        if (card.type === 'calc') {
            cardDiv.setAttribute('data-base-dose', card.baseDose);
            cardDiv.setAttribute('data-dose-unit', card.doseUnit);
            cardDiv.setAttribute('data-dose-per', card.dosePer);
            
            cardDiv.innerHTML = `
                ${badgesHtml}
                <h5 class="product-name">${targetVal}</h5>
                <span class="product-active" style="${subtitleText ? '' : 'display:none;'}">${subtitleText}</span>
                <div class="product-dose-wrapper">
                    <span class="product-dose-label">Doz:</span>
                    <span class="product-dose-value">${card.baseDose} ${card.doseUnit} / ${card.dosePer} L su</span>
                </div>
                <div class="calc-result">
                    <span>Depo için:</span>
                    <span class="calc-val">0</span> <span class="calc-unit">${card.doseUnit}</span>
                </div>
            `;
        } else {
            // Info card
            cardDiv.style.opacity = '0.85';
            
            cardDiv.innerHTML = `
                ${badgesHtml}
                <h5 class="product-name" style="color: var(--text-secondary);">${targetVal}</h5>
                <span class="product-active" style="${subtitleText ? '' : 'display:none;'}">${subtitleText}</span>
                <p style="font-size: 0.72rem; color: var(--text-tertiary); line-height: 1.3;">${card.description || ''}</p>
                <div class="calc-result" style="border-top:none;">
                    <span style="color:var(--accent-gold); font-weight:700;">${card.calcLabel || 'UYGULAMA YAPILMAZ'}</span>
                </div>
            `;
        }
        
        return cardDiv;
    }

    // 5. Serialize current page state and save to server
    function saveProgramDOMToServer() {
        const progData = {
            title: document.querySelector('.hero-title')?.innerText.replace(/\n/g, ' ').trim() || '',
            subtitle: document.querySelector('.hero-subtitle')?.innerText.trim() || '',
            badge: document.querySelector('.hero-badge')?.innerText.trim() || '',
            emoji: cropId === 'apple' ? '🍏' : (cropId === 'cherry' ? '🍒' : (cropId === 'apricot' ? '🍊' : '🍑')),
            guidelines: Array.from(document.querySelectorAll('.guideline-list li')).map(li => {
                return li.querySelector('.guideline-item-container') ? li.querySelector('.guideline-item-container').firstElementChild.innerHTML : li.innerHTML;
            }),
            stages: []
        };
        
        const cols = document.querySelectorAll('.table-column');
        cols.forEach(col => {
            const colId = col.id;
            if (!colId || !colId.startsWith('col-stage-')) return;
            
            const stageNum = parseInt(colId.replace('col-stage-', ''), 10);
            const stageTitle = col.querySelector('.stage-title')?.innerText.trim() || '';
            const stageTime = col.querySelector('.stage-time')?.innerText.trim() || '';
            const image = col.querySelector('.col-image')?.getAttribute('src') || '';
            
            const stageNav = document.querySelector(`.stage-nav-item[data-stage="${stageNum}"]`);
            const shortName = stageNav ? stageNav.innerText.replace(/^\d+/, '').trim() : stageTitle;
            
            const stageData = {
                id: stageNum,
                shortName: shortName,
                title: stageTitle,
                time: stageTime,
                image: image,
                hastalik: [],
                zararli: [],
                besleme: []
            };
            
            ['hastalik', 'zararli', 'besleme'].forEach(cat => {
                const group = col.querySelector(`.category-group[data-category="${cat}"]`);
                if (!group) return;
                
                const cards = group.querySelectorAll('.product-card');
                cards.forEach(card => {
                    const target = card.getAttribute('data-card-target') || card.querySelector('.product-name')?.innerText.trim() || '';
                    const name = card.getAttribute('data-card-name') || '';
                    const active = card.getAttribute('data-card-active') || card.querySelector('.product-active')?.innerText.replace('Etken:', '').replace('Etken: ', '').trim() || '';
                    
                    if (card.hasAttribute('data-base-dose')) {
                        // Calc card
                        stageData[cat].push({
                            target: target,
                            name: name,
                            active: active,
                            type: 'calc',
                            baseDose: parseFloat(card.getAttribute('data-base-dose')),
                            doseUnit: card.getAttribute('data-dose-unit') || 'g',
                            dosePer: parseFloat(card.getAttribute('data-dose-per')) || 100,
                            tankGroup: parseInt(card.getAttribute('data-tank-group') || '1', 10)
                        });
                    } else {
                        // Info card
                        const desc = card.querySelector('p')?.innerText.trim() || '';
                        const calcLabel = card.querySelector('.calc-result span')?.innerText.trim() || 'UYGULAMA YAPILMAZ';
                        
                        stageData[cat].push({
                            target: target,
                            name: name,
                            active: active,
                            type: 'info',
                            description: desc,
                            calcLabel: calcLabel,
                            tankGroup: parseInt(card.getAttribute('data-tank-group') || '1', 10)
                        });
                    }
                });
            });
            
            progData.stages.push(stageData);
        });
        
        // Update local object
        programs[cropId] = progData;
        
        // Save to server
        fetch('api/save_programs.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(programs)
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                showToast("Değişiklikler sunucuya kaydedildi.");
            } else {
                console.error("Kaydetme hatası:", res.message);
                showToast("Kaydetme başarısız: " + res.message, true);
            }
        })
        .catch(err => {
            console.error("Ağ hatası:", err);
            showToast("İnternet bağlantı hatası. Kayıt ertelendi.", true);
        });
    }

    // Load dynamic data immediately
    loadSavedCards();

    // Bind Drag & Drop event listeners to category groups once on load
    const categoryGroups = document.querySelectorAll('.category-group');
    categoryGroups.forEach(group => {
        group.addEventListener('dragover', handleDragOver);
        group.addEventListener('dragenter', handleDragEnter);
        group.addEventListener('dragleave', handleDragLeave);
        group.addEventListener('drop', handleDrop);
    });
});

// Global Event Delegation for Edit Modal Target Input & BKU Search & Selection (Guarantees execution everywhere)
document.addEventListener('input', (e) => {
    if (e.target && (e.target.id === 'edit-prod-target' || e.target.id === 'edit-prod-bku-search')) {
        const targetVal = document.getElementById('edit-prod-target')?.value || '';
        const activeVal = document.getElementById('edit-prod-active')?.value || '';
        const searchVal = document.getElementById('edit-prod-bku-search')?.value || '';
        if (typeof updateBkuDropdown === 'function') {
            updateBkuDropdown(targetVal, activeVal, searchVal);
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.target && (e.target.id === 'edit-prod-target' || e.target.id === 'edit-prod-bku-search')) {
        const targetVal = document.getElementById('edit-prod-target')?.value || '';
        const activeVal = document.getElementById('edit-prod-active')?.value || '';
        const searchVal = document.getElementById('edit-prod-bku-search')?.value || '';
        if (typeof updateBkuDropdown === 'function') {
            updateBkuDropdown(targetVal, activeVal, searchVal);
        }
    }
});

document.addEventListener('focusin', (e) => {
    if (e.target && e.target.id === 'edit-prod-target') {
        if (typeof updateTargetDatalist === 'function') updateTargetDatalist();
        const targetVal = e.target.value;
        const activeVal = document.getElementById('edit-prod-active')?.value || '';
        const searchVal = document.getElementById('edit-prod-bku-search')?.value || '';
        if (typeof updateBkuDropdown === 'function') {
            updateBkuDropdown(targetVal, activeVal, searchVal);
        }
    }
});

document.addEventListener('change', (e) => {
    if (e.target && (e.target.id === 'edit-prod-target' || e.target.id === 'edit-prod-bku-search')) {
        const targetVal = document.getElementById('edit-prod-target')?.value || '';
        const activeVal = document.getElementById('edit-prod-active')?.value || '';
        const searchVal = document.getElementById('edit-prod-bku-search')?.value || '';
        if (typeof updateBkuDropdown === 'function') {
            updateBkuDropdown(targetVal, activeVal, searchVal);
        }
    }

    if (e.target && e.target.id === 'edit-prod-recommend') {
        const val = e.target.value;
        if (!val) return;
        try {
            const item = JSON.parse(val);
            const nameInput = document.getElementById('edit-prod-name');
            const activeInput = document.getElementById('edit-prod-active');
            const doseInput = document.getElementById('edit-prod-dose');
            const unitInput = document.getElementById('edit-prod-unit');
            const perInput = document.getElementById('edit-prod-per');
            const info = document.getElementById('bku-recommend-info');

            if (nameInput && item.ad) nameInput.value = item.ad;
            if (activeInput && item.aktif) activeInput.value = item.aktif;

            if (item.dozDeger) {
                if (doseInput) doseInput.value = item.dozDeger;
                if (unitInput && item.dozBirim) unitInput.value = item.dozBirim;
                if (perInput && item.dozHacim) perInput.value = item.dozHacim;
            } else if (item.dozText) {
                const match = item.dozText.match(/([\d\.,]+)\s*(ml|g|gr|kg|l|lt)\s*\/?\s*([\d]*)/i);
                if (match) {
                    if (doseInput) doseInput.value = match[1].replace(',', '.');
                    if (unitInput) unitInput.value = match[2].toLowerCase() === 'gr' ? 'g' : (match[2].toLowerCase() === 'lt' ? 'l' : match[2]);
                    if (perInput && match[3]) perInput.value = match[3] || 100;
                }
            }

            if (info) {
                const phiText = item.phi ? ` | Hasat Arası (PHI): <strong>${item.phi} Gün</strong>` : '';
                const uyariText = item.uyari ? `<br><span style="color:var(--accent-gold); font-weight:600;">${item.uyari}</span>` : '';
                info.innerHTML = `✅ <strong>${item.ad}</strong> seçildi. Dozaj: <strong>${item.dozText || 'Belirtilmedi'}</strong>${phiText}${uyariText}`;
            }
        } catch (err) {
            console.error("Tavsiye seçim hatası:", err);
        }
    }
});
