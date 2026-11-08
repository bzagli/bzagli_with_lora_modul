<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$garden_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['garden_id'] ?? 'default');
if ($garden_id === '') $garden_id = 'default';

// Sade klasör yapısı
$filename = '../../data/' . $garden_id . '/irrigation_fertilization.json';

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode([]);
}
?>