<?php
require_once __DIR__ . '/_auth.php';
header('Content-Type: application/json; charset=utf-8');
bz_clear_token();
echo json_encode(['status' => 'success']);
