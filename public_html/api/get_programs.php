<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$filename = '../../data/programs.json';

if (file_exists($filename)) {
    echo file_get_contents($filename);
} else {
    echo json_encode((object)[]);
}
?>
