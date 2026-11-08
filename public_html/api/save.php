<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

// Gelen JSON verisini al
$json_data = file_get_contents('php://input');
$data_array = json_decode($json_data, true);

if ($data_array === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı.']);
    exit;
}

// Bahçe ID'sini al
$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id); // Güvenlik temizliği

$directory = "../../data/{$garden_id}";
$filename = "{$directory}/products.json";

// data klasörü yoksa oluştur
if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

// Dosyaya geri yaz (JSON_PRETTY_PRINT ile okunabilir formatta)
if (file_put_contents($filename, json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    // Arşivleme: Ana dosyanın yanına zaman damgalı bir kopya oluşturur (Ekstra klasör oluşturmaz)
    $timestamp = date('Ymd_His');
    $archive_file = "{$directory}/products_history_{$timestamp}.json";
    file_put_contents($archive_file, json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['status' => 'success', 'message' => 'Veriler başarıyla senkronize edildi ve arşivlendi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası! Yazma izinlerini kontrol edin.']);
}
?>