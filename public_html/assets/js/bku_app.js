// 1. COMPREHENSIVE BKU DATABASE (INCLUDING USER IMAGES & MANUAL POPULATIONS)
                                                                
// [DEFAULT_BKU_DATABASE is loaded externally from database.js]
;

    function formatTankDoz(val, unit) {
        if (unit === "ml") {
            if (val >= 1000) {
                const ltVal = val / 1000;
                const formattedLt = ltVal.toFixed(2).replace(/\.?0+$/, '');
                return `${formattedLt} lt`;
            } else {
                return `${Math.round(val)} ml`;
            }
        } else if (unit === "g" || unit === "gr" || unit === "g (Toz)") {
            if (val >= 1000) {
                const kgVal = val / 1000;
                const formattedKg = kgVal.toFixed(2).replace(/\.?0+$/, '');
                return `${formattedKg} kg`;
            } else {
                return `${Math.round(val)} g`;
            }
        } else {
            return `${val.toFixed(1).replace(/\.?0+$/, '')} adet`;
        }
    }

    function getCleanHedef(item) {
        if (!item) return "-";
        if (item.hedef) return item.hedef;
        if (item.uyari) {
            let text = item.uyari.replace(/Grup:\s*[A-Za-z0-9\s,\/\+.]+/i, "")
                                 .replace(/Ruhsatlı ve tavsiyelidir\.?/gi, "")
                                 .trim();
            text = text.replace(/^[|:\-\s]+|[|:\-\s]+$/g, "").trim();
            return text || "-";
        }
        return "-";
    }

    // State Variables
    let bkuDatabase = [];
    let activePlantFilter = "";
    let sprayingProgram = {
        gardenName: "Kuzey Meyve Bahçesi",
        plant: "ELMA",
        area: 10,
        tankCapacity: 2000,
        waterRate: 100,
        harvestDate: "2026-09-15",
        stage: "fruit_dev",
        weather: "ideal",
        rounds: []
    };

    function getResistanceInfo(aktif, grupName) {
        if (!aktif) return { code: "GENEL", name: "Genel Sınıf", risk: "Düşük", desc: "Etki mekanizması genel veya biyolojik sınıfa dahildir." };
        
        const lower = aktif.toLowerCase();
        const isFungicide = grupName && grupName.includes("Fungisit");
        const isInsecticide = grupName && (grupName.includes("İnsektisit") || grupName.includes("Akarisit"));
        
        // Fail-safe check to prevent insecticide active ingredients from being misclassified as fungicides due to group typos
        const hasInsecticideActive = lower.includes("acetamiprid") || lower.includes("imidacloprid") || lower.includes("thiamethoxam") || 
                                     lower.includes("phosmet") || lower.includes("malathion") || lower.includes("chlorpyrifos") || 
                                     lower.includes("lambda-cyhalothrin") || lower.includes("deltamethrin") || lower.includes("tau-fluvalinate") || 
                                     lower.includes("cypermethrin") || lower.includes("emamectin") || lower.includes("chlorantraniliprole") || 
                                     lower.includes("cyantraniliprole") || lower.includes("flubendiamide") || lower.includes("spinosad") || 
                                     lower.includes("spinetoram") || lower.includes("spirotetramat") || lower.includes("sulfoxaflor") || 
                                     lower.includes("afidopyropen") || lower.includes("pirimicarb") || lower.includes("lufenuron") || 
                                     lower.includes("diflubenzuron") || lower.includes("indoxacarb") || lower.includes("spirodiclofen") || 
                                     lower.includes("bifenazate") || lower.includes("etoxazole") || lower.includes("hexythiazox");

        // 1. FUNGICIDES
        if ((isFungicide && !hasInsecticideActive) || lower.includes("fluopyram") || lower.includes("boscalid") || lower.includes("fluxapyroxad") || lower.includes("isopyrazam")) {
            let code = "FRAC 7";
            let name = "SDHI (Succinate Dehydrogenase Inhibitor)";
            let risk = "Orta-Yüksek";
            let desc = "Mantarın hücresel solunum zincirindeki Kompleks II (Succinate dehydrogenase) enzimini inhibe ederek hücresel enerji üretimini keser.";
            
            if (lower.includes("trifloxystrobin")) {
                return {
                    code: "FRAC 7 + 11",
                    name: "SDHI + Strobilurin (QoI)",
                    risk: "Yüksek",
                    desc: "Çift etki mekanizması: Hücresel solunum zincirinde hem Kompleks II hem de Kompleks III enzim sistemlerini bloke eder. Direnç yönetimi için mükemmel bir koruyucudur."
                };
            }
            if (lower.includes("pyraclostrobin")) {
                return {
                    code: "FRAC 7 + 11",
                    name: "SDHI + Strobilurin (QoI)",
                    risk: "Yüksek",
                    desc: "Çift etki mekanizması: Hücresel solunumu hem Kompleks II hem de Kompleks III seviyesinde keserek üstün koruyucu ve tedavi edici etki sağlar."
                };
            }
            if (lower.includes("difenoconazole")) {
                return {
                    code: "FRAC 7 + 3",
                    name: "SDHI + Triazole (DMI)",
                    risk: "Orta-Yüksek",
                    desc: "Çift etki mekanizması: Solunum zincirini engeller (FRAC 7) ve mantar hücre zarı sterol sentezini (FRAC 3) durdurur."
                };
            }
            return { code, name, risk, desc };
        }
        
        if (lower.includes("trifloxystrobin") || lower.includes("pyraclostrobin") || lower.includes("kresoxim-methyl") || lower.includes("azoxystrobin")) {
            return {
                code: "FRAC 11",
                name: "Strobilurin (QoI - Quinone Outside Inhibitors)",
                risk: "Yüksek",
                desc: "Mitokondriyal solunum zincirinde sitokrom bc1 (Kompleks III) kompleksini inhibe ederek hücresel ATP üretimini tamamen durdurur."
            };
        }
        
        if (lower.includes("difenoconazole") || lower.includes("mefentrifluconazole") || lower.includes("flutriafol") || lower.includes("tebuconazole") || lower.includes("myclobutanil") || lower.includes("penconazole") || lower.includes("propiconazole")) {
            return {
                code: "FRAC 3",
                name: "DMI / Triazole (Demethylation Inhibitor)",
                risk: "Orta",
                desc: "Mantar hücre zarı için hayati önem taşıyan ergosterol biyosentezinde C14-demethylase enzimini bloke ederek hücre duvarını çökertir."
            };
        }
        
        if (lower.includes("cyprodinil")) {
            if (lower.includes("fludioxonil")) {
                return {
                    code: "FRAC 9 + 12",
                    name: "Anilinopyrimidine + Phenylpyrrole",
                    risk: "Orta",
                    desc: "Çift etki mekanizması: Metiyonin aminoasit biyosentezini inhibe eder (FRAC 9) ve ozmotik sinyal iletim yolağını engeller (FRAC 12)."
                };
            }
            return {
                code: "FRAC 9",
                name: "Anilinopyrimidine",
                risk: "Orta",
                desc: "Mantarda protein sentezinde rol oynayan metiyonin aminoasidinin biyosentezini inhibe eder."
            };
        }
        
        if (lower.includes("fludioxonil")) {
            return {
                code: "FRAC 12",
                name: "Phenylpyrrole",
                risk: "Orta",
                desc: "Mantarda ozmotik sinyal iletim yolağında MAP kinaz enzimini inhibe ederek ozmoregülasyonu bozar."
            };
        }
        
        if (lower.includes("tea tree") || lower.includes("çay ağacı")) {
            return {
                code: "FRAC F7",
                name: "Bitkisel Ekstrat (Çay Ağacı Yağı)",
                risk: "Düşük",
                desc: "Doğal kökenli olup, mantar hücre zarlarının fiziksel bütünlüğünü ve membran geçirgenliğini bozarak etki eder. Direnç riski yoktur."
            };
        }
        
        if (lower.includes("dithianon")) {
            return {
                code: "FRAC M09",
                name: "Multi-site Quinone Derivesi",
                risk: "Düşük",
                desc: "Mantarın hücre bölünmesini ve solunumunu çoklu noktadan bozarak koruyucu etki yapar. Direnç gelişme riski yoktur."
            };
        }
        
        if (lower.includes("bakır") || lower.includes("copper") || lower.includes("metalik bakır")) {
            return {
                code: "FRAC M01",
                name: "Çoklu Noktadan Etkili İnorganik Bakır",
                risk: "Düşük",
                desc: "Mantar sporları ve bakterilerle temas ettiğinde bakır iyonları salarak proteinleri denatüre eder ve enzimleri bozar. Direnç riski yoktur, organik tarımda temeldir."
            };
        }
        
        if (lower.includes("thiophanate-methyl")) {
            return {
                code: "FRAC 1",
                name: "MBC (Methyl Benzimidazole Carbamates)",
                risk: "Yüksek",
                desc: "Hücre bölünmesi sırasında mikrotübül polimerizasyonunda beta-tubulin sentezini engelleyerek iğ iplikçiklerinin oluşumunu durdurur."
            };
        }
        
        if (lower.includes("captan") || lower.includes("kaptan")) {
            return {
                code: "FRAC M04",
                name: "Çoklu Noktadan Etkili Phthalimide",
                risk: "Düşük",
                desc: "Mantar hücrelerindeki sülfhidril grupları ile reaksiyona girerek hücresel solunumu çoklu noktadan durdurur. Direnç oluşturma riski yoktur."
            };
        }
        
        if (lower.includes("dodine") || lower.includes("dodin")) {
            return {
                code: "FRAC U12",
                name: "Guanidine",
                risk: "Orta",
                desc: "Mantar hücresi membran bütünlüğünü bozarak hücre içeriğinin dışarı sızmasına yol açar."
            };
        }
        
        if (lower.includes("iminoctadine")) {
            return {
                code: "FRAC M07",
                name: "Çoklu Noktadan Etkili Guanidine Derivesi",
                risk: "Düşük-Orta",
                desc: "Mantarın lipid ve membran sentezini çoklu noktadan bloke eder."
            };
        }
        
        if (lower.includes("bacillus amyloliquefaciens") || lower.includes("bacillus subtilis") || lower.includes("serenade")) {
            return {
                code: "FRAC BM02",
                name: "Mikrobiyal Biyolojik Fungisit",
                risk: "Düşük",
                desc: "Doğal bakteriyel lipopeptitler üreterek mantar hücre zarlarını fiziksel olarak parçalar ve bitkide sistemik uyarılmış dayanıklılık (SAR) sağlar."
            };
        }
        
        if (lower.includes("kükürt") || lower.includes("sulfur")) {
            return {
                code: "FRAC M02",
                name: "Çoklu Noktadan Etkili İnorganik Kükürt",
                risk: "Düşük",
                desc: "Mantar hücresi solunum zincirine girerek hidrojen alıcısı olarak çalışır ve kükürtlü bileşiklerle solunumu bozar. Akarisit etkisi de mevcuttur."
            };
        }
        
        // 2. INSECTICIDES
        if (lower.includes("afidopyropen")) {
            return {
                code: "IRAC 9D",
                name: "Kordotonal Organ Modülatörü (Afidopyropen)",
                risk: "Orta",
                desc: "Zararlı böceğin (yaprakbiti vb.) yerçekimi, ses ve hareket algısını sağlayan kordotonal organlarını felç ederek beslenmesini saniyeler içinde durdurur."
            };
        }
        
        if (lower.includes("acetamiprid") || lower.includes("imidacloprid") || lower.includes("thiamethoxam")) {
            return {
                code: "IRAC 4A",
                name: "Neonikotinoid (Sinir Modülatörü)",
                risk: "Orta-Yüksek",
                desc: "Böceğin merkezi sinir sistemindeki Nikotinik Asetilkolin Reseptörlerine (nAChR) bağlanarak aşırı uyarı ve sinirsel felç oluşturur."
            };
        }
        
        if (lower.includes("phosmet") || lower.includes("malathion") || lower.includes("chlorpyrifos") || lower.includes("diazinon")) {
            return {
                code: "IRAC 1B",
                name: "Organofosfat (Sinir Gazı Grubu)",
                risk: "Yüksek",
                desc: "Sinir kavşaklarındaki Asetilkolinesteraz (AChE) enzimini geri dönüşümsüz inhibe ederek sürekli sinirsel iletime ve ölüme yol açar."
            };
        }
        
        if (lower.includes("pirimicarb")) {
            return {
                code: "IRAC 1A",
                name: "Karbamat (AChE İnhibitörü)",
                risk: "Yüksek",
                desc: "Sinir kavşaklarındaki Asetilkolinesteraz enzimini bloke ederek asetilkolin birikimine ve böcek felcine yol açar."
            };
        }
        
        if (lower.includes("pyrethrin") || lower.includes("lambda-cyhalothrin") || lower.includes("deltamethrin") || lower.includes("tau-fluvalinate") || lower.includes("cypermethrin")) {
            return {
                code: "IRAC 3A",
                name: "Sentetik / Doğal Piretroid",
                risk: "Yüksek",
                desc: "Böceğin sinir liflerindeki sodyum kanallarını sürekli açık tutarak ardışık sinir uyarılarına, ani felce (Knock-down etkisi) ve ölüme neden olur."
            };
        }
        
        if (lower.includes("emamectin")) {
            return {
                code: "IRAC 6",
                name: "Avermektin (Klorür Kanal Aktivörü)",
                risk: "Orta",
                desc: "Sinir-kas kavşağındaki GABA ve glutamat kapılı klorür kanallarını aktive ederek klor iyonu akışını artırır ve böcekte kas felci yapar."
            };
        }
        
        if (lower.includes("chlorantraniliprole") || lower.includes("cyantraniliprole") || lower.includes("flubendiamide")) {
            return {
                code: "IRAC 28",
                name: "Diamid (Kas Hücresi Reseptör Modülatörü)",
                risk: "Orta",
                desc: "Böceğin kas hücrelerindeki riyanodin reseptörlerine bağlanarak hücre içi kalsiyum depolarını kontrolsüz şekilde boşaltır ve kas felci oluşturur."
            };
        }

        if (lower.includes("spinosad") || lower.includes("spinetoram")) {
            return {
                code: "IRAC 5",
                name: "Spinosyn (Nikotinik Reseptör Aktivörü)",
                risk: "Orta",
                desc: "Nikotinik asetilkolin reseptörlerini nAChR allosterik olarak aktive ederek merkezi sinir sistemini aşırı uyarır."
            };
        }
        
        // 3. ACARICIDES (MITICIDES)
        if (lower.includes("spirodiclofen")) {
            return {
                code: "IRAC 23",
                name: "Lipid Sentezi İnhibitörü (Spirodiclofen / Ketoenol)",
                risk: "Orta",
                desc: "Böcek ve akarlarda lipid (yağ) sentezini asetil koenzim A karboksilaz (ACCase) enzimini inhibe ederek engeller. Özellikle nimf ve yumurtalar üzerinde etkilidir."
            };
        }
        
        if (lower.includes("pyridaben")) {
            return {
                code: "IRAC 21A",
                name: "METI - Kompleks I Solunum İnhibitörü (Pyridaben)",
                risk: "Orta-Yüksek",
                desc: "Mitokondriyal elektron taşıma zincirinde Kompleks I (NADH dehidrojenaz) enzimini inhibe ederek hücresel enerji (ATP) üretimini durdurur. Ani ve güçlü kontakt etkilidir."
            };
        }
        
        if (lower.includes("hexythiazox")) {
            return {
                code: "IRAC 10A",
                name: "Mite Büyüme Regülatörü (Hexythiazox)",
                risk: "Orta",
                desc: "Akarlarda kitin sentezini engelleyerek yumurta, larva ve nimf aşamalarında gelişimi durdurur. Erginlere karşı kısırlaştırıcı etki gösterir."
            };
        }
        
        if (lower.includes("cyflumetofen") || lower.includes("cylumetofen")) {
            return {
                code: "IRAC 25A",
                name: "Kompleks II Solunum İnhibitörü (Cyflumetofen)",
                risk: "Düşük-Orta",
                desc: "Mitokondriyal elektron taşıma zincirinde Kompleks II (Suksinat dehidrojenaz) enzimini inhibe ederek akarlarda enerji üretimini durdurur. Yeni nesil spesifik akarisittir."
            };
        }
        
        if (lower.includes("etoxazole")) {
            return {
                code: "IRAC 10B",
                name: "Kitin Sentezi İnhibitörü (Etoxazole)",
                risk: "Orta",
                desc: "Akarların kitin sentezini engelleyerek embriyo gelişimini ve deri değiştirmeyi durdurur. Yumurta, larva ve nimf aşamalarında yüksek etkilidir."
            };
        }
        
        if (lower.includes("bifenazate")) {
            return {
                code: "IRAC 20D",
                name: "Kompleks III Solunum İnhibitörü (Bifenazate / Karbazat)",
                risk: "Orta",
                desc: "Mitokondriyal elektron taşıma zincirinde Kompleks III (sitokrom b) bölgesine etki ederek hücresel solunumu durdurur. Tüm hareketli akar dönemlerine karşı etkilidir."
            };
        }
        
        if (lower.includes("acequinocyl")) {
            return {
                code: "IRAC 20B",
                name: "Kompleks III Solunum İnhibitörü (Acequinocyl)",
                risk: "Orta",
                desc: "Mitokondriyal elektron taşıma zincirinde Kompleks III (Qo bölgesi) enzimini bloke ederek hücresel enerji sentezini durdurur. Geniş etki spektrumlu akarisittir."
            };
        }
        
        return {
            code: isFungicide ? "FRAC NC" : (isInsecticide ? "IRAC NC" : "GENEL"),
            name: "Sınıflandırılmamış / Diğer Sınıf",
            risk: "Düşük-Orta",
            desc: "Kimyasal direnç sınıflarının dışındaki genel, biyolojik veya organik etki mekanizmalı bitki koruma sınıfı."
        };
    }

    function renderAgronomicalAdvisory() {
        const container = document.getElementById("smartAdvisoryContainer");
        if (!container) return;

        const plant = sprayingProgram.plant;
        const stage = sprayingProgram.stage;
        const weather = sprayingProgram.weather;

        // 1. Weather Advisory
        let weatherIcon = "🟢";
        let weatherTitle = "İdeal İlaçlama Hava Şartları";
        let weatherClass = "moa-low-risk";
        let weatherDesc = "Hava sıcaklığı ve nem oranları ideal sınırlar içerisinde. Rüzgar hızı ilaç sürüklenmesine yol açmayacak kadar hafif. İlaçlama için koşullar mükemmeldir.";

        if (weather === "windy") {
            weatherIcon = "⚠️";
            weatherTitle = "Yüksek Rüzgar Sürüklenme (Drift) Riski";
            weatherClass = "moa-frac";
            weatherDesc = "Rüzgar hızı yüksek! İlaçlama yapılması kesinlikle tavsiye edilmez. Rüzgar sürüklenmesi (drift) nedeniyle damlacıklar hedef dışı alanlara kaçarak çevreye zarar verir ve ilaçlama etkinliğini ciddi şekilde düşürür. Rüzgarın 12 km/s altına inmesini bekleyiniz.";
        } else if (weather === "hot") {
            weatherIcon = "⚠️";
            weatherTitle = "Yüksek Sıcaklık ve Buharlaşma Riski";
            weatherClass = "moa-frac";
            weatherDesc = "Sıcaklık 30°C'nin üstünde! Yüksek buharlaşma nedeniyle püskürtülen damlacıklar yaprağa ulaşmadan kuruyabilir. Ayrıca yüksek sıcaklıkta bitki stresi arttığından fitotoksite (yaprak yanıklığı) riski çok yüksektir. İlaçlamayı akşam serinliğinde veya sabah erken saatlerde yapınız.";
        } else if (weather === "rainy") {
            weatherIcon = "🔴";
            weatherTitle = "Yağış Yıkanma Riski ve Hastalık Tehdidi";
            weatherClass = "moa-irac";
            weatherDesc = "Yağış bekleniyor! Uygulamadan sonraki 6 saat içinde yağmur yağarsa temas etkili (kontakt) ilaçlar tamamen yıkanarak etkisini kaybeder. Hızlı emilen sistemik karakterli ilaçları tercih edin ve mutlaka kaliteli bir yayıcı-yapıştırıcı (adjuvant) kullanın. Ayrıca yağmurlu hava Karaleke ve Monilya hastalık sporlarının yayılması için en uygun koşulları hazırlar!";
        }

        // 2. Phenological Stage & Agronomical Advice
        let stageName = "";
        let stageAdvice = "";
        let targetPests = "";

        const stagesMap = {
            dormant: "Kış Uykusu / Tomurcuk Kabarma",
            budbreak: "Fare Kulağı / Yeşil Tomurcuk",
            pink_bud: "Pembe/Beyaz Tomurcuk (Çiçek Öncesi)",
            bloom: "Tam Çiçeklenme Dönemi",
            petal_fall: "Taç Yaprak Dökümü",
            fruit_dev: "Meyve Tutumu ve Gelişimi",
            pre_harvest: "Hasat Öncesi Dönemi"
        };
        stageName = stagesMap[stage] || "Genel Dönem";

        if (plant === "ELMA" || plant === "ARMUT" || plant === "AYVA") {
            if (stage === "dormant" || stage === "budbreak") {
                stageAdvice = "Kış mücadelesi aşamasıdır. Karaleke sporlarının kışlayan formlarını yok etmek ve gövde zararlılarının yumurtalarını engellemek için Bakır (FRAC M01) ve mineral yağ (yazlık yağ) uygulaması agronomik olarak ilk adımdır.";
                targetPests = "Elma karalekesi (Venturia inaequalis), Yumuşak çekirdekli kış yumurtaları ve gövde kabuklu bitleri.";
            } else if (stage === "pink_bud" || stage === "bloom") {
                stageAdvice = "Kritik Karaleke ve Külleme enfeksiyon dönemidir. Çiçeklenme döneminde sistemik etkili ilaçlar tercih edilmelidir. Arılara zarar vermemek adına çiçeklenme sırasında insektisit (böcek ilacı) uygulamalarından kaçınılmalı veya yalnızca gece saatlerinde arı dostu biyolojik preparatlar kullanılmalıdır.";
                targetPests = "Elma karalekesi, Külleme, Çiçek monilyası.";
            } else if (stage === "petal_fall" || stage === "fruit_dev") {
                stageAdvice = "Birinci ve ikinci nesil Elma İçkurdu larvaları bu dönemde meyveye zarar verir. İlaçlamalarda mutlaka IRAC 28 (Diamid) veya IRAC 1B/3A rotasyonu yapılmalı, direnç gelişimini engellemek için aynı gruptan ilaçları üst üste atmaktan kaçınılmalıdır.";
                targetPests = "Elma içkurdu (Cydia pomonella), Karaleke, Yaprakbitleri, Kırmızı Örümcek.";
            } else {
                stageAdvice = "Hasat öncesi koruma ve kalıntı yönetimi dönemi. Seçilen ilaçların Son İlaçlama ile Hasat Arası Süresine (PHI) son derece dikkat edilmeli, kalıntı sınırlarını (MRL) aşmamak için biyolojik mücadele veya kısa bekleme süreli ürünler seçilmelidir.";
                targetPests = "Meyve monilyası (Mumya), Geç nesil Elma içkurdu larvaları.";
            }
        } else if (["KAYISI", "KİRAZ", "VİŞNE", "ŞEFTALİ", "NEKTARİN", "ERİK", "BADEM"].includes(plant)) {
            if (stage === "dormant" || stage === "budbreak") {
                stageAdvice = "Sert çekirdekli meyvelerde Klasterosporium (Yaprak delen/Çil) ve Yaprak Kıvırcıklığı enfeksiyonlarının kışlaklarını yok etmek için tomurcuklar patlamadan önce mutlaka %1-2'lik Bordo Bulamacı (Bakır sülfat, FRAC M01) uygulaması yapılmalıdır.";
                targetPests = "Yaprak delen (Clasterosporium carpophilum), Şeftali yaprak kıvırcıklığı (Taphrina deformans).";
            } else if (stage === "pink_bud" || stage === "bloom") {
                stageAdvice = "Sert çekirdeklilerde en kritik hastalıklardan biri **ÇİÇEK MONİLYASI** (Monilinia laxa) hastalığıdır. Çiçeklerin açmaya başladığı %10 çiçeklenme döneminde 1. ilaçlama, %70-80 çiçeklenmede 2. ilaçlama mutlaka yapılmalıdır. FRAC 7+11 (SDHI+Strobilurin) veya FRAC 3 (Triazol) etkili koruyucu fungisitler agronomik olarak zorunludur.";
                targetPests = "Çiçek monilyası (Monilinia laxa = Sclerotinia laxa), Mumya.";
            } else if (stage === "petal_fall" || stage === "fruit_dev") {
                stageAdvice = "Meyve gelişim döneminde Monilinia fructigena (Meyve monilyası) ve kiraz/şeftali sinekleri takibi önem taşır. Yaprakbitleri taze sürgünlerde kolonileşebilir. Rotasyonlu ilaçlama yapılması direnç oluşumunu kırar.";
                targetPests = "Meyve monilyası, Şeftali güvesi (Anarsia lineatella), Kiraz sineği, Yaprakbitleri.";
            } else {
                stageAdvice = "Hasada yakın bir dönem. Kiraz ve kayısı gibi hızlı tüketilen taze meyvelerde PHI süresi hayati önem taşır. PHI süresi 3 veya 7 günün üzerinde olan güçlü sistemiklerden kaçınılmalı, biyolojik fungisitler (FRAC BM02) tercih edilmelidir.";
                targetPests = "Meyve monilyası, Yaprakbiti.";
            }
        } else {
            if (stage === "dormant" || stage === "budbreak") {
                stageAdvice = "Bakteriyel yanıklık ve gövde zararlıları için koruyucu bakır uygulamaları (FRAC M01) önerilir. Kış temizliği için ağaç altı kuru yaprakların toplanması spor yoğunluğunu azaltır.";
                targetPests = "Ceviz antraknozu, Bakteriyel yanıklık.";
            } else if (stage === "pink_bud" || stage === "bloom") {
                stageAdvice = "Bakteriyel yanıklığa karşı hassas dönem. Çiçeklenme başında ve ortasında koruyucu ve sistemik bakır kombinasyonları uygulanabilir.";
                targetPests = "Bakteriyel yanıklık (Xanthomonas juglandis).";
            } else {
                stageAdvice = "Meyve büyüme ve iç doldurma dönemi. İç kurdu ve yaprakbiti takipleri yapılmalıdır. Direnci engellemek için böcek ilaçlarında kimyasal sınıfları rotasyona tabi tutun.";
                targetPests = "Ceviz içkurdu, Yaprakbiti.";
            }
        }

        container.innerHTML = `
            <div class="advisory-panel">
                <div class="advisory-header" style="display:flex; align-items:center; gap:8px;">
                    <span>🌾</span> ZİRAİ KARAR DESTEK & AKILLI TAVSİYE PANELİ
                </div>
                <div class="advisory-grid">
                    <div style="background: rgba(255,255,255,0.4); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                        <div style="font-weight: 700; color: #333; margin-bottom: 8px; display:flex; align-items:center; gap:6px;">
                            <span>${weatherIcon}</span> ${weatherTitle}
                        </div>
                        <p style="font-size: 0.85rem; color: #555; line-height: 1.4; margin: 0;">${weatherDesc}</p>
                    </div>

                    <div style="background: rgba(255,255,255,0.4); padding: 15px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                        <div style="font-weight: 700; color: var(--primary); margin-bottom: 8px;">
                            🌱 ${stageName} Dönemi Agronomik Rehberi
                        </div>
                        <p style="font-size: 0.85rem; color: #444; line-height: 1.4; margin: 0 0 8px 0;">${stageAdvice}</p>
                        <div style="font-size: 0.78rem; color: #666; font-weight:600;">
                            🚨 Hedef Alınacak Zararlı/Hastalıklar: <span style="color:#d32f2f; font-weight:normal;">${targetPests}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ------------------------------------------------------------- */
    // INITIALIZATION & TAB CONTROLLERS (ROBUST TRY-CATCH)
    // ------------------------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {
        // Authorization & Role setup
        const userRole = localStorage.getItem('userRole') || 'viewer';
        const isAdmin = userRole === 'admin';
        const permissions = JSON.parse(localStorage.getItem('userPermissions') || '{"hidden":[]}');
        
        // Dynamic adaptation of Meyve Takvimleri tab link
        if (permissions.hidden) {
            const fruitTabs = ['apple.html', 'cherry.html', 'apricot.html', 'peach.html'];
            const visibleFruitTabs = fruitTabs.filter(page => !permissions.hidden.includes(page));
            const fruitCalendarBtn = Array.from(document.querySelectorAll('.nav-tabs button')).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('apple.html'));
            if (fruitCalendarBtn) {
                if (visibleFruitTabs.length === 0) {
                    fruitCalendarBtn.style.display = 'none';
                } else {
                    fruitCalendarBtn.setAttribute('onclick', `window.location.href='${visibleFruitTabs[0]}'`);
                }
            }
        }

        const bannerContainer = document.getElementById("authStatusBanner");
        if (bannerContainer) {
            if (isAdmin) {
                bannerContainer.className = "auth-status-banner admin";
                bannerContainer.innerHTML = `
                    <span>⚙️ <strong>Yönetici Modu:</strong> Tüm Bitki Koruma Ürünlerini listeleme, ekleme, güncelleme, silme ve toplu veri yükleme (Excel/CSV) yetkilerine sahipsiniz.</span>
                    <span class="badge">Yönetici</span>
                `;
            } else {
                bannerContainer.className = "auth-status-banner read-only";
                bannerContainer.innerHTML = `
                    <span>🔒 <strong>Salt Okunur Mod:</strong> Bitki Koruma Ürünlerini arama, inceleme ve dozaj hesaplama yetkiniz vardır. Ekleme, silme ve düzenleme alanları kısıtlanmıştır.</span>
                    <span class="badge">Salt Okunur</span>
                `;
                
                // Hide Yeni BKÜ / İlaç Ekle tab button
                const addBkuBtn = document.getElementById("btn-addBku");
                if (addBkuBtn) {
                    addBkuBtn.style.display = "none";
                }
                
                // Inject style to hide admin-only elements
                const style = document.createElement('style');
                style.innerHTML = '.admin-only { display: none !important; }';
                document.head.appendChild(style);
            }
        }

        loadDatabase();

        // Fetch BKU custom database from server
        fetch("api/get_bku_custom.php")
            .then(res => res.json())
            .then(serverDb => {
                if (Array.isArray(serverDb) && serverDb.length > 0) {
                    let updated = false;
                    DEFAULT_BKU_DATABASE.forEach(defItem => {
                        const existing = serverDb.find(item => 
                            item.ad === defItem.ad && 
                            item.bitki === defItem.bitki && 
                            item.aktif === defItem.aktif &&
                            item.hedef === defItem.hedef
                        );
                        if (existing) {
                            if (existing.grup !== defItem.grup) {
                                existing.grup = defItem.grup;
                                updated = true;
                            }
                        } else {
                            serverDb.push(defItem);
                            updated = true;
                        }
                    });
                    bkuDatabase = deduplicateDatabase(serverDb);
                    localStorage.setItem("bku_rehberi_db_v1", JSON.stringify(bkuDatabase));
                    if (updated) {
                        saveDatabaseToLocalStorage();
                    }
                    updateStats();
                    renderPlantPillFilters();
                    renderBkuTable();
                }
            })
            .catch(err => {
                console.warn("Sunucu BKÜ veritabanı senkronizasyon hatası:", err);
            });

        // Back to Top floating button handler
        const backToTopBtn = document.getElementById("backToTopBtn");
        if (backToTopBtn) {
            window.addEventListener("scroll", () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add("visible");
                } else {
                    backToTopBtn.classList.remove("visible");
                }
            });
            backToTopBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        // Setup stats & forms
        updateStats();
        renderPlantPillFilters();
        renderBkuTable();

        // Load Selection List and Inputs state from localStorage
        try {
            const storedListName = localStorage.getItem("bku_selected_list_name_v1");
            if (storedListName) {
                const nameInput = document.getElementById("cartListName");
                if (nameInput) nameInput.value = storedListName;
            }
            
            const storedTotalWater = localStorage.getItem("bku_cart_total_water_v1");
            if (storedTotalWater) {
                const totalWaterInput = document.getElementById("cartTotalWater");
                if (totalWaterInput) totalWaterInput.value = storedTotalWater;
            }
            
            const storedHolderCap = localStorage.getItem("bku_cart_holder_cap_v1");
            if (storedHolderCap) {
                const holderCapInput = document.getElementById("cartHolderCap");
                if (holderCapInput) holderCapInput.value = storedHolderCap;
            }
            
            const storedWaterPerDa = localStorage.getItem("bku_cart_water_per_da_v1");
            if (storedWaterPerDa) {
                const waterPerDaInput = document.getElementById("cartWaterPerDa");
                if (waterPerDaInput) waterPerDaInput.value = storedWaterPerDa;
            }
        } catch (e) {
            console.error("Failed to load cart settings:", e);
        }

        // Load selection list array and render it
        try {
            const storedList = localStorage.getItem("bku_selected_list_v1");
            if (storedList) {
                selectedBkuList = JSON.parse(storedList);
            }
        } catch (e) {
            console.error("Failed to load selected Bku list:", e);
        }

        // Render selected list (will display card if list is loaded OR if there are saved lists)
        try {
            renderSelectedBkuList();
            renderBkuTable();
        } catch (e) {
            console.error("Failed to render selected list on load:", e);
        }
        
        // Load saved lists in dropdown
        try {
            updateSavedListsDropdown();
        } catch (e) {
            console.error("Failed to populate saved lists dropdown:", e);
        }

        // Fetch saved lists from server
        fetch("api/get_bku_lists.php")
            .then(res => res.json())
            .then(serverLists => {
                if (serverLists && typeof serverLists === 'object' && !Array.isArray(serverLists)) {
                    let localLists = {};
                    try {
                        const stored = localStorage.getItem("bku_saved_lists_v1");
                        if (stored) localLists = JSON.parse(stored);
                    } catch (e) {}

                    const mergedLists = { ...localLists };
                    for (const [name, serverList] of Object.entries(serverLists)) {
                        const localList = mergedLists[name];
                        if (!localList || (serverList.timestamp && (!localList.timestamp || serverList.timestamp > localList.timestamp))) {
                            mergedLists[name] = serverList;
                        }
                    }

                    localStorage.setItem("bku_saved_lists_v1", JSON.stringify(mergedLists));
                    updateSavedListsDropdown();
                    renderSelectedBkuList();
                }
            })
            .catch(err => {
                console.warn("Sunucu kayıtlı listeleri senkronizasyon hatası:", err);
            });
        
        // Setup Date picker to present near future defaults
        const today = new Date();
        const futureDate = new Date(today.getFullYear(), today.getMonth() + 4, today.getDate());
        document.getElementById("builderHarvestDate").value = futureDate.toISOString().split('T')[0];

        // Event listeners for searches
        document.getElementById("searchQuery").addEventListener("input", filterAndRenderTable);
        document.getElementById("filterGrup").addEventListener("change", filterAndRenderTable);
        document.getElementById("filterAktif").addEventListener("change", filterAndRenderTable);
        document.getElementById("filterMensei").addEventListener("change", filterAndRenderTable);

        // Dark mode setup
        const themeBtn = document.getElementById("themeToggleBtn");
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
        });

        // Setup Drag & Drop for Excel / CSV Imports
        const dropZone = document.getElementById("importDropZone");
        if (dropZone) {
            ["dragenter", "dragover"].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    dropZone.classList.add("dragover");
                }, false);
            });

            ["dragleave", "drop"].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    dropZone.classList.remove("dragover");
                }, false);
            });

            dropZone.addEventListener("drop", (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files.length > 0) {
                    const mockEvent = { target: { files: files } };
                    handleFileImport(mockEvent);
                }
            }, false);
        }
    });

    function cleanAllUyari() {
        bkuDatabase.forEach(item => {
            if (item && item.uyari) {
                item.uyari = item.uyari.replace(/\.?\s*Ruhsatl[ıi]\s+ve\s+tavsiyelidir\.?/gi, "").trim();
                if (item.uyari.endsWith(".")) {
                    item.uyari = item.uyari.slice(0, -1).trim();
                }
            }
        });
    }

    function deduplicateDatabase(db) {
        if (!Array.isArray(db)) return [];
        const seen = new Set();
        return db.filter(item => {
            if (!item) return false;
            const bitki = (item.bitki || "").trim().toUpperCase();
            const ad = (item.ad || "").trim().toUpperCase();
            const aktif = (item.aktif || "").trim().toUpperCase();
            const hedef = (item.hedef || "").trim().toUpperCase();
            const dozText = (item.dozText || "").trim().toUpperCase();
            const phi = item.phi || 0;
            const key = `${bitki}|${ad}|${aktif}|${hedef}|${dozText}|${phi}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function loadDatabase() {
        try {
            if (localStorage.getItem("bku_rehberi_db_v1")) {
                const parsed = JSON.parse(localStorage.getItem("bku_rehberi_db_v1"));
                // Verify the array structure to prevent rendering crash due to corrupted old data
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0] && typeof parsed[0] === 'object' && 'ad' in parsed[0]) {
                    // Sync with DEFAULT_BKU_DATABASE to automatically import any new default items
                    let updated = false;
                    DEFAULT_BKU_DATABASE.forEach(defItem => {
                        const existing = parsed.find(item => 
                            item.ad === defItem.ad && 
                            item.bitki === defItem.bitki && 
                            item.aktif === defItem.aktif &&
                            item.hedef === defItem.hedef
                        );
                        if (existing) {
                            if (existing.grup !== defItem.grup) {
                                existing.grup = defItem.grup;
                                updated = true;
                            }
                        } else {
                            parsed.push(defItem);
                            updated = true;
                        }
                    });
                    bkuDatabase = deduplicateDatabase(parsed);
                } else {
                    // Invalid structure fallback
                    bkuDatabase = deduplicateDatabase([...DEFAULT_BKU_DATABASE]);
                }
            } else {
                bkuDatabase = deduplicateDatabase([...DEFAULT_BKU_DATABASE]);
            }
        } catch (e) {
            console.error("Localstorage parsing error, resetting to default:", e);
            bkuDatabase = deduplicateDatabase([...DEFAULT_BKU_DATABASE]);
        }

        saveDatabaseToLocalStorage();
    }

    // Forceful DB reset option
    function resetDatabaseToDefault() {
        if (localStorage.getItem('userRole') !== 'admin') {
            alert("Bu işlem için yönetici yetkiniz bulunmamaktadır!");
            return;
        }
        if (confirm("Mevcut veritabanınızı fabrika ayarlarına sıfırlamak istiyor musunuz? (Tüm el yapımı eklemeleriniz silinecektir!)")) {
            localStorage.removeItem("bku_rehberi_db_v1");
            bkuDatabase = [...DEFAULT_BKU_DATABASE];
            saveDatabaseToLocalStorage();
            
            updateStats();
            activePlantFilter = "";
            renderPlantPillFilters();
            renderBkuTable();
            alert("Veritabanı başarıyla fabrika ayarlarına sıfırlandı!");
        }
    }

    function updateStats() {
        document.getElementById("statTotalBku").textContent = bkuDatabase.length;
    }

    function switchTab(tabId) {
        const userRole = localStorage.getItem('userRole') || 'viewer';
        if (tabId === 'addBku' && userRole !== 'admin') {
            alert("Yeni BKÜ ekleme/düzenleme yetkiniz bulunmamaktadır!");
            return;
        }

        document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add("active");
        
        // Highlight active tab button dynamically by ID
        const btn = document.getElementById("btn-" + tabId);
        if (btn) {
            btn.classList.add("active");
        }

        // Show/hide floating action button based on active tab and cart state
        const floatingBtn = document.getElementById("floatingCartBtn");
        if (floatingBtn) {
            if (tabId === "dbView" && selectedBkuList.length > 0) {
                floatingBtn.style.display = "flex";
            } else {
                floatingBtn.style.display = "none";
            }
        }

        if (tabId === "bannedProductsTab") {
            renderBannedProductsTab();
        } else if (tabId === "selectedBkuCart") {
            renderSelectedBkuList();
        }
    }

    function renderBannedProductsTab() {
        const tbody = document.getElementById("bannedProductsTableBody");
        if (!tbody) return;

        const searchQuery = (document.getElementById("bannedSearchQuery")?.value || "").toLowerCase();

        // Check if BANNED_ACTIVE_INGREDIENTS is defined
        if (typeof BANNED_ACTIVE_INGREDIENTS === 'undefined') {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-light);">Yasaklı aktif maddeler listesi yüklenemedi.</td></tr>`;
            return;
        }

        // Filter the BANNED_ACTIVE_INGREDIENTS array from the Excel file
        const filteredBanned = BANNED_ACTIVE_INGREDIENTS.filter(item => {
            if (!item) return false;
            
            const ad = item.ad || "";
            const ithalat = item.ithalat || "";
            const imalat = item.imalat || "";
            const kullanim = item.kullanim || "";

            const matchesQuery = ad.toLowerCase().includes(searchQuery) ||
                                 ithalat.toLowerCase().includes(searchQuery) ||
                                 imalat.toLowerCase().includes(searchQuery) ||
                                 kullanim.toLowerCase().includes(searchQuery);

            return matchesQuery;
        });

        if (filteredBanned.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-light);">Aranan kriterlere uygun yasaklı aktif madde bulunamadı.</td></tr>`;
            return;
        }

        let html = "";
        filteredBanned.forEach(item => {
            const no = item.no || "-";
            const ad = item.ad || "";
            const ithalat = item.ithalat || "-";
            const imalat = item.imalat || "-";
            const kullanim = item.kullanim || "-";

            html += `
                <tr style="background-color: rgba(231,76,60,0.01); border-left: 3px solid #e74c3c;">
                    <td style="text-align: center; font-weight: 700; color: var(--text-light);">${no}</td>
                    <td>
                        <span style="font-size: 1.05rem; font-weight: 700; color: #e74c3c; font-family: var(--font-display);">${ad}</span>
                    </td>
                    <td><span style="font-weight: 600; font-size: 0.9rem;">${ithalat}</span></td>
                    <td><span style="font-weight: 600; font-size: 0.9rem;">${imalat}</span></td>
                    <td><span class="badge-phi phi-danger" style="font-weight: 700; font-size: 0.9rem;">⏳ ${kullanim}</span></td>
                    <td style="text-align: center;">
                        <span class="badge-phi phi-danger" style="font-weight: bold; font-size: 0.8rem; display: inline-block; background-color: rgba(231, 76, 60, 0.08); border: 1px solid rgba(231, 76, 60, 0.2); padding: 4px 10px; border-radius: 6px;">🚫 KULLANIMI YASAKTIR</span>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // ------------------------------------------------------------- */
    // DATABASE RENDERERS & FILTER HANDLERS
    // ------------------------------------------------------------- */
    function populateActiveIngredientFilter() {
        const select = document.getElementById("filterAktif");
        if (!select) return;

        const activesSet = new Set();
        bkuDatabase.forEach(item => {
            if (item && item.aktif) {
                const parts = item.aktif.split(/\+|ve/);
                parts.forEach(part => {
                    let clean = part.replace(/^\s*(?:%\s*)?\d+(?:[\.,]\d+)?\s*(g\/l|g\/kg|%|g\/t|mg\/l|mg|g\/da|g|ml)?/gi, "")
                                    .replace(/[%]/g, "")
                                    .replace(/^[^a-zA-Z0-9çÇıİğĞöÖşŞüÜ(]+/, "")
                                    .replace(/[^a-zA-Z0-9çÇıİğĞöÖşŞüÜ)]+$/, "")
                                    .trim();
                    if (clean) {
                        clean = clean.split(' ')
                                     .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                     .join(' ');
                        activesSet.add(clean);
                    }
                });
            }
        });

        const sortedActives = Array.from(activesSet).sort((a, b) => a.localeCompare(b, 'tr'));

        const currentVal = select.value;

        let html = '<option value="">Tümü</option>';
        sortedActives.forEach(act => {
            html += `<option value="${act.toLowerCase()}">${act}</option>`;
        });
        select.innerHTML = html;

        if (currentVal) {
            select.value = currentVal;
        }
    }

    function renderPlantPillFilters() {
        const counts = {};
        bkuDatabase.forEach(item => {
            if (item && item.bitki) {
                counts[item.bitki] = (counts[item.bitki] || 0) + 1;
            }
        });

        const container = document.getElementById("plantPillFilters");
        let html = `<button class="pill-btn ${activePlantFilter === "" ? 'active' : ''}" onclick="setPlantFilter('')">🌐 Hepsi (${bkuDatabase.length})</button>`;
        
        const plants = ["ELMA", "ARMUT", "AYVA", "ŞEFTALİ", "NEKTARİN", "KAYISI", "KİRAZ", "CEVİZ", "ERİK", "VİŞNE", "BADEM"];
        plants.forEach(plant => {
            const count = counts[plant] || 0;
            const emoji = getPlantEmoji(plant);
            html += `<button class="pill-btn ${activePlantFilter === plant ? 'active' : ''}" onclick="setPlantFilter('${plant}')">${emoji} ${plant} (${count})</button>`;
        });

        container.innerHTML = html;
        populateActiveIngredientFilter();
    }

    function setPlantFilter(plant) {
        activePlantFilter = plant;
        renderPlantPillFilters();
        filterAndRenderTable();
    }

    function getPlantEmoji(plant) {
        switch(plant) {
            case "ELMA": return "🍎";
            case "ARMUT": return "🍐";
            case "AYVA": return "🍋";
            case "ŞEFTALİ": return "🍑";
            case "NEKTARİN": return "🍑";
            case "KAYISI": return "🍑";
            case "KİRAZ": return "🍒";
            case "CEVİZ": return "🥥";
            case "ERİK": return "🍇";
            case "VİŞNE": return "🍒";
            case "BADEM": return "🥜";
            default: return "🌿";
        }
    }

    // Chronological Date Parsing Helper
    function parseDate(dateStr) {
        if (!dateStr || dateStr === "-") return new Date(0);
        const parts = dateStr.split(".");
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return new Date(0);
    }

    function filterAndRenderTable() {
        const query = (document.getElementById("searchQuery").value || "").toLowerCase();
        const grup = document.getElementById("filterGrup").value;
        const aktif = document.getElementById("filterAktif").value;
        const mensei = document.getElementById("filterMensei").value;

        const filtered = bkuDatabase.filter(item => {
            if (!item) return false;
            
            const itemBitki = item.bitki || "";
            const itemAd = item.ad || "";
            const itemAktif = item.aktif || "";
            const itemGrup = item.grup || "";

            const matchesPlant = activePlantFilter === "" || itemBitki === activePlantFilter;
            const matchesGrup = grup === "" || itemGrup === grup;
            
            let matchesAktif = true;
            if (aktif !== "") {
                matchesAktif = itemAktif.toLowerCase().includes(aktif);
            }
            
            let matchesMensei = true;
            if (mensei !== "") {
                matchesMensei = itemAd.includes(`(${mensei})`);
            }

            const matchesQuery = itemAd.toLowerCase().includes(query) || 
                                 itemAktif.toLowerCase().includes(query) || 
                                 itemGrup.toLowerCase().includes(query) ||
                                 itemBitki.toLowerCase().includes(query) ||
                                 (item.hedef || "").toLowerCase().includes(query) ||
                                 (item.uyari || "").toLowerCase().includes(query);

            return matchesPlant && matchesGrup && matchesAktif && matchesMensei && matchesQuery;
        });

        // Automatically sort by Tavsiye Tarihi in descending chronological order
        filtered.sort((a, b) => {
            const dateA = parseDate(a.tarih);
            const dateB = parseDate(b.tarih);
            return dateB - dateA;
        });

        renderTableRows(filtered);
    }

    function renderBkuTable() {
        filterAndRenderTable();
    }

    function renderTableRows(data) {
        const tbody = document.getElementById("bkuTableBody");
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-light);">Aranan kriterlere uygun bitki koruma ürünü bulunamadı.</td></tr>`;
            return;
        }

        // Update selectAllBku checkbox state dynamically
        const selectAllCheckbox = document.getElementById("selectAllBku");
        if (selectAllCheckbox) {
            const allFilteredSelected = data.every(item => 
                selectedBkuList.some(s => s.ad === item.ad && s.bitki === item.bitki)
            );
            selectAllCheckbox.checked = data.length > 0 && allFilteredSelected;
        }

        let html = "";
        data.forEach((item, index) => {
            if (!item) return;

            const originalIndex = bkuDatabase.indexOf(item);
            
            const bitki = item.bitki || "";
            const ad = item.ad || "";
            const aktif = item.aktif || "";
            const grup = item.grup || "";
            const dozText = item.dozText || "";
            const phi = parseInt(item.phi) || 0;
            const tarih = item.tarih || "";

            // Check if item is already in selection cart
            const isSelected = selectedBkuList.some(s => s.ad === ad && s.bitki === bitki);
            const checkedAttr = isSelected ? "checked" : "";

            // Format PHI
            let phiHtml = "";
            if (phi === 0) {
                phiHtml = `<span class="badge-phi phi-success">✔ 0 Gün (Güvenli)</span>`;
            } else {
                const colorClass = phi > 20 ? 'phi-danger' : (phi > 10 ? 'phi-warning' : 'phi-success');
                phiHtml = `<span class="badge-phi ${colorClass}">⏳ ${phi} Gün</span>`;
            }

            // Parse Group Badges
            let grupClass = "badge-insecticide";
            if (grup === "Feromon") grupClass = "badge-pheromone";
            if (grup === "Fungisit") grupClass = "badge-fungicide";
            if (grup === "Akarisit") grupClass = "badge-acaricide";
            if (grup === "Foliar") grupClass = "badge-foliar";
            if (grup === "Diğer") grupClass = "badge-other";

            // Parse Origin Badges (removed as requested)

            // Check if active ingredient is banned
            const bannedIng = typeof checkBannedActiveIngredient !== 'undefined' ? checkBannedActiveIngredient(aktif) : null;
            let bannedWarningHtml = "";
            let rowStyle = "";
            if (bannedIng) {
                bannedWarningHtml = `<br><span class="badge-phi phi-danger" style="margin-top: 4px; display: inline-block;">⚠️ YASAKLI: ${bannedIng}</span>`;
                rowStyle = `style="background-color: rgba(231,76,60,0.04); border-left: 3px solid #e74c3c;"`;
            }

            const detailToggleHtml = `<br><a href="javascript:void(0)" class="detail-toggle-link" onclick="toggleBkuDetails(${originalIndex})" id="detail_toggle_btn_${originalIndex}" style="font-size:0.75rem; text-decoration:none; color:var(--primary-light); font-weight:600; display:inline-flex; align-items:center; gap:3px; margin-top:4px;">ℹ️ Zirai Detaylar & Hava Hassasiyeti</a>`;

            html += `
                <tr ${rowStyle} id="bku_row_${originalIndex}">
                    <td style="text-align: center; vertical-align: middle;">
                        <input type="checkbox" class="bku-row-checkbox" data-index="${originalIndex}" onchange="handleBkuRowCheckboxChange(this, ${originalIndex})" ${checkedAttr} style="width: 16px; height: 16px; cursor: pointer;">
                    </td>
                    <td><span class="plant-cell">${getPlantEmoji(bitki)} ${bitki}</span></td>
                    <td><span style="font-size:0.85rem; font-weight:600; color:var(--primary-light); display:inline-block; max-width:220px; overflow-wrap:anywhere;">${getCleanHedef(item)}</span></td>
                    <td>
                        <span class="product-name-cell">${ad}</span>
                        ${detailToggleHtml}
                    </td>
                    <td>
                        <span style="font-size:0.88rem; font-weight:500;">${aktif}</span>${bannedWarningHtml}<br>
                        ${(function() {
                            const moaInfo = getResistanceInfo(aktif, grup);
                            const bClass = moaInfo.code.includes('FRAC') ? 'moa-frac' : (moaInfo.code.includes('IRAC') ? 'moa-irac' : 'moa-low-risk');
                            return `<span class="badge-moa ${bClass}" style="margin-top:4px;" title="${moaInfo.name}: ${moaInfo.desc}">${moaInfo.code}</span>`;
                        })()}
                    </td>
                    <td><code style="background:#f1f3f5; padding:2px 6px; border-radius:4px; font-weight:600; font-size:0.85rem;">${dozText}</code></td>
                    <td>${phiHtml}</td>
                    <td><span style="font-size:0.85rem; color:var(--text-light); font-weight:500;">${tarih}</span></td>
                    <td class="admin-only">
                        <div class="action-btn-group">
                            <button class="btn-action btn-edit" onclick="editBku(${originalIndex})" title="Düzenle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            </button>
                            <button class="btn-action btn-delete" onclick="deleteBku(${originalIndex})" title="Sil">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </td>
                </tr>
                <tr id="bku_detail_row_${originalIndex}" class="bku-detail-row" style="display: none; background-color: var(--bg-card);">
                    <td colspan="9">
                        <div class="bku-details-wrapper" id="bku_details_wrapper_${originalIndex}" style="padding: 15px; border-left: 4px solid var(--primary-light); background-color: rgba(25, 135, 84, 0.02); border-radius: 0 8px 8px 0; margin: 5px 0;">
                            <!-- Filled dynamically -->
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // CRUD ACTIONS
    function saveBku(e) {
        e.preventDefault();
        if (localStorage.getItem('userRole') !== 'admin') {
            alert("Bu işlem için yönetici yetkiniz bulunmamaktadır!");
            return;
        }

        const editIndexVal = document.getElementById("editIndex").value;
        const aktifVal = document.getElementById("formAktif").value;
        const bannedIng = typeof checkBannedActiveIngredient !== 'undefined' ? checkBannedActiveIngredient(aktifVal) : null;
        if (bannedIng) {
            if (!confirm(`⚠️ DİKKAT: Eklemek/güncellemek istediğiniz ilacın aktif maddesi (${bannedIng}) ithalatı/imalatı durdurulmuş YASAKLI bir maddedir!\n\nYine de kaydetmek istiyor musunuz?`)) {
                return;
            }
        }
        const record = {
            bitki: document.getElementById("formBitki").value,
            ad: document.getElementById("formAd").value.toUpperCase(),
            aktif: document.getElementById("formAktif").value,
            grup: document.getElementById("formGrup").value,
            hedef: document.getElementById("formHedef").value,
            dozText: document.getElementById("formDozText").value,
            dozDeger: parseFloat(document.getElementById("formDozDeger").value) || 0,
            dozBirim: document.getElementById("formDozBirim").value,
            dozHacim: parseFloat(document.getElementById("formDozHacim").value) || 1,
            dozTip: document.getElementById("formDozTip").value,
            phi: parseInt(document.getElementById("formPhi").value) || 0,
            tarih: document.getElementById("formTarih").value,
            uyari: document.getElementById("formUyari").value
        };

        if (editIndexVal !== "") {
            // Update
            bkuDatabase[parseInt(editIndexVal)] = record;
        } else {
            // Create
            bkuDatabase.push(record);
        }

        saveDatabaseToLocalStorage();
        
        // Reset and notify
        document.getElementById("bkuForm").reset();
        document.getElementById("editIndex").value = "";
        document.getElementById("formTitle").innerHTML = `➕ Yeni Ruhsatlı BKÜ / İlaç Tanımlama Arayüzü`;

        updateStats();
        renderPlantPillFilters();
        renderBkuTable();
        switchTab("dbView");
    }

    function editBku(index) {
        if (localStorage.getItem('userRole') !== 'admin') {
            alert("Bu işlem için yönetici yetkiniz bulunmamaktadır!");
            return;
        }
        const item = bkuDatabase[index];
        if (!item) return;
        
        document.getElementById("editIndex").value = index;
        document.getElementById("formBitki").value = item.bitki || "ELMA";
        document.getElementById("formAd").value = item.ad || "";
        document.getElementById("formAktif").value = item.aktif || "";
        document.getElementById("formGrup").value = item.grup || "İnsektisit";
        document.getElementById("formHedef").value = item.hedef || "";
        document.getElementById("formDozText").value = item.dozText || "";
        document.getElementById("formDozDeger").value = item.dozDeger || "";
        document.getElementById("formDozBirim").value = item.dozBirim || "ml";
        document.getElementById("formDozHacim").value = item.dozHacim || "";
        document.getElementById("formDozTip").value = item.dozTip || "su";
        document.getElementById("formPhi").value = item.phi || 0;
        document.getElementById("formTarih").value = item.tarih || "";
        document.getElementById("formUyari").value = item.uyari || "";

        document.getElementById("formTitle").innerHTML = `📝 BKÜ Kaydı Güncelleme Paneli: <span style="color:var(--secondary);">${item.ad || ''}</span>`;
        switchTab("addBku");
    }

    function deleteBku(index) {
        if (localStorage.getItem('userRole') !== 'admin') {
            alert("Bu işlem için yönetici yetkiniz bulunmamaktadır!");
            return;
        }
        if (confirm("Bu bitki koruma ürünü kaydını kalıcı olarak silmek istediğinizden emin misiniz?")) {
            bkuDatabase.splice(index, 1);
            saveDatabaseToLocalStorage();
            updateStats();
            renderPlantPillFilters();
            renderBkuTable();
        }
    }

    function cancelEdit() {
        document.getElementById("bkuForm").reset();
        document.getElementById("editIndex").value = "";
        document.getElementById("formTitle").innerHTML = `➕ Yeni Ruhsatlı BKÜ / İlaç Tanımlama Arayüzü`;
        switchTab("dbView");
    }


    // ------------------------------------------------------------- */
    // INTERACTIVE SPRAYING PROGRAM BUILDER MODULE
    // ------------------------------------------------------------- */
    function onProgramPlantChange() {
        const selectedPlant = document.getElementById("builderPlant").value;
        document.getElementById("builderSummaryPlantText").textContent = selectedPlant;
        // Reset rounds to avoid mixing mismatching BKUs
        sprayingProgram.rounds = [];
        document.getElementById("sprayingRoundsContainer").innerHTML = "";
    }

    function goToStep(stepNum) {
        // Toggle step contents
        document.querySelectorAll(".step-content").forEach(el => el.classList.remove("active"));
        document.getElementById(`step${stepNum}Content`).classList.add("active");

        // Toggle progress indicators
        document.querySelectorAll(".step-item").forEach((el, index) => {
            el.classList.remove("active", "completed");
            if (index + 1 < stepNum) {
                el.classList.add("completed");
            } else if (index + 1 === stepNum) {
                el.classList.add("active");
            }
        });

        if (stepNum === 2) {
            // Save step 1 data
            sprayingProgram.gardenName = document.getElementById("builderGardenName").value;
            sprayingProgram.plant = document.getElementById("builderPlant").value;
            sprayingProgram.area = parseFloat(document.getElementById("builderArea").value) || 0;
            sprayingProgram.tankCapacity = parseFloat(document.getElementById("builderTankCapacity").value) || 100;
            sprayingProgram.waterRate = parseFloat(document.getElementById("builderWaterRate").value) || 50;
            sprayingProgram.harvestDate = document.getElementById("builderHarvestDate").value;
            sprayingProgram.stage = document.getElementById("builderStage").value;
            sprayingProgram.weather = document.getElementById("builderWeather").value;

            document.getElementById("builderSummaryPlantText").textContent = sprayingProgram.plant;

            // Render agronomical advice panel
            renderAgronomicalAdvisory();

            // If empty rounds, add one by default
            if (sprayingProgram.rounds.length === 0) {
                addSprayingRound();
            } else {
                renderSprayingRounds();
            }
        }

        if (stepNum === 3) {
            // Compile Step 2 inputs into program state
            compileStep2Rounds();
            
            // Build report card
            renderProgramReportCard();
        }
    }

    function addSprayingRound() {
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        const roundId = "ts_step_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
        const index = sprayingProgram.rounds.length + 1;
        
        // Add round structure
        sprayingProgram.rounds.push({
            id: roundId,
            stage: `Uygulama Etap ${index}`,
            targetPest: "",
            bkuAd: "",
            bkuAds: [],
            date: formatDate(today)
        });

        renderSprayingRounds();
    }
    window.addSprayingRound = addSprayingRound;

    window.addBkuDropdownToRound = function(roundId) {
        const round = sprayingProgram.rounds.find(r => r.id === roundId);
        if (round) {
            if (!round.bkuAds) round.bkuAds = round.bkuAd ? [round.bkuAd] : [];
            round.bkuAds.push(""); // Add an empty select
            renderSprayingRounds();
        }
    };

    window.removeBkuFromRound = function(roundId, index) {
        const round = sprayingProgram.rounds.find(r => r.id === roundId);
        if (round) {
            if (!round.bkuAds) round.bkuAds = round.bkuAd ? [round.bkuAd] : [];
            round.bkuAds.splice(index, 1);
            round.bkuAd = round.bkuAds[0] || ""; // Sync primary
            renderSprayingRounds();
        }
    };

    window.onRoundBkuListChange = function(roundId, index, bkuName) {
        const round = sprayingProgram.rounds.find(r => r.id === roundId);
        if (round) {
            if (!round.bkuAds) round.bkuAds = round.bkuAd ? [round.bkuAd] : [];
            round.bkuAds[index] = bkuName;
            round.bkuAd = round.bkuAds[0] || ""; // Sync primary
            
            // Automatically set target pest if empty
            const bku = bkuDatabase.find(item => item && item.ad === bkuName && item.bitki === sprayingProgram.plant);
            const cleanHedefVal = getCleanHedef(bku);
            if (bku && cleanHedefVal !== "-") {
                const cardEl = document.getElementById(`round_card_${roundId}`);
                if (cardEl) {
                    const pestInput = cardEl.querySelector(".input-pest");
                    if (pestInput && (!pestInput.value || pestInput.value.trim() === "")) {
                        pestInput.value = cleanHedefVal;
                        round.targetPest = cleanHedefVal;
                    }
                }
            }
        }
        calculateRoundDoseAndSafety(roundId);
    };

    function removeSprayingRound(id) {
        sprayingProgram.rounds = sprayingProgram.rounds.filter(r => r.id !== id);
        renderSprayingRounds();
    }

    function compileStep2Rounds() {
        sprayingProgram.rounds.forEach(round => {
            const cardEl = document.getElementById(`round_card_${round.id}`);
            if (cardEl) {
                round.stage = cardEl.querySelector(".input-stage").value;
                round.targetPest = cardEl.querySelector(".input-pest").value;
                round.date = cardEl.querySelector(".input-date").value;
                
                // Collect multiple selects
                const bkuSelects = Array.from(cardEl.querySelectorAll(".input-bku"));
                round.bkuAds = bkuSelects.map(sel => sel.value).filter(val => val && val.trim() !== "");
                round.bkuAd = round.bkuAds[0] || ""; // Sync primary for backwards compatibility
            }
        });
    }

    function renderSprayingRounds() {
        const container = document.getElementById("sprayingRoundsContainer");
        if (sprayingProgram.rounds.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px; border:2px dashed #ccc; border-radius:12px; color:var(--text-light);">Uygulama eklemek için sağ üstteki "+ Yeni Uygulama Ekle" butonuna basın.</div>`;
            return;
        }

        // Get matching BKUs for current plant
        const matchingBkus = bkuDatabase.filter(item => item && item.bitki === sprayingProgram.plant);

        let html = "";
        sprayingProgram.rounds.forEach((round, idx) => {
            // Ensure bkuAds exists
            if (!round.bkuAds) round.bkuAds = round.bkuAd ? [round.bkuAd] : [];

            // Let's render dropdown selects for each BKU in the mixture
            let bkuSelectionsHtml = "";
            const bkuCount = round.bkuAds.length > 0 ? round.bkuAds.length : 1;

            for (let i = 0; i < bkuCount; i++) {
                const selectedBkuName = round.bkuAds[i] || "";
                let optionsHtml = `<option value="">-- İlaç Seçiniz --</option>`;
                matchingBkus.forEach(bku => {
                    const bkuAd = bku.ad || "";
                    const bkuGrup = bku.grup || "";
                    const selectedAttr = bkuAd === selectedBkuName ? "selected" : "";
                    optionsHtml += `<option value="${bkuAd}" ${selectedAttr}>${bkuAd} (${bkuGrup})</option>`;
                });

                bkuSelectionsHtml += `
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <select class="form-control input-bku" onchange="onRoundBkuListChange('${round.id}', ${i}, this.value)" style="flex: 1;">
                            ${optionsHtml}
                        </select>
                        ${bkuCount > 1 ? `
                        <button type="button" class="btn btn-danger" onclick="removeBkuFromRound('${round.id}', ${i})" style="padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; background-color: #dc3545; color: white; border: none; cursor: pointer; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: bold;" title="İlacı Karışımdan Çıkar">
                            ✕
                        </button>
                        ` : ''}
                    </div>
                `;
            }

            html += `
                <div class="spray-step-card" id="round_card_${round.id}">
                    <div class="spray-step-header">
                        <span class="spray-step-number">Etap #${idx + 1} - İlaçlama</span>
                        <button class="btn-action btn-delete" onclick="removeSprayingRound('${round.id}')" title="Etabı Kaldır">
                            🗑️ Kaldır
                        </button>
                    </div>

                    <div class="form-grid-2">
                        <div class="form-group">
                            <label>Fenolojik Dönem (Zamanlama)</label>
                            <input type="text" class="form-control input-stage" value="${round.stage}" placeholder="Örn: Pembe Tomurcuk Dönemi, Fare Kulağı...">
                        </div>
                        <div class="form-group">
                            <label>Hedef Hastalık / Zararlı</label>
                            <input type="text" class="form-control input-pest" value="${round.targetPest || ''}" placeholder="Örn: Elma İçkurdu, Karaleke...">
                        </div>
                    </div>

                    <div class="form-grid-2" style="align-items: start;">
                        <div class="form-group" style="display: flex; flex-direction: column;">
                            <label>Ruhsatlı BKÜ Seçimi (Tank Karışımı)</label>
                            <div class="bku-selections-list">
                                ${bkuSelectionsHtml}
                            </div>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="addBkuDropdownToRound('${round.id}')" style="margin-top: 5px; width: fit-content; background: rgba(25, 135, 84, 0.08); border: 1.5px solid rgba(25, 135, 84, 0.2); color: var(--primary-light); cursor: pointer; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.82rem; display: flex; align-items: center; gap: 4px; height: 32px;">
                                ➕ Karışıma Başka İlaç Ekle
                            </button>
                        </div>
                        <div class="form-group">
                            <label>Uygulama Yapılacak Tarih</label>
                            <input type="date" class="form-control input-date" value="${round.date}" onchange="checkRoundSafety('${round.id}')" style="height: 38px;">
                        </div>
                    </div>

                    <!-- Dynamic warnings / calculations -->
                    <div class="round-calcs-container" id="calc_container_${round.id}">
                        <!-- Dynamically generated calculation details -->
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Perform instant alerts checks
        sprayingProgram.rounds.forEach(round => {
            calculateRoundDoseAndSafety(round.id);
        });
    }

    function checkRoundSafety(roundId) {
        const round = sprayingProgram.rounds.find(r => r.id === roundId);
        const cardEl = document.getElementById(`round_card_${round.id}`);
        if (round && cardEl) {
            round.date = cardEl.querySelector(".input-date").value;
            calculateRoundDoseAndSafety(roundId);
        }
    }

    function calculateRoundDoseAndSafety(roundId) {
        const container = document.getElementById(`calc_container_${roundId}`);
        if (!container) return;

        const round = sprayingProgram.rounds.find(r => r.id === roundId);
        if (!round) {
            container.innerHTML = "";
            return;
        }

        if (!round.bkuAds) round.bkuAds = round.bkuAd ? [round.bkuAd] : [];
        
        // Remove empty selections from calculations but keep the selects
        const activeBkuNames = round.bkuAds.filter(name => name && name.trim() !== "");

        if (activeBkuNames.length === 0) {
            container.innerHTML = "";
            return;
        }

        const tankSize = sprayingProgram.tankCapacity;
        const totalArea = sprayingProgram.area;
        const waterRate = sprayingProgram.waterRate; // L/dekar
        const totalWaterNeeded = totalArea * waterRate;
        const inputDateVal = document.getElementById(`round_card_${roundId}`).querySelector(".input-date").value;

        let combinedHtml = "";

        activeBkuNames.forEach((bkuName) => {
            const bku = bkuDatabase.find(item => item && item.ad === bkuName && item.bitki === sprayingProgram.plant);
            if (!bku) return;

            const dozBirim = bku.dozBirim || "ml";
            const dozHacim = bku.dozHacim || 100;
            const dozDeger = bku.dozDeger || 0;
            const phiVal = parseInt(bku.phi) || 0;

            let tankDose = 0;
            let totalDose = 0;

            if (bku.dozTip === "su") {
                const multiplier = tankSize / dozHacim;
                tankDose = multiplier * dozDeger;
                totalDose = (totalWaterNeeded / dozHacim) * dozDeger;
            } else {
                const areaPerTank = tankSize / waterRate;
                tankDose = areaPerTank * dozDeger;
                totalDose = totalArea * dozDeger;
            }

            const tankDoseStr = formatTankDoz(tankDose, dozBirim);
            const totalDoseStr = formatTankDoz(totalDose, dozBirim);

            let calcHtml = `
                <div class="calculation-preview" style="margin-bottom: 15px; border-left: 4px solid var(--primary); padding-left: 10px;">
                    <strong style="color: var(--primary);">🎛️ Doz Karışım Sihirbazı Özeti - ${bkuName}:</strong>
                    <ul style="margin-top: 5px; list-style-type: none; padding-left: 0;">
                        <li>→ Pülverizatör tankı başına <strong>${tankDoseStr}</strong> ilaç katmalısınız.</li>
                        <li>→ Ortağınızın tamamı (${totalArea} dekar) için toplam ihtiyaç: <strong>${totalDoseStr}</strong> üründür. <span style="font-size:0.8rem; color:#666;">(Harcanacak Su: ${totalWaterNeeded} Litre)</span></li>
                    </ul>
                </div>
            `;

            // 2. CHEMICAL GROUP & RESISTANCE INFORMATION
            const currentMoa = getResistanceInfo(bku.aktif, bku.grup);
            const bClass = currentMoa.code.includes('FRAC') ? 'moa-frac' : (currentMoa.code.includes('IRAC') ? 'moa-irac' : 'moa-low-risk');
            const advisory = generateBkuDetailedInfo(bku);
            
            let moaDetailHtml = `
                <div style="margin-top: 10px; border: 1px solid rgba(0,0,0,0.08); background: rgba(0,0,0,0.02); border-radius: 8px; padding: 12px; font-size: 0.85rem; margin-bottom: 15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-weight:700; color:var(--primary);">🛡️ FRAC/IRAC Direnç Sınıflandırması (${bkuName}):</span>
                        <span class="badge-moa ${bClass}">${currentMoa.code}</span>
                    </div>
                    <p style="margin:0 0 4px 0; color:#333;"><strong>Etki Sınıfı:</strong> ${currentMoa.name} | <strong>Direnç Riski:</strong> <strong>${currentMoa.risk}</strong></p>
                    <p style="margin:0; font-size:0.8rem; color:#555; font-style:italic; line-height: 1.3; margin-bottom:10px;">${currentMoa.desc}</p>
                    
                    <div style="border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size:0.8rem;">
                        <div><strong>🐛 Hedef Evre:</strong> <span style="color:#555;">${advisory.etkiEvresi}</span></div>
                        <div><strong>🛡️ Çalışma Şekli:</strong> <span style="color:#555;">${advisory.sistemikDurum}</span></div>
                        <div><strong>🌱 Fenolojik Dönem:</strong> <span style="color:#555;">${advisory.fenoloji}</span></div>
                        <div><strong>☀ Hava Hassasiyeti:</strong> <span style="color:#555;">${advisory.havaDurumu}</span></div>
                    </div>
                </div>
            `;

            // 3. CHEMICAL GROUP ROTATION INTEGRITY CHECKER
            let resistanceWarningHtml = "";
            const currentIdx = sprayingProgram.rounds.findIndex(r => r.id === roundId);
            if (currentIdx > 0) {
                const prevRound = sprayingProgram.rounds[currentIdx - 1];
                if (prevRound) {
                    if (!prevRound.bkuAds) prevRound.bkuAds = prevRound.bkuAd ? [prevRound.bkuAd] : [];
                    const prevActiveBkuNames = prevRound.bkuAds.filter(name => name && name.trim() !== "");
                    
                    prevActiveBkuNames.forEach(prevBkuName => {
                        const prevBku = bkuDatabase.find(item => item && item.ad === prevBkuName && item.bitki === sprayingProgram.plant);
                        if (prevBku) {
                            const prevMoa = getResistanceInfo(prevBku.aktif, prevBku.grup);
                            if (currentMoa.code !== "GENEL" && currentMoa.code !== "Bilinmiyor" && currentMoa.code === prevMoa.code) {
                                const isLowRisk = currentMoa.code.includes("M") || currentMoa.code.includes("BM") || currentMoa.code.includes("F7");
                                if (!isLowRisk) {
                                    resistanceWarningHtml += `
                                        <div class="warning-alert" style="margin-top: 10px; margin-bottom: 15px;">
                                            <span>⚠️</span>
                                            <div>
                                                <strong>ETKİ GRUBU (ROTASYON) UYARISI!</strong><br>
                                                Bu etapta seçtiğiniz <strong>${bkuName}</strong> ilacı ile bir önceki etapta kullandığınız <strong>${prevBkuName}</strong> ilacı aynı etki mekanizmasına <strong>(${currentMoa.code})</strong> sahiptir.<br>
                                                <span style="font-size:0.8rem; font-weight:normal; display:inline-block; margin-top:4px;">
                                                    Zararlıların veya fungal patojenlerin bu kimyasal grubuna karşı <strong>direnç geliştirmesini</strong> önlemek için üst üste aynı etki kodlu ilaçları uygulamayınız. Farklı bir etki mekanizmasına (FRAC/IRAC grubu) sahip bir ilaç seçmeniz agronomik olarak şiddetle tavsiye edilir.
                                                </span>
                                            </div>
                                        </div>
                                    `;
                                }
                            }
                        }
                    });
                }
            }

            // 4. HASAT GÜVENLİĞİ (PHI SAFETY MONITOR)
            let safetyHtml = "";
            if (inputDateVal && sprayingProgram.harvestDate) {
                const sprayDate = new Date(inputDateVal);
                const harvestDate = new Date(sprayingProgram.harvestDate);

                // Compute difference in days
                const diffTime = harvestDate - sprayDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    safetyHtml = `
                        <div class="danger-alert" style="margin-bottom: 15px;">
                            <span>⚠️</span>
                            <div><strong>HASAT SONRASI UYGULAMA!</strong> İlaçlama tarihi planlanan hasat tarihinden sonradır. Lütfen kontrol ediniz.</div>
                        </div>
                    `;
                } else if (diffDays < phiVal) {
                    safetyHtml = `
                        <div class="danger-alert" style="margin-bottom: 15px;">
                            <span>🚨</span>
                            <div>
                                <strong>PHI GÜVENLİK ALARMI (KALINTI RİSKİ)! Hasat aralığı yetersizdir! (${bkuName})</strong><br>
                                İlacın Hasat Arası Süresi: <strong>${phiVal} gün</strong> | Hasada kalan süre: <strong>${diffDays} gün</strong>.<br>
                                <span style="font-size:0.82rem;">Lütfen ilacı değiştiriniz veya hasat tarihini en az <strong>${phiVal - diffDays} gün</strong> erteleyiniz!</span>
                            </div>
                        </div>
                    `;
                } else {
                    safetyHtml = `
                        <div style="background-color: #d1e7dd; border-left: 5px solid #0f5132; color: #0f5132; padding: 10px 15px; border-radius: 8px; margin-top: 10px; margin-bottom: 15px; font-size: 0.88rem; font-weight:600; display:flex; align-items:center; gap:8px;">
                            <span>✔</span> Hasat güvenliği sağlandı (${bkuName}). Hasada kalan süre: ${diffDays} gün (Gereken PHI: ${phiVal} gün).
                        </div>
                    `;
                }
            }

            combinedHtml += `
                <div style="border: 1px solid rgba(25, 135, 84, 0.1); border-radius: 8px; padding: 15px; background: rgba(255, 255, 255, 0.8); margin-bottom: 15px; box-shadow: var(--box-shadow-sm);">
                    <h5 style="color: var(--primary); font-family: var(--font-display); font-weight: 700; font-size: 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 5px; margin-bottom: 10px;">📦 ${bkuName}</h5>
                    ${calcHtml}
                    ${moaDetailHtml}
                    ${safetyHtml}
                    ${resistanceWarningHtml}
                </div>
            `;
        });

        container.innerHTML = combinedHtml;
    }

    // ------------------------------------------------------------- */
    // REPORT GENERATOR & PDF CARD EXPORTING
    // ------------------------------------------------------------- */
    function renderProgramReportCard() {
        // Build values in print card
        document.getElementById("printGardenName").textContent = sprayingProgram.gardenName;
        document.getElementById("printPlantName").textContent = sprayingProgram.plant;
        document.getElementById("printArea").textContent = sprayingProgram.area;
        document.getElementById("printTank").textContent = sprayingProgram.tankCapacity;
        document.getElementById("printHarvestDate").textContent = formatDateText(sprayingProgram.harvestDate);
        document.getElementById("printCreateDate").textContent = new Date().toLocaleDateString('tr-TR');

        // Render rows
        const tbody = document.getElementById("printRoundsTableBody");
        let html = "";
        
        // Setup shopping dictionary
        const shoppingDict = {};

        if (sprayingProgram.rounds.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Hiç ilaçlama adımı eklenmedi.</td></tr>`;
            return;
        }

        sprayingProgram.rounds.forEach((round, index) => {
            const activeBkuNames = (round.bkuAds && round.bkuAds.length > 0)
                ? round.bkuAds.filter(name => name && name.trim() !== "")
                : (round.bkuAd ? [round.bkuAd] : []);

            let bkuInfo = "Eklenmedi";
            let doseInfo = "-";
            let safetyInfo = "-";
            let moaBadge = "-";

            if (activeBkuNames.length > 0) {
                let bkuInfoParts = [];
                let doseInfoParts = [];
                let safetyInfoParts = [];
                let moaBadgeParts = [];

                activeBkuNames.forEach((bkuName) => {
                    const bku = bkuDatabase.find(item => item && item.ad === bkuName && item.bitki === sprayingProgram.plant);
                    if (bku) {
                        const bkuAd = bku.ad || "";
                        const bkuAktif = bku.aktif || "";
                        const dozBirim = bku.dozBirim || "ml";
                        const dozHacim = bku.dozHacim || 100;
                        const dozDeger = bku.dozDeger || 0;
                        const phiVal = parseInt(bku.phi) || 0;

                        bkuInfoParts.push(`
                            <div style="margin-bottom: 4px;">
                                <strong>${bkuAd}</strong><br>
                                <span style="font-size:0.8rem; color:#555;">${bkuAktif}</span><br>
                                <span style="font-size:0.75rem; color:var(--primary); font-weight:600;">🎯 Ruhsatlı Hedef: ${getCleanHedef(bku)}</span>
                            </div>
                        `);

                        // Calculate mixing
                        const tankSize = sprayingProgram.tankCapacity;
                        const totalArea = sprayingProgram.area;
                        const waterRate = sprayingProgram.waterRate;
                        const totalWaterNeeded = totalArea * waterRate;

                        let tankDose = 0;
                        let totalDose = 0;

                        if (bku.dozTip === "su") {
                            tankDose = (tankSize / dozHacim) * dozDeger;
                            totalDose = (totalWaterNeeded / dozHacim) * dozDeger;
                        } else {
                            tankDose = (tankSize / waterRate) * dozDeger;
                            totalDose = totalArea * dozDeger;
                        }

                        const formattedTankDose = formatTankDoz(tankDose, dozBirim);
                        const formattedTotalDose = formatTankDoz(totalDose, dozBirim);
                        doseInfoParts.push(`
                            <div style="margin-bottom: 4px;">
                                Tank başına: <strong>${formattedTankDose}</strong><br>
                                Toplam ihtiyaç: <strong>${formattedTotalDose}</strong>
                            </div>
                        `);

                        // Collect for shopping list
                        const shopKey = bkuAd + "||" + dozBirim;
                        shoppingDict[shopKey] = (shoppingDict[shopKey] || 0) + totalDose;

                        // Safety PHI
                        let currentSafetyHtml = "-";
                        if (round.date && sprayingProgram.harvestDate) {
                            const sprayDate = new Date(round.date);
                            const harvestDate = new Date(sprayingProgram.harvestDate);
                            const diffDays = Math.ceil((harvestDate - sprayDate) / (1000 * 60 * 60 * 24));

                            if (diffDays < phiVal) {
                                currentSafetyHtml = `<span style="color:var(--danger); font-weight:700;">🚨 TEHLİKELİ (KALINTI RİSKİ)<br>Süre: ${diffDays} gün, PHI: ${phiVal} gün</span>`;
                            } else {
                                currentSafetyHtml = `<span style="color:var(--success); font-weight:600;">✔ GÜVENLİ (Kalıntısız)<br>Süre: ${diffDays} gün (PHI: ${phiVal})</span>`;
                            }
                        }
                        safetyInfoParts.push(`<div style="margin-bottom: 4px;">${currentSafetyHtml}</div>`);

                        // Moa
                        const moaInfo = getResistanceInfo(bku.aktif, bku.grup);
                        const bClass = moaInfo.code.includes('FRAC') ? 'moa-frac' : (moaInfo.code.includes('IRAC') ? 'moa-irac' : 'moa-low-risk');
                        moaBadgeParts.push(`
                            <div style="margin-bottom: 4px; display: flex; flex-direction: column; align-items: center;">
                                <span class="badge-moa ${bClass}">${moaInfo.code}</span>
                                <span style="font-size:0.72rem; color:#666; font-style:italic;">${moaInfo.risk} Risk</span>
                            </div>
                        `);
                    }
                });

                if (bkuInfoParts.length > 0) {
                    bkuInfo = bkuInfoParts.join('<div style="border-top:1px dashed #ddd; margin:8px 0;"></div>');
                    doseInfo = doseInfoParts.join('<div style="border-top:1px dashed #ddd; margin:8px 0;"></div>');
                    safetyInfo = safetyInfoParts.join('<div style="border-top:1px dashed #ddd; margin:8px 0;"></div>');
                    moaBadge = moaBadgeParts.join('<div style="border-top:1px dashed #ddd; margin:8px 0;"></div>');
                }
            }

            html += `
                <tr>
                    <td style="font-weight:700; text-align:center;">Etap #${index + 1}</td>
                    <td><strong>${round.stage}</strong><br><span style="font-size:0.82rem; color:#555;">Hedef: ${round.targetPest || 'Belirtilmedi'}</span></td>
                    <td>${bkuInfo}</td>
                    <td style="text-align:center;">${moaBadge}</td>
                    <td style="font-weight:600;">${formatDateText(round.date)}</td>
                    <td>${doseInfo}</td>
                    <td>${safetyInfo}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // Render shopping list
        const shopGrid = document.getElementById("printShoppingListGrid");
        let shopHtml = "";
        
        const keys = Object.keys(shoppingDict);
        if (keys.length === 0) {
            shopGrid.innerHTML = `<div style="color:#666;">Alışveriş listesi bulunmuyor.</div>`;
            return;
        }

        keys.forEach(key => {
            const parts = key.split("||");
            const bkuName = parts[0];
            const unit = parts[1];
            const totalQty = shoppingDict[key];
            const formattedShopQty = formatTankDoz(totalQty, unit);

            shopHtml += `
                <div class="shopping-card">
                    <div class="shopping-card-header">
                        <span class="shopping-title">${bkuName}</span>
                        <span class="shopping-qty">${formattedShopQty}</span>
                    </div>
                    <p style="font-size:0.8rem; color:#555;">Bahçenizin tamamına (${sprayingProgram.area} dekar) yapılacak uygulama için toplam gereken net ürün.</p>
                </div>
            `;
        });

        shopGrid.innerHTML = shopHtml;
    }

    function formatDateText(dateStr) {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function restartProgram() {
        if (confirm("Mevcut ilaçlama programını sıfırlamak ve baştan başlamak istiyor musunuz?")) {
            sprayingProgram.rounds = [];
            goToStep(1);
        }
    }


    // ------------------------------------------------------------- */
    // STANDALONE CALCULATOR WIZARD
    // ------------------------------------------------------------- */
    function toggleCalcMode() {
        const mode = document.getElementById("calcMode").value;
        if (mode === "su") {
            document.getElementById("calcWaterInputs").style.display = "block";
            document.getElementById("calcAreaInputs").style.display = "none";
        } else {
            document.getElementById("calcWaterInputs").style.display = "none";
            document.getElementById("calcAreaInputs").style.display = "block";
        }
        document.getElementById("calcResults").style.display = "none";
    }

    function runStandaloneCalculator() {
        const mode = document.getElementById("calcMode").value;
        const resultPanel = document.getElementById("calcResults");
        
        let resultHtml = "";

        if (mode === "su") {
            const dose = parseFloat(document.getElementById("calcWaterDoz").value);
            const volume = parseFloat(document.getElementById("calcWaterHacim").value);
            const tank = parseFloat(document.getElementById("calcWaterTank").value);

            if (isNaN(dose) || isNaN(volume) || isNaN(tank) || volume <= 0) {
                alert("Lütfen geçerli sayısal değerler giriniz!");
                return;
            }

            const tankDose = (tank / volume) * dose;
            resultHtml = `
                <strong>📊 Hesaplama Raporu (Su Bazlı):</strong>
                <ul>
                    <li>${tank} Litrelik pülverizatör tankınıza eklemeniz gereken ilaç miktarı: <strong>${tankDose.toFixed(1)} birim (ml veya g)</strong>.</li>
                </ul>
            `;
        } else {
            const dose = parseFloat(document.getElementById("calcAreaDoz").value);
            const suOrani = parseFloat(document.getElementById("calcAreaSuOrani").value);
            const tank = parseFloat(document.getElementById("calcAreaTank").value);

            if (isNaN(dose) || isNaN(suOrani) || isNaN(tank) || suOrani <= 0) {
                alert("Lütfen geçerli sayısal değerler giriniz!");
                return;
            }

            const areaPerTank = tank / suOrani;
            const tankDose = areaPerTank * dose;

            resultHtml = `
                <strong>📊 Hesaplama Raporu (Alan Bazlı):</strong>
                <ul>
                    <li>1 tam tank dolusu su (${tank} L) ile <strong>${areaPerTank.toFixed(1)} dekar</strong> alan ilaçlanabilmektedir.</li>
                    <li>Dolayısıyla tank başına eklemeniz gereken ilaç miktarı: <strong>${tankDose.toFixed(1)} birim (ml/g/adet)</strong>.</li>
                </ul>
            `;
        }

        resultPanel.innerHTML = resultHtml;
        resultPanel.style.display = "block";
    }

    // --- Bulk Data Import & Export System ---
    
    window.handleFileImport = function(event) {
        if (localStorage.getItem('userRole') !== 'admin') {
            alert("Bu işlem için yönetici yetkiniz bulunmamaktadır!");
            return;
        }
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                let importedCount = 0;
                let mergedCount = 0;
                
                // 1. JSON Backup Restore
                if (file.name.endsWith('.json')) {
                    const importedDb = JSON.parse(content);
                    if (Array.isArray(importedDb)) {
                        importedDb.forEach(item => {
                            if (item.bitki && item.ad) {
                                const key = (item.bitki.toUpperCase() + "_" + item.ad.toUpperCase());
                                const existingIndex = bkuDatabase.findIndex(x => x && (x.bitki.toUpperCase() + "_" + x.ad.toUpperCase()) === key);
                                if (existingIndex !== -1) {
                                    bkuDatabase[existingIndex] = item;
                                    mergedCount++;
                                } else {
                                    bkuDatabase.push(item);
                                    importedCount++;
                                }
                            }
                        });
                        saveDatabaseToLocalStorage();
                        alert(`✅ Yedek başarıyla geri yüklendi!\n${importedCount} yeni ilaç eklendi, ${mergedCount} mevcut ilaç güncellendi.`);
                        filterAndRenderTable();
                        updateStats();
                        return;
                    } else {
                        alert("❌ Hata: Geçersiz yedek dosyası yapısı.");
                        return;
                    }
                }

                // 2. CSV / TSV Text Import Parsing
                const lines = content.split(/\r?\n/);
                let newItems = [];
                const delimiter = detectDelimiter(content);

                lines.forEach((line, idx) => {
                    if (!line.trim()) return;
                    
                    // Skip header row
                    if (idx === 0 && (line.toLowerCase().includes("bitki") || line.toLowerCase().includes("bku"))) {
                        return;
                    }

                    let row = [];
                    if (delimiter === ',') {
                        row = parseCSVRow(line);
                    } else {
                        row = line.split(delimiter).map(x => x.trim());
                    }

                    if (row.length < 5) return;

                    const bitki = row[0].toUpperCase().trim();
                    const zararli = row[1] ? row[1].trim() : "";
                    const aktif = row[2] ? row[2].trim() : "";
                    const ad = row[3] ? row[3].trim() : "";
                    const grup = row[4] ? row[4].trim() : "";
                    
                    let dozText = row[5] ? row[5].trim() : "";
                    let phi_str = row[6] ? row[6].trim() : "";
                    let tarih = row[7] ? row[7].trim() : "";
                    let ek_uyari = row[8] ? row[8].trim() : "";

                    // Parse dosage properties
                    let dozDeger = 0.0;
                    let dozBirim = "g";
                    let dozHacim = 100;
                    let dozTip = "su";

                    const valMatch = dozText.toLowerCase().match(/([0-9.,]+)\s*(ml|g|adet|feromon|gr|lt|tuzak)/);
                    if (valMatch) {
                        const valStr = valMatch[1].replace(',', '.');
                        dozDeger = parseFloat(valStr) || 0.0;
                        dozBirim = valMatch[2];
                        if (dozBirim === "gr" || dozBirim === "g") dozBirim = "g";
                        else if (dozBirim === "ml" || dozBirim === "lt") dozBirim = "ml";
                    } else {
                        const valOnly = dozText.match(/([0-9.,]+)/);
                        if (valOnly) {
                            dozDeger = parseFloat(valOnly[1].replace(',', '.')) || 0.0;
                        }
                    }

                    if (dozText.toLowerCase().includes("dekar") || dozText.toLowerCase().includes("/da") || dozText.toLowerCase().includes("tuzak")) {
                        dozTip = "dekar";
                        dozHacim = 1;
                    } else {
                        dozTip = "su";
                        const volMatch = dozText.toLowerCase().match(/100\s*(l|lt)/);
                        if (volMatch) dozHacim = 100;
                        else dozHacim = 100;
                    }

                    // Parse PHI
                    let phi = 0;
                    const phiMatch = phi_str.match(/(\d+)/);
                    if (phiMatch) {
                        phi = parseInt(phiMatch[1]) || 0;
                    }

                    // Normalize Group
                    let cleanGrup = "Fungisit";
                    if (grup.toLowerCase().includes("insektisit")) cleanGrup = "İnsektisit";
                    else if (grup.toLowerCase().includes("feromon")) cleanGrup = "Feromon";
                    else if (grup.toLowerCase().includes("akar")) cleanGrup = "Fungisit + Akarisit";

                    // Uyari represents the target disease/organism and custom notices
                    let hedef = zararli;
                    let uyari = ek_uyari || "";
                    if (dozText.includes("**")) {
                        dozText = dozText.replace("**", "").trim();
                        uyari += (uyari ? " | " : "") + "(**) Dikkat: Özel doz uyarısı.";
                    }

                    newItems.push({
                        bitki,
                        ad,
                        aktif,
                        grup: cleanGrup,
                        hedef,
                        dozText,
                        dozDeger,
                        dozBirim,
                        dozHacim,
                        dozTip,
                        phi,
                        tarih,
                        uyari
                    });
                });

                if (newItems.length === 0) {
                    alert("❌ Geçerli bir kayıt bulunamadı. Lütfen dosya sütun düzenini kontrol edin.");
                    return;
                }

                // Merge with in-memory database
                newItems.forEach(item => {
                    const key = (item.bitki.toUpperCase() + "_" + item.ad.toUpperCase());
                    const existingIndex = bkuDatabase.findIndex(x => x && (x.bitki.toUpperCase() + "_" + x.ad.toUpperCase()) === key);
                    if (existingIndex !== -1) {
                        const existing = bkuDatabase[existingIndex];
                        // Merge date if existing has none
                        if (!existing.tarih && item.tarih) {
                            bkuDatabase[existingIndex].tarih = item.tarih;
                        }
                        // Merge warning/disease info if it differs
                        if (item.uyari && !existing.uyari.includes(item.uyari)) {
                            bkuDatabase[existingIndex].uyari = existing.uyari ? `${existing.uyari} | ${item.uyari}` : item.uyari;
                        }
                        mergedCount++;
                    } else {
                        bkuDatabase.push(item);
                        importedCount++;
                    }
                });

                // Sort and save
                bkuDatabase.sort((a, b) => {
                    const dateA = parseDate(a.tarih);
                    const dateB = parseDate(b.tarih);
                    return dateB - dateA;
                });
                saveDatabaseToLocalStorage();

                alert(`✅ Veriler başarıyla içe aktarıldı!\n${importedCount} yeni ilaç eklendi, ${mergedCount} mevcut ilaç güncellendi.`);
                filterAndRenderTable();
                updateStats();

            } catch (err) {
                console.error(err);
                alert("❌ Dosya okunurken bir hata oluştu: " + err.message);
            }
        };
        reader.readAsText(file, "UTF-8");
    };

    window.exportDatabase = function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bkuDatabase, null, 4));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "bku_veritabani_yedek.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    function detectDelimiter(text) {
        const firstLine = text.split('\n')[0];
        if (firstLine.includes('\t')) return '\t';
        if (firstLine.includes(';')) return ';';
        return ',';
    }

    function parseCSVRow(text) {
        let p = false, r = [''], j = 0;
        for (let i = 0; i < text.length; i++) {
            let c = text[i];
            if (c === '"') { p = !p; }
            else if (c === ',' && !p) { r[++j] = ''; }
            else { r[j] += c; }
        }
        return r.map(x => x.trim());
    }

    window.loadSampleProgramToBuilder = function(programKey) {
        if (!confirm("Seçtiğiniz örnek program düzenleyiciye yüklenecektir. Mevcut düzenleme durumunuz sıfırlanacaktır. Devam etmek istiyor musunuz?")) {
            return;
        }

        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];

        if (programKey === 'elma_kapsamli') {
            document.getElementById("builderGardenName").value = "Örnek Kapsamlı Elma Bahçesi";
            document.getElementById("builderPlant").value = "ELMA";
            document.getElementById("builderArea").value = "10";
            document.getElementById("builderTankCapacity").value = "2000";
            document.getElementById("builderWaterRate").value = "100";
            
            const harvestDate = new Date();
            harvestDate.setDate(today.getDate() + 90);
            document.getElementById("builderHarvestDate").value = formatDate(harvestDate);

            sprayingProgram.gardenName = "Örnek Kapsamlı Elma Bahçesi";
            sprayingProgram.plant = "ELMA";
            sprayingProgram.area = 10;
            sprayingProgram.tankCapacity = 2000;
            sprayingProgram.waterRate = 100;
            sprayingProgram.harvestDate = formatDate(harvestDate);

            const d1 = new Date();
            const d2 = new Date(); d2.setDate(today.getDate() + 10);
            const d3 = new Date(); d3.setDate(today.getDate() + 20);
            const d4 = new Date(); d4.setDate(today.getDate() + 27);
            const d5 = new Date(); d5.setDate(today.getDate() + 35);
            const d6 = new Date(); d6.setDate(today.getDate() + 45);
            const d7 = new Date(); d7.setDate(today.getDate() + 55);
            const d8 = new Date(); d8.setDate(today.getDate() + 65);
            const d9 = new Date(); d9.setDate(today.getDate() + 75);
            const d10 = new Date(); d10.setDate(today.getDate() + 85);

            sprayingProgram.rounds = [
                {
                    id: "ek_1_" + Date.now(),
                    stage: "1. Etap: Tomurcuk Kabarma (Kış Mücadelesi)",
                    targetPest: "Elma karaleke kış sporları, gövde zararlıları",
                    bkuAd: "MASTERCOP (İTHAL)",
                    date: formatDate(d1)
                },
                {
                    id: "ek_2_" + Date.now(),
                    stage: "2. Etap: Fare Kulağı (Erken İlkbahar)",
                    targetPest: "Elma karalekesi (Venturia inaequalis)",
                    bkuAd: "FLO-CAPTAN 50 WP (İTHAL)",
                    date: formatDate(d2)
                },
                {
                    id: "ek_3_" + Date.now(),
                    stage: "3. Etap: Pembe Tomurcuk (Çiçek Öncesi)",
                    targetPest: "Elma karalekesi & Külleme koruması",
                    bkuAd: "CHORUS 50 WG (İTHAL)",
                    date: formatDate(d3)
                },
                {
                    id: "ek_4_" + Date.now(),
                    stage: "4. Etap: Tam Çiçeklenme (%50-60 Çiçek)",
                    targetPest: "Karaleke ve Çiçek monilyası",
                    bkuAd: "SCALA (İTHAL)",
                    date: formatDate(d4)
                },
                {
                    id: "ek_5_" + Date.now(),
                    stage: "5. Etap: Taç Yaprak Dökümü (Meyve Bağlama)",
                    targetPest: "Karaleke ve Külleme (Direnç rotasyonu)",
                    bkuAd: "LUSEN SC 500 (İTHAL)",
                    date: formatDate(d5)
                },
                {
                    id: "ek_6_" + Date.now(),
                    stage: "6. Etap: Meyve Gelişimi (Fındık Büyüklüğü)",
                    targetPest: "1. Nesil Elma İçkurdu & Yaprak Bitleri",
                    bkuAd: "SOLADO (İMAL)",
                    date: formatDate(d6)
                },
                {
                    id: "ek_7_" + Date.now(),
                    stage: "7. Etap: Meyve Büyüme (Ceviz Büyüklüğü)",
                    targetPest: "Karaleke yaz enfeksiyonları & Külleme",
                    bkuAd: "DELAN SC (İTHAL)",
                    date: formatDate(d7)
                },
                {
                    id: "ek_8_" + Date.now(),
                    stage: "8. Etap: Yaz Ortası Mücadelesi",
                    targetPest: "2. Nesil Elma İçkurdu & Yaprak Bükücü",
                    bkuAd: "CORAGEN (İTHAL)",
                    date: formatDate(d8)
                },
                {
                    id: "ek_9_" + Date.now(),
                    stage: "9. Etap: Meyve İrileşme & Olgunlaşma",
                    targetPest: "Kırmızı Örümcekler (Avrupa & İki Noktalı)",
                    bkuAd: "KANEMITE (İTHAL)",
                    date: formatDate(d9)
                },
                {
                    id: "ek_10_" + Date.now(),
                    stage: "10. Etap: Hasat Öncesi Son Koruma",
                    targetPest: "Depo Çürüklükleri (Kalıntısız koruma)",
                    bkuAd: "VACCIPLANT (İTHAL)",
                    date: formatDate(d10)
                }
            ];
        } else if (programKey === 'kayisi_kapsamli') {
            document.getElementById("builderGardenName").value = "Örnek Sezonluk Kayısı Bahçesi";
            document.getElementById("builderPlant").value = "KAYISI";
            document.getElementById("builderArea").value = "15";
            document.getElementById("builderTankCapacity").value = "2000";
            document.getElementById("builderWaterRate").value = "100";
            
            const harvestDate = new Date();
            harvestDate.setDate(today.getDate() + 60);
            document.getElementById("builderHarvestDate").value = formatDate(harvestDate);

            sprayingProgram.gardenName = "Örnek Sezonluk Kayısı Bahçesi";
            sprayingProgram.plant = "KAYISI";
            sprayingProgram.area = 15;
            sprayingProgram.tankCapacity = 2000;
            sprayingProgram.waterRate = 100;
            sprayingProgram.harvestDate = formatDate(harvestDate);

            const d1 = new Date();
            const d2 = new Date(); d2.setDate(today.getDate() + 10);
            const d3 = new Date(); d3.setDate(today.getDate() + 18);
            const d4 = new Date(); d4.setDate(today.getDate() + 28);
            const d5 = new Date(); d5.setDate(today.getDate() + 40);
            const d6 = new Date(); d6.setDate(today.getDate() + 52);

            sprayingProgram.rounds = [
                {
                    id: "kk_1_" + Date.now(),
                    stage: "1. Etap: Tomurcuk Şişme (Kış Uykusu)",
                    targetPest: "Yaprak delen (çil) kış uykusu mücadelesi",
                    bkuAd: "NOVICURE (İMAL)",
                    date: formatDate(d1)
                },
                {
                    id: "kk_2_" + Date.now(),
                    stage: "2. Etap: Pembe/Beyaz Tomurcuk",
                    targetPest: "Çiçek monilyası (Monilinia laxa)",
                    bkuAd: "REGEV (İTHAL)",
                    date: formatDate(d2)
                },
                {
                    id: "kk_3_" + Date.now(),
                    stage: "3. Etap: Tam Çiçeklenme (%50-60 Çiçek)",
                    targetPest: "Çiçek monilyası direnç yönetimi",
                    bkuAd: "SWITCH 62.5 WG (İTHAL)",
                    date: formatDate(d3)
                },
                {
                    id: "kk_4_" + Date.now(),
                    stage: "4. Etap: Kürklü Dönem (Taç Dökümü)",
                    targetPest: "Yaprak delen (çil) ve monilya",
                    bkuAd: "MERPAN (İTHAL)",
                    date: formatDate(d4)
                },
                {
                    id: "kk_5_" + Date.now(),
                    stage: "5. Etap: Meyve Büyüme (Çağla Dönemi)",
                    targetPest: "Doğu Meyve Güvesi & Şeftali Güvesi",
                    bkuAd: "CORAGEN (İTHAL)",
                    date: formatDate(d5)
                },
                {
                    id: "kk_6_" + Date.now(),
                    stage: "6. Etap: Hasat Öncesi Olgunlaşma",
                    targetPest: "Meyve monilyası & Çürüklük",
                    bkuAd: "REVYONA (İTHAL)",
                    date: formatDate(d6)
                }
            ];
        } else if (programKey === 'seftali_kapsamli') {
            document.getElementById("builderGardenName").value = "Örnek Sezonluk Şeftali Bahçesi";
            document.getElementById("builderPlant").value = "ŞEFTALİ";
            document.getElementById("builderArea").value = "12";
            document.getElementById("builderTankCapacity").value = "2000";
            document.getElementById("builderWaterRate").value = "100";
            
            const harvestDate = new Date();
            harvestDate.setDate(today.getDate() + 75);
            document.getElementById("builderHarvestDate").value = formatDate(harvestDate);

            sprayingProgram.gardenName = "Örnek Sezonluk Şeftali Bahçesi";
            sprayingProgram.plant = "ŞEFTALİ";
            sprayingProgram.area = 12;
            sprayingProgram.tankCapacity = 2000;
            sprayingProgram.waterRate = 100;
            sprayingProgram.harvestDate = formatDate(harvestDate);

            const d1 = new Date();
            const d2 = new Date(); d2.setDate(today.getDate() + 8);
            const d3 = new Date(); d3.setDate(today.getDate() + 16);
            const d4 = new Date(); d4.setDate(today.getDate() + 24);
            const d5 = new Date(); d5.setDate(today.getDate() + 34);
            const d6 = new Date(); d6.setDate(today.getDate() + 44);
            const d7 = new Date(); d7.setDate(today.getDate() + 56);
            const d8 = new Date(); d8.setDate(today.getDate() + 68);

            sprayingProgram.rounds = [
                {
                    id: "sk_1_" + Date.now(),
                    stage: "1. Etap: Tomurcuk Şişme (Kış Sonu)",
                    targetPest: "Şeftali yaprak kıvırcıklığı (Glok)",
                    bkuAd: "CUPROXAT (İTHAL)",
                    date: formatDate(d1)
                },
                {
                    id: "sk_2_" + Date.now(),
                    stage: "2. Etap: Tomurcuk Patlama (Erken İlkbahar)",
                    targetPest: "Yaprak kıvırcıklığı ve yaprak delen",
                    bkuAd: "DELAN SC (İTHAL)",
                    date: formatDate(d2)
                },
                {
                    id: "sk_3_" + Date.now(),
                    stage: "3. Etap: Pembe Tomurcuk",
                    targetPest: "Çiçek monilyası (Monilinia laxa)",
                    bkuAd: "CHORUS 50 WG (İTHAL)",
                    date: formatDate(d3)
                },
                {
                    id: "sk_4_" + Date.now(),
                    stage: "4. Etap: Çiçek Sonu (Çanak Yaprak Dökümü)",
                    targetPest: "Çiçek monilyası ve Külleme",
                    bkuAd: "BELLIS (İTHAL)",
                    date: formatDate(d4)
                },
                {
                    id: "sk_5_" + Date.now(),
                    stage: "5. Etap: Sürgün ve Yaprak Gelişimi",
                    targetPest: "Yaprak Biti & Dut Kabuklu Biti",
                    bkuAd: "BREAKER (İTHAL)",
                    date: formatDate(d5)
                },
                {
                    id: "sk_6_" + Date.now(),
                    stage: "6. Etap: Meyve Gelişimi (Çekirdek Sertleşme)",
                    targetPest: "Doğu Meyve Güvesi & Filiz Güvesi",
                    bkuAd: "CORAGEN (İTHAL)",
                    date: formatDate(d6)
                },
                {
                    id: "sk_7_" + Date.now(),
                    stage: "7. Etap: Meyve İrileşme ve Olgunlaşma",
                    targetPest: "Doğu Meyve Güvesi rotasyonu & Yaprak bitleri",
                    bkuAd: "BELLMAC 5.7 WG (İTHAL)",
                    date: formatDate(d7)
                },
                {
                    id: "sk_8_" + Date.now(),
                    stage: "8. Etap: Hasat Öncesi Son Koruma",
                    targetPest: "Meyve monilyası ve depo çürüklükleri (Sıfır Kalıntı)",
                    bkuAd: "VACCIPLANT (İTHAL)",
                    date: formatDate(d8)
                }
            ];
        } else if (programKey === 'kiraz_kapsamli') {
            document.getElementById("builderGardenName").value = "Örnek Sezonluk Kiraz Bahçesi";
            document.getElementById("builderPlant").value = "KİRAZ";
            document.getElementById("builderArea").value = "10";
            document.getElementById("builderTankCapacity").value = "2000";
            document.getElementById("builderWaterRate").value = "100";
            
            const harvestDate = new Date();
            harvestDate.setDate(today.getDate() + 70);
            document.getElementById("builderHarvestDate").value = formatDate(harvestDate);

            sprayingProgram.gardenName = "Örnek Sezonluk Kiraz Bahçesi";
            sprayingProgram.plant = "KİRAZ";
            sprayingProgram.area = 10;
            sprayingProgram.tankCapacity = 2000;
            sprayingProgram.waterRate = 100;
            sprayingProgram.harvestDate = formatDate(harvestDate);

            const d1 = new Date();
            const d2 = new Date(); d2.setDate(today.getDate() + 10);
            const d3 = new Date(); d3.setDate(today.getDate() + 20);
            const d4 = new Date(); d4.setDate(today.getDate() + 30);
            const d5 = new Date(); d5.setDate(today.getDate() + 40);
            const d6 = new Date(); d6.setDate(today.getDate() + 50);
            const d7 = new Date(); d7.setDate(today.getDate() + 60);

            sprayingProgram.rounds = [
                {
                    id: "krk_1_" + Date.now(),
                    stage: "1. Etap: Tomurcuk Kabarma (Kış Mücadelesi)",
                    targetPest: "Bakteriyel dal kanseri & yaprak delen",
                    bkuAd: "NOVICURE (İMAL)",
                    date: formatDate(d1)
                },
                {
                    id: "krk_2_" + Date.now(),
                    stage: "2. Etap: Beyaz Tomurcuk (Çiçeklenme Öncesi)",
                    targetPest: "Çiçek monilyası koruması",
                    bkuAd: "REGEV (İTHAL)",
                    date: formatDate(d2)
                },
                {
                    id: "krk_3_" + Date.now(),
                    stage: "3. Etap: Çiçek Sonu (Taç Yaprak Dökümü)",
                    targetPest: "Kiraz yaprak lekesi & Yaprak delen (Çil)",
                    bkuAd: "DELAN SC (İTHAL)",
                    date: formatDate(d3)
                },
                {
                    id: "krk_4_" + Date.now(),
                    stage: "4. Etap: Meyve Tutumu ve Gelişimi",
                    targetPest: "Kiraz siyah yaprak biti",
                    bkuAd: "BREAKER (İTHAL)",
                    date: formatDate(d4)
                },
                {
                    id: "krk_5_" + Date.now(),
                    stage: "5. Etap: Meyve Renk Dönümü (Sarı/Pembe)",
                    targetPest: "Kiraz Sineği (Rhagoletis cerasi - kurtlanma önleyici)",
                    bkuAd: "MOSPILAN (İTHAL)",
                    date: formatDate(d5)
                },
                {
                    id: "krk_6_" + Date.now(),
                    stage: "6. Etap: Olgunlaşma (Hasat Yaklaşırken)",
                    targetPest: "Kiraz sineği & Thrips rotasyonu",
                    bkuAd: "DELEGATE (İTHAL)",
                    date: formatDate(d6)
                },
                {
                    id: "krk_7_" + Date.now(),
                    stage: "7. Etap: Hasat Öncesi Son Koruma",
                    targetPest: "Meyve Monilyası & Depo çürüklükleri",
                    bkuAd: "SIGNUM (İTHAL)",
                    date: formatDate(d7)
                }
            ];
        }

        switchTab('programBuilder');
        document.getElementById("builderSummaryPlantText").textContent = sprayingProgram.plant;
        renderAgronomicalAdvisory();
        renderSprayingRounds();
        goToStep(2);
        
        alert("✅ Örnek program başarıyla düzenleyiciye aktarıldı ve adım adım pülverizatör doz hesaplamaları ile PHI kalıntı izleyicileri dinamik olarak tetiklendi!");
    };

    function saveDatabaseToLocalStorage() {
        cleanAllUyari();
        bkuDatabase = deduplicateDatabase(bkuDatabase);
        localStorage.setItem("bku_rehberi_db_v1", JSON.stringify(bkuDatabase));

        // Sync to server
        fetch("api/save_bku_custom.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(bkuDatabase)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") {
                console.error("BKÜ veritabanı sunucuya kaydedilemedi:", data.message);
            }
        })
        .catch(err => console.error("BKÜ veritabanı sunucu senkronizasyon hatası:", err));
    }

    // --- BKÜ SEÇİM SEPETİ VE İLAÇ İHTİYAÇ HESAPLAYICI MODÜLÜ ---
    let selectedBkuList = [];

    function saveSelectedListToLocalStorage() {
        localStorage.setItem("bku_selected_list_v1", JSON.stringify(selectedBkuList));
    }

    window.onCartListNameChange = function() {
        const nameInput = document.getElementById("cartListName");
        if (nameInput) {
            localStorage.setItem("bku_selected_list_name_v1", nameInput.value);
        }
    };

    window.handleBkuRowCheckboxChange = function(cb, index) {
        const item = bkuDatabase[index];
        if (!item) return;

        if (cb.checked) {
            // Check if not already in list
            if (!selectedBkuList.some(s => s.ad === item.ad && s.bitki === item.bitki)) {
                selectedBkuList.push(item);
            }
        } else {
            selectedBkuList = selectedBkuList.filter(s => !(s.ad === item.ad && s.bitki === item.bitki));
        }

        renderSelectedBkuList();
        saveSelectedListToLocalStorage();
        
        // Update master checkbox
        const checkboxes = Array.from(document.querySelectorAll(".bku-row-checkbox"));
        const master = document.getElementById("selectAllBku");
        if (master && checkboxes.length > 0) {
            master.checked = checkboxes.every(c => c.checked);
        }
    };

    window.toggleSelectAllBku = function(masterCb) {
        const checkboxes = document.querySelectorAll(".bku-row-checkbox");
        checkboxes.forEach(cb => {
            cb.checked = masterCb.checked;
            const index = parseInt(cb.getAttribute("data-index"));
            const item = bkuDatabase[index];
            if (item) {
                if (masterCb.checked) {
                    if (!selectedBkuList.some(s => s.ad === item.ad && s.bitki === item.bitki)) {
                        selectedBkuList.push(item);
                    }
                } else {
                    selectedBkuList = selectedBkuList.filter(s => !(s.ad === item.ad && s.bitki === item.bitki));
                }
            }
        });
        renderSelectedBkuList();
        saveSelectedListToLocalStorage();
    };

    window.clearSelectedBkuList = function() {
        if (confirm("Seçtiğiniz tüm ilaçları sepetten temizlemek istediğinize emin misiniz?")) {
            selectedBkuList = [];
            renderSelectedBkuList();
            saveSelectedListToLocalStorage();
            
            // Uncheck all in table
            const checkboxes = document.querySelectorAll(".bku-row-checkbox");
            checkboxes.forEach(cb => cb.checked = false);
            
            const master = document.getElementById("selectAllBku");
            if (master) master.checked = false;
        }
    };

    window.saveCurrentList = function() {
        const nameInput = document.getElementById("cartListName");
        if (!nameInput) return;
        const listName = nameInput.value.trim();
        if (!listName) {
            alert("Lütfen listeye bir isim verin!");
            return;
        }

        const cartTotalWater = document.getElementById("cartTotalWater") ? parseFloat(document.getElementById("cartTotalWater").value) : 1;
        const cartHolderCap = document.getElementById("cartHolderCap") ? parseFloat(document.getElementById("cartHolderCap").value) : 2000;
        const cartWaterPerDa = document.getElementById("cartWaterPerDa") ? parseFloat(document.getElementById("cartWaterPerDa").value) : 100;

        let savedLists = {};
        try {
            const stored = localStorage.getItem("bku_saved_lists_v1");
            if (stored) savedLists = JSON.parse(stored);
        } catch (e) {
            console.error(e);
        }

        savedLists[listName] = {
            name: listName,
            list: selectedBkuList,
            water: cartTotalWater,
            holder: cartHolderCap,
            waterPerDa: cartWaterPerDa,
            timestamp: Date.now()
        };

        localStorage.setItem("bku_saved_lists_v1", JSON.stringify(savedLists));
        updateSavedListsDropdown();

        // Sync to server
        fetch("api/save_bku_lists.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(savedLists)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status !== "success") {
                console.error("Kayıtlı listeler sunucuya kaydedilemedi:", data.message);
            }
        })
        .catch(err => console.error("Kayıtlı listeler sunucu senkronizasyon hatası:", err));

        alert(`"${listName}" listesi başarıyla kaydedildi.`);
    };

    window.loadSavedList = function(listName) {
        if (!listName) return;

        let savedLists = {};
        try {
            const stored = localStorage.getItem("bku_saved_lists_v1");
            if (stored) savedLists = JSON.parse(stored);
        } catch (e) {
            console.error(e);
        }

        const data = savedLists[listName];
        if (!data) return;

        selectedBkuList = data.list || [];
        
        // Restore inputs
        if (document.getElementById("cartListName")) document.getElementById("cartListName").value = listName;
        if (document.getElementById("cartTotalWater")) document.getElementById("cartTotalWater").value = data.water || 1;
        if (document.getElementById("cartHolderCap")) document.getElementById("cartHolderCap").value = data.holder || 2000;
        if (document.getElementById("cartWaterPerDa")) document.getElementById("cartWaterPerDa").value = data.waterPerDa || 100;

        // Save active state to regular localStorage keys so it persists page reload
        saveSelectedListToLocalStorage();
        localStorage.setItem("bku_selected_list_name_v1", listName);
        localStorage.setItem("bku_cart_total_water_v1", data.water || 1);
        localStorage.setItem("bku_cart_holder_cap_v1", data.holder || 2000);
        localStorage.setItem("bku_cart_water_per_da_v1", data.waterPerDa || 100);

        renderSelectedBkuList();
        renderBkuTable(); // Refresh table checkboxes
        onCartInputChange(); // recalculate everything
        
        // Update selection in dropdown to match
        const dropdown = document.getElementById("cartSavedLists");
        if (dropdown) dropdown.value = listName;

        alert(`"${listName}" listesi başarıyla yüklendi.`);
    };

    window.deleteSavedList = function() {
        const nameInput = document.getElementById("cartListName");
        if (!nameInput) return;
        const listName = nameInput.value.trim();
        if (!listName) return;

        let savedLists = {};
        try {
            const stored = localStorage.getItem("bku_saved_lists_v1");
            if (stored) savedLists = JSON.parse(stored);
        } catch (e) {
            console.error(e);
        }

        if (!savedLists[listName]) {
            alert("Silinecek böyle bir liste bulunamadı.");
            return;
        }

        if (confirm(`"${listName}" listesini silmek istediğinize emin misiniz?`)) {
            delete savedLists[listName];
            localStorage.setItem("bku_saved_lists_v1", JSON.stringify(savedLists));

            // Sync delete to server
            fetch("api/save_bku_lists.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(savedLists)
            })
            .then(res => res.json())
            .then(data => {
                if (data.status !== "success") {
                    console.error("Kayıtlı listeler sunucudan silinemedi:", data.message);
                }
            })
            .catch(err => console.error("Kayıtlı listeler sunucu senkronizasyon hatası:", err));
            
            // clear selection and inputs
            selectedBkuList = [];
            nameInput.value = "Yeni Liste";
            saveSelectedListToLocalStorage();
            localStorage.setItem("bku_selected_list_name_v1", "Yeni Liste");
            
            renderSelectedBkuList();
            renderBkuTable();
            updateSavedListsDropdown();
            alert(`"${listName}" listesi silindi.`);
        }
    };

    window.startNewList = function() {
        if (selectedBkuList.length > 0) {
            if (!confirm("Mevcut seçili ilaçları temizleyip yeni bir liste oluşturmak istiyor musunuz?")) {
                return;
            }
        }
        selectedBkuList = [];
        const nameInput = document.getElementById("cartListName");
        if (nameInput) {
            nameInput.value = "Yeni Liste - " + new Date().toLocaleDateString('tr-TR');
            localStorage.setItem("bku_selected_list_name_v1", nameInput.value);
        }
        
        saveSelectedListToLocalStorage();
        renderSelectedBkuList();
        renderBkuTable();
        
        const dropdown = document.getElementById("cartSavedLists");
        if (dropdown) dropdown.value = "";
    };

    window.updateSavedListsDropdown = function() {
        const dropdowns = document.querySelectorAll("#cartSavedLists");
        if (dropdowns.length === 0) return;

        let savedLists = {};
        try {
            const stored = localStorage.getItem("bku_saved_lists_v1");
            if (stored) savedLists = JSON.parse(stored);
        } catch (e) {
            console.error(e);
        }

        let html = '<option value="">-- Kayıtlı Listeler --</option>';
        Object.keys(savedLists).forEach(name => {
            html += `<option value="${name}">${name}</option>`;
        });
        
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = html;
            // Try to select current if match
            const currentName = document.getElementById("cartListName") ? document.getElementById("cartListName").value : "";
            if (savedLists[currentName]) {
                dropdown.value = currentName;
            }
        });
    };

    window.removeSelectedBkuSingle = function(ad, bitki) {
        selectedBkuList = selectedBkuList.filter(s => !(s.ad === ad && s.bitki === bitki));
        renderSelectedBkuList();
        saveSelectedListToLocalStorage();
        
        // Sync checkbox in main table if visible
        const checkboxes = document.querySelectorAll(".bku-row-checkbox");
        checkboxes.forEach(cb => {
            const index = parseInt(cb.getAttribute("data-index"));
            const item = bkuDatabase[index];
            if (item && item.ad === ad && item.bitki === bitki) {
                cb.checked = false;
            }
        });
        
        const master = document.getElementById("selectAllBku");
        if (master) master.checked = false;
    };

    window.recalculateCart = function() {
        const totalWaterTon = parseFloat(document.getElementById("cartTotalWater").value) || 1;
        const totalWater = totalWaterTon * 1000;
        const holderCap = parseFloat(document.getElementById("cartHolderCap").value) || 400;
        const waterPerDa = parseFloat(document.getElementById("cartWaterPerDa").value) || 50;

        // Save settings to local storage
        localStorage.setItem("bku_cart_total_water_v1", totalWaterTon);
        localStorage.setItem("bku_cart_holder_cap_v1", holderCap);
        localStorage.setItem("bku_cart_water_per_da_v1", waterPerDa);

        // Hide update button container since calculation is now synced
        const btnContainer = document.getElementById("cartUpdateBtnContainer");
        if (btnContainer) {
            btnContainer.style.display = "none";
        }

        // Update helper texts
        document.getElementById("cartTotalWaterText").innerText = `${totalWaterTon.toFixed(2)} Ton = ${totalWater} Litre Su`;
        
        const holders = totalWater / holderCap;
        document.getElementById("cartHolderCountText").innerText = `${totalWater} L su / ${holderCap} L = ${holders.toFixed(2)} Tank Hazırlığı`;
        
        const impliedArea = totalWater / waterPerDa;
        document.getElementById("cartImpliedAreaText").innerText = `Hesaplanan Alan = ${impliedArea.toFixed(2)} da`;

        // Update requirements inside table rows
        const tbody = document.getElementById("selectedBkuCartBody");
        if (!tbody) return;
        if (selectedBkuList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-light);">Henüz ilaç seçilmedi. Tablodan ilaç seçebilir veya kayıtlı listenizi yükleyebilirsiniz.</td></tr>`;
            return;
        }

        // Render rows dynamically with calculated values
        let html = "";
        selectedBkuList.forEach((item) => {
            const bitki = item.bitki || "";
            const ad = item.ad || "";
            const aktif = item.aktif || "";
            const grup = item.grup || "";
            const originalDozText = item.dozText || "";
            const dozDeger = parseFloat(item.dozDeger) || 0;
            const dozBirim = item.dozBirim || "ml";
            const dozHacim = parseFloat(item.dozHacim) || 100;
            const dozTip = item.dozTip || "su";

            let totalReqValue = 0;
            let holderDozValue = 0;

            if (dozTip === "su") {
                totalReqValue = (totalWater / dozHacim) * dozDeger;
                holderDozValue = (holderCap / dozHacim) * dozDeger;
            } else {
                totalReqValue = impliedArea * (dozDeger / dozHacim);
                holderDozValue = (holderCap / waterPerDa) * (dozDeger / dozHacim);
            }

            // Format total requirement beautifully
            let totalReqStr = "";
            if (dozBirim === "ml") {
                if (totalReqValue >= 1000) {
                    totalReqStr = `<strong>${(totalReqValue / 1000).toFixed(2)} L</strong>`;
                } else {
                    totalReqStr = `<strong>${Math.round(totalReqValue)} ml</strong>`;
                }
            } else if (dozBirim === "g") {
                if (totalReqValue >= 1000) {
                    totalReqStr = `<strong>${(totalReqValue / 1000).toFixed(2)} kg</strong>`;
                } else {
                    totalReqStr = `<strong>${Math.round(totalReqValue)} g</strong>`;
                }
            } else {
                totalReqStr = `<strong>${Math.round(totalReqValue)} adet</strong>`;
            }

            // Format holder dose beautifully
            const formattedTankDozVal = formatTankDoz(holderDozValue, dozBirim);
            let holderDozStr = `<strong>${formattedTankDozVal}</strong> / tank`;

            html += `
                <tr>
                    <td><span class="plant-cell">${getPlantEmoji(bitki)} ${bitki}</span></td>
                    <td>
                        <span class="product-name-cell">${ad}</span><br>
                        <span style="font-size:0.75rem; color:#666; font-weight:600; display:inline-block; margin-top:3px;">🎯 Hedef: ${getCleanHedef(item)}</span>
                    </td>
                    <td>
                        <span style="font-size:0.8rem; font-weight:500;">${aktif}</span><br>
                        <span class="badge-bku ${grup === 'Fungisit' ? 'badge-fungicide' : (grup === 'Feromon' ? 'badge-pheromone' : (grup === 'Akarisit' ? 'badge-acaricide' : (grup === 'Foliar' ? 'badge-foliar' : (grup === 'Diğer' ? 'badge-other' : 'badge-insecticide'))))}" style="padding:2px 8px; font-size:0.7rem; margin-top:3px;">${grup}</span>
                    </td>
                    <td><code style="background:#f1f3f5; padding:2px 4px; border-radius:4px; font-size:0.78rem;">${originalDozText}</code></td>
                    <td style="background: rgba(15, 81, 50, 0.05); color: #0f5132; font-size: 0.92rem;">${totalReqStr}</td>
                    <td style="background: rgba(15, 81, 50, 0.05); color: #0f5132; font-size: 0.92rem;">${holderDozStr}</td>
                    <td style="text-align:center;">
                        <button class="btn-action btn-delete" onclick="removeSelectedBkuSingle('${ad.replace(/'/g, "\\'")}', '${bitki}')" title="Kaldır">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    };

    window.onCartInputChange = function() {
        const totalWaterTon = parseFloat(document.getElementById("cartTotalWater").value) || 1;
        const totalWater = totalWaterTon * 1000;
        const holderCap = parseFloat(document.getElementById("cartHolderCap").value) || 400;
        const waterPerDa = parseFloat(document.getElementById("cartWaterPerDa").value) || 50;

        // Save settings to local storage (even if not updated table yet, keep input values persistent)
        localStorage.setItem("bku_cart_total_water_v1", totalWaterTon);
        localStorage.setItem("bku_cart_holder_cap_v1", holderCap);
        localStorage.setItem("bku_cart_water_per_da_v1", waterPerDa);

        // Update helper texts instantly for UX feedback
        document.getElementById("cartTotalWaterText").innerText = `${totalWaterTon.toFixed(2)} Ton = ${totalWater} Litre Su`;
        
        const holders = totalWater / holderCap;
        document.getElementById("cartHolderCountText").innerText = `${totalWater} L su / ${holderCap} L = ${holders.toFixed(2)} Tank Hazırlığı`;
        
        const impliedArea = totalWater / waterPerDa;
        document.getElementById("cartImpliedAreaText").innerText = `Hesaplanan Alan = ${impliedArea.toFixed(2)} da`;

        // Show update button container in flex mode
        const btnContainer = document.getElementById("cartUpdateBtnContainer");
        if (btnContainer) {
            btnContainer.style.display = "flex";
        }
    };

    window.applyCartCalculationUpdate = function() {
        recalculateCart();
    };

    window.renderSelectedBkuList = function() {
        const card = document.getElementById("selectedBkuCartCard");
        if (!card) return;

        const floatingBtn = document.getElementById("floatingCartBtn");
        const floatingCount = document.getElementById("floatingCartCount");
        const isDbActive = document.getElementById("dbView") && document.getElementById("dbView").classList.contains("active");

        let savedLists = {};
        try {
            const stored = localStorage.getItem("bku_saved_lists_v1");
            if (stored) savedLists = JSON.parse(stored);
        } catch (e) {}
        const hasSavedLists = Object.keys(savedLists).length > 0;

        const emptyState = document.getElementById("selectedBkuCartEmptyState");

        if (selectedBkuList.length === 0 && !hasSavedLists) {
            card.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            if (floatingBtn) floatingBtn.style.display = "none";
            return;
        }

        card.style.display = "block";
        if (emptyState) emptyState.style.display = "none";
        document.getElementById("selectedBkuCartTitle").innerText = `📋 Seçilen BKÜ İlaçları ve İhtiyaç Hesaplama Paneli (${selectedBkuList.length} İlaç Seçildi)`;
        
        if (floatingBtn) {
            floatingBtn.style.display = (isDbActive && selectedBkuList.length > 0) ? "flex" : "none";
            if (floatingCount) {
                floatingCount.textContent = selectedBkuList.length;
            }
        }

        // Recalculate and populate table values
        recalculateCart();
    };

    window.scrollToSelectedBkuCart = function() {
        switchTab('selectedBkuCart');

        const card = document.getElementById("selectedBkuCartCard");
        if (!card) return;

        // Add highlight pulse animation
        card.classList.remove("highlight-pulse");
        // Trigger reflow to restart animation if clicked multiple times
        void card.offsetWidth;
        card.classList.add("highlight-pulse");

        // Remove the class after the animation completes
        setTimeout(() => {
            card.classList.remove("highlight-pulse");
        }, 1000);
    };

    window.copySelectedBkuList = function() {
        if (selectedBkuList.length === 0) return;
        
        const totalWaterTon = parseFloat(document.getElementById("cartTotalWater").value) || 1;
        const totalWater = totalWaterTon * 1000;
        const holderCap = parseFloat(document.getElementById("cartHolderCap").value) || 400;
        const waterPerDa = parseFloat(document.getElementById("cartWaterPerDa").value) || 50;
        const impliedArea = totalWater / waterPerDa;
        const holders = totalWater / holderCap;

        const listNameVal = document.getElementById("cartListName") ? document.getElementById("cartListName").value : "Liste #1";
        let text = `📋 ZİRAİ İLAÇLAMA İHTİYAÇ VE TANK KARIŞIM HESAP RAPORU - [${listNameVal}]\n`;
        text += `==============================================\n`;
        text += `💧 Toplam Su Hacmi    : ${totalWater} Litre (${(totalWater/1000).toFixed(2)} Ton)\n`;
        text += `🚜 Holder Kapasitesi  : ${holderCap} Litre (Toplam ${holders.toFixed(2)} Tank Hazırlanacak)\n`;
        text += `🌱 Hesaplanan Arazi   : ${impliedArea.toFixed(1)} Dekar (Su Oranı: ${waterPerDa} L/da)\n`;
        text += `==============================================\n\n`;

        selectedBkuList.forEach((item, index) => {
            const dozDeger = parseFloat(item.dozDeger) || 0;
            const dozBirim = item.dozBirim || "ml";
            const dozHacim = parseFloat(item.dozHacim) || 100;
            const dozTip = item.dozTip || "su";

            let totalReqValue = 0;
            let holderDozValue = 0;

            if (dozTip === "su") {
                totalReqValue = (totalWater / dozHacim) * dozDeger;
                holderDozValue = (holderCap / dozHacim) * dozDeger;
            } else {
                totalReqValue = impliedArea * (dozDeger / dozHacim);
                holderDozValue = (holderCap / waterPerDa) * (dozDeger / dozHacim);
            }

            let totalStr = totalReqValue >= 1000 ? `${(totalReqValue/1000).toFixed(2)} ${dozBirim==='ml'?'L':'kg'}` : `${Math.round(totalReqValue)} ${dozBirim}`;
            let tankStr = formatTankDoz(holderDozValue, dozBirim);

            text += `${index + 1}. [${item.bitki}] ${item.ad}\n`;
            text += `   - Hedef Zararlı : ${getCleanHedef(item)}\n`;
            text += `   - Aktif Madde   : ${item.aktif}\n`;
            text += `   - Orijinal Doz  : ${item.dozText}\n`;
            text += `   - GEREKEN TOPLAM: ${totalStr}\n`;
            text += `   - TANK BAŞI DOZ : ${tankStr} / tank\n\n`;
        });

        text += `⚠️ Not: İlaçları karıştırırken WALES sırasına (Önce WP/WG tozlar, sonra SC sıvılar, en son EC yağlar ve yayıcılar) mutlaka uyunuz.`;

        navigator.clipboard.writeText(text).then(() => {
            alert("✅ Seçilen ilaçlar ihtiyaç listesi başarıyla panoya kopyalandı! WhatsApp veya SMS üzerinden paylaşabilirsiniz.");
        }).catch(err => {
            console.error("Panoya kopyalama başarısız oldu:", err);
            alert("Metin kopyalanamadı, lütfen manuel kopyalayın.");
        });
    };

    window.printSelectedBkuList = function() {
        const printWindow = window.open("", "_blank");
        const totalWaterTon = parseFloat(document.getElementById("cartTotalWater").value) || 1;
        const totalWater = totalWaterTon * 1000;
        const holderCap = parseFloat(document.getElementById("cartHolderCap").value) || 400;
        const waterPerDa = parseFloat(document.getElementById("cartWaterPerDa").value) || 50;
        const impliedArea = totalWater / waterPerDa;
        const holders = totalWater / holderCap;

        let tableRows = "";
        selectedBkuList.forEach((item, index) => {
            const dozDeger = parseFloat(item.dozDeger) || 0;
            const dozBirim = item.dozBirim || "ml";
            const dozHacim = parseFloat(item.dozHacim) || 100;
            const dozTip = item.dozTip || "su";

            let totalReqValue = 0;
            let holderDozValue = 0;

            if (dozTip === "su") {
                totalReqValue = (totalWater / dozHacim) * dozDeger;
                holderDozValue = (holderCap / dozHacim) * dozDeger;
            } else {
                totalReqValue = impliedArea * (dozDeger / dozHacim);
                holderDozValue = (holderCap / waterPerDa) * (dozDeger / dozHacim);
            }

            let totalStr = totalReqValue >= 1000 ? `${(totalReqValue/1000).toFixed(2)} ${dozBirim==='ml'?'Litre':'kg'}` : `${Math.round(totalReqValue)} ${dozBirim}`;
            let tankStr = formatTankDoz(holderDozValue, dozBirim);

            tableRows += `
                <tr>
                    <td style="border:1px solid #ddd; padding:10px; font-weight:bold;">${item.bitki}</td>
                    <td style="border:1px solid #ddd; padding:10px; font-weight:bold;">
                        ${item.ad}<br>
                        <span style="font-size:0.8rem; color:#555; font-weight:normal;">🎯 Hedef: ${getCleanHedef(item)}</span>
                    </td>
                    <td style="border:1px solid #ddd; padding:10px;">${item.aktif}</td>
                    <td style="border:1px solid #ddd; padding:10px;">${item.dozText}</td>
                    <td style="border:1px solid #ddd; padding:10px; font-weight:bold; color:#0f5132; background:#f4f9f6;">${totalStr}</td>
                    <td style="border:1px solid #ddd; padding:10px; font-weight:bold; color:#0f5132; background:#f4f9f6;">${tankStr} / tank</td>
                </tr>
            `;
        });

        printWindow.document.write(`
            <html>
            <head>
                <title>Zirai İlaçlama İhtiyaç Listesi Raporu</title>
                <style>
                    body { font-family: 'Inter', sans-serif; color:#333; margin:40px; }
                    .header { text-align:center; border-bottom:3px solid #0f5132; padding-bottom:15px; margin-bottom:30px; }
                    table { width:100%; border-collapse:collapse; margin-bottom:30px; }
                    th { background:#0f5132; color:white; padding:12px; border:1px solid #ddd; text-align:left; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 style="margin:0; color:#0f5132;">ZİRAİ İLAÇLAMA İHTİYAÇ VE KARIŞIM KARTI - [${document.getElementById("cartListName") ? document.getElementById("cartListName").value : "Liste #1"}]</h1>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Bitki</th>
                            <th>Ruhsatlı BKÜ</th>
                            <th>Aktif Madde</th>
                            <th>Orijinal Doz</th>
                            <th>Gereken Toplam Miktar</th>
                            <th>Holder Başı Doz</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    window.transferSelectedToProgram = function() {
        if (selectedBkuList.length === 0) return;
        
        if (!confirm(`Seçtiğiniz ${selectedBkuList.length} adet BKÜ ilacını "İlaçlama Programı Hazırla" sihirbazına etaplar halinde aktarmak istiyor musunuz? (Bu işlem mevcut program düzenleme aşamanızı sıfırlayacaktır).`)) {
            return;
        }

        const totalWaterTon = parseFloat(document.getElementById("cartTotalWater").value) || 1;
        const totalWater = totalWaterTon * 1000;
        const holderCap = parseFloat(document.getElementById("cartHolderCap").value) || 400;
        const waterPerDa = parseFloat(document.getElementById("cartWaterPerDa").value) || 50;
        const impliedArea = totalWater / waterPerDa;

        const targetPlant = selectedBkuList[0].bitki || "ELMA";
        
        document.getElementById("builderGardenName").value = "Seçimden Oluşturulan Bahçe";
        document.getElementById("builderPlant").value = targetPlant;
        document.getElementById("builderArea").value = Math.ceil(impliedArea);
        document.getElementById("builderTankCapacity").value = holderCap;
        document.getElementById("builderWaterRate").value = waterPerDa;
        
        sprayingProgram.gardenName = "Seçimden Oluşturulan Bahçe";
        sprayingProgram.plant = targetPlant;
        sprayingProgram.area = Math.ceil(impliedArea);
        sprayingProgram.tankCapacity = holderCap;
        sprayingProgram.waterRate = waterPerDa;
        sprayingProgram.rounds = [];

        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];

        selectedBkuList.forEach((item, index) => {
            const dateOffset = index * 10;
            const itemDate = new Date();
            itemDate.setDate(today.getDate() + dateOffset);

            const round = {
                id: "ts_step_" + index + "_" + Date.now(),
                stage: `${index + 1}. Uygulama Etabı`,
                targetPest: getCleanHedef(item) || "Zararlı / Mantar Kontrolü",
                bkuAd: item.ad,
                date: formatDate(itemDate)
            };
            sprayingProgram.rounds.push(round);
        });

        switchTab('programBuilder');
        document.getElementById("builderSummaryPlantText").textContent = sprayingProgram.plant;
        
        renderAgronomicalAdvisory();
        renderSprayingRounds();
        goToStep(2);

        alert("⚡ Seçtiğiniz ilaçlar pürüzsüzce İlaçlama Programı sihirbazına aktarıldı! Buradan tank başı net karışım dozajlarını ve PHI kalıntı bekleme günlerinizi dinamik takip edebilirsiniz.");
    };

    // ------------------------------------------------------------- */
    // AGRONOMICAL ADVISORY & WEATHER WORKING MECHANISM DATABASE
    // ------------------------------------------------------------- */
    function generateBkuDetailedInfo(item) {
        if (!item) return { etkiEvresi: "", sistemikDurum: "", fenoloji: "", havaDurumu: "" };
        const active = (item.aktif || "").toLowerCase();
        const group = (item.grup || "").toLowerCase();

        let etkiEvresi = "Larva ve erginlere karşı kontakt/mide etkilidir.";
        let sistemikDurum = "Kontakt etkilidir, bitki bünyesine taşınmaz.";
        let fenoloji = "Zararlı popülasyonu ekonomik zarar eşiğine ulaştığında.";
        let havaDurumu = "Yağışlardan etkilenir, uygulamadan sonraki 6 saat yağışsız olmalıdır. Sıcaklık 25°C altındayken uygulanması önerilir.";

        if (active.includes("abamectin")) {
            etkiEvresi = "Akar larvaları, nimfleri ve erginlerine karşı son derece etkilidir. Yumurta etkisi zayıftır.";
            sistemikDurum = "Translaminar (yaprak içi geçişli) etkilidir, yaprak dokusunda rezervuar oluşturur. Lokal sistemik koruma sağlar.";
            fenoloji = "Meyve tutumundan sonra kırmızı örümcek popülasyonu yaprak başına 8-10 adede ulaştığında.";
            havaDurumu = "Sıcak havalarda buharlaşma riski nedeniyle akşam serinliğinde atılmalıdır. Yağmurla yıkanma dayanımı ortadır.";
        } else if (active.includes("emamectin")) {
            etkiEvresi = "Mide ve temas yoluyla etki eder. Özellikle Lepidopter (içkurdu vb.) larvalarında çok etkilidir.";
            sistemikDurum = "Translaminar etkilidir, yaprak dokusuna hızlıca nüfuz eder. Yağmurla kolay yıkanmaz.";
            fenoloji = "Zararlı kelebek uçuşlarının pik yaptığı ve larva çıkışının başladığı dönemlerde.";
            havaDurumu = "Yüksek sıcaklıklarda etki kaybı yaşamaz. Uygulamadan 2 saat sonra yağan yağmurdan etkilenmez.";
        } else if (active.includes("pyriproxyfen")) {
            etkiEvresi = "Böcek büyüme düzenleyicisidir (IGR). Yumurtalara, larvalara ve nimflere etkilidir. Erginleri kısırlaştırır.";
            sistemikDurum = "Translaminar etkilidir. Bitkide doğrudan sistemik taşınım göstermez ama yaprağın diğer yüzüne geçer.";
            fenoloji = "Zararlının yumurta bırakma periyodunun başında veya sürgün gelişiminin erken dönemlerinde.";
            havaDurumu = "Hava sıcaklığı etkiyi doğrudan etkilemez. Yağmur yağmadan önce yaprak yüzeyinde kuruması sağlanmalıdır (min 2 saat).";
        } else if (active.includes("spirodiclofen") || active.includes("spirotetramat")) {
            etkiEvresi = "Lipid sentezi inhibitörüdür. Akar yumurtalarına, larvalarına ve nimflerine mükemmel etki eder. Dişi erginleri kısırlaştırır.";
            sistemikDurum = active.includes("spirotetramat") ? 
                "İki yönlü sistemiktir (hem yaprağa hem köklere taşınır). Spirodiclofen ise kontakt ve translaminardır." : 
                "Kontakt ve translaminar etkilidir, yaprak dokusu tarafından emilir.";
            fenoloji = "Çiçek taç yaprak dökümünden sonra, ilk akar veya kabuklu bit hareketliliği görüldüğünde.";
            havaDurumu = "Bitki su stresindeyken sistemik taşınım yavaşlar. Hava sıcaklığının çok yüksek (>32°C) olmadığı günlerde atılmalıdır.";
        } else if (active.includes("bifenazate")) {
            etkiEvresi = "Akarların tüm hareketli evrelerine (larva, nimf, ergin) karşı ani etkilidir (knock-down). Yumurta etkisi de mevcuttur.";
            sistemikDurum = "Kontakt etkilidir. Translaminar etkisi sınırlıdır, bu nedenle kaplama ilaçlama çok önemlidir.";
            fenoloji = "Meyve büyüme döneminde yapraklarda akar yoğunluğu tespit edildiğinde.";
            havaDurumu = "Işık ve yüksek sıcaklık altında stabildir. Yağış öncesi 4-6 saatlik kuru süre gerektirir.";
        } else if (active.includes("etoxazole") || active.includes("hexythiazox")) {
            etkiEvresi = "Kitin sentezi inhibitörüdür. Akar yumurtalarına, larvalarına ve nimflerine çok etkilidir. Erginleri doğrudan öldürmez ama kısırlaştırır.";
            sistemikDurum = "Translaminar ve kontakt etkilidir. Yaprağın üstüne atıldığında altına geçerek uzun süreli koruma sağlar.";
            fenoloji = "Yumurta ve larva yoğunluğunun zirveye ulaştığı çiçek dökümü sonrasındaki erken dönemde.";
            havaDurumu = "Sıcaklık etkiyi azaltmaz. Kontakt etkisi yüksek olduğundan homojen püskürtme gerektirir.";
        } else if (active.includes("acetamiprid") || active.includes("imidacloprid") || active.includes("thiamethoxam")) {
            etkiEvresi = "Neonikotinoid grubudur. Emici zararlıların (yaprakbiti, kabuklubit, beyazsinek) larva, nimf & erginlerine ani etkilidir.";
            sistemikDurum = "Güçlü sistemik & translaminar etkilidir. Bitki tarafından hızla emilir ve yeni büyüyen sürgünlere taşınır.";
            fenoloji = "İlk yaprakbiti kolonileri görüldüğünde veya sürgün gelişim dönemlerinde.";
            havaDurumu = "Sıcak havalarda bitki stresi nedeniyle fitotoksisite riski vardır, sabah serinliğinde uygulanmalıdır. Sistemik olduğu için yağmurla yıkanma direnci çok yüksektir (1 saat sonra yağan yağmurdan etkilenmez).";
        } else if (active.includes("phosmet") || active.includes("malathion") || active.includes("chlorpyrifos")) {
            etkiEvresi = "Organofosfat grubudur. Geniş yelpazedeki böceklerin larva & ergin evrelerine karşı ani ve güçlü öldürücüdür.";
            sistemikDurum = "Kontakt ve mide etkilidir, sistemik değildir. Kalıcı kokusu ve gaz etkisi vardır.";
            fenoloji = "İçkurtlarının yumurtadan çıkış dönemlerinde veya yaprakbiti/koşnil bulaşıklığı saptandığında.";
            havaDurumu = "Yüksek sıcaklıklarda gaz etkisi artar ancak buharlaşma nedeniyle erken kurur. Yağışlardan kolay yıkanır.";
        } else if (active.includes("lambda-cyhalothrin") || active.includes("deltamethrin") || active.includes("tau-fluvalinate") || active.includes("cypermethrin") || active.includes("esfenvalerate") || active.includes("cyfluthrin")) {
            etkiEvresi = "Sentetik piretroid grubudur. Böceğin sinir sistemine etki ederek ani felç ve öldürme (knock-down) etkisi yapar.";
            sistemikDurum = "Tamamen kontakt ve mide etkilidir. Bitki dokusuna nüfuz etmez.";
            fenoloji = "Kelebek uçuşlarının yoğun olduğu, larvaların henüz yaprak veya meyve içine girmediği dönemde.";
            havaDurumu = "25°C üzerindeki sıcaklıklarda etki gücü hızla azalır (sentetik piretroidlerin sıcaklık stabilitesi düşüktür). Akşam serinliğinde veya serin havalarda uygulanmalıdır. Yağmurla kolayca yıkanır.";
        } else if (active.includes("chlorantraniliprole") || active.includes("cyantraniliprole") || active.includes("flubendiamide")) {
            etkiEvresi = "Diamid grubudur. Lepidopter (içkurdu vb.) yumurta & larvalarına karşı son derece seçici ve güçlü etkilidir.";
            sistemikDurum = "Translaminar ve lokal sistemik etkilidir. Bitki dokusu tarafından emilerek koruyucu kalkan oluşturur.";
            fenoloji = "Kelebek uçuşlarının izlendiği feromon tuzaklarındaki verilere göre, ilk larva çıkışından hemen önce.";
            havaDurumu = "Işıkta ve sıcakta son derece stabildir. Yağmurla yıkanmaya karşı yüksek direnç gösterir (1-2 saatlik kuruma süresi yeterlidir).";
        } else if (active.includes("spinosad") || active.includes("spinetoram")) {
            etkiEvresi = "Biyolojik kökenli spinosyn grubudur. Larvalara, thripslere ve sinek erginlerine karşı temas ve mide yoluyla mükemmel etkilidir.";
            sistemikDurum = "Translaminar etkilidir. Yaprak içine geçerek koruma sağlar, ancak sistemik taşınımı sınırlıdır.";
            fenoloji = "Meyve büyüme periyodunda zararlı popülasyonu eşiği aştığında.";
            havaDurumu = "Güneş ışığında (UV) hızlı parçalanma gösterebilir, bu nedenle kesinlikle akşamüstü uygulanmalıdır. Kuruduktan sonra yağışa dirençlidir.";
        } else if (active.includes("bakır") || active.includes("copper") || active.includes("bordo")) {
            etkiEvresi = "İnorganik bakırdır. Mantar sporlarının çimlenmesini engeller ve bakteriyel yayılımı durdurur.";
            sistemikDurum = "Kontakt etkilidir. Tamamen koruyucudur (koruyucu fungisit). Tedavi edici etkisi yoktur.";
            fenoloji = "Kış uykusu (tomurcuk kabarması) ve fare kulağı dönemi. Yapraklı dönemde fitotoksisite (yaprak yakma) riski nedeniyle önerilmez.";
            havaDurumu = "Soğuk ve aşırı nemli havalarda kuruması gecikirse yaprakta fitotoksisite yapabilir. Yağmurla tamamen yıkanır, yağış sonrasında uygulamanın tekrarlanması gerekir.";
        } else if (active.includes("captan") || active.includes("kaptan") || active.includes("dithianon") || active.includes("metiram") || active.includes("polyram")) {
            etkiEvresi = "Çoklu noktadan etkili koruyucu fungisittir. Mantar sporlarının çimlenmesini engelleyerek enfeksiyonu baştan keser.";
            sistemikDurum = "Kontakt etkilidir, sistemik değildir. Sadece koruyucu (protektif) etki gösterir, tedavi edici değildir.";
            fenoloji = "Fare kulağı döneminden başlayarak meyve gelişim dönemlerine kadar yağış öncesi koruma amaçlı.";
            havaDurumu = "Kontakt olduğu için yağmurla yıkanır. Yağış başlamadan en az 4-6 saat önce uygulanmış ve kurumuş olmalıdır.";
        } else if (active.includes("difenoconazole") || active.includes("tebuconazole") || active.includes("penconazole") || active.includes("mefentrifluconazole")) {
            etkiEvresi = "Triazol (DMI) grubudur. Mantarın misel gelişimini ve spor oluşumunu durdurur.";
            sistemikDurum = "Sistemik ve akropetal (yukarı doğru) taşınım gösterir. Hem koruyucu hem de güçlü tedavi edici (curative) etkilidir.";
            fenoloji = "Çiçek taç yaprak dökümünden itibaren aktif karaleke veya külleme enfeksiyonu tespit edildiğinde.";
            havaDurumu = "Ilık ve aktif büyüme gösteren bitkilerde emilim maksimumdur. Sistemik yapıda olduğu için uygulamadan 2 saat sonra yağan yağmurdan etkilenmez.";
        } else if (active.includes("trifloxystrobin") || active.includes("pyraclostrobin") || active.includes("kresoxim-methyl")) {
            etkiEvresi = "Strobilurin (QoI) grubudur. Mantar sporlarının çimlenmesini ve misel gelişimini durdurur.";
            sistemikDurum = "Translaminar ve lokal sistemiktir. Mumsu tabakaya güçlü bağlanır. Güçlü koruyucu ve orta düzey tedavi edici etkilidir.";
            fenoloji = "Erken yaprak ve pembe tomurcuk periyodundan itibaren enfeksiyon risklerine karşı.";
            havaDurumu = "Yaprağın mumsu tabakasına hızlı bağlandığı için yağmurla yıkanmaya son derece dayanıklıdır. Sıcaklık dalgalanmalarından etkilenmez.";
        } else if (active.includes("boscalid") || active.includes("fluxapyroxad") || active.includes("fluopyram")) {
            etkiEvresi = "SDHI grubudur. Mantarın hücresel enerji üretimini keser, spor çimlenmesi ve misel büyümesini durdurur.";
            sistemikDurum = "Translaminar ve sistemik etkilidir. Çok güçlü bir koruyucu kalkan ve tedavi edici etki sunar.";
            fenoloji = "Çiçeklenme öncesi, çiçeklenme veya hasat öncesi depo çürüklüğü ilaçlamalarında.";
            havaDurumu = "Yaprak dokusuna emilimi hızlıdır. Yağmur yıkanma dayanımı çok yüksektir. Düşük ve yüksek sıcaklıklarda kararlıdır.";
        } else if (active.includes("cyprodinil") || active.includes("pyrimethanil")) {
            etkiEvresi = "Mantarda protein sentezini engeller. Özellikle monilya ve karaleke kontrolünde spor yayılımını keser.";
            sistemikDurum = "Sistemik ve translaminar etkilidir. Hem koruyucu hem tedavi edici etkisi mevcuttur.";
            fenoloji = "Erken ilkbahar döneminde, çiçek tomurcuğu ve çiçeklenme periyodunda.";
            havaDurumu = "Soğuk hava şartlarında (erken ilkbahar, 10-15°C) triazollere göre çok daha yüksek etkinlik gösterir. Yağış yıkanma dayanımı yüksektir.";
        } else if (active.includes("kükürt") || active.includes("sulfur")) {
            etkiEvresi = "İnorganik kükürttür. Mantar sporlarının solunumunu engeller. Külleme ve akarlara karşı etkilidir.";
            sistemikDurum = "Kontakt etkilidir, sistemik değildir. Tamamen koruyucu etki sunar.";
            fenoloji = "Meyve büyüme periyodunda külleme riskine karşı düzenli olarak.";
            havaDurumu = "28°C üzerindeki sıcaklıklarda buharlaşarak yaprak yakma (fitotoksisite) yapar. 18°C altındaki sıcaklıklarda ise etkisi zayıflar. Yağmurla kolayca yıkanır.";
        } else if (active.includes("bacillus")) {
            etkiEvresi = "Biyolojik fungisittir. Zararlı mantar hücre zarlarını fiziksel olarak parçalar ve bitkinin savunmasını (SAR) uyarır.";
            sistemikDurum = "Kontakt etkilidir ancak bitkide sistemik direnç mekanizmalarını tetikler. Kalıntı riski sıfırdır (PHI: 0 gün).";
            fenoloji = "Çiçeklenme dönemi ve hasada yakın dönemlerde kalıntı riski olmadan koruma için.";
            havaDurumu = "UV (güneş) ışınlarına hassastır, bu nedenle akşam serinliğinde atılmalıdır. Yağış yıkanma dayanımı ortadır.";
        } else if (active.includes("thiophanate-methyl")) {
            etkiEvresi = "Mantar misel gelişimini ve spor çimlenmesini engeller.";
            sistemikDurum = "Sistemik etkilidir, bitki bünyesine kök ve yapraklardan alınarak taşınır. Koruyucu ve tedavi edici etki sağlar.";
            fenoloji = "Erken dönem karaleke ve monilya mücadelelerinde, sürgün ve çiçeklenme periyodunda.";
            havaDurumu = "Sistemik yapısı gereği emilim için aktif bitki büyümesi gerekir. Yağış yıkanma direnci 2 saat sonra kurulduğunda yüksektir.";
        } else if (active.includes("dodine")) {
            etkiEvresi = "Mantar hücre zarı geçirgenliğini bozar. Spor çimlenmesini ve özellikle misel gelişimini durdurur. Kamçılayıcı etki (kick-back) vardır.";
            sistemikDurum = "Lokal sistemik ve nüfuz edici (penetrant) özelliktedir. Koruyucu ve güçlü tedavi edici (curative) etkisi vardır.";
            fenoloji = "Fare kulağı ve çiçeklenme öncesi/sonrası dönemlerde elma karalekesine karşı.";
            havaDurumu = "5°C'nin altındaki soğuk havalarda etkisi yavaşlar. Yağışlardan önce uygulanması durumunda en az 2-3 saatlik kuruma süresi ister.";
        } else if (active.includes("indoxacarb")) {
            etkiEvresi = "Böcek sodyum kanallarını bloke eder. Lepidopter larvalarına (içkurdu vb.) karşı mide ve temas yoluyla yüksek etkilidir. Yumurta etkisi sınırlıdır.";
            sistemikDurum = "Kontakt ve mide etkilidir. Translaminar veya sistemik taşınımı yoktur. Yaprak yüzeyinde kalıcı koruma sağlar.";
            fenoloji = "İçkurdu kelebek uçuşlarının saptandığı ve larva çıkışlarının başladığı dönemlerde.";
            havaDurumu = "Sıcaklık stabilitesi yüksektir (sıcak havalardan etkilenmez). Yağış yıkanma direnci kuruduktan sonra (yaklaşık 2-3 saat) iyidir.";
        } else if (active.includes("diflubenzuron")) {
            etkiEvresi = "Kitin sentezini engelleyerek böceklerin deri değiştirmesini durdurur. Larvalar deri değiştiremeyerek ölür. Yumurta öldürücü (ovisit) etkisi çok güçlüdür.";
            sistemikDurum = "Kontakt ve mide etkilidir, sistemik değildir. Kaplama ilaçlama önemlidir.";
            fenoloji = "Zararlı yumurta bırakma döneminin hemen başında, larvalar çıkmadan önce.";
            havaDurumu = "Işıkta ve sıcakta son derece stabildir. Yağmur yağmadan önce kuruması sağlanmalıdır (min 3 saat).";
        } else if (active.includes("sulfoxaflor")) {
            etkiEvresi = "Sulfoksimin grubudur. Yaprakbitleri ve emici zararlıların nimf ve erginlerine karşı sinir sistemini felç ederek etki gösterir.";
            sistemikDurum = "Sistemik ve translaminar etkilidir. Yaprak tarafından hızla emilir ve yeni sürgünlere taşınır.";
            fenoloji = "Yaprakbiti kolonileri ve emici zararlılar sürgünlerde görülmeye başladığında.";
            havaDurumu = "Sıcak havalardan bağımsız çalışır. Sistemik olduğu için yağmurla yıkanma direnci çok yüksektir (1 saat sonra yağan yağmurdan etkilenmez).";
        } else if (active.includes("tea tree oil") || active.includes("çay ağacı")) {
            etkiEvresi = "Mantar ve bakteri hücre zarlarını fiziksel olarak tahrip eder, spor çimlenmesini engeller. Organik mücadeleye uygundur.";
            sistemikDurum = "Kontakt etkilidir, sistemik değildir. Kalıntı riski yoktur (PHI: 0 gün).";
            fenoloji = "Hasat öncesi dönemler dahil, hastalık riskinin olduğu her fenolojik dönemde.";
            havaDurumu = "Yağmurla kolay yıkanır. Gün ortası sıcaklarında değil, sabah veya akşamüstü atılmalıdır.";
        } else if (active.includes("fludioxonil")) {
            etkiEvresi = "Mantarda osmoregülasyon sinyal iletimini inhibe eder. Spor çimlenmesini ve misel gelişimini engeller. Özellikle depo çürüklüğü etmenlerine karşı çok etkilidir.";
            sistemikDurum = "Kontakt etkilidir, yaprak yüzeyinde kalıcı koruma sağlar. Translaminar geçişi sınırlıdır.";
            fenoloji = "Çiçek sonu veya hasat öncesi meyve koruma döneminde.";
            havaDurumu = "Yağış öncesi 4-6 saat kuru kalması gerekir. Sıcaklık dalgalanmalarından etkilenmez.";
        }

        if (etkiEvresi.includes("kontakt/mide")) {
            if (group.includes("fungisit")) {
                etkiEvresi = "Mantar sporlarının çimlenmesini ve misel yayılımını engelleyen koruyucu etkiye sahiptir.";
                sistemikDurum = "Genel koruyucu fungisittir. Enfeksiyon gerçekleşmeden önce koruma sağlar.";
                fenoloji = "Hastalık belirtileri görülmeden önce veya ilk belirtilerle birlikte nemli havalarda.";
                havaDurumu = "Genellikle temas etkili olduğu için uygulamadan sonraki 6 saat boyunca yağış olmamalıdır.";
            }
        }

        return { etkiEvresi, sistemikDurum, fenoloji, havaDurumu };
    }

    window.toggleBkuDetails = function(index) {
        const detailRow = document.getElementById(`bku_detail_row_${index}`);
        const toggleBtn = document.getElementById(`detail_toggle_btn_${index}`);
        if (!detailRow || !toggleBtn) return;

        if (detailRow.style.display === "none") {
            const item = bkuDatabase[index];
            const advisory = generateBkuDetailedInfo(item);
            const wrapper = document.getElementById(`bku_details_wrapper_${index}`);
            
            wrapper.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 5px;">
                    <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--box-shadow-sm);">
                        <div style="font-weight: 700; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                            <span>🐛</span> Hedef Evre / Zararlı Etkisi
                        </div>
                        <p style="font-size: 0.82rem; color: var(--text-dark); line-height: 1.4; margin: 0;">${advisory.etkiEvresi}</p>
                    </div>
                    <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--box-shadow-sm);">
                        <div style="font-weight: 700; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                            <span>🛡️</span> Çalışma Şekli & Etki Tarzı
                        </div>
                        <p style="font-size: 0.82rem; color: var(--text-dark); line-height: 1.4; margin: 0;">${advisory.sistemikDurum}</p>
                    </div>
                    <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--box-shadow-sm);">
                        <div style="font-weight: 700; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                            <span>🌱</span> Önerilen Fenolojik Dönem
                        </div>
                        <p style="font-size: 0.82rem; color: var(--text-dark); line-height: 1.4; margin: 0;">${advisory.fenoloji}</p>
                    </div>
                    <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); box-shadow: var(--box-shadow-sm);">
                        <div style="font-weight: 700; color: var(--primary); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                            <span>☀</span> Hava Durumu Hassasiyeti
                        </div>
                        <p style="font-size: 0.82rem; color: var(--text-dark); line-height: 1.4; margin: 0;">${advisory.havaDurumu}</p>
                    </div>
                </div>
            `;
            
            detailRow.style.display = "table-row";
            toggleBtn.innerHTML = "❌ Detayları Kapat";
            toggleBtn.style.color = "#d32f2f";
        } else {
            detailRow.style.display = "none";
            toggleBtn.innerHTML = "ℹ️ Zirai Detaylar & Hava Hassasiyeti";
            toggleBtn.style.color = "var(--primary-light)";
        }
    };