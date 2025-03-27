<?php
require_once 'config.php';

// Solo procesar solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Obtener datos del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Validar que todos los campos necesarios estén presentes
$requiredFields = ['date', 'time', 'partySize'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Field $field is required"]);
        exit;
    }
}

try {
    // 1. Obtener configuración del restaurante
    $configStmt = $conn->prepare("SELECT * FROM restaurant_config LIMIT 1");
    $configStmt->execute();
    $config = $configStmt->fetch(PDO::FETCH_ASSOC);
    
    // Comprobar si el horario está dentro del horario de operación
    if ($data['time'] < $config['opening_time'] || $data['time'] > $config['closing_time']) {
        echo json_encode([
            'available' => false,
            'reason' => 'The requested time is outside of business hours'
        ]);
        exit;
    }
    
    // 2. Contar personas ya reservadas en ese horario (dentro de un rango de 30 minutos)
    $sql = "SELECT SUM(party_size) as total_people 
            FROM reservations 
            WHERE status = 'active' 
              AND reservation_date = :date 
              AND ABS(TIMESTAMPDIFF(MINUTE, 
                    CONCAT(reservation_date, ' ', reservation_time), 
                    CONCAT(:date, ' ', :time))) < 30";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':date', $data['date']);
    $stmt->bindParam(':time', $data['time']);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $currentPeople = $result['total_people'] ?: 0;
    $totalPeople = $currentPeople + $data['partySize'];
    
    // 3. Verificar disponibilidad
    $available = $totalPeople <= $config['max_capacity'];
    
    echo json_encode([
        'available' => $available,
        'currentCapacity' => $currentPeople,
        'requestedSize' => $data['partySize'],
        'maxCapacity' => $config['max_capacity']
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>