<?php
require_once __DIR__ . '/_auth.php';
bz_require_login();
header('Content-Type: application/json; charset=utf-8');

$products = [];
$uniqueNames = [];

// 1. Get from chemical_reference.json
$refFile = '../../data/chemical_reference.json';
if (file_exists($refFile)) {
    $refData = json_decode(file_get_contents($refFile), true);
    if (is_array($refData)) {
        foreach ($refData as $item) {
            $name = trim($item['name'] ?? '');
            if (empty($name)) continue;
            
            $key = mb_strtolower($name, 'UTF-8');
            if (!isset($uniqueNames[$key])) {
                $uniqueNames[$key] = true;
                $products[] = [
                    'name' => $name,
                    'active_ingredient' => trim($item['active_ingredient'] ?? ''),
                    'category' => trim($item['category'] ?? ''),
                    'group' => trim($item['group'] ?? ''),
                    'dosage' => trim($item['dosage'] ?? ''),
                    'company' => trim($item['company'] ?? ''),
                    'target' => trim($item['target'] ?? ''),
                    'source' => 'reference'
                ];
            }
        }
    }
}

// 2. Scan all subdirectories in data/
$dataDir = '../../data';
if (is_dir($dataDir)) {
    $dirs = scandir($dataDir);
    foreach ($dirs as $dir) {
        if ($dir === '.' || $dir === '..') continue;
        
        $prodPath = $dataDir . '/' . $dir . '/products.json';
        if (is_file($prodPath)) {
            $stockData = json_decode(file_get_contents($prodPath), true);
            if (is_array($stockData)) {
                foreach ($stockData as $item) {
                    $name = trim($item['name'] ?? '');
                    if (empty($name)) continue;
                    
                    $key = mb_strtolower($name, 'UTF-8');
                    if (!isset($uniqueNames[$key])) {
                        $uniqueNames[$key] = true;
                        
                        $products[] = [
                            'name' => $name,
                            'active_ingredient' => trim($item['active_ingredient'] ?? ''),
                            'category' => trim($item['category'] ?? ''),
                            'group' => trim($item['group'] ?? ''),
                            'dosage' => trim($item['dosage'] ?? ''),
                            'company' => '',
                            'target' => '',
                            'source' => 'stock'
                        ];
                    }
                }
            }
        }
    }
}

// Sort alphabetically by name
usort($products, function($a, $b) {
    return strcasecmp($a['name'], $b['name']);
});

echo json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
