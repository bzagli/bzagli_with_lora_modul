<?php
/**
 * Fixaj E22 LoRa Alıcı (ESP32) API Servisi - 3. istasyon
 * Sürüm: 4.3.0-dx
 * 
 * Fixaj_Recv_ESP32_Dashboard cihazının POST ettiği sıcaklık/nem verisi için 15 dakikalık uç değer (min/max) arşivi,
 * canlı izleme, geçmiş grafikleri ve gün-derece hesaplama servisi.
 */
date_default_timezone_set('Europe/Istanbul');
ini_set('display_errors', '0');
ini_set('log_errors', '1');

const DX_VERSION = '4.3.0-fixaj';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('X-Fixaj-Version: ' . DX_VERSION);

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function dx_root() {
    $parentData = dirname(__DIR__, 2) . '/data';
    if (is_dir($parentData)) return $parentData;
    $localData = dirname(__DIR__) . '/data';
    if (is_dir($localData)) return $localData;
    return $parentData;
}

function dx_store() {
    return dx_root() . '/fixaj_v3';
}

function dx_json_reply($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function dx_clean_num($val, $min, $max) {
    if ($val === null || $val === '' || is_bool($val)) return null;
    $val = str_replace(',', '.', trim((string)$val));
    if (!is_numeric($val)) return null;
    $n = (float)$val;
    return (is_finite($n) && $n >= $min && $n <= $max) ? round($n, 2) : null;
}

function dx_parse_date($value) {
    if (!is_string($value)) return null;
    $dt = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    return ($dt && $dt->format('Y-m-d') === $value) ? $dt : null;
}

function dx_record($item) {
    if (!is_array($item)) return null;
    $t = dx_clean_num($item['temp'] ?? $item['temperature'] ?? null, -50, 80);
    $h = dx_clean_num($item['hum'] ?? $item['humidity'] ?? null, 0, 100);
    if ($t === null || $h === null) return null;

    $timeStr = $item['time'] ?? $item['at'] ?? null;
    $ts = null;
    if (is_numeric($timeStr) && (int)$timeStr > 1600000000) {
        $ts = (int)$timeStr;
        $dt = (new DateTimeImmutable())->setTimestamp($ts);
    } elseif (is_string($timeStr)) {
        $fmt = strpos($timeStr, '-') === 4 ? 'Y-m-d H:i:s' : 'd.m.Y H:i:s';
        $dt = DateTimeImmutable::createFromFormat('!' . $fmt, $timeStr);
        if ($dt) $ts = $dt->getTimestamp();
    }
    if (!$ts) {
        if (isset($item['ts']) && is_numeric($item['ts'])) {
            $ts = (int)$item['ts'];
            $dt = (new DateTimeImmutable())->setTimestamp($ts);
        } else {
            return null;
        }
    }

    $id = is_string($item['id'] ?? null) ? $item['id'] : hash('sha256', $ts . '|' . $t . '|' . $h);
    return [
        'id' => $id,
        'temp' => $t,
        'hum' => $h,
        'raw_temp' => $item['raw_temp'] ?? null,
        'raw_hum' => $item['raw_hum'] ?? null,
        'rssi' => $item['rssi'] ?? null,
        'snr' => $item['snr'] ?? null,
        'konum' => is_string($item['konum'] ?? null) ? $item['konum'] : null,
        'time' => $dt->format('d.m.Y H:i:s'),
        'ts' => $ts,
        'source' => is_string($item['source'] ?? null) ? $item['source'] : 'fixaj_e22'
    ];
}

function dx_locked($cb) {
    $dir = dx_store();
    if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
        throw new RuntimeException('data/fixaj_v3 dizini oluşturulamadı.');
    }
    $lock = fopen($dir . '/record.lock', 'c');
    if ($lock === false) {
        throw new RuntimeException('Kayıt kilidi açılamadı.');
    }
    try {
        if (!flock($lock, LOCK_EX)) {
            throw new RuntimeException('Kayıt kilidi alınamadı.');
        }
        return $cb();
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function dx_read_lines($path) {
    $rows = [];
    if (!is_file($path)) return $rows;
    $fh = fopen($path, 'rb');
    if ($fh === false) return $rows;
    try {
        while (($line = fgets($fh)) !== false) {
            $line = trim($line);
            if ($line === '') continue;
            $data = json_decode($line, true);
            $rec = dx_record($data);
            if ($rec !== null) $rows[] = $rec;
        }
    } finally {
        fclose($fh);
    }
    return $rows;
}

function dx_last_from_store() {
    $files = glob(dx_store() . '/????-??-??.jsonl');
    if (!$files) return null;
    rsort($files);
    foreach ($files as $file) {
        $rows = dx_read_lines($file);
        if ($rows) return $rows[count($rows) - 1];
    }
    return null;
}

function dx_append($date, $rows) {
    if (!$rows) return;
    $dir = dx_store();
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    $path = $dir . '/' . $date . '.jsonl';
    $fh = fopen($path, 'c+b');
    if ($fh === false) throw new RuntimeException('Kayıt dosyası açılamadı.');
    try {
        fseek($fh, 0, SEEK_END);
        $size = ftell($fh);
        if ($size > 0) {
            fseek($fh, -1, SEEK_END);
            $lastByte = fread($fh, 1);
            fseek($fh, 0, SEEK_END);
            if ($lastByte !== "\n") fwrite($fh, "\n");
        }
        foreach ($rows as $r) {
            fwrite($fh, json_encode($r, JSON_UNESCAPED_UNICODE) . "\n");
        }
        fflush($fh);
    } finally {
        fclose($fh);
    }
}

function dx_summary($rows, $date) {
    $s = [
        'date' => $date, 'count' => count($rows),
        'temp_min' => null, 'temp_max' => null, 'temp_avg' => null,
        'hum_min' => null, 'hum_max' => null, 'hum_avg' => null,
        'first_time' => null, 'last_time' => null
    ];
    if (!$rows) return $s;

    $tSum = 0; $hSum = 0;
    foreach ($rows as $r) {
        $t = $r['temp']; $h = $r['hum'];
        $s['temp_min'] = $s['temp_min'] === null ? $t : min($s['temp_min'], $t);
        $s['temp_max'] = $s['temp_max'] === null ? $t : max($s['temp_max'], $t);
        $s['hum_min'] = $s['hum_min'] === null ? $h : min($s['hum_min'], $h);
        $s['hum_max'] = $s['hum_max'] === null ? $h : max($s['hum_max'], $h);
        $tSum += $t; $hSum += $h;
    }
    $cnt = count($rows);
    $s['temp_avg'] = round($tSum / $cnt, 1);
    $s['hum_avg'] = round($hSum / $cnt, 1);
    $s['first_time'] = $rows[0]['time'];
    $s['last_time'] = $rows[$cnt - 1]['time'];
    return $s;
}

function dx_interval_summary($rows) {
    $slots = [];
    foreach ($rows as $r) {
        $slot = (int)floor($r['ts'] / 900);
        if (!isset($slots[$slot])) {
            $slots[$slot] = $r;
            $slots[$slot]['interval_start'] = date('d.m.Y H:i', $slot * 900);
            $slots[$slot]['interval_end'] = date('H:i', ($slot + 1) * 900);
            $slots[$slot]['sample_count'] = 0;
            $slots[$slot]['temp_min'] = $r['temp'];
            $slots[$slot]['temp_max'] = $r['temp'];
            $slots[$slot]['hum_min'] = $r['hum'];
            $slots[$slot]['hum_max'] = $r['hum'];
        }
        $slots[$slot]['sample_count']++;
        $slots[$slot]['temp_min'] = min($slots[$slot]['temp_min'], $r['temp']);
        $slots[$slot]['temp_max'] = max($slots[$slot]['temp_max'], $r['temp']);
        $slots[$slot]['hum_min'] = min($slots[$slot]['hum_min'], $r['hum']);
        $slots[$slot]['hum_max'] = max($slots[$slot]['hum_max'], $r['hum']);
    }
    ksort($slots);
    return array_values($slots);
}

function dx_slots($rows) {
    $slots = [];
    foreach ($rows as $r) {
        $slot = (int)floor($r['ts'] / 900);
        if (!isset($slots[$slot])) $slots[$slot] = $r;
    }
    ksort($slots);
    return array_values($slots);
}

function dx_sync($from, $to, $compact = false, &$metadata = []) {
    $metadata = [];
    $result = [];
    $today = date('Y-m-d');

    // Only migrate legacy data/fixaj_history.jsonl if fixaj_v3 has no partitions at all
    $existingPartitions = glob(dx_store() . '/????-??-??.jsonl');
    $hasPartitions = !empty($existingPartitions);
    $legacyPath = dx_root() . '/fixaj_history.jsonl';
    $legacyChecked = $hasPartitions;
    $legacyGrouped = [];

    $cacheFile = dx_store() . '/summaries_cache.json';
    $sumCache = ($compact === 'daily_only' && is_file($cacheFile)) ? (json_decode((string)@file_get_contents($cacheFile), true) ?: []) : [];
    $cacheDirty = false;

    $latestPath = dx_root() . '/fixaj.json';
    $latestRec = is_file($latestPath) ? dx_record(json_decode((string)@file_get_contents($latestPath), true)) : null;
    $latestDate = $latestRec ? date('Y-m-d', $latestRec['ts']) : null;

    $cursor = new DateTimeImmutable($from);
    $end = new DateTimeImmutable($to);

    for (; $cursor <= $end; $cursor = $cursor->modify('+1 day')) {
        $date = $cursor->format('Y-m-d');
        $dayFile = dx_store() . '/' . $date . '.jsonl';
        $rows = [];

        if ($compact === 'daily_only' && $date < $today && $latestDate !== $date) {
            if (!is_file($dayFile)) {
                $metadata[$date] = ['summary' => dx_summary([], $date), 'last' => null];
                $result[$date] = [];
                continue;
            }
            $fSize = @filesize($dayFile);
            $fMtime = @filemtime($dayFile);
            if (isset($sumCache[$date]) && ($sumCache[$date]['size'] ?? -1) === $fSize && ($sumCache[$date]['mtime'] ?? -1) === $fMtime && isset($sumCache[$date]['summary'])) {
                $metadata[$date] = ['summary' => $sumCache[$date]['summary'], 'last' => $sumCache[$date]['last'] ?? null];
                $result[$date] = [];
                continue;
            }
        }

        if (is_file($dayFile)) {
            $rows = dx_read_lines($dayFile);
        } elseif (!$legacyChecked) {
            // Only parse legacy file once when fixaj_v3 has never been populated
            if (is_file($legacyPath)) {
                $legRows = dx_read_lines($legacyPath);
                foreach ($legRows as $lr) {
                    $ld = date('Y-m-d', $lr['ts']);
                    $legacyGrouped[$ld][] = $lr;
                }
            }
            $legacyChecked = true;
            if (!empty($legacyGrouped[$date])) {
                $rows = $legacyGrouped[$date];
                dx_append($date, $rows);
            }
        }

        // Add latest live reading if belongs to this day and not recorded
        if ($latestRec && $latestDate === $date) {
            $found = false;
            if ($rows) {
                $lastInDay = end($rows);
                if ($lastInDay['ts'] === $latestRec['ts'] || abs($lastInDay['ts'] - $latestRec['ts']) < 2) {
                    $found = true;
                }
            }
            if (!$found) {
                $rows[] = $latestRec;
            }
        }

        if ($rows) {
            usort($rows, static function ($a, $b) { return $a['ts'] <=> $b['ts']; });
        }

        $daySummary = dx_summary($rows, $date);
        $dayLast = $rows ? end($rows) : null;
        $metadata[$date] = [
            'summary' => $daySummary,
            'last' => $dayLast
        ];

        if ($compact === 'daily_only' && $date < $today && is_file($dayFile)) {
            $sumCache[$date] = ['size' => @filesize($dayFile), 'mtime' => @filemtime($dayFile), 'summary' => $daySummary, 'last' => $dayLast];
            $cacheDirty = true;
        }

        $result[$date] = ($compact === 'daily_only')
            ? []
            : (($compact === 'archive') ? dx_interval_summary($rows) : ($compact ? dx_slots($rows) : $rows));
        unset($rows);
    }

    if ($cacheDirty) {
        @file_put_contents($cacheFile, json_encode($sumCache, JSON_UNESCAPED_UNICODE));
    }

    return $result;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'POST') {
        $input = $_POST;
        if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
        }
        if (!is_array($input)) dx_json_reply(['error' => 'Geçersiz veri biçimi.'], 400);

        $t = dx_clean_num($input['temp'] ?? $input['temperature'] ?? null, -50, 80);
        $h = dx_clean_num($input['hum'] ?? $input['humidity'] ?? null, 0, 100);
        if ($t === null || $h === null) {
            dx_json_reply(['error' => 'Geçerli temp ve hum alanları gereklidir.'], 400);
        }

        $out = dx_locked(function () use ($t, $h, $input) {
            $now = time();
            $r = [
                'id' => bin2hex(random_bytes(16)),
                'temp' => $t,
                'hum' => $h,
                'raw_temp' => $input['raw_temp'] ?? null,
                'raw_hum' => $input['raw_hum'] ?? null,
                'rssi' => $input['rssi'] ?? null,
                'snr' => $input['snr'] ?? null,
                'konum' => is_string($input['konum'] ?? null) ? substr(strip_tags($input['konum']), 0, 32) : null,
                'time' => date('d.m.Y H:i:s', $now),
                'ts' => $now,
                'source' => 'fixaj_e22'
            ];
            $today = date('Y-m-d', $now);
            dx_append($today, [$r]);

            // Anlık dosya güncelle (fixaj.json)
            $liveFile = dx_root() . '/fixaj.json';
            @file_put_contents($liveFile, json_encode($r, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

            return ['ok' => true, 'version' => DX_VERSION, 'time' => $r['time']];
        });
        dx_json_reply($out);
    } elseif ($method === 'GET') {
        $action = $_GET['action'] ?? 'live';
        if (!is_string($action) || !in_array($action, ['live', 'history', 'archive', 'degree', 'daily'], true)) {
            dx_json_reply(['error' => 'Geçersiz işlem.'], 400);
        }

        $out = dx_locked(function () use ($action) {
            $now = time();
            $today = date('Y-m-d', $now);
            $from = $today;
            $to = $today;

            if ($action === 'history') {
                $days = filter_input(INPUT_GET, 'days', FILTER_VALIDATE_INT);
                if (!in_array($days, [1, 7, 30, 90, 365], true)) $days = 1;
                $since = $now - $days * 86400;
                $from = date('Y-m-d', $since);
            } elseif ($action === 'archive' || $action === 'degree' || $action === 'daily') {
                $a = dx_parse_date($_GET['from'] ?? ($action === 'daily' ? date('Y-m-d', $now - 30 * 86400) : $today));
                $b = dx_parse_date($_GET['to'] ?? $today);
                $maxDays = $action === 'archive' ? 366 : 3650;
                if (!$a || !$b || $a > $b || $a->diff($b)->days > $maxDays) {
                    throw new InvalidArgumentException('Geçerli tarih aralığı seçin (en fazla 366 gün arşiv, 3650 gün özet).');
                }
                $from = ($action === 'degree' ? $a->modify('-1 day') : $a)->format('Y-m-d');
                $to = $b->format('Y-m-d');
            }

            $metadata = [];
            $compactMode = $action === 'daily' ? 'daily_only' : ($action === 'archive' ? 'archive' : ($action !== 'live'));
            $byDay = dx_sync($from, $to, $compactMode, $metadata);
            $all = [];
            if ($action !== 'daily') {
                foreach ($byDay as $rows) {
                    $all = array_merge($all, $rows);
                }
            }
            unset($byDay);

            if ($action === 'degree') {
                return [
                    'version' => DX_VERSION,
                    'server_ts' => $now,
                    'points' => array_values(array_filter($all, static function ($r) use ($now) { return $r['ts'] <= $now; }))
                ];
            }

            if ($action === 'daily') {
                $dailyRows = [];
                $allTempSum = 0; $allHumSum = 0; $allCount = 0;
                $overallTempMin = null; $overallTempMax = null;
                $overallHumMin = null; $overallHumMax = null;
                foreach ($metadata as $date => $meta) {
                    $summary = $meta['summary'] ?? null;
                    if ($summary && $summary['count'] > 0) {
                        $dailyRows[] = $summary;
                        $allTempSum += ($summary['temp_avg'] * $summary['count']);
                        $allHumSum += ($summary['hum_avg'] * $summary['count']);
                        $allCount += $summary['count'];
                        $overallTempMin = $overallTempMin === null ? $summary['temp_min'] : min($overallTempMin, $summary['temp_min']);
                        $overallTempMax = $overallTempMax === null ? $summary['temp_max'] : max($overallTempMax, $summary['temp_max']);
                        $overallHumMin = $overallHumMin === null ? $summary['hum_min'] : min($overallHumMin, $summary['hum_min']);
                        $overallHumMax = $overallHumMax === null ? $summary['hum_max'] : max($overallHumMax, $summary['hum_max']);
                    }
                }
                $dailyRows = array_reverse($dailyRows);
                return [
                    'version' => DX_VERSION,
                    'from' => $from, 'to' => $to,
                    'overall' => [
                        'total_days' => count($dailyRows),
                        'total_count' => $allCount,
                        'temp_avg' => $allCount > 0 ? round($allTempSum / $allCount, 1) : null,
                        'temp_min' => $overallTempMin, 'temp_max' => $overallTempMax,
                        'hum_avg' => $allCount > 0 ? round($allHumSum / $allCount, 1) : null,
                        'hum_min' => $overallHumMin, 'hum_max' => $overallHumMax
                    ],
                    'rows' => $dailyRows
                ];
            }

            if ($action === 'archive') {
                $slots = array_reverse($all);
                $total = count($slots);
                $pages = max(1, (int)ceil($total / 100));
                $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT);
                $page = min($pages, max(1, (int)$page));
                return [
                    'version' => DX_VERSION,
                    'total' => $total,
                    'pages' => $pages,
                    'page' => $page,
                    'interval_extrema' => true,
                    'rows' => array_slice($slots, ($page - 1) * 100, 100)
                ];
            }

            // action === 'live' veya 'history'
            $last = $metadata[$today]['last'] ?? null;
            if (!$last) {
                $lp = dx_root() . '/fixaj.json';
                if (is_file($lp)) $last = dx_record(json_decode((string)@file_get_contents($lp), true));
            }
            if (!$last) {
                $last = dx_last_from_store();
            }
            $result = [
                'version' => DX_VERSION,
                'last' => $last,
                'today' => $metadata[$today]['summary'] ?? dx_summary([], $today),
                'server_ts' => $now,
                'tracking' => 'ok'
            ];
            if ($action === 'history') {
                $points = array_values(array_filter(dx_slots($all), static function ($r) use ($since, $now) {
                    return $r['ts'] >= $since && $r['ts'] <= $now;
                }));
                if ($last && $last['ts'] >= $since && $last['ts'] <= $now && (!$points || $last['ts'] > end($points)['ts'])) {
                    $points[] = $last;
                }
                $result['points'] = $points;
            }
            return $result;
        });
        dx_json_reply($out);
    } else {
        dx_json_reply(['error' => 'GET veya POST gerekli.'], 405);
    }
} catch (InvalidArgumentException $e) {
    dx_json_reply(['error' => $e->getMessage(), 'version' => DX_VERSION], 400);
} catch (Throwable $e) {
    error_log('Fixaj E22 API Error: ' . $e->getMessage());
    dx_json_reply(['error' => $e->getMessage(), 'version' => DX_VERSION], 500);
}
