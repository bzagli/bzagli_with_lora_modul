<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$json_data = file_get_contents('php://input');
$data_array = json_decode($json_data, true);

if ($data_array === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı.']);
    exit;
}

$garden_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['garden_id'] ?? 'default');
if ($garden_id === '') $garden_id = 'default';

// Sade klasör yapısı
$directory = "../../data/{$garden_id}";
$filename = "{$directory}/irrigation_fertilization.json";

if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

if (file_put_contents($filename, json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['status' => 'success', 'message' => 'Sulama ve gübreleme verileri başarıyla senkronize edildi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası! Yazma izinlerini kontrol edin.']);
}
?>