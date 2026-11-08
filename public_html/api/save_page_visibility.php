<?php
require_once __DIR__ . '/_auth.php';
$auth_user = bz_require_admin();
header('Content-Type: application/json; charset=utf-8');

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if ($data === null) {
    echo json_encode(['status' => 'error', 'message' => 'Geçersiz veri gönderildi.']);
    exit;
}

$dir = __DIR__ . '/../../data';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}
$filename = $dir . '/page_visibility.json';
$users_file = $dir . '/users.json';

// Mevcut veriyi oku
$existing = [];
if (file_exists($filename)) {
    $content = @file_get_contents($filename);
    $existing = json_decode($content, true);
    if (!is_array($existing)) $existing = [];
}

if (!isset($existing['hidden_for_non_admins']) || !is_array($existing['hidden_for_non_admins'])) {
    $existing['hidden_for_non_admins'] = [];
}
if (!isset($existing['user_visibility']) || !is_array($existing['user_visibility'])) {
    $existing['user_visibility'] = [];
}
if (!isset($existing['garden_visibility']) || !is_array($existing['garden_visibility'])) {
    $existing['garden_visibility'] = [];
}
if (!isset($existing['user_garden_visibility']) || !is_array($existing['user_garden_visibility'])) {
    $existing['user_garden_visibility'] = [];
}

// Temizleme fonksiyonu
function sanitizePageList($pages) {
    if (!is_array($pages)) return [];
    $clean = [];
    foreach ($pages as $p) {
        $p = trim((string)$p);
        if (preg_match('/^[a-zA-Z0-9_\-\.]+\.html$/', $p) || in_array($p, ['season_archive'])) {
            $clean[] = $p;
        }
    }
    return array_values(array_unique($clean));
}

$scope_type = $data['scope_type'] ?? 'global';
$target_user = trim($data['target_user'] ?? '');
$target_garden = trim($data['target_garden'] ?? '');
$admin_user = trim($auth_user['username'] ?? 'admin');
$hidden_pages = sanitizePageList($data['hidden_pages'] ?? $data['hidden_for_non_admins'] ?? []);

$scope_desc = "Genel";

if ($scope_type === 'user' && !empty($target_user)) {
    $existing['user_visibility'][$target_user] = $hidden_pages;
    $scope_desc = "Kullanıcı: " . $target_user;

    // Ayrıca data/users.json içindeki bu kullanıcının permissions.hidden alanını da güncelle
    if (file_exists($users_file)) {
        $users_data = json_decode(@file_get_contents($users_file), true);
        if (is_array($users_data)) {
            $user_found = false;
            foreach ($users_data as &$u) {
                if (strtolower($u['username'] ?? '') === strtolower($target_user)) {
                    if (!isset($u['permissions']) || !is_array($u['permissions'])) {
                        $u['permissions'] = ['edit' => true, 'delete' => true];
                    }
                    $u['permissions']['hidden'] = $hidden_pages;
                    $user_found = true;
                    break;
                }
            }
            if ($user_found) {
                @file_put_contents($users_file, json_encode($users_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
            }
        }
    }
} elseif ($scope_type === 'garden' && !empty($target_garden)) {
    $existing['garden_visibility'][$target_garden] = $hidden_pages;
    $scope_desc = "Bahçe: " . $target_garden;
} elseif ($scope_type === 'user_garden' && !empty($target_user) && !empty($target_garden)) {
    $key = $target_user . '::' . $target_garden;
    $existing['user_garden_visibility'][$key] = $hidden_pages;
    $scope_desc = "Kullanıcı + Bahçe (" . $target_user . " @ " . $target_garden . ")";
} else {
    // Global fallback
    $existing['hidden_for_non_admins'] = $hidden_pages;
    $scope_desc = "Tüm Normal Kullanıcılar (Genel)";
}

$existing['updated_at'] = date('Y-m-d H:i:s');
$existing['updated_by'] = $admin_user;

$written = file_put_contents($filename, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

if ($written !== false) {
    // Log kaydı
    $log_file = $dir . '/activity_logs.json';
    if (file_exists($log_file)) {
        $logs = json_decode(@file_get_contents($log_file), true);
        if (!is_array($logs)) $logs = [];
        array_unshift($logs, [
            'date' => date('Y-m-d H:i:s'),
            'user' => $admin_user,
            'action' => 'Sayfa Görünürlük Ayarı (' . $scope_desc . ')',
            'details' => count($hidden_pages) . ' sayfa gizlendi.'
        ]);
        if (count($logs) > 500) $logs = array_slice($logs, 0, 500);
        @file_put_contents($log_file, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    echo json_encode([
        'status' => 'success',
        'message' => $scope_desc . ' için sayfa görünürlük ayarları kaydedildi.',
        'scope_type' => $scope_type,
        'target_user' => $target_user,
        'target_garden' => $target_garden,
        'hidden_pages' => $hidden_pages,
        'data' => $existing,
        'updated_at' => $existing['updated_at']
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Dosyaya yazılamadı.']);
}
?>
