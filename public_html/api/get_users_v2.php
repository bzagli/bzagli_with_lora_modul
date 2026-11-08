<?php
require_once __DIR__ . '/_auth.php';
bz_require_admin();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$users_file = '../../data/users.json';

if (file_exists($users_file)) {
    $users = json_decode(file_get_contents($users_file), true);
    echo json_encode(is_array($users) ? $users : []);
} else {
    echo json_encode([]);
}
?>
