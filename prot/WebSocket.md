**WebSocket** — протокол, обеспечивающий постоянное двунаправленное соединение (full-duplex) между клиентом и сервером поверх одного TCP-соединения. WebSocket используется для чатов, онлайн-игр, real-time приложений и других случаев, где нужна низкая задержка и постоянное соединение.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP                                                                       |
| **Тип протокола**           | С установлением соединения                                              |
| **Дуплекс**                 | Полнодуплексный (full-duplex)                                           |
| **Инициация**               | HTTP handshake, затем upgrade до WebSocket                               |
| **Порты**                   | 80 (HTTP), 443 (HTTPS)                                                   |
| **Формат**                  | Бинарный или текстовый                                                   |

## **Процесс установления соединения**

### **WebSocket Handshake**

```
Клиент                          Сервер
  |                               |
  |-------- HTTP GET ------------→|
  |         Upgrade: websocket    |
  |         Connection: Upgrade   |
  |         Sec-WebSocket-Key: ...|
  |                               |
  |<-- HTTP 101 Switching --------|
  |         Upgrade: websocket    |
  |         Connection: Upgrade   |
  |         Sec-WebSocket-Accept: ...|
  |                               |
  |     WebSocket соединение      |
  |     установлено               |
```

**HTTP Request:**
```
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
```

**HTTP Response (101):**
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

## **Структура WebSocket фрейма**

### **Базовый формат**

| Поле                    | Размер (биты) | Описание                                    |
| ----------------------- | -------------- | ------------------------------------------- |
| **FIN**                 | 1              | Конец сообщения (1) или продолжение (0)    |
| **RSV1-3**              | 3              | Зарезервировано                             |
| **Opcode**               | 4              | Тип фрейма                                  |
| **MASK**                 | 1              | Маскирование (1 для клиента, 0 для сервера) |
| **Payload Length**       | 7/7+16/7+64    | Длина данных                                |
| **Masking Key**          | 32 (если MASK=1) | Ключ маскирования                        |
| **Payload Data**        | Переменная     | Данные                                      |

### **Opcode значения**

| Код | Название        | Описание                                    |
| --- | --------------- | ------------------------------------------- |
| 0   | Continuation    | Продолжение предыдущего фрейма              |
| 1   | Text            | Текстовые данные                            |
| 2   | Binary          | Бинарные данные                             |
| 8   | Close           | Закрытие соединения                        |
| 9   | Ping            | Ping (keep-alive)                           |
| 10  | Pong            | Pong (ответ на ping)                        |

## **Примеры использования**

### **JavaScript (браузер)**

```javascript
// Создание WebSocket соединения
const ws = new WebSocket('ws://server.example.com/chat');

// Обработка открытия
ws.onopen = () => {
    console.log('WebSocket connected');
    ws.send('Hello Server!');
};

// Обработка сообщений
ws.onmessage = (event) => {
    console.log('Received:', event.data);
};

// Обработка ошибок
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// Обработка закрытия
ws.onclose = () => {
    console.log('WebSocket closed');
};

// Отправка сообщения
ws.send('Hello from client!');

// Закрытие соединения
ws.close();
```

### **Node.js (сервер)**

```javascript
const WebSocket = require('ws');

// Создание сервера
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Отправка сообщения
    ws.send('Welcome to WebSocket server!');

    // Получение сообщений
    ws.on('message', (message) => {
        console.log('Received:', message.toString());

        // Отправка всем клиентам
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    // Закрытие соединения
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
```

### **Python (клиент)**

```python
import websocket

def on_message(ws, message):
    print(f"Received: {message}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws):
    print("Connection closed")

def on_open(ws):
    ws.send("Hello Server!")

ws = websocket.WebSocketApp("ws://server.example.com/chat",
                            on_open=on_open,
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.run_forever()
```

### **Python (сервер)**

```python
from websocket_server import WebsocketServer

def new_client(client, server):
    print(f"New client connected: {client['id']}")
    server.send_message_to_all("New client connected")

def message_received(client, server, message):
    print(f"Message from {client['id']}: {message}")
    server.send_message_to_all(message)

server = WebsocketServer(8080, host='0.0.0.0')
server.set_fn_new_client(new_client)
server.set_fn_message_received(message_received)
server.run_forever()
```

## **Безопасность WebSocket**

### **WSS (WebSocket Secure)**

Использование WSS вместо WS для шифрования:

```javascript
// Безопасное соединение
const wss = new WebSocket('wss://server.example.com/chat');
```

**Принцип:**
- TLS поверх TCP
- Порт 443 (HTTPS)
- Защита от перехвата

### **Origin проверка**

Проверка источника запроса:

```javascript
const wss = new WebSocket.Server({
    port: 8080,
    verifyClient: (info) => {
        return info.origin === 'https://example.com';
    }
});
```

### **Аутентификация**

```javascript
// Через токен в URL
const ws = new WebSocket('wss://server.example.com/chat?token=abc123');

// Или через подзапрос после подключения
ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'auth', token: 'abc123' }));
};
```

## **Применение WebSocket**

1. **Чат-приложения** — real-time обмен сообщениями
2. **Онлайн-игры** — real-time обновления
3. **Торговые платформы** — live котировки
4. **Коллаборативные инструменты** — совместное редактирование
5. **Уведомления** — push уведомления
6. **Мониторинг** — live дашборды

## **Сравнение с HTTP**

| Характеристика | HTTP | WebSocket |
| -------------- | ---- | --------- |
| **Соединение** | Временное | Постоянное |
| **Дуплекс**    | Полудуплекс | Полнодуплекс |
| **Заголовки**  | Каждый запрос | Только при handshake |
| **Задержка**   | Высокая | Низкая |
| **Применение** | Request-Response | Real-time |

## **Heartbeat (Ping/Pong)**

Механизм для проверки соединения:

```javascript
// Пинг каждые 30 секунд
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
    }
}, 30000);

ws.on('pong', () => {
    console.log('Received pong');
});
```

## **Ограничения WebSocket**

1. **Прокси** — некоторые прокси не поддерживают
2. **Firewall** — может блокироваться
3. **Масштабирование** — сложнее, чем stateless HTTP
4. **Старые браузеры** — не все поддерживают

## **Альтернативы WebSocket**

1. **Server-Sent Events (SSE)** — односторонняя связь
2. **Long Polling** — эмуляция через HTTP
3. **WebRTC** — для peer-to-peer связи

## **Будущее WebSocket**

- **Расширенная поддержка** — больше браузеров и серверов
- **Улучшенная производительность** — оптимизация
- **Стандартизация** — RFC 6455 и расширения
- **Интеграция** — с современными фреймворками

## **Диагностика WebSocket**

### **Проблемы и решения**

| Проблема                   | Причина                                  | Решение                                   |
| -------------------------- | ---------------------------------------- | ----------------------------------------- |
| **Connection failed**      | Firewall блокирует                       | Проверить firewall, использовать WSS      |
| **Unexpected close**        | Таймаут, сетевые проблемы                | Увеличить таймауты, добавить reconnect    |
| **CORS errors**            | Origin не разрешен                       | Настроить CORS на сервере                 |

### **Мониторинг**

```bash
# Wireshark фильтры
websocket
http.request.uri contains "/chat"
```

## **Производительность**

### **Оптимизация**

1. **Сжатие** — Per-message compression
2. **Бинарные данные** — вместо текстовых
3. **Батчинг** — группировка сообщений
4. **Connection pooling** — переиспользование соединений

## **Рекомендации**

1. **Использовать WSS** — для безопасности
2. **Обработка переподключений** — автоматическое восстановление
3. **Heartbeat** — проверка соединения
4. **Обработка ошибок** — graceful degradation
5. **Масштабирование** — через load balancer с поддержкой WebSocket
