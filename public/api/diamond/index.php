<?php
/**
 * Diamond API Proxy for Hostinger
 * Routes /api/diamond/* requests to actual API server
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the path after /api/diamond/
$request_uri = $_SERVER['REQUEST_URI'];
$path = preg_replace('#^/api/diamond/?#', '', parse_url($request_uri, PHP_URL_PATH));
$query_string = $_SERVER['QUERY_STRING'] ?? '';

// Target API server
$api_base = 'http://130.250.191.174:3009';
$target_url = $api_base . '/' . $path;
if ($query_string) {
    $target_url .= '?' . $query_string;
}

// Initialize cURL
$ch = curl_init($target_url);

// Set options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

// Forward request body for POST/PUT
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Forward headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (!in_array(strtolower($name), ['host', 'connection'])) {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Send response
http_response_code($http_code);
echo $response;
?>
