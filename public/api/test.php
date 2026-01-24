<?php
/**
 * Diagnostic test for Diamond API connection
 * Access: https://yourdomain.com/api/test.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$diagnostics = [
    'php_version' => phpversion(),
    'curl_available' => function_exists('curl_init'),
    'curl_version' => function_exists('curl_version') ? curl_version()['version'] : 'N/A',
    'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'Unknown',
    'tests' => []
];

// Test 1: cURL availability
if (!function_exists('curl_init')) {
    echo json_encode([
        'status' => 'error',
        'message' => 'cURL is not available on this server',
        'solution' => 'Contact Hostinger support to enable cURL extension',
        'diagnostics' => $diagnostics
    ]);
    exit();
}

// Test 2: Basic HTTP connection (Google)
$ch = curl_init('https://www.google.com');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_NOBODY, true);
$result = curl_exec($ch);
$diagnostics['tests']['google_connection'] = [
    'success' => $result !== false,
    'http_code' => curl_getinfo($ch, CURLINFO_HTTP_CODE),
    'error' => curl_error($ch)
];
curl_close($ch);

// Test 3: Diamond API with detailed error info
$testUrl = 'http://130.250.191.174:3009/allSportid?key=mahi4449839dbabkadbakwq1qqd';

$ch = curl_init($testUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_VERBOSE, false);

$response = curl_exec($ch);
$curlInfo = curl_getinfo($ch);
$curlError = curl_error($ch);
$curlErrno = curl_errno($ch);
curl_close($ch);

$diagnostics['tests']['diamond_api'] = [
    'success' => $response !== false,
    'http_code' => $curlInfo['http_code'],
    'connect_time' => $curlInfo['connect_time'] ?? 0,
    'total_time' => $curlInfo['total_time'] ?? 0,
    'error_code' => $curlErrno,
    'error_message' => $curlError,
    'url' => $testUrl
];

// Final result
if ($response === false) {
    // Connection failed - likely Hostinger blocks this port/IP
    echo json_encode([
        'status' => 'error',
        'message' => 'Cannot connect to Diamond API from this server',
        'reason' => $curlErrno == 28 
            ? 'Connection timeout - Hostinger may be blocking port 3009'
            : ($curlErrno == 7 ? 'Connection refused - API server may be blocking your server IP' : $curlError),
        'error_code' => $curlErrno,
        'diagnostics' => $diagnostics,
        'solutions' => [
            '1. Contact Hostinger support to allow outbound connections to 130.250.191.174:3009',
            '2. Use Cloudflare Workers proxy instead (free alternative)',
            '3. Ask Diamond API provider to whitelist your Hostinger server IP: ' . ($diagnostics['server_ip'] ?? 'Unknown'),
            '4. Try using a VPS instead of shared hosting'
        ]
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Proxy is working correctly!',
        'response_preview' => substr($response, 0, 200) . '...',
        'diagnostics' => $diagnostics
    ]);
}
?>
