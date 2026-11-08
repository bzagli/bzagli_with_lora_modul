/**
 * Bahçe Meteoroloji İstasyonu - Gün-Derece (Degree-Days) Hesaplama Modülü
 * BZAGLI V4.0 - Tarımsal Fenoloji ve Zararlı Takip Motoru
 * 
 * Özellikler:
 * - Zaman ağırlıklı yüksek hassasiyetli saniye entegrasyonu (°C·gün)
 * - Elma İç Kurdu (Cydia pomonella) & Şeftali Filiz Güvesi (Anarsia lineatella) biyolojik fenoloji modelleri
 * - Akıllı evre/ilaçlama eşiği tespiti ve ziraat rehberi
 */
(function(root) {
  'use strict';

  const PEST_MODELS = {
    codling: {
      id: 'codling',
      name: 'Elma İç Kurdu',
      scientificName: 'Cydia pomonella',
      lowerThreshold: 10.0,
      upperThreshold: 31.1,
      biofixDesc: 'İlk ergin kelebeğin feromon tuzağında yakalandığı tarih',
      targetStages: [
        { min: 0, max: 50, name: 'Biofix & Kelebek Uçuş Başlangıcı', badge: 'Başlangıç', color: '#60a5fa', level: 'info', advice: 'Tuzak kontrollerini sürdürün; Biofix tarihini netleştirin.' },
        { min: 50, max: 120, name: 'Yoğun Yumurta Bırakma Dönemi', badge: 'Yumurtlama', color: '#f59e0b', level: 'attention', advice: 'Ağaçlarda yumurta kontrolü yapın. Larva çıkışına az kaldı.' },
        { min: 120, max: 150, name: '1. Döl İlk Larva Çıkışı (1. İLAÇLAMA)', badge: 'Kritik İlaçlama', color: '#ef4444', level: 'critical', advice: '🚨 KRİTİK ZAMAN: Larvalar meyve kabuğunu delmeden önce ilaçlama yapılmalıdır!' },
        { min: 150, max: 250, name: 'Larva Gelişimi & Meyve Girişi', badge: 'Meyve Girişi', color: '#f97316', level: 'warning', advice: 'İlaçlama etki süresini ve yeni larva girişlerini kontrol edin.' },
        { min: 250, max: 320, name: '%50 Larva Çıkışı (2. İLAÇLAMA DÖNEMİ)', badge: '2. İlaçlama', color: '#ef4444', level: 'critical', advice: '🚨 2. İLAÇLAMA: Larva çıkışı tepe noktasına ulaştı, gerekiyorsa 2. uygulama yapılmalı.' },
        { min: 320, max: 500, name: '1. Döl Sonu / Pupa Dönemi', badge: 'Döl Sonu', color: '#10b981', level: 'normal', advice: '1. döl zararı tamamlanmak üzere. 2. döl tuzak uçuşlarına hazırlanın.' },
        { min: 500, max: 9999, name: '2. Döl Kelebek Uçuşu & Yumurtlama', badge: '2. Döl', color: '#a855f7', level: 'attention', advice: '2. döl başlangıcı. Yaz dönemi tuzak yakalamalarını izleyin.' }
      ]
    },
    twig: {
      id: 'twig',
      name: 'Şeftali Filiz Güvesi',
      scientificName: 'Anarsia lineatella',
      lowerThreshold: 10.0,
      upperThreshold: 31.0,
      biofixDesc: 'İlkbaharda ilk erginin feromon tuzağında yakalandığı tarih',
      targetStages: [
        { min: 0, max: 100, name: 'Kelebek Uçuşu & Yumurtlama', badge: 'Uçuş Başlangıcı', color: '#60a5fa', level: 'info', advice: 'İlkbahar sürgün ve tuzak kontrollerine başlayın.' },
        { min: 100, max: 160, name: '1. Döl İlk Larva Çıkışı (İLAÇLAMA ZAMANI)', badge: 'Kritik İlaçlama', color: '#ef4444', level: 'critical', advice: '🚨 KRİTİK ZAMAN: Larvalar taze sürgünlere ve meyvelere girmeden önce ilaçlama zamanı!' },
        { min: 160, max: 250, name: 'Sürgün ve Meyve Girişi', badge: 'Sürgün Zararı', color: '#f97316', level: 'warning', advice: 'Uç kurutan sürgünleri temizleyin veya ilaç korumasını kontrol edin.' },
        { min: 250, max: 400, name: 'Yoğun Larva Zararı', badge: 'Yoğun Zarar', color: '#f59e0b', level: 'attention', advice: 'Sürgün uçlarındaki bayılmaları ve meyve bulaşıklığını izleyin.' },
        { min: 400, max: 9999, name: '2. Döl Başlangıcı', badge: '2. Döl', color: '#a855f7', level: 'attention', advice: 'Yaz dönemi 2. döl kelebek uçuşlarını takip edin.' }
      ]
    }
  };

  /**
   * Birikimli gün-derece değerine göre mevcut fenolojik evreyi ve tavsiyeyi getirir.
   */
  function getStageInfo(pestKey, cumulativeDD) {
    const model = PEST_MODELS[pestKey];
    if (!model) return null;
    const val = (cumulativeDD !== null && cumulativeDD !== undefined && Number.isFinite(Number(cumulativeDD))) ? Number(cumulativeDD) : 0;

    let activeStage = model.targetStages[0];
    for (const stage of model.targetStages) {
      if (val >= stage.min && val < stage.max) {
        activeStage = stage;
        break;
      }
    }

    // Bir sonraki kritik eşik
    let nextCritical = null;
    for (const stage of model.targetStages) {
      if (stage.level === 'critical' && val < stage.min) {
        nextCritical = { min: stage.min, name: stage.name, remaining: Math.max(0, stage.min - val) };
        break;
      }
    }

    return {
      pestName: model.name,
      scientificName: model.scientificName,
      cumulative: val,
      stageName: activeStage.name,
      badge: activeStage.badge,
      color: activeStage.color,
      level: activeStage.level,
      advice: activeStage.advice,
      nextCritical: nextCritical,
      isCriticalNow: activeStage.level === 'critical'
    };
  }

  /**
   * Arşivlenmiş meteoroloji ölçümlerinden yüksek hassasiyetli gün-derece hesabı yapar.
   * @param {Array} points - İstasyon ölçüm noktaları [{ts, temp, time}, ...]
   * @param {number} start - Başlangıç tarihi epoch saniye (UTC)
   * @param {number} end - Bitiş tarihi epoch saniye (UTC)
   * @param {object} [options] - Opsiyonel eşik ve boşluk ayarları
   */
  function calculate(points, start, end, options) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      throw new Error('Geçersiz hesap dönemi: Başlangıç tarihi bugünden ileri olamaz.');
    }

    const opts = options || {};
    const baseTemp = Number(opts.lowerThreshold) || 10.0;
    const capTemp = Number(opts.upperThreshold) || 31.0;
    const maxGapSeconds = Number(opts.maxGap) || 1800; // 30 dakika üzeri boşlukları doldurma

    // UTC+3 Türkiye Saati için Gün formatlayıcı (Hızlı ISO dönüşümü)
    const dateKeyFromTs = ts => {
      const d = new Date((ts + 10800) * 1000);
      return d.toISOString().slice(0, 10);
    };

    // Günlük veri yapısı havuzu oluştur (start -> end arası her gün)
    const dailyMap = new Map();
    for (let ts = start; ts < end; ts += 86400) {
      const dKey = dateKeyFromTs(ts);
      if (!dailyMap.has(dKey)) {
        dailyMap.set(dKey, {
          date: dKey,
          dd: 0,
          seconds: 0,
          expected: Math.min(86400, end - ts),
          tempMin: Infinity,
          tempMax: -Infinity,
          samples: 0
        });
      }
    }

    if (!Array.isArray(points) || !points.length) {
      const days = [...dailyMap.values()];
      days.forEach(d => {
        d.cumulative = 0;
        d.partial = true;
        d.coverage = 0;
        d.value = 0;
        d.tempMin = null;
        d.tempMax = null;
      });
      return { total: 0, seconds: 0, coverage: 0, days };
    }

    // Geçerli ölçümleri filtrele ve sırala (O(N log N))
    const validRows = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p && typeof p.ts === 'number' && Number.isFinite(p.ts) &&
          typeof p.temp === 'number' && Number.isFinite(p.temp) &&
          p.temp >= -50 && p.temp <= 80) {
        validRows.push(p);
      }
    }
    validRows.sort((a, b) => a.ts - b.ts);

    // Tekilleştirme ve günlük min/max kaydı
    const rows = [];
    let lastTs = -1;
    for (let i = 0; i < validRows.length; i++) {
      const p = validRows[i];
      if (p.ts !== lastTs) {
        rows.push(p);
        lastTs = p.ts;
        const dKey = dateKeyFromTs(p.ts);
        const dayEntry = dailyMap.get(dKey);
        if (dayEntry) {
          dayEntry.samples++;
          if (p.temp < dayEntry.tempMin) dayEntry.tempMin = p.temp;
          if (p.temp > dayEntry.tempMax) dayEntry.tempMax = p.temp;
        }
      }
    }

    // Aralıklar üzerinden integral hesaplama
    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i];
      const b = rows[i + 1];
      const gap = b.ts - a.ts;

      if (gap <= 0 || gap > maxGapSeconds) continue;

      let left = Math.max(start, a.ts);
      const right = Math.min(end, b.ts);
      if (left >= right) continue;

      // 10–31 °C aralığındaki katkı hızı (°C)
      const effectiveTemp = Math.max(0, Math.min(capTemp, a.temp) - baseTemp);

      while (left < right) {
        const day = dateKeyFromTs(left);
        const midnight = Date.parse(day + 'T00:00:00+03:00') / 1000;
        const stop = Math.min(right, midnight + 86400);
        const r = dailyMap.get(day);
        if (r) {
          const duration = stop - left;
          r.seconds += duration;
          r.dd += (effectiveTemp * duration) / 86400;
        }
        left = stop;
      }
    }

    // Birikimli toplamları ve kapsam oranlarını hesapla
    const days = [...dailyMap.values()];
    let totalDD = 0, totalSeconds = 0;

    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      totalDD += d.dd;
      totalSeconds += d.seconds;
      d.cumulative = totalSeconds > 0 ? Math.round(totalDD * 10) / 10 : 0;
      d.coverage = d.expected > 0 ? Math.min(100, Math.round((1000 * d.seconds) / d.expected) / 10) : 0;
      d.partial = d.coverage < 95;
      d.value = d.seconds > 0 ? Math.round(d.dd * 10) / 10 : 0;
      if (d.tempMin === Infinity) d.tempMin = null;
      if (d.tempMax === -Infinity) d.tempMax = null;
    }

    const totalPeriodSeconds = Math.max(1, end - start);
    const overallCoverage = Math.min(100, Math.round((1000 * totalSeconds) / totalPeriodSeconds) / 10);

    return {
      total: totalSeconds > 0 ? Math.round(totalDD * 10) / 10 : 0,
      seconds: totalSeconds,
      coverage: overallCoverage,
      days: days
    };
  }

  const api = {
    calculate: calculate,
    PEST_MODELS: PEST_MODELS,
    getStageInfo: getStageInfo
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.MeteoDegreeDays = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
