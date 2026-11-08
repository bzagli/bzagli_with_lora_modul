<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$garden_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['garden_id'] ?? 'default');
if ($garden_id === '') $garden_id = 'default';

$directory = "../../data/{$garden_id}";
$filename = "{$directory}/irrigation_fertilization.json";

if (!file_exists($filename)) {
    echo json_encode(['status' => 'error', 'message' => 'Veritabanı dosyası bulunamadı!']);
    exit;
}

// 1. Dosyayı Yükle
$json_data = file_get_contents($filename);
$records = json_decode($json_data, true);

if ($records === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı.']);
    exit;
}

// 2. İşlem Öncesi Yedek Al
$backup_filename = "{$filename}.backup_" . date('Ymd_His');
copy($filename, $backup_filename);

// Helper function to calculate total area
function getRecordTotalArea($r) {
    if (isset($r['totalArea']) && (float)$r['totalArea'] > 0) {
        return (float)$r['totalArea'];
    }
    $total_area = 0.0;
    if (!empty($r['parcelVariety'])) {
        preg_match_all('/\((\d+(?:\.\d+)?)\s*da\)/', $r['parcelVariety'], $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $val) {
                $total_area += (float)$val;
            }
        }
    }
    return $total_area;
}

// Helper function to clean up notes
function cleanNotes($notes) {
    if (empty($notes)) return '';
    $cleaned = str_replace([
        ' (Gece Girişi - Sayaç Takibinden Tahmini Dolduruldu)',
        ' (Gece Girişi - Sayaç Takipten Tahmini Dolduruldu)',
        '(Gece Girişi - Sayaç Takibinden Tahmini Dolduruldu)',
        '(Gece Girişi - Sayaç Takipten Tahmini Dolduruldu)'
    ], '', $notes);
    return trim($cleaned);
}

$updated_count = 0;
$details = [];

foreach ($records as &$r) {
    // Clean notes always
    $r['notes'] = cleanNotes($r['notes'] ?? '');

    $c_start_clean = isset($r['counterStart']) ? trim($r['counterStart']) : '';
    $c_end_clean = isset($r['counterEnd']) ? trim($r['counterEnd']) : '';
    $is_zero_start = ($c_start_clean === '' || (float)$c_start_clean === 0.0);
    $is_zero_end = ($c_end_clean === '' || (float)$c_end_clean === 0.0);

    // It is an estimated run if counters are missing/equal, or if isEstimated is explicitly true
    $is_estimated = !empty($r['isEstimated']) || ($is_zero_start && $is_zero_end) || ($c_start_clean !== '' && $c_start_clean === $c_end_clean);

    if ($is_estimated) {
        $duration = isset($r['duration']) ? (int)$r['duration'] : 0;
        
        // If it has duration/time, calculate at 2 m³/da/saat
        if ($duration > 0) {
            $total_area = getRecordTotalArea($r);
            // 2 m³ per hour per decare
            $water_amount = $total_area * ($duration / 60) * 2;
            
            $r['waterAmount'] = sprintf('%.2f', $water_amount);
            $r['isEstimated'] = true;
            
            // Clear the faked counters because they are not manually entered and we don't want "afaki" data
            $r['counterStart'] = '';
            $r['counterEnd'] = '';

            $details[] = "ID: {$r['id']} | Süre: {$duration} dk | Alan: {$total_area} da | Su: {$r['waterAmount']} m³ (Tahmini Hesaplandı)";
            $updated_count++;
        }
    }
}
unset($r); // clear reference

// 3. Güncellenmiş Veritabanını Kaydet
if ($updated_count > 0 || true) { // Always save since we clean notes too
    if (!file_put_contents($filename, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['status' => 'error', 'message' => 'Güncellenmiş veritabanı dosyaya yazılamadı!']);
        exit;
    }
}

echo json_encode([
    'status' => 'success',
    'message' => "Senkronizasyon başarıyla tamamlandı. {$updated_count} adet gece kaydı güncellendi ve notlar temizlendi.",
    'updated_count' => $updated_count,
    'details' => $details
]);
?>
