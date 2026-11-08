<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$garden_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['garden_id'] ?? 'default');
if ($garden_id === '') $garden_id = 'default';

$data_dir = realpath(__DIR__ . '/../../data');
if ($data_dir === false) {
    $data_dir = __DIR__ . '/../../data';
}
$filename = $data_dir . DIRECTORY_SEPARATOR . $garden_id . DIRECTORY_SEPARATOR . 'products.json';

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode([]);
}
?>
