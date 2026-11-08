<?php
require_once __DIR__ . '/_auth.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$json_data = file_get_contents('php://input');
$login_data = json_decode($json_data, true);

$data_dir = realpath(__DIR__ . '/../../data');
if ($data_dir === false) {
    $data_dir = __DIR__ . '/../../data';
}
$users_file = $data_dir . '/users.json';

// Dosya yoksa varsayılan admin oluştur
if (!file_exists($users_file)) {
    $default_users = [
        [
            'username' => 'Bulent',
            'password' => '1209',
            'role' => 'admin',
            'permissions' => ['edit' => true, 'delete' => true, 'hidden' => []]
        ]
    ];
    if (!is_dir($data_dir)) mkdir($data_dir, 0755, true);
    file_put_contents($users_file, json_encode($default_users));
}

// Kaba kuvvet koruması: IP başına 15 dakikada en fazla 10 hatalı deneme
const LOGIN_MAX_FAILS = 10;
const LOGIN_WINDOW = 900;
$attempt_file = sys_get_temp_dir() . '/bz_login_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$attempts = json_decode((string)@file_get_contents($attempt_file), true);
if (!is_array($attempts) || (time() - (int)($attempts['since'] ?? 0)) > LOGIN_WINDOW) {
    $attempts = ['since' => time(), 'fails' => 0];
}
if ($attempts['fails'] >= LOGIN_MAX_FAILS) {
    http_response_code(429);
    echo json_encode(['status' => 'error', 'message' => 'Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar deneyin.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$users = json_decode(file_get_contents($users_file), true);
if (!is_array($users)) $users = [];
$login_username = trim($login_data['username'] ?? '');
$login_password = trim($login_data['password'] ?? '');

foreach ($users as $user) {
    $stored_username = trim($user['username'] ?? '');
    $stored_password = trim($user['password'] ?? '');
    if ($login_username !== '' && strtolower($stored_username) === strtolower($login_username) && hash_equals($stored_password, $login_password)) {
        @unlink($attempt_file);
        bz_issue_token($user);
        echo json_encode([
            'status' => 'success',
            'role' => $user['role'],
            'username' => $user['username'],
            'allowed_gardens' => $user['allowed_gardens'] ?? [],
            'permissions' => $user['permissions'] ?? ['edit' => true, 'delete' => true, 'hidden' => []]
        ]);
        exit;
    }
}

$attempts['fails']++;
@file_put_contents($attempt_file, json_encode($attempts), LOCK_EX);
echo json_encode(['status' => 'error', 'message' => 'Hatalı giriş!']);
