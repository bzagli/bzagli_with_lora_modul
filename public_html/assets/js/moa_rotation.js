// Etki mekanizması (FRAC / IRAC) sınıflandırması ve direnç rotasyonu kontrolü.
// Etken madde metninden (ör. "% 25.2 Boscalid + % 12.8 Pyraclostrobin") etki gruplarını çıkarır ve
// ilaçlama programında aynı grubun art arda evrelerde / aynı evrede tekrar kullanılmasını tespit eder.
// Tarayıcıda window.MoaRotation, Node'da module.exports olarak kullanılabilir.
(function (root) {
    // [arama ifadesi, grup kodu, grup adı]. Kodlar FRAC (fungisit) ve IRAC (insektisit/akarisit) listelerine göre.
    const MOA_TABLE = [
        // --- FRAC (Fungisitler) ---
        [/bak[ıi]r|copper|tribazik/i, 'FRAC M01', 'Bakır (çok yönlü)'],
        [/k[üu]k[üu]rt|sulph?ur/i, 'FRAC M02', 'Kükürt (çok yönlü)'],
        [/metiram|mancozeb|propineb|thiram|ziram/i, 'FRAC M03', 'Ditiyokarbamat (çok yönlü)'],
        [/captan|folpet/i, 'FRAC M04', 'Ftalimid (çok yönlü)'],
        [/chlorothalonil/i, 'FRAC M05', 'Kloronitril (çok yönlü)'],
        [/dithianon/i, 'FRAC M09', 'Kinon (çok yönlü)'],
        [/dodine/i, 'FRAC U12', 'Guanidin'],
        [/difenoconazole|tebuconazole|penconazole|myclobutanil|propiconazole|flusilazole|fenbuconazole|tetraconazole|hexaconazole|mefentrifluconazole|metconazole|prothioconazole|triadimenol|cyproconazole/i, 'FRAC 3', 'DMI (triazol)'],
        [/bupirimate/i, 'FRAC 8', 'Hidroksi-pirimidin'],
        [/cyprodinil|pyrimethanil|mepanipyrim/i, 'FRAC 9', 'Anilinopirimidin (AP)'],
        [/boscalid|fluxapyroxad|fluopyram|penthiopyrad|isopyrazam|benzovindiflupyr|isofetamid|pydiflumetofen|fluindapyr/i, 'FRAC 7', 'SDHI'],
        [/pyraclostrobin|trifloxystrobin|kresoxim|azoxystrobin|fluoxastrobin|picoxystrobin/i, 'FRAC 11', 'QoI (strobilurin)'],
        [/fludioxonil/i, 'FRAC 12', 'Fenilpirol'],
        [/fenhexamid|fenpyrazamine/i, 'FRAC 17', 'KRI (hidroksianilid)'],
        [/thiophanate|carbendazim/i, 'FRAC 1', 'MBC (benzimidazol)'],
        [/iprodione/i, 'FRAC 2', 'Dikarboksimid'],
        [/fosetyl|phosphonate|fosfit/i, 'FRAC P07', 'Fosfonat'],
        [/proquinazid|quinoxyfen/i, 'FRAC 13', 'Aza-naftalen'],
        [/metrafenone|pyriofenone/i, 'FRAC 50', 'Aril-fenil-keton'],
        [/cyflufenamid/i, 'FRAC U06', 'Fenil-asetamid'],
        // --- IRAC (İnsektisit / Akarisit) ---
        [/acetamiprid|thiacloprid|imidacloprid|thiamethoxam|clothianidin/i, 'IRAC 4A', 'Neonikotinoid'],
        [/sulfoxaflor/i, 'IRAC 4C', 'Sülfoksimin'],
        [/flupyradifurone/i, 'IRAC 4D', 'Butenolid'],
        [/deltamethrin|lambda|cypermethrin|bifenthrin|tau-?fluvalinate|esfenvalerate|beta-?cyfluthrin|etofenprox/i, 'IRAC 3A', 'Piretroid'],
        [/chlorpyrifos|malathion|phosmet|dimethoate/i, 'IRAC 1B', 'Organofosfat'],
        [/pirimicarb|methomyl/i, 'IRAC 1A', 'Karbamat'],
        [/spinosad|spinetoram/i, 'IRAC 5', 'Spinosin'],
        [/emamectin|abamectin|milbemectin/i, 'IRAC 6', 'Avermektin'],
        [/pyriproxyfen|fenoxycarb/i, 'IRAC 7C', 'Juvenil hormon analoğu'],
        [/afidopyropen|pymetrozine/i, 'IRAC 9', 'Kordotonal organ modülatörü'],
        [/flonicamid/i, 'IRAC 29', 'Flonikamid'],
        [/clofentezine|hexythiazox|etoxazole/i, 'IRAC 10', 'Akar büyüme inhibitörü'],
        [/diflubenzuron|lufenuron|novaluron|teflubenzuron|triflumuron|hexaflumuron/i, 'IRAC 15', 'Benzoilüre (kitin sentezi)'],
        [/buprofezin/i, 'IRAC 16', 'Buprofezin'],
        [/methoxyfenozide|tebufenozide/i, 'IRAC 18', 'Ekdizon agonisti'],
        [/fenpyroximate|pyridaben|tebufenpyrad|fenazaquin/i, 'IRAC 21A', 'METI akarisit'],
        [/indoxacarb/i, 'IRAC 22A', 'Oksadiazin'],
        [/spirodiclofen|spiromesifen|spirotetramat/i, 'IRAC 23', 'Tetronik/tetramik asit'],
        [/cyflumetofen|bifenazate/i, 'IRAC 25', 'Mitokondri kompleks II/III'],
        [/chlorantraniliprole|cyantraniliprole|cyclaniliprole/i, 'IRAC 28', 'Diamid'],
        [/acequinocyl/i, 'IRAC 20B', 'Akekinosil'],
        [/mineral ya[gğ]|parafin|yazl[ıi]k ya[gğ]|k[ıi][şs]l[ıi]k ya[gğ]|paraffin/i, 'IRAC UNM', 'Mineral yağ (fiziksel etki)'],
        [/bacillus thuringiensis|\bbt\b/i, 'IRAC 11A', 'Bt toksini']
    ];

    // Çok yönlü (M) fungisitler, mineral yağ ve fiziksel etkililer için direnç riski düşüktür; rotasyon uyarısı verilmez
    function isLowRiskCode(code) {
        return /^FRAC M\d+/.test(code) || code === 'IRAC UNM' || code === 'FRAC P07';
    }

    function getMoaGroups(text) {
        const s = String(text || '');
        const found = [];
        for (const [re, code, label] of MOA_TABLE) {
            if (re.test(s) && !found.some(f => f.code === code)) found.push({ code, label });
        }
        return found;
    }

    // Bir program öğesinin tüm metinlerinden (etken madde + ürün adı) grupları çıkarır
    function getItemGroups(item) {
        if (!item || item.type === 'info') return [];
        return getMoaGroups(`${item.active || ''} ${item.name || ''}`);
    }

    // Program evrelerinde rotasyon ihlallerini bulur.
    // Kural: yüksek riskli (çok yönlü olmayan) bir grup aynı evrede iki kez ya da art arda iki evrede kullanılmamalı.
    // Dönüş: [{ stageId, category, itemIndex, code, label, reason }]
    function checkProgramRotation(stages, categories = ['hastalik', 'zararli']) {
        const issues = [];
        const list = Array.isArray(stages) ? stages : [];
        list.forEach((stage, si) => {
            const prev = si > 0 ? list[si - 1] : null;
            categories.forEach(cat => {
                const items = stage[cat] || [];
                const seenInStage = {};
                items.forEach((item, ii) => {
                    getItemGroups(item).forEach(g => {
                        if (isLowRiskCode(g.code)) return;
                        if (seenInStage[g.code] !== undefined) {
                            issues.push({ stageId: stage.id, category: cat, itemIndex: ii, code: g.code, label: g.label, reason: 'same-stage' });
                        }
                        seenInStage[g.code] = ii;
                        if (prev) {
                            const prevItems = [...(prev.hastalik || []), ...(prev.zararli || [])];
                            if (prevItems.some(p => getItemGroups(p).some(pg => pg.code === g.code))) {
                                issues.push({ stageId: stage.id, category: cat, itemIndex: ii, code: g.code, label: g.label, reason: 'previous-stage', prevStageId: prev.id });
                            }
                        }
                    });
                });
            });
        });
        return issues;
    }

    const api = { MOA_TABLE, getMoaGroups, getItemGroups, isLowRiskCode, checkProgramRotation };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.MoaRotation = api;
})(typeof window !== 'undefined' ? window : this);
