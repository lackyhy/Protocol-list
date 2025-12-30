**SIP** (Session Initiation Protocol) — протокол сигнализации для установления, изменения и завершения сеансов связи, таких как VoIP-звонки и видеоконференции. SIP работает на прикладном уровне и использует текстовый формат, похожий на HTTP.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP, TCP, TLS (порт 5060, 5061 для SIPS)                                |
| **Тип протокола**           | Текстовый протокол (похож на HTTP)                                       |
| **Назначение**              | Сигнализация для мультимедийных сеансов                                   |
| **Функции**                 | Установление, изменение, завершение сеансов                              |
| **Безопасность**            | SIPS (SIP over TLS)                                                      |

## **SIP компоненты**

### **Основные компоненты**

1. **User Agent (UA)** — клиентское приложение
   - **UAC** (User Agent Client) — инициатор запроса
   - **UAS** (User Agent Server) — отвечает на запросы

2. **Proxy Server** — маршрутизирует запросы
3. **Registrar Server** — регистрирует местоположение пользователей
4. **Redirect Server** — перенаправляет запросы
5. **Location Server** — хранит информацию о местоположении

## **SIP методы**

### **Основные методы**

| Метод      | Описание                                    |
| ---------- | ------------------------------------------- |
| **INVITE** | Приглашение к сеансу                        |
| **ACK**    | Подтверждение                               |
| **BYE**    | Завершение сеанса                           |
| **CANCEL** | Отмена запроса                              |
| **REGISTER** | Регистрация местоположения                |
| **OPTIONS** | Запрос возможностей                         |
| **INFO**   | Дополнительная информация                   |
| **UPDATE** | Обновление сеанса                           |

## **Пример SIP сессии**

### **Установление звонка**

```
Alice                          Proxy                          Bob
  |                               |                               |
  |-------- INVITE -------------→|
  |         (SDP offer)            |                               |
  |                               |-------- INVITE -------------→|
  |                               |         (SDP offer)            |
  |                               |                               |
  |                               |←------- 180 Ringing ----------|
  |                               |                               |
  |←------- 180 Ringing ----------|                               |
  |                               |                               |
  |                               |←------- 200 OK ---------------|
  |                               |         (SDP answer)           |
  |←------- 200 OK ---------------|                               |
  |         (SDP answer)           |                               |
  |-------- ACK -----------------→|                               |
  |                               |-------- ACK -----------------→|
  |                               |                               |
  |     Медиа сессия (RTP)         |                               |
  |                               |                               |
  |-------- BYE -----------------→|                               |
  |                               |-------- BYE -----------------→|
  |                               |                               |
  |                               |←------- 200 OK ---------------|
  |←------- 200 OK ---------------|                               |
```

## **SIP заголовки**

### **Основные заголовки**

| Заголовок        | Описание                                    |
| ---------------- | ------------------------------------------- |
| **From**         | Отправитель                                 |
| **To**           | Получатель                                  |
| **Call-ID**      | Уникальный идентификатор вызова             |
| **CSeq**         | Номер последовательности                    |
| **Via**          | Маршрут запроса                              |
| **Contact**      | Контактная информация                       |
| **Content-Type** | Тип содержимого (обычно SDP)                |
| **Content-Length** | Длина содержимого                         |

### **Пример INVITE**

```
INVITE sip:bob@example.com SIP/2.0
Via: SIP/2.0/UDP alice.example.com:5060
From: Alice <sip:alice@example.com>;tag=12345
To: Bob <sip:bob@example.com>
Call-ID: abc123@alice.example.com
CSeq: 1 INVITE
Contact: <sip:alice@alice.example.com>
Content-Type: application/sdp
Content-Length: 142

v=0
o=alice 2890844526 2890844526 IN IP4 alice.example.com
s=Session
c=IN IP4 192.168.1.10
t=0 0
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000
```

## **SIP ответы**

### **Коды ответов**

| Код | Категория | Описание                                    |
| --- | --------- | ------------------------------------------- |
| 1xx | Provisional | Временные ответы (100 Trying, 180 Ringing) |
| 2xx | Success   | Успешные ответы (200 OK)                    |
| 3xx | Redirection | Перенаправление (302 Moved Temporarily) |
| 4xx | Client Error | Ошибка клиента (404 Not Found, 486 Busy Here) |
| 5xx | Server Error | Ошибка сервера (500 Internal Server Error) |
| 6xx | Global Failure | Глобальная ошибка (600 Busy Everywhere) |

## **SDP (Session Description Protocol)**

SDP используется для описания медиа-параметров:

```
v=0
o=alice 2890844526 2890844526 IN IP4 alice.example.com
s=Session
c=IN IP4 192.168.1.10
t=0 0
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000
m=video 51372 RTP/AVP 31
a=rtpmap:31 H261/90000
```

## **Примеры использования**

### **Регистрация**

```
REGISTER sip:example.com SIP/2.0
Via: SIP/2.0/UDP client.example.com:5060
From: Alice <sip:alice@example.com>;tag=12345
To: Alice <sip:alice@example.com>
Call-ID: reg123@client.example.com
CSeq: 1 REGISTER
Contact: <sip:alice@192.168.1.10:5060>
Expires: 3600
Content-Length: 0

SIP/2.0 200 OK
Via: SIP/2.0/UDP client.example.com:5060
From: Alice <sip:alice@example.com>;tag=12345
To: Alice <sip:alice@example.com>;tag=67890
Call-ID: reg123@client.example.com
CSeq: 1 REGISTER
Contact: <sip:alice@192.168.1.10:5060>;expires=3600
Content-Length: 0
```

### **Python (pjsip)**

```python
import pjsua as pj

# Создание библиотеки
lib = pj.Lib()

# Инициализация
lib.init()

# Создание транспорта
transport = lib.create_transport(pj.TransportType.UDP)

# Запуск библиотеки
lib.start()

# Регистрация
acc = lib.create_account(pj.AccountConfig("sip:example.com", "username", "password"))

# Создание звонка
call = acc.make_call("sip:bob@example.com")
```

## **Безопасность SIP**

### **SIPS (SIP over TLS)**

Использование TLS для защиты:

```
INVITE sips:bob@example.com SIP/2.0
```

**Порты:**
- **5060** — обычный SIP (UDP/TCP)
- **5061** — SIPS (TLS)

### **Аутентификация**

```
401 Unauthorized
WWW-Authenticate: Digest realm="example.com", nonce="abc123"

INVITE sip:bob@example.com SIP/2.0
Authorization: Digest username="alice", realm="example.com",
  nonce="abc123", uri="sip:bob@example.com", response="..."
```

## **Применение SIP**

1. **VoIP** — голосовые звонки через IP
2. **Видеоконференции** — видеосвязь
3. **Мгновенные сообщения** — чат
4. **Presence** — статус пользователей
5. **Unified Communications** — объединённые коммуникации

## **Ограничения SIP**

1. **Сложность** — сложный протокол
2. **NAT** — проблемы с NAT (требует STUN/TURN)
3. **Безопасность** — требует правильной настройки
4. **Совместимость** — различия в реализациях

## **Будущее SIP**

- **SIP over WebRTC** — интеграция с WebRTC
- **Улучшенная безопасность** — новые методы
- **5G интеграция** — использование в 5G сетях
- **Стандартизация** — дальнейшее развитие
