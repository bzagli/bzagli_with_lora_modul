<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

// Gelen JSON verisini al (bahçenin tüm herbisit kayıtları)
$json_data = file_get_contents('php://input');
$data_array = json_decode($json_data, true);

if (!is_array($data_array)) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı.']);
    exit;
}

// Bahçe ID'sini al
$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id); // Güvenlik temizliği

$directory = "../../data/{$garden_id}";
$filename = "{$directory}/herbicide_records.json";

// data klasörü yoksa oluştur
if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

if (file_put_contents($filename, json_encode(array_values($data_array), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false) {
    echo json_encode(['status' => 'success', 'message' => 'Herbisit kayıtları başarıyla kaydedildi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası! Yazma izinlerini kontrol edin.']);
}
?>
