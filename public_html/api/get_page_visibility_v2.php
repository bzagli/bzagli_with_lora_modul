<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$dir = __DIR__ . '/../../data';
$vis_file = $dir . '/page_visibility.json';
$users_file = $dir . '/users.json';
$gardens_file = $dir . '/gardens.json';

$vis_data = [];
if (file_exists($vis_file)) {
    $content = @file_get_contents($vis_file);
    $vis_data = json_decode($content, true);
    if (!is_array($vis_data)) $vis_data = [];
}

$hidden_for_non_admins = $vis_data['hidden_for_non_admins'] ?? [];
$user_visibility = $vis_data['user_visibility'] ?? [];
$garden_visibility = $vis_data['garden_visibility'] ?? [];
$user_garden_visibility = $vis_data['user_garden_visibility'] ?? [];

// Load users and gardens
$users_list = [];
if (file_exists($users_file)) {
    $users_raw = json_decode(@file_get_contents($users_file), true);
    if (is_array($users_raw)) {
        foreach ($users_raw as $u) {
            $uname = $u['username'] ?? '';
            $role = $u['role'] ?? 'viewer';
            if ($uname !== '') {
                $users_list[] = [
                    'username' => $uname,
                    'role' => $role,
                    'allowed_gardens' => $u['allowed_gardens'] ?? []
                ];
                // Sync existing hidden pages from users.json if not yet in page_visibility.json
                if (!isset($user_visibility[$uname]) && !empty($u['permissions']['hidden']) && is_array($u['permissions']['hidden'])) {
                    $user_visibility[$uname] = $u['permissions']['hidden'];
                }
            }
        }
    }
}

$gardens_list = [];
if (file_exists($gardens_file)) {
    $gardens_raw = json_decode(@file_get_contents($gardens_file), true);
    if (is_array($gardens_raw)) {
        foreach ($gardens_raw as $g) {
            if (!empty($g['id'])) {
                $gardens_list[] = [
                    'id' => $g['id'],
                    'name' => $g['name'] ?? $g['id']
                ];
            }
        }
    }
}

echo json_encode([
    'status' => 'success',
    'hidden_for_non_admins' => $hidden_for_non_admins,
    'user_visibility' => $user_visibility,
    'garden_visibility' => $garden_visibility,
    'user_garden_visibility' => $user_garden_visibility,
    'users' => $users_list,
    'gardens' => $gardens_list,
    'updated_at' => $vis_data['updated_at'] ?? null,
    'updated_by' => $vis_data['updated_by'] ?? null
], JSON_UNESCAPED_UNICODE);
?>
