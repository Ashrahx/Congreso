<?php
require_once 'config.php';

// Determinar el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Obtener reservaciones
        getReservations();
        break;
    case 'POST':
        // Crear nueva reservación
        createReservation();
        break;
    case 'PUT':
        // Actualizar reservación (para cancelar)
        updateReservation();
        break;
    default:
        // Método no permitido
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getReservations() {
    global $conn;
    
    // Obtener parámetros de filtro
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
    
    try {
        $sql = "SELECT * FROM reservations";
        
        // Aplicar filtro de estado
        if ($status !== 'all') {
            $sql .= " WHERE status = :status";
        }
        
        // Ordenar por fecha y hora
        $sql .= " ORDER BY reservation_date, reservation_time";
        
        $stmt = $conn->prepare($sql);
        
        if ($status !== 'all') {
            $stmt->bindParam(':status', $status);
        }
        
        $stmt->execute();
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($reservations);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function createReservation() {
    global $conn;
    
    // Obtener datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validar que todos los campos necesarios estén presentes
    $requiredFields = ['clientName', 'contactNumber', 'partySize', 'date', 'time'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field $field is required"]);
            return;
        }
    }
    
    try {
        // Insertar nueva reservación
        $sql = "INSERT INTO reservations (client_name, contact_number, party_size, reservation_date, reservation_time, status)
                VALUES (:client_name, :contact_number, :party_size, :reservation_date, :reservation_time, 'active')";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':client_name', $data['clientName']);
        $stmt->bindParam(':contact_number', $data['contactNumber']);
        $stmt->bindParam(':party_size', $data['partySize']);
        $stmt->bindParam(':reservation_date', $data['date']);
        $stmt->bindParam(':reservation_time', $data['time']);
        
        if ($stmt->execute()) {
            // Obtener el ID de la reservación creada
            $id = $conn->lastInsertId();
            
            // Devolver la reservación creada
            http_response_code(201);
            echo json_encode([
                'id' => $id,
                'clientName' => $data['clientName'],
                'contactNumber' => $data['contactNumber'],
                'partySize' => $data['partySize'],
                'date' => $data['date'],
                'time' => $data['time'],
                'status' => 'active',
                'createdAt' => date('Y-m-d H:i:s')
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create reservation']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function updateReservation() {
    global $conn;
    
    // Obtener datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Verificar que se proporcionó un ID
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Reservation ID is required']);
        return;
    }
    
    try {
        // Actualizar reservación (en este caso, cambiar el estado a 'cancelled')
        $sql = "UPDATE reservations SET status = :status WHERE id = :id";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $data['id']);
        $status = isset($data['status']) ? $data['status'] : 'cancelled';
        $stmt->bindParam(':status', $status);
        
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Reservation updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update reservation']);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>