<?php
/**
 * Kiểm tra kết nối từ container app → container db
 * Truy cập: http://localhost:8000/db-test.php  (sau khi copy file này vào public/)
 *
 * Hoặc chạy từ terminal:
 *   docker exec vmovies_app php /var/www/html/.docker/db-test.php
 */

$host     = $_ENV['DB_HOST']     ?? getenv('DB_HOST')     ?: 'db';
$port     = $_ENV['DB_PORT']     ?? getenv('DB_PORT')     ?: '3306';
$database = $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'vmovies';
$username = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'vmovies';
$password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: 'secret';

$dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $version = $pdo->query('SELECT VERSION() AS version')->fetchColumn();

    echo "[OK] Kết nối MySQL thành công!\n";
    echo "     Host    : {$host}:{$port}\n";
    echo "     Database: {$database}\n";
    echo "     Version : {$version}\n";

} catch (PDOException $e) {
    echo "[FAIL] Kết nối thất bại: " . $e->getMessage() . "\n";
    exit(1);
}
