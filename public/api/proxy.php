<?php
/**
 * Diamond API Proxy for Hostinger
 * Handles CORS and forwards requests from HTTPS to HTTP API
 */

// Enable error reporting for debugging (disable in production)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// CORS Headers - Allow all origins
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
define('DIAMOND_API_BASE', 'http://130.250.191.174:3009');
define('API_KEY', 'mahi4449839dbabkadbakwq1qqd');

// Get the API path from query parameter
$path = isset($_GET['path']) ? trim($_GET['path'], '/') : '';

if (empty($path)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Bad Request',
        'message' => 'Missing path parameter. Use ?path=endpoint'
    ]);
    exit();
}

// Build target URL
$targetUrl = DIAMOND_API_BASE . '/' . $path;

// Get all query parameters except 'path'
$queryParams = $_GET;
unset($queryParams['path']);

// Add API key if not already present
if (!isset($queryParams['key'])) {
    $queryParams['key'] = API_KEY;
}

// Build query string
if (!empty($queryParams)) {
    $targetUrl .= '?' . http_build_query($queryParams);
}

// Initialize cURL
$ch = curl_init($targetUrl);

// Set basic cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For HTTP API
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
    case 'PUT':
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        $postData = file_get_contents('php://input');
        
        if (!empty($postData)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData)
            ]);
        }
        break;
        
    case 'DELETE':
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        break;
        
    case 'GET':
    default:
        // Default GET request
        break;
}

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Proxy Error',
        'message' => 'Failed to connect to Diamond API',
        'details' => $curlError,
        'target_url' => $targetUrl
    ]);
    exit();
}

// Return the response with same status code
http_response_code($httpCode);
echo $response;
?>
