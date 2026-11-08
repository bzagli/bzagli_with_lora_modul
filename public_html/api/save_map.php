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

$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$directory = "../../data/{$garden_id}";
$filename = "{$directory}/map_data.json";

if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

if (file_put_contents($filename, json_encode($data_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['status' => 'success', 'message' => 'Harita verileri başarıyla kaydedildi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosya yazma hatası!']);
}
?>
