// Agenda Summary & Product Usage Calculator
// Parses completed agenda events, resolves variety areas and groups, and aggregates product usage.

let cachedMapData = null;
let lastGardenId = null;

// Turkish character normalization
function normalizeTurkish(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/i̇/g, 'i')
        .trim();
}

// Group definitions
const varietyGroups = {
    "kayisi": ["Bolero", "Nelson", "Madrigal", "Memphis"],
    "nektarin": ["Diosa", "Canoppe", "Tintosa", "Diablotina", "Esmeralda", "Kinolea", "Nebreska", "Esmeralda fidan"],
    "seftali": ["Sweet Henry", "Bayblone", "Filoe"]
};

// Spelling fixes for variety names in Icachem
const varietySpellingFixes = {
    "sweethenry": "sweet henry",
    "sweethanry": "sweet henry",
    "sweetharry": "sweet henry",
    "dioblatina": "diablotina",
    "nebrasaka": "nebreska"
};

// Clean product names for grouping
function getNormalizedProductName(rawName) {
    const nameNorm = normalizeTurkish(rawName).replace(/\s+/g, '');
    
    if (nameNorm.includes("coragen")) {
        return "Coragen";
    } else if (nameNorm.includes("esfenvalerate") || nameNorm.includes("esfenvalarete") || nameNorm.includes("esfenvelarate") || nameNorm.includes("esfenvaterate") || nameNorm.includes("bestgol")) {
        return "Esfenvalerate (Bestgol)";
    } else if (nameNorm.includes("bellis") || nameNorm.includes("belli(")) {
        return "Bellis";
    } else if (nameNorm.includes("karate") || nameNorm.includes("karete") || nameNorm.includes("petra")) {
        return "Karate Zeon (Petra)";
    } else if (nameNorm.includes("potasyum") && nameNorm.includes("nitrat")) {
        return "Potasyum Nitrat";
    } else if (nameNorm.includes("potasyum") && nameNorm.includes("sulfat")) {
        return "Potasyum Sülfat";
    } else if (nameNorm.includes("amonyum") && nameNorm.includes("sulfat")) {
        return "Amonyum Sülfat";
    } else if (nameNorm.includes("hektas") && nameNorm.includes("bordo")) {
        return "Hektaş Bordo";
    } else if (nameNorm.includes("sumitop")) {
        return "Sumitop";
    } else if (nameNorm.includes("teppeki") || nameNorm.includes("tepekki")) {
        return "Teppeki";
    } else if (nameNorm.includes("ziram")) {
        return "Ziram (Luther)";
    } else if (nameNorm.includes("novatech") || nameNorm.includes("navatech")) {
        return "Novatech 21";
    } else if (nameNorm.includes("aminox")) {
        return "Aminox";
    } else if (nameNorm.includes("demir") || nameNorm.includes("sequestrene") || nameNorm.includes("sequstrene")) {
        return "Demir (Sequestrene)";
    } else if (nameNorm.includes("celerate") || nameNorm.includes("cellerate")) {
        return "Cellerate";
    } else if (nameNorm.includes("delegate") || nameNorm.includes("delagate")) {
        return "Delegate";
    } else if (nameNorm.includes("wayup")) {
        return "Way Up";
    } else if (nameNorm.includes("bioway")) {
        return "Bioway";
    } else if (nameNorm.includes("calwayplus")) {
        return "Calway Plus";
    } else if (nameNorm.includes("calway")) {
        return "Calway";
    } else if (nameNorm.includes("microlex")) {
        return "Microlex";
    } else if (nameNorm.includes("magnezyum") && nameNorm.includes("sulfat")) {
        return "Magnezyum Sülfat";
    } else if (nameNorm.includes("urefosfat")) {
        return "Üre Fosfat";
    }
    return rawName.trim();
}

// Parse dose string
function parseDose(doseStr) {
    if (!doseStr) return null;
    const cleanStr = doseStr.trim().toLowerCase();
    
    // Match numeric value (accept dot or comma)
    const numMatch = cleanStr.match(/([0-9]+(?:[.,][0-9]+)?)/);
    if (!numMatch) return null;
    const val = parseFloat(numMatch[1].replace(',', '.'));
    
    // Basis
    const basis = cleanStr.includes('ton') ? 'ton' : 'da';
    
    // Unit
    let unit = '';
    if (cleanStr.includes('ml')) {
        unit = 'ml';
    } else if (cleanStr.includes('gr') || cleanStr.includes('g ') || cleanStr.endsWith(' g')) {
        unit = 'gr';
    } else if (cleanStr.includes('kg')) {
        unit = 'kg';
    } else if (cleanStr.includes('lt') || cleanStr.includes('l ') || cleanStr.endsWith(' l')) {
        unit = 'lt';
    }
    
    let targetUnit = 'lt';
    let multiplier = 1.0;
    
    if (unit === 'ml' || unit === 'lt') {
        targetUnit = 'lt';
        if (unit === 'ml') multiplier = 0.001;
    } else if (unit === 'gr' || unit === 'kg') {
        targetUnit = 'kg';
        if (unit === 'gr') multiplier = 0.001;
    } else {
        if (cleanStr.includes('kg') || cleanStr.includes('gr')) {
            targetUnit = 'kg';
            if (cleanStr.includes('gr')) multiplier = 0.001;
        } else {
            targetUnit = 'lt';
            if (cleanStr.includes('ml')) multiplier = 0.001;
        }
    }
    
    return {
        value: val * multiplier,
        unit: targetUnit,
        basis: basis
    };
}

// Resolve list of varieties for a given parselCesit string and notes
function resolveVarieties(parselCesitStr, notesStr, varietyAreas) {
    if (!parselCesitStr) return [];
    
    const parts = parselCesitStr.split(/[-&/,]/);
    const matched = new Set();
    
    const varietyMapNorm = {};
    for (const name in varietyAreas) {
        varietyMapNorm[normalizeTurkish(name)] = name;
    }
    
    parts.forEach(part => {
        let partNorm = normalizeTurkish(part).replace(/\s+/g, '');
        if (!partNorm) return;
        
        if (partNorm.includes("kayisi")) {
            varietyGroups.kayisi.forEach(v => matched.add(v));
        } else if (partNorm.includes("nektarin")) {
            varietyGroups.nektarin.forEach(v => matched.add(v));
        } else if (partNorm.includes("seftali")) {
            varietyGroups.seftali.forEach(v => matched.add(v));
        } else {
            // Apply spelling fixes
            for (const fixFrom in varietySpellingFixes) {
                if (partNorm.includes(fixFrom)) {
                    partNorm = normalizeTurkish(varietySpellingFixes[fixFrom]).replace(/\s+/g, '');
                }
            }
            
            let found = false;
            for (const normVar in varietyMapNorm) {
                const normVarClean = normVar.replace(/\s+/g, '');
                if (normVarClean === partNorm || normVarClean.includes(partNorm) || partNorm.includes(normVarClean)) {
                    matched.add(varietyMapNorm[normVar]);
                    found = true;
                }
            }
            
            if (!found) {
                for (const normVar in varietyMapNorm) {
                    if (partNorm.includes(normVar.replace(/\s+/g, '')) || normVar.replace(/\s+/g, '').includes(partNorm)) {
                        matched.add(varietyMapNorm[normVar]);
                    }
                }
            }
        }
    });
    
    // Notes exclusion: Esmeralda fidan
    const notesNorm = normalizeTurkish(notesStr);
    if (notesNorm.includes("esmeralda fidan haric") || (notesNorm.includes("esmeralda fidan") && notesNorm.includes("haric"))) {
        matched.delete("Esmeralda fidan");
    }
    
    return Array.from(matched);
}

// Fetch map variety areas
async function loadVarietyAreas(gardenId) {
    if (cachedMapData && lastGardenId === gardenId) {
        return cachedMapData;
    }
    
    try {
        const response = await fetch(`api/get_map.php?garden_id=${gardenId}&t=${Date.now()}`);
        const mapData = await response.json();
        
        const varietyAreas = {};
        if (Array.isArray(mapData)) {
            mapData.forEach(item => {
                if (item.type === 'variety') {
                    const name = item.name.trim();
                    const area = parseFloat(item.area) || 0;
                    varietyAreas[name] = (varietyAreas[name] || 0) + area;
                }
            });
        }
        
        cachedMapData = varietyAreas;
        lastGardenId = gardenId;
        return varietyAreas;
    } catch (e) {
        console.error("Çeşitalanları yüklenirken hata oluştu:", e);
        return {};
    }
}

// Filter the tables when user types in the search input
function filterSummaryTables() {
    const searchVal = normalizeTurkish(document.getElementById('summarySearch').value);
    
    // Filter Grouped Table
    const groupedRows = document.querySelectorAll('#summaryGroupedBody tr');
    groupedRows.forEach(row => {
        const text = normalizeTurkish(row.querySelector('td:first-child').innerText);
        if (text.includes(searchVal)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Filter Raw Table
    const rawRows = document.querySelectorAll('#summaryRawBody tr');
    rawRows.forEach(row => {
        const text = normalizeTurkish(row.querySelector('td:first-child').innerText);
        if (text.includes(searchVal)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Render the summary view
async function renderAgendaSummary(eventsArray, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const gardenId = localStorage.getItem('selected_garden_id') || 'default';
    const varietyAreas = await loadVarietyAreas(gardenId);
    
    // Setup UI skeleton
    container.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="card bg-success bg-opacity-10 text-success p-3 border-0 rounded-4 h-100">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="text-uppercase fw-bold mb-1 small text-success opacity-75">Tamamlanan Uygulamalar</h6>
                            <h3 class="fw-bold mb-0" id="statCompletedCount">0</h3>
                        </div>
                        <i class="bi bi-check-circle-fill fs-1 text-success opacity-25"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-info bg-opacity-10 text-info p-3 border-0 rounded-4 h-100">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="text-uppercase fw-bold mb-1 small text-info opacity-75">Toplam Sarf Edilen Su</h6>
                            <h3 class="fw-bold mb-0" id="statTotalWater">0 L</h3>
                        </div>
                        <i class="bi bi-droplet-fill fs-1 text-info opacity-25"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-warning bg-opacity-10 text-warning p-3 border-0 rounded-4 h-100">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 class="text-uppercase fw-bold mb-1 small text-warning opacity-75">Toplam İşlenen Alan</h6>
                            <h3 class="fw-bold mb-0" id="statTotalArea">0 da</h3>
                        </div>
                        <i class="bi bi-grid-3x3-gap-fill fs-1 text-warning opacity-25"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-calculator-fill me-2 text-success"></i>Ürün ve Gübre Kullanım Toplamları</h5>
            <div class="input-group" style="max-width: 300px;">
                <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                <input type="text" id="summarySearch" class="form-control border-start-0 form-control-sm" placeholder="Ürün adı ile ara...">
            </div>
        </div>

        <div class="row g-4">
            <!-- Grouped -->
            <div class="col-lg-6">
                <div class="card shadow-sm border rounded-4 p-3 h-100">
                    <h6 class="fw-bold text-dark border-bottom pb-2 mb-3"><i class="bi bi-layers-half text-primary me-2"></i>Grup Toplamları (Önerilen)</h6>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light" style="font-size: 0.85rem;">
                                <tr>
                                    <th>Ürün Adı</th>
                                    <th class="text-end">Toplam Kullanım</th>
                                    <th class="text-center">Birim</th>
                                </tr>
                            </thead>
                            <tbody id="summaryGroupedBody" style="font-size: 0.9rem;">
                                <tr><td colspan="3" class="text-center text-muted py-3">Hesaplanıyor...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Raw -->
            <div class="col-lg-6">
                <div class="card shadow-sm border rounded-4 p-3 h-100">
                    <h6 class="fw-bold text-dark border-bottom pb-2 mb-3"><i class="bi bi-list-stars text-secondary me-2"></i>Detaylı Ham Kayıtlar</h6>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light" style="font-size: 0.85rem;">
                                <tr>
                                    <th>Ürün Adı (Ham)</th>
                                    <th class="text-end">Toplam Kullanım</th>
                                    <th class="text-center">Birim</th>
                                </tr>
                            </thead>
                            <tbody id="summaryRawBody" style="font-size: 0.9rem;">
                                <tr><td colspan="3" class="text-center text-muted py-3">Hesaplanıyor...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4">
            <button class="btn btn-sm btn-outline-secondary w-100 py-2 rounded-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseVarieties" aria-expanded="false">
                🔍 Çeşit Alan Detaylarını Göster (da)
            </button>
            <div class="collapse mt-2" id="collapseVarieties">
                <div class="card p-3 border rounded-3 bg-light">
                    <div class="row g-2 row-cols-2 row-cols-md-4" id="summaryVarietiesList">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener to search input
    document.getElementById('summarySearch').addEventListener('input', filterSummaryTables);
    
    // Render variety areas reference list
    const varListContainer = document.getElementById('summaryVarietiesList');
    let varListHtml = '';
    let totalGardenArea = 0;
    for (const name in varietyAreas) {
        varListHtml += `
            <div class="col">
                <div class="p-2 border rounded bg-white small">
                    <span class="fw-bold text-dark">${name}:</span>
                    <span class="badge bg-success float-end">${varietyAreas[name]} da</span>
                </div>
            </div>
        `;
        totalGardenArea += varietyAreas[name];
    }
    if (varListHtml) {
        varListContainer.innerHTML = varListHtml;
    } else {
        varListContainer.innerHTML = `<div class="col-12 text-center text-muted">Bu bahçe için henüz çeşit çizimi yapılmamış.</div>`;
    }
    
    // Calculations
    const rawTotals = {};
    const groupedTotals = {};
    let completedCount = 0;
    let totalWater = 0;
    let sumCoveredArea = 0;
    
    eventsArray.forEach(item => {
        if (item.status !== 'completed') return;
        
        const pc = item.parselCesit || '';
        const notes = item.notes || '';
        const resolved = resolveVarieties(pc, notes, varietyAreas);
        const area = resolved.reduce((sum, v) => sum + (varietyAreas[v] || 0), 0);
        
        if (area === 0) return;
        
        completedCount++;
        sumCoveredArea += area;
        
        // Products list
        let products = item.products || [];
        if (products.length === 0 && item.name) {
            products = [{ name: item.name, dose: item.dose }];
        }
        
        if (products.length > 0) {
            // Water calculation: 100 liters per decare
            totalWater += area * 100;
        }
        
        products.forEach(p => {
            const name = p.name ? p.name.trim() : '';
            const dose = p.dose ? p.dose.trim() : '';
            if (!name || !dose) return;
            
            const parsed = parseDose(dose);
            if (!parsed) return;
            
            let amount = 0;
            if (parsed.basis === 'ton') {
                amount = area * 0.1 * parsed.value;
            } else {
                amount = area * parsed.value;
            }
            
            const unit = parsed.unit;
            
            // Raw accumulation
            if (!rawTotals[name]) {
                rawTotals[name] = { amount: 0, unit: unit };
            }
            rawTotals[name].amount += amount;
            
            // Grouped accumulation
            const grpName = getNormalizedProductName(name);
            if (!groupedTotals[grpName]) {
                groupedTotals[grpName] = { amount: 0, unit: unit };
            }
            groupedTotals[grpName].amount += amount;
        });
    });
    
    // Update stats
    document.getElementById('statCompletedCount').innerText = completedCount;
    document.getElementById('statTotalWater').innerText = totalWater.toLocaleString('tr-TR') + ' Litre';
    document.getElementById('statTotalArea').innerText = sumCoveredArea.toLocaleString('tr-TR') + ' da';
    
    // Render Grouped Table
    const grpBody = document.getElementById('summaryGroupedBody');
    let grpHtml = '';
    const sortedGrpKeys = Object.keys(groupedTotals).sort();
    sortedGrpKeys.forEach(k => {
        const t = groupedTotals[k];
        grpHtml += `
            <tr>
                <td class="fw-semibold">${k}</td>
                <td class="text-end fw-bold text-success">${t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}</td>
                <td class="text-center"><span class="badge bg-secondary-subtle text-secondary">${t.unit}</span></td>
            </tr>
        `;
    });
    grpBody.innerHTML = grpHtml || `<tr><td colspan="3" class="text-center text-muted">Tamamlanmış işlem kaydı bulunamadı.</td></tr>`;
    
    // Render Raw Table
    const rawBody = document.getElementById('summaryRawBody');
    let rawHtml = '';
    const sortedRawKeys = Object.keys(rawTotals).sort();
    sortedRawKeys.forEach(k => {
        const t = rawTotals[k];
        rawHtml += `
            <tr>
                <td>${k}</td>
                <td class="text-end fw-bold text-dark">${t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}</td>
                <td class="text-center"><span class="badge bg-light text-dark border">${t.unit}</span></td>
            </tr>
        `;
    });
    rawBody.innerHTML = rawHtml || `<tr><td colspan="3" class="text-center text-muted">Tamamlanmış işlem kaydı bulunamadı.</td></tr>`;
}

// Make functions globally available
window.renderAgendaSummary = renderAgendaSummary;
window.filterSummaryTables = filterSummaryTables;
