**RTSP** (Real Time Streaming Protocol) — протокол управления для потоковой передачи медиаданных. RTSP позволяет управлять потоком (пауза, воспроизведение, запись), но не передаёт сами медиаданные (для этого используется RTP).

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 554, 8554 для RTSP over TLS)                                 |
| **Тип протокола**           | Текстовый протокол (похож на HTTP)                                       |
| **Назначение**              | Управление потоковой передачей медиа                                     |
| **Функции**                 | PLAY, PAUSE, RECORD, SETUP, TEARDOWN                                    |
| **Медиа передача**          | RTP (не RTSP)                                                            |

## **RTSP методы**

### **Основные методы**

| Метод      | Описание                                    |
| ---------- | ------------------------------------------- |
| **DESCRIBE** | Получение описания медиа                   |
| **SETUP**  | Настройка сессии                            |
| **PLAY**   | Начало воспроизведения                      |
| **PAUSE**  | Пауза                                       |
| **RECORD** | Запись потока                               |
| **TEARDOWN** | Завершение сессии                          |
| **OPTIONS** | Запрос возможностей                         |
| **ANNOUNCE** | Объявление описания                        |
| **GET_PARAMETER** | Получение параметров                      |
| **SET_PARAMETER** | Установка параметров                      |

## **Пример RTSP сессии**

```
Клиент                          Сервер
  |                               |
  |-------- OPTIONS -------------→|
  |                               |
  |←------- 200 OK ---------------|
  |                               |
  |-------- DESCRIBE -------------→|
  |         rtsp://server/video    |
  |                               |
  |←------- 200 OK ---------------|
  |         (SDP описание)         |
  |                               |
  |-------- SETUP ----------------→|
  |         Transport: RTP/AVP;    |
  |         unicast;client_port=   |
  |         5004-5005              |
  |                               |
  |←------- 200 OK ---------------|
  |         Transport: RTP/AVP;    |
  |         unicast;server_port=  |
  |         5006-5007              |
  |                               |
  |-------- PLAY -----------------→|
  |         Range: npt=0.000-      |
  |                               |
  |←------- 200 OK ---------------|
  |                               |
  |     RTP поток данных          |
  |                               |
  |-------- PAUSE ----------------→|
  |                               |
  |←------- 200 OK ---------------|
  |                               |
  |-------- TEARDOWN -------------→|
  |                               |
  |←------- 200 OK ---------------|
```

## **RTSP ответы**

### **Коды ответов**

| Код | Описание                                    |
| --- | ------------------------------------------- |
| 200 | OK                                          |
| 400 | Bad Request                                 |
| 401 | Unauthorized                                |
| 404 | Not Found                                   |
| 455 | Method Not Valid in This State              |
| 500 | Internal Server Error                       |

## **Примеры использования**

### **Командная строка (ffmpeg)**

```bash
# Воспроизведение RTSP потока
ffplay rtsp://server.example.com:554/stream

# Запись RTSP потока
ffmpeg -i rtsp://server.example.com:554/stream -c copy output.mp4

# Трансляция RTSP потока
ffmpeg -i rtsp://server.example.com:554/stream \
  -c:v libx264 -c:a aac -f flv rtmp://server/live/stream
```

### **Python (opencv)**

```python
import cv2

# Подключение к RTSP потоку
cap = cv2.VideoCapture('rtsp://server.example.com:554/stream')

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow('RTSP Stream', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

### **VLC**

```bash
# Воспроизведение через VLC
vlc rtsp://server.example.com:554/stream

# Или через GUI: Media > Open Network Stream
```

## **SDP в RTSP**

RTSP использует SDP для описания медиа:

```
DESCRIBE rtsp://server.example.com/video RTSP/1.0
CSeq: 1
User-Agent: VLC media player

RTSP/1.0 200 OK
CSeq: 1
Content-Type: application/sdp
Content-Length: 456

v=0
o=- 0 0 IN IP4 192.168.1.100
s=Video Stream
c=IN IP4 192.168.1.100
t=0 0
m=video 0 RTP/AVP 96
a=rtpmap:96 H264/90000
a=fmtp:96 packetization-mode=1
m=audio 0 RTP/AVP 0
a=rtpmap:0 PCMU/8000
```

## **Настройка RTSP сервера**

### **VLC как RTSP сервер**

```bash
# Запуск VLC RTSP сервера
vlc -I dummy --rtsp-host=0.0.0.0 --rtsp-port=554 \
  file:///path/to/video.mp4
```

### **MediaMTX (ранее rtsp-simple-server)**

```yaml
# mediamtx.yml
protocols: [tcp, udp]
encryption: "strict"
rtspAddress: :554
```

## **Безопасность RTSP**

### **Аутентификация**

```
DESCRIBE rtsp://server.example.com/video RTSP/1.0
CSeq: 1

RTSP/1.0 401 Unauthorized
CSeq: 1
WWW-Authenticate: Digest realm="RTSP", nonce="abc123"

DESCRIBE rtsp://server.example.com/video RTSP/1.0
CSeq: 2
Authorization: Digest username="user", realm="RTSP",
  nonce="abc123", uri="rtsp://server.example.com/video",
  response="..."

RTSP/1.0 200 OK
CSeq: 2
```

### **RTSP over TLS**

Использование TLS для защиты:
- Порт 8554 (RTSP over TLS)
- Защита от перехвата

## **Применение RTSP**

1. **IP камеры** — видеонаблюдение
2. **Потоковое вещание** — live streaming
3. **Видеосерверы** — медиа серверы
4. **Системы видеонаблюдения** — CCTV
5. **Онлайн трансляции** — live events

## **Ограничения RTSP**

1. **Сложность** — сложный протокол
2. **NAT** — проблемы с NAT
3. **Firewall** — может блокироваться
4. **Совместимость** — различия в реализациях

## **Будущее RTSP**

- **Улучшенная безопасность** — новые методы
- **WebRTC интеграция** — использование в браузерах
- **Оптимизация** — улучшение производительности
- **Стандартизация** — дальнейшее развитие
