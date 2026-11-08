<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $garden_id);
if ($garden_id === '') $garden_id = 'default';

$data_dir = realpath(__DIR__ . '/../../data');
if ($data_dir === false) $data_dir = __DIR__ . '/../../data';
$filename = $data_dir . DIRECTORY_SEPARATOR . $garden_id . DIRECTORY_SEPARATOR . 'irrigation_schedules.json';

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode([]);
}
?>
