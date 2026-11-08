<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');
// Tarayıcı önbelleğini devre dışı bırakma
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$filename = '../../data/gardens.json';

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode([]);
}
?>