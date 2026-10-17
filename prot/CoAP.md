**CoAP** (Constrained Application Protocol) — лёгкий протокол запрос-ответ для устройств с ограниченными ресурсами (маломощные микроконтроллеры, датчики, сети с низкой пропускной способностью). По модели CoAP похож на HTTP (методы GET/POST/PUT/DELETE, коды ответа, URI), но работает поверх UDP, занимает единицы байт на заголовок и подходит для Интернета вещей. Его можно напрямую отображать в HTTP через прокси.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP (основной), также TCP/TLS/WebSocket (RFC 8323)                       |
| **Порты**                   | 5683 (CoAP), 5684 (CoAPs/DTLS)                                           |
| **Стандарт**                | RFC 7252; расширения: 7641 (Observe), 7959 (Blockwise), 8613 (OSCORE)    |
| **Модель**                  | Запрос-ответ (REST), клиент-сервер                                       |
| **Размер заголовка**        | 4 байта                                                                  |
| **Безопасность**            | DTLS (CoAPs), OSCORE                                                     |
| **Схема URI**               | `coap://`, `coaps://`                                                    |

## **Почему не HTTP**

| Проблема HTTP для IoT                 | Решение CoAP                           |
| ------------------------------------- | -------------------------------------- |
| TCP — накладные расходы, память        | UDP, опционально подтверждения         |
| Текстовые заголовки — десятки байт     | Двоичный заголовок 4 байта             |
| Нет встроенного push                   | Observe (подписка на ресурс)           |
| Большие сообщения                      | Blockwise transfer (передача частями)  |
| Нет multicast                          | Multicast-запросы (обнаружение)        |

## **Структура сообщения**

| Поле           | Размер         | Описание                                           |
| -------------- | -------------- | -------------------------------------------------- |
| **Version**    | 2 бита         | Версия (1)                                         |
| **Type**       | 2 бита         | CON, NON, ACK, RST                                 |
| **Token Length** | 4 бита       | Длина токена (0–8)                                 |
| **Code**       | 1 байт         | Метод (0.01–0.04) или код ответа (2.xx–5.xx)       |
| **Message ID** | 2 байта        | Для сопоставления и защиты от дублей               |
| **Token**      | 0–8 байт       | Сопоставление запроса и ответа                     |
| **Options**    | переменный     | URI, формат, Observe и т.д. (TLV-подобные)         |
| **Payload**    | переменный     | Данные (после маркера `0xFF`)                      |

## **Типы сообщений**

| Тип     | Описание                                                       |
| ------- | -------------------------------------------------------------- |
| **CON** (Confirmable) | Требует подтверждения (ACK); повторяется при потере |
| **NON** (Non-confirmable) | Без подтверждения (для периодической телеметрии) |
| **ACK** | Подтверждение CON                                              |
| **RST** | Сброс (сообщение не удалось обработать)                        |

### **Надёжность на UDP**

```
Confirmable:                     Non-confirmable:
Клиент          Сервер           Клиент          Сервер
  |-- CON GET -->|                 |-- NON GET --->|
  |<-- ACK ------|                 |   (без ответа гарантии)
  (повтор при потере, экспоненциальный backoff)
```

## **Методы**

| Код   | Метод    | Аналог HTTP |
| ----- | -------- | ----------- |
| 0.01  | GET      | GET         |
| 0.02  | POST     | POST        |
| 0.03  | PUT      | PUT         |
| 0.04  | DELETE   | DELETE      |
| 0.05  | FETCH    | —           |
| 0.06  | PATCH    | PATCH       |

## **Коды ответов**

Формат `c.dd` (как HTTP-классы):

| Код    | Название                 | Аналог HTTP |
| ------ | ------------------------ | ----------- |
| 2.01   | Created                  | 201         |
| 2.02   | Deleted                  | —           |
| 2.03   | Valid                    | 304         |
| 2.04   | Changed                  | —           |
| 2.05   | Content                  | 200         |
| 4.00   | Bad Request              | 400         |
| 4.01   | Unauthorized             | 401         |
| 4.04   | Not Found                | 404         |
| 4.05   | Method Not Allowed       | 405         |
| 4.15   | Unsupported Content-Format | 415       |
| 5.00   | Internal Server Error    | 500         |
| 5.03   | Service Unavailable      | 503         |

## **Основные опции**

| Опция               | Описание                                      |
| ------------------- | --------------------------------------------- |
| **Uri-Host / Uri-Port / Uri-Path / Uri-Query** | Компоненты URI          |
| **Content-Format**  | Тип данных (text/plain, application/json, application/cbor) |
| **Accept**          | Желаемый формат ответа                        |
| **Observe**         | Подписка на изменения ресурса                 |
| **Block1 / Block2** | Передача по частям (большие данные)           |
| **ETag**            | Версия ресурса (кэширование)                  |
| **Max-Age**         | Срок кэширования                              |

## **Observe — подписка (RFC 7641)**

Вместо постоянного опроса клиент подписывается на ресурс и получает уведомления при изменении:

```
Клиент                          Сервер (датчик температуры)
  |-- GET /temp (Observe:0) ----->|
  |<-- 2.05 Content "21.5" (Observe:12) --|  текущее значение
  |<-- 2.05 Content "21.7" (Observe:13) --|  при изменении
  |<-- 2.05 Content "22.0" (Observe:14) --|
  |-- GET /temp (Observe:1) ----->|          отписка
```

## **Обнаружение ресурсов**

CoAP-устройства публикуют список ресурсов по стандартному пути `/.well-known/core` в формате CoRE Link (RFC 6690):

```
GET coap://device/.well-known/core
→ </temp>;rt="temperature";if="sensor",
  </light>;rt="light";if="actuator"
```

Можно отправить multicast-запрос на `224.0.1.187` (или `ff0x::fd`), чтобы найти все устройства в сети.

## **Blockwise Transfer (RFC 7959)**

Большие данные (прошивки, изображения) передаются блоками, чтобы уместиться в маленький буфер устройства и один UDP-пакет:

```
GET /firmware (Block2: 0/1/64)   → блок 0, размер 64, есть ещё
GET /firmware (Block2: 1/1/64)   → блок 1, есть ещё
...
GET /firmware (Block2: N/0/64)   → последний блок
```

## **Безопасность**

| Механизм      | Описание                                                       |
| ------------- | -------------------------------------------------------------- |
| **CoAPs (DTLS)** | TLS для датаграмм; режимы: PSK, Raw Public Key, сертификаты  |
| **OSCORE** (RFC 8613) | Шифрование на уровне объекта (защита сохраняется через прокси, не зависит от DTLS) |
| **EDHOC**     | Лёгкий обмен ключами для OSCORE                                |

DTLS защищает канал, но «ломается» на прокси HTTP↔CoAP; OSCORE шифрует само сообщение и проходит через прокси.

## **Примеры использования**

### **Клиент (libcoap)**

```bash
# Чтение ресурса
coap-client -m get coap://device.local/temp

# Запись
coap-client -m put -e "on" coap://device.local/light

# Обнаружение ресурсов
coap-client -m get coap://device.local/.well-known/core

# Observe
coap-client -m get -s 60 coap://device.local/temp

# CoAPs с PSK
coap-client -m get -u user -k secretkey coaps://device.local/temp
```

### **Python (aiocoap)**

```python
import asyncio
from aiocoap import Context, Message, GET

async def main():
    ctx = await Context.create_client_context()
    req = Message(code=GET, uri="coap://device.local/temp")
    resp = await ctx.request(req).response
    print(resp.code, resp.payload.decode())

asyncio.run(main())
```

### **Сервер (aiocoap)**

```python
import asyncio
from aiocoap import Context, resource, Message, CONTENT

class Temp(resource.Resource):
    async def render_get(self, request):
        return Message(code=CONTENT, payload=b"21.5")

async def main():
    root = resource.Site()
    root.add_resource(["temp"], Temp())
    await Context.create_server_context(root, bind=("::", 5683))
    await asyncio.get_running_loop().create_future()

asyncio.run(main())
```

### **Wireshark**

```
coap
coap.code
coap.mid
```

## **Применение**

1. **Умный дом** — датчики, выключатели (Thread использует CoAP)
2. **Промышленные датчики** — телеметрия в сетях с ограничениями
3. **LwM2M** (Lightweight M2M) — управление IoT-устройствами поверх CoAP
4. **Матерь (Matter)** — часть стека использует подходы CoAP/Thread
5. **Уличное освещение, счётчики** — массовые маломощные устройства

## **Сравнение CoAP и MQTT**

| Характеристика       | CoAP                     | MQTT                       | HTTP                      |
| -------------------- | ------------------------ | -------------------------- | ------------------------- |
| **Модель**           | Запрос-ответ (REST)      | Публикация-подписка        | Запрос-ответ              |
| **Транспорт**        | UDP                      | TCP                        | TCP                       |
| **Брокер**           | Не нужен (P2P)           | Нужен                      | Не нужен                  |
| **Push/подписка**    | Observe                  | Основная модель            | Нет (нужен polling/SSE)   |
| **Multicast**        | Да                       | Нет                        | Нет                       |
| **Накладные расходы** | Минимальные             | Низкие                     | Высокие                   |
| **Применение**       | Запрос состояния датчиков, REST для IoT | Телеметрия, события | Веб, мощные устройства |
