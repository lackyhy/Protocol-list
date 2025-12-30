**HTTP** (HyperText Transfer Protocol) — протокол прикладного уровня для передачи гипертекстовых документов и других ресурсов в сети. HTTP является основой Всемирной паутины (WWW) и используется для загрузки веб-страниц, работы с API, передачи данных между клиентом и сервером.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (обычно порт 80)                                                     |
| **Тип протокола**           | Request-Response (запрос-ответ)                                         |
| **Состояние**               | Stateless (без состояния)                                                |
| **Версии**                  | HTTP/1.0, HTTP/1.1, HTTP/2, HTTP/3                                      |
| **Методы**                  | GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH и др.                       |

## **Структура HTTP сообщения**

### **HTTP Request (Запрос)**

```
Method SP Request-URI SP HTTP-Version CRLF
Headers CRLF
CRLF
Body (опционально)
```

**Пример:**
```
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: text/html
Connection: close

```

### **HTTP Response (Ответ)**

```
HTTP-Version SP Status-Code SP Reason-Phrase CRLF
Headers CRLF
CRLF
Body (опционально)
```

**Пример:**
```
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1234
Connection: close

<html>...</html>
```

## **HTTP методы (Methods)**

| Метод      | Описание                                    | Идемпотентность | Безопасность |
| ---------- | ------------------------------------------- | --------------- | ------------ |
| **GET**    | Получение ресурса                           | Да              | Да           |
| **POST**   | Создание ресурса или отправка данных       | Нет             | Нет          |
| **PUT**    | Полное обновление ресурса                   | Да              | Нет          |
| **DELETE** | Удаление ресурса                            | Да              | Нет          |
| **HEAD**   | Получение заголовков без тела               | Да              | Да           |
| **OPTIONS** | Получение поддерживаемых методов           | Да              | Да           |
| **PATCH**  | Частичное обновление ресурса                | Нет             | Нет          |
| **TRACE**  | Эхо-запрос для диагностики                  | Да              | Да           |
| **CONNECT** | Установление туннеля (для прокси)          | Нет             | Нет          |

## **HTTP статус коды**

### **1xx: Informational (Информационные)**

| Код | Статус          | Описание                                    |
| --- | --------------- | ------------------------------------------- |
| 100 | Continue        | Запрос принят, клиент должен продолжить     |
| 101 | Switching Protocols | Сервер переключается на другой протокол   |
| 102 | Processing      | Запрос в обработке                          |
| 103 | Early Hints     | Ранние подсказки, предзагрузка ресурсов     |

### **2xx: Success (Успех)**

| Код | Статус          | Описание                                    |
| --- | --------------- | ------------------------------------------- |
| 200 | OK              | Запрос успешно обработан                    |
| 201 | Created         | Ресурс успешно создан                       |
| 202 | Accepted        | Запрос принят, обработка не завершена      |
| 204 | No Content      | Запрос выполнен, контент отсутствует        |
| 206 | Partial Content | Частичное содержимое                        |

### **3xx: Redirection (Перенаправление)**

| Код | Статус              | Описание                                    |
| --- | ------------------- | ------------------------------------------- |
| 301 | Moved Permanently   | Ресурс перемещен навсегда                   |
| 302 | Found               | Временное перенаправление                   |
| 303 | See Other           | Ответ находится по другому адресу           |
| 304 | Not Modified        | Ресурс не изменился                         |
| 307 | Temporary Redirect  | Временное перенаправление с сохранением метода |
| 308 | Permanent Redirect  | Постоянное перенаправление с сохранением метода |

### **4xx: Client Error (Ошибка клиента)**

| Код | Статус              | Описание                                    |
| --- | ------------------- | ------------------------------------------- |
| 400 | Bad Request         | Некорректный запрос                         |
| 401 | Unauthorized        | Требуется аутентификация                    |
| 403 | Forbidden           | Доступ запрещен                             |
| 404 | Not Found           | Ресурс не найден                            |
| 405 | Method Not Allowed  | Метод не поддерживается                     |
| 408 | Request Timeout     | Таймаут запроса                             |
| 409 | Conflict            | Конфликт с текущим состоянием               |
| 413 | Payload Too Large   | Тело запроса слишком велико                  |
| 414 | URI Too Long         | Длина URL превышает лимит                    |
| 429 | Too Many Requests   | Слишком много запросов                      |

### **5xx: Server Error (Ошибка сервера)**

| Код | Статус                  | Описание                                    |
| --- | ----------------------- | ------------------------------------------- |
| 500 | Internal Server Error   | Внутренняя ошибка сервера                   |
| 501 | Not Implemented         | Функциональность не реализована             |
| 502 | Bad Gateway             | Ошибка шлюза                                |
| 503 | Service Unavailable     | Сервис недоступен                           |
| 504 | Gateway Timeout         | Таймаут шлюза                               |
| 505 | HTTP Version Not Supported | Версия HTTP не поддерживается          |

## **HTTP заголовки (Headers)**

### **Общие заголовки**

| Заголовок          | Описание                                    |
| ------------------ | ------------------------------------------- |
| **Cache-Control**  | Управление кешированием                     |
| **Connection**     | Управление соединением                      |
| **Date**           | Дата и время сообщения                      |
| **Pragma**         | Устаревший заголовок кеширования            |
| **Trailer**        | Заголовки в конце сообщения                 |
| **Transfer-Encoding** | Кодирование передачи                    |
| **Upgrade**        | Переключение на другой протокол         |
| **Via**            | Промежуточные прокси                        |

### **Заголовки запроса**

| Заголовок          | Описание                                    |
| ------------------ | ------------------------------------------- |
| **Accept**         | Типы контента, которые принимает клиент     |
| **Accept-Charset** | Кодировки символов                          |
| **Accept-Encoding** | Методы сжатия (gzip, deflate)             |
| **Accept-Language** | Предпочитаемые языки                       |
| **Authorization**  | Учетные данные для аутентификации           |
| **Cookie**         | HTTP cookies                                |
| **Host**           | Имя хоста и порт                            |
| **If-Match**       | Условный запрос (ETag)                      |
| **If-Modified-Since** | Условный запрос (дата)                  |
| **If-None-Match**  | Условный запрос (ETag)                      |
| **If-Range**       | Условный запрос (диапазон)                  |
| **If-Unmodified-Since** | Условный запрос (дата)              |
| **Max-Forwards**   | Максимум промежуточных серверов             |
| **Proxy-Authorization** | Аутентификация для прокси              |
| **Range**          | Запрос части ресурса                        |
| **Referer**        | URL источника запроса                       |
| **User-Agent**     | Информация о клиенте                        |

### **Заголовки ответа**

| Заголовок          | Описание                                    |
| ------------------ | ------------------------------------------- |
| **Accept-Ranges**  | Поддержка диапазонов                        |
| **Age**            | Возраст ответа в кеше                       |
| **ETag**           | Тег сущности (для кеширования)              |
| **Location**       | URL для перенаправления                     |
| **Proxy-Authenticate** | Требуется аутентификация прокси         |
| **Retry-After**    | Время повтора запроса                       |
| **Server**         | Информация о сервере                        |
| **Set-Cookie**     | Установка cookie                            |
| **Vary**           | Вариативные заголовки                       |
| **WWW-Authenticate** | Требуется аутентификация                |

### **Заголовки сущности**

| Заголовок          | Описание                                    |
| ------------------ | ------------------------------------------- |
| **Allow**          | Разрешенные методы                          |
| **Content-Encoding** | Кодирование контента (gzip, deflate)     |
| **Content-Language** | Язык контента                             |
| **Content-Length** | Длина контента в байтах                     |
| **Content-Location** | Альтернативное расположение               |
| **Content-MD5**    | MD5 хеш контента                            |
| **Content-Range**  | Диапазон контента                           |
| **Content-Type**   | MIME-тип контента                           |
| **Expires**        | Время истечения                             |
| **Last-Modified**  | Время последнего изменения                  |

## **Примеры HTTP запросов и ответов**

### **GET запрос**

```
GET /api/users/123 HTTP/1.1
Host: api.example.com
Accept: application/json
User-Agent: MyApp/1.0

```

**Ответ:**
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 156
Date: Mon, 01 Jan 2024 12:00:00 GMT

{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### **POST запрос**

```
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 45
Authorization: Bearer token123

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Ответ:**
```
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/users/124
Content-Length: 158

{
  "id": 124,
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### **PUT запрос**

```
PUT /api/users/123 HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 52
Authorization: Bearer token123

{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

### **DELETE запрос**

```
DELETE /api/users/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer token123

```

**Ответ:**
```
HTTP/1.1 204 No Content
Date: Mon, 01 Jan 2024 12:00:00 GMT
```

## **HTTP версии**

### **HTTP/1.0**

- Одно соединение на запрос
- Нет Host заголовка (обязателен в 1.1)
- Базовые возможности

### **HTTP/1.1**

- **Persistent connections** — переиспользование соединений
- **Pipelining** — отправка нескольких запросов без ожидания ответов
- **Chunked transfer encoding** — потоковая передача
- **Host заголовок** обязателен
- **Кеширование** улучшено

### **HTTP/2**

- **Multiplexing** — несколько запросов в одном соединении
- **Server Push** — сервер может отправлять ресурсы заранее
- **Header compression** — сжатие заголовков (HPACK)
- **Бинарный протокол** — вместо текстового
- Работает поверх TLS (HTTPS)

### **HTTP/3**

- Основан на **QUIC** (UDP вместо TCP)
- Встроенное шифрование
- Быстрое установление соединения
- Улучшенная работа с мобильными сетями

## **Кеширование**

### **Механизмы кеширования**

1. **Expires** — абсолютное время истечения
   ```
   Expires: Wed, 21 Oct 2024 07:28:00 GMT
   ```

2. **Cache-Control** — более гибкое управление
   ```
   Cache-Control: max-age=3600, public
   ```

3. **ETag** — тег сущности для валидации
   ```
   ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
   ```

4. **Last-Modified** — время последнего изменения
   ```
   Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
   ```

### **Директивы Cache-Control**

| Директива      | Описание                                    |
| -------------- | ------------------------------------------- |
| **max-age**    | Максимальный возраст в секундах             |
| **no-cache**   | Требуется валидация перед использованием    |
| **no-store**  | Не кешировать                               |
| **private**    | Только для браузера (не для прокси)         |
| **public**     | Можно кешировать везде                      |
| **must-revalidate** | Требуется валидация при истечении      |
| **s-maxage**   | Максимальный возраст для shared cache       |

## **Аутентификация**

### **Basic Authentication**

```
Authorization: Basic base64(username:password)
```

**Пример:**
```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### **Bearer Token (OAuth 2.0)**

```
Authorization: Bearer token123456789
```

### **Digest Authentication**

Более безопасная альтернатива Basic:
- Использует хеширование
- Защита от перехвата паролей

## **Cookies**

### **Установка cookie**

```
Set-Cookie: sessionid=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
```

### **Отправка cookie**

```
Cookie: sessionid=abc123; theme=dark
```

### **Атрибуты cookie**

| Атрибут      | Описание                                    |
| ------------ | ------------------------------------------- |
| **Domain**   | Домен, для которого cookie действителен     |
| **Path**     | Путь, для которого cookie действителен      |
| **Expires**  | Время истечения                             |
| **Max-Age**  | Максимальный возраст в секундах             |
| **HttpOnly** | Недоступен через JavaScript                 |
| **Secure**   | Только через HTTPS                           |
| **SameSite** | Защита от CSRF (Strict, Lax, None)         |

## **Примеры использования**

### **cURL**

```bash
# GET запрос
curl http://example.com/api/users

# POST запрос
curl -X POST http://example.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# С аутентификацией
curl -H "Authorization: Bearer token123" \
  http://example.com/api/users

# С заголовками
curl -H "Accept: application/json" \
  -H "User-Agent: MyApp/1.0" \
  http://example.com/api/users
```

### **Python (requests)**

```python
import requests

# GET запрос
response = requests.get('http://example.com/api/users')
print(response.json())

# POST запрос
data = {'name': 'John', 'email': 'john@example.com'}
response = requests.post('http://example.com/api/users', json=data)

# С аутентификацией
headers = {'Authorization': 'Bearer token123'}
response = requests.get('http://example.com/api/users', headers=headers)
```

### **JavaScript (fetch)**

```javascript
// GET запрос
fetch('http://example.com/api/users')
  .then(response => response.json())
  .then(data => console.log(data));

// POST запрос
fetch('http://example.com/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({name: 'John', email: 'john@example.com'})
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## **Безопасность HTTP**

### **Угрозы**

1. **Man-in-the-Middle** — перехват трафика
2. **Session Hijacking** — перехват сессии
3. **CSRF** — межсайтовая подделка запросов
4. **XSS** — межсайтовый скриптинг
5. **Injection Attacks** — SQL injection, command injection

### **Защита**

1. **HTTPS** — использование TLS/SSL
2. **Secure Cookies** — HttpOnly, Secure, SameSite
3. **CORS** — контроль доступа между доменами
4. **Content Security Policy** — ограничение ресурсов
5. **Input Validation** — проверка входных данных

## **REST API**

HTTP часто используется для REST API:

- **GET** — получение ресурсов
- **POST** — создание ресурсов
- **PUT** — полное обновление
- **PATCH** — частичное обновление
- **DELETE** — удаление ресурсов

**Принципы REST:**
- Stateless
- Ресурсы идентифицируются URI
- Использование стандартных HTTP методов
- Представление в JSON/XML

## **Производительность**

### **Оптимизация**

1. **Сжатие** — gzip, deflate
2. **Кеширование** — правильные заголовки
3. **CDN** — распределение контента
4. **HTTP/2** — multiplexing, header compression
5. **Минификация** — уменьшение размера ресурсов

## **Мониторинг и отладка**

### **Инструменты**

1. **Browser DevTools** — Network tab
2. **Wireshark** — анализ трафика
3. **tcpdump** — захват пакетов
4. **Postman** — тестирование API
5. **curl** — командная строка

### **Логирование**

```bash
# Просмотр HTTP трафика
sudo tcpdump -i eth0 -A 'tcp port 80'

# Wireshark фильтры
http
http.request.method == "GET"
http.response.code == 200
```

## **Применение HTTP**

1. **Веб-браузинг** — загрузка веб-страниц
2. **API** — взаимодействие приложений
3. **Мобильные приложения** — связь с сервером
4. **Микросервисы** — коммуникация между сервисами
5. **CDN** — доставка контента

## **Ограничения HTTP**

1. **Stateless** — нет состояния между запросами
2. **Текстовый протокол** — накладные расходы (в HTTP/1.x)
3. **Безопасность** — требует HTTPS для защиты
4. **Производительность** — ограничения HTTP/1.x

## **Будущее HTTP**

- **HTTP/3** на основе QUIC
- Улучшенная производительность
- Лучшая работа с мобильными сетями
- Встроенное шифрование
