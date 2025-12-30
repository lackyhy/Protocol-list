**gRPC** (gRPC Remote Procedure Calls) — современный фреймворк для вызова удалённых процедур (RPC), использующий HTTP/2 в качестве транспорта и Protocol Buffers для описания интерфейсов и сериализации данных. gRPC разработан Google и широко используется в микросервисных архитектурах.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | HTTP/2                                                                   |
| **Сериализация**            | Protocol Buffers (protobuf)                                              |
| **Тип протокола**           | RPC (Remote Procedure Call)                                            |
| **Мультиплексирование**     | HTTP/2 streams                                                            |
| **Языки**                   | Множество (Go, Python, Java, C++, Node.js и др.)                        |

## **Архитектура gRPC**

### **Компоненты**

1. **Service Definition** — определение сервиса в .proto файле
2. **Server** — реализация сервиса
3. **Client** — клиент, вызывающий методы
4. **Protocol Buffers** — сериализация данных

### **Преимущества**

- **Высокая производительность** — бинарная сериализация
- **Мультиплексирование** — несколько потоков в одном соединении
- **Строгая типизация** — определение через .proto
- **Кроссплатформенность** — поддержка множества языков
- **Streaming** — поддержка потоков данных

## **Типы вызовов**

### **1. Unary RPC**

Простой запрос-ответ:

```protobuf
rpc GetUser(UserRequest) returns (UserResponse);
```

### **2. Server Streaming**

Сервер отправляет поток данных:

```protobuf
rpc ListUsers(UserRequest) returns (stream UserResponse);
```

### **3. Client Streaming**

Клиент отправляет поток данных:

```protobuf
rpc CreateUsers(stream UserRequest) returns (UserResponse);
```

### **4. Bidirectional Streaming**

Двунаправленный поток:

```protobuf
rpc ChatUsers(stream MessageRequest) returns (stream MessageResponse);
```

## **Protocol Buffers**

### **Определение сервиса (.proto)**

```protobuf
syntax = "proto3";

package user;

service UserService {
    rpc GetUser(GetUserRequest) returns (UserResponse);
    rpc ListUsers(ListUsersRequest) returns (stream UserResponse);
}

message GetUserRequest {
    int32 user_id = 1;
}

message UserResponse {
    int32 id = 1;
    string name = 2;
    string email = 3;
}

message ListUsersRequest {
    int32 limit = 1;
    int32 offset = 2;
}
```

### **Компиляция**

```bash
# Установка protoc
# Генерация кода
protoc --python_out=. user.proto
protoc --go_out=. user.proto
```

## **Примеры использования**

### **Python (сервер)**

```python
import grpc
from concurrent import futures
import user_pb2
import user_pb2_grpc

class UserService(user_pb2_grpc.UserServiceServicer):
    def GetUser(self, request, context):
        return user_pb2.UserResponse(
            id=request.user_id,
            name="John Doe",
            email="john@example.com"
        )

    def ListUsers(self, request, context):
        for i in range(request.limit):
            yield user_pb2.UserResponse(
                id=i,
                name=f"User {i}",
                email=f"user{i}@example.com"
            )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    user_pb2_grpc.add_UserServiceServicer_to_server(
        UserService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

### **Python (клиент)**

```python
import grpc
import user_pb2
import user_pb2_grpc

def run():
    channel = grpc.insecure_channel('localhost:50051')
    stub = user_pb2_grpc.UserServiceStub(channel)

    # Unary call
    response = stub.GetUser(user_pb2.GetUserRequest(user_id=1))
    print(f"User: {response.name}, Email: {response.email}")

    # Server streaming
    responses = stub.ListUsers(user_pb2.ListUsersRequest(limit=10))
    for response in responses:
        print(f"User: {response.name}")

if __name__ == '__main__':
    run()
```

### **Go (сервер)**

```go
package main

import (
    "context"
    "log"
    "net"
    "google.golang.org/grpc"
    pb "path/to/user"
)

type server struct {
    pb.UnimplementedUserServiceServer
}

func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.UserResponse, error) {
    return &pb.UserResponse{
        Id:    req.UserId,
        Name:  "John Doe",
        Email: "john@example.com",
    }, nil
}

func main() {
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }
    s := grpc.NewServer()
    pb.RegisterUserServiceServer(s, &server{})
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
```

### **Node.js**

```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const server = new grpc.Server();
server.addService(userProto.UserService.service, {
    GetUser: (call, callback) => {
        callback(null, {
            id: call.request.user_id,
            name: 'John Doe',
            email: 'john@example.com'
        });
    }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
});
```

## **Безопасность gRPC**

### **TLS/SSL**

```python
# Сервер
server_credentials = grpc.ssl_server_credentials([
    (private_key, certificate_chain)
])
server.add_secure_port('[::]:50051', server_credentials)

# Клиент
channel_credentials = grpc.ssl_channel_credentials()
channel = grpc.secure_channel('server.example.com:50051', channel_credentials)
```

### **Аутентификация**

```python
# Метadata для аутентификации
metadata = [('authorization', 'Bearer token123')]
context = grpc.aio.Metadata(*metadata)
response = await stub.GetUser(request, metadata=metadata)
```

## **Производительность**

### **Преимущества**

- **Бинарная сериализация** — быстрее JSON
- **HTTP/2** — мультиплексирование, header compression
- **Streaming** — эффективная передача больших данных
- **Кодогенерация** — оптимизированный код

### **Сравнение с REST**

| Характеристика | REST (JSON) | gRPC |
| -------------- | ---------- | ---- |
| **Формат**     | Текстовый  | Бинарный |
| **Производительность** | Средняя | Высокая |
| **Размер**     | Большой    | Малый |
| **Типизация**  | Слабая     | Строгая |

## **Применение gRPC**

1. **Микросервисы** — коммуникация между сервисами
2. **Мобильные приложения** — API для мобильных клиентов
3. **Облачные сервисы** — Google Cloud, AWS
4. **Real-time системы** — streaming данных
5. **Внутренние API** — высокопроизводительные API

## **Ограничения gRPC**

1. **Браузеры** — не поддерживается напрямую (нужен gRPC-Web)
2. **Человекочитаемость** — бинарный формат
3. **Кеширование** — сложнее, чем HTTP
4. **Firewall** — может блокироваться

## **gRPC-Web**

Адаптация gRPC для браузеров:

```javascript
// Клиент в браузере
const {UserServiceClient} = require('./user_grpc_web_pb');
const client = new UserServiceClient('https://api.example.com');
```

## **Будущее gRPC**

- **Расширенная поддержка** — больше языков и платформ
- **Улучшенная производительность** — оптимизация
- **Интеграция** — с современными фреймворками
- **Стандартизация** — дальнейшее развитие
