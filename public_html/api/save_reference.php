<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if ($data === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri formatı']);
    exit;
}

$directory = '../../data';
$filename = $directory . '/chemical_reference.json';

if (!is_dir($directory)) {
    mkdir($directory, 0777, true);
}

if (file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Yazma hatası']);
}
?>