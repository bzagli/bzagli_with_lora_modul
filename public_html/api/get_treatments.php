<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$garden_id = $_GET['garden_id'] ?? 'default';
$garden_id = preg_replace('/[^a-zA-Z0-9_]/', '', $garden_id);

$filename = '../../data/' . $garden_id . '/treatments.json';

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode([]);
}
?>