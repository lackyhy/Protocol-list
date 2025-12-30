**MQTT** (Message Queuing Telemetry Transport) — легковесный протокол обмена сообщениями по модели "издатель-подписчик" (publish-subscribe). MQTT разработан для устройств с ограниченными ресурсами и нестабильных сетей, широко используется в Интернете вещей (IoT).

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**                | TCP (порт 1883, 8883 для MQTT over TLS)                                  |
| **Тип протокола**          | Publish-Subscribe (издатель-подписчик)                                   |
| **Размер заголовка**        | Минимальный (2 байта)                                                     |
| **QoS**                     | Три уровня качества обслуживания                                         |
| **Версии**                  | MQTT 3.1, MQTT 3.1.1, MQTT 5.0 (текущая)                                |

## **Архитектура MQTT**

### **Компоненты**

1. **Broker** — сервер, который принимает и распределяет сообщения
2. **Publisher** — клиент, который публикует сообщения
3. **Subscriber** — клиент, который подписывается на топики

### **Модель Publish-Subscribe**

```
Publisher → Broker → Subscriber
              ↓
         Topic: "sensor/temperature"
```

**Принцип:**
- Издатели и подписчики не знают друг о друге
- Связь через топики (topics)
- Broker маршрутизирует сообщения

## **Топики (Topics)**

### **Структура топиков**

Иерархическая структура с разделителем `/`:
```
home/living-room/temperature
home/bedroom/light
sensor/+/data
sensors/#
```

### **Wildcards**

| Символ | Описание                                    | Пример                                    |
| ------ | ------------------------------------------- | ----------------------------------------- |
| **+**  | Одноуровневый wildcard                      | `sensor/+/temperature` (sensor/room1/temperature, sensor/room2/temperature) |
| **#**  | Многоуровневый wildcard (только в конце)    | `sensors/#` (sensors/room1/temp, sensors/room2/humidity) |

## **Структура MQTT пакета**

### **Фиксированный заголовок**

| Поле                    | Размер (биты) | Описание                                    |
| ----------------------- | -------------- | ------------------------------------------- |
| **Message Type**        | 4              | Тип сообщения (CONNECT, PUBLISH и т.д.)     |
| **Flags**               | 4              | Флаги (DUP, QoS, RETAIN)                    |
| **Remaining Length**    | Переменная     | Длина оставшейся части пакета              |

**Минимальный размер:** 2 байта

## **Типы MQTT сообщений**

| Тип | Название        | Описание                                    |
| --- | --------------- | ------------------------------------------- |
| 1   | CONNECT         | Подключение к broker                        |
| 2   | CONNACK         | Подтверждение подключения                   |
| 3   | PUBLISH         | Публикация сообщения                        |
| 4   | PUBACK          | Подтверждение публикации (QoS 1)            |
| 5   | PUBREC          | Получение публикации (QoS 2)                |
| 6   | PUBREL          | Освобождение публикации (QoS 2)             |
| 7   | PUBCOMP         | Завершение публикации (QoS 2)                |
| 8   | SUBSCRIBE       | Подписка на топик                           |
| 9   | SUBACK          | Подтверждение подписки                      |
| 10  | UNSUBSCRIBE     | Отписка от топика                           |
| 11  | UNSUBACK        | Подтверждение отписки                       |
| 12  | PINGREQ         | Запрос ping                                 |
| 13  | PINGRESP        | Ответ ping                                  |
| 14  | DISCONNECT      | Отключение                                  |

## **QoS (Quality of Service)**

### **QoS 0: At most once (Fire and Forget)**

```
Publisher → Broker → Subscriber
```

**Характеристики:**
- Минимальные накладные расходы
- Нет подтверждений
- Возможна потеря сообщений

### **QoS 1: At least once**

```
Publisher → Broker → PUBACK
              ↓
           Subscriber → PUBACK
```

**Характеристики:**
- Подтверждение получения
- Возможны дубликаты
- Гарантированная доставка

### **QoS 2: Exactly once**

```
Publisher → Broker → PUBREC → PUBREL → PUBCOMP
              ↓
           Subscriber → PUBREC → PUBREL → PUBCOMP
```

**Характеристики:**
- Гарантированная доставка
- Нет дубликатов
- Максимальные накладные расходы

## **Примеры использования**

### **Python (paho-mqtt)**

```python
import paho.mqtt.client as mqtt

# Callback при подключении
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("sensor/temperature")

# Callback при получении сообщения
def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

# Создание клиента
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Подключение
client.connect("broker.example.com", 1883, 60)
client.loop_forever()
```

### **Публикация сообщения**

```python
import paho.mqtt.client as mqtt

client = mqtt.Client()
client.connect("broker.example.com", 1883, 60)
client.publish("sensor/temperature", "25.5", qos=1)
client.disconnect()
```

### **Node.js (mqtt)**

```javascript
const mqtt = require('mqtt');

// Подключение
const client = mqtt.connect('mqtt://broker.example.com');

// Подписка
client.on('connect', () => {
  client.subscribe('sensor/temperature');
});

// Получение сообщений
client.on('message', (topic, message) => {
  console.log(`${topic}: ${message.toString()}`);
});

// Публикация
client.publish('sensor/temperature', '25.5', { qos: 1 });
```

### **Командная строка (mosquitto)**

```bash
# Подписка
mosquitto_sub -h broker.example.com -t "sensor/temperature"

# Публикация
mosquitto_pub -h broker.example.com -t "sensor/temperature" -m "25.5"

# С QoS
mosquitto_pub -h broker.example.com -t "sensor/temperature" -m "25.5" -q 1

# С сохранением (retain)
mosquitto_pub -h broker.example.com -t "sensor/temperature" -m "25.5" -r
```

## **Настройка MQTT Broker**

### **Mosquitto (Linux)**

```bash
# Установка
sudo apt-get install mosquitto mosquitto-clients

# Конфигурация /etc/mosquitto/mosquitto.conf
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd

# Создание пользователя
mosquitto_passwd -c /etc/mosquitto/passwd username

# Запуск
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

### **С TLS/SSL**

```bash
# /etc/mosquitto/mosquitto.conf
listener 8883
cafile /etc/mosquitto/certs/ca.crt
certfile /etc/mosquitto/certs/server.crt
keyfile /etc/mosquitto/certs/server.key
require_certificate false
```

## **Retained Messages**

Сообщения, которые сохраняются на broker и отправляются новым подписчикам:

```python
client.publish("sensor/temperature", "25.5", retain=True)
```

**Применение:**
- Последнее известное значение
- Статус устройства
- Конфигурация

## **Last Will and Testament (LWT)**

Сообщение, которое broker отправит, если клиент неожиданно отключится:

```python
client.will_set("device/status", "offline", qos=1, retain=True)
client.connect("broker.example.com", 1883, 60)
```

## **Keep Alive**

Механизм для проверки, что соединение активно:

```python
client.connect("broker.example.com", 1883, keepalive=60)
```

**Принцип:**
- Клиент отправляет PINGREQ каждые keepalive секунд
- Если broker не получает PINGREQ, соединение разрывается

## **Безопасность MQTT**

### **Аутентификация**

```bash
# Создание пользователя
mosquitto_passwd -c /etc/mosquitto/passwd username
```

### **TLS/SSL**

```python
import ssl

client = mqtt.Client()
client.tls_set(ca_certs="/path/to/ca.crt")
client.connect("broker.example.com", 8883, 60)
```

### **ACL (Access Control List)**

```bash
# /etc/mosquitto/acl
user username
topic read sensor/temperature
topic write sensor/command
```

## **Применение MQTT**

1. **IoT устройства** — датчики, умный дом
2. **Мобильные приложения** — push уведомления
3. **Мониторинг** — сбор данных с устройств
4. **Управление** — удаленное управление устройствами
5. **Real-time обновления** — живые обновления данных

## **Ограничения MQTT**

1. **Нет гарантии порядка** — сообщения могут прийти в другом порядке
2. **Ограничения топиков** — иерархическая структура
3. **Безопасность** — требует дополнительной настройки
4. **Брокер как точка отказа** — требует высокой доступности

## **MQTT vs другие протоколы**

| Характеристика | MQTT | AMQP | HTTP |
| -------------- | ---- | ---- | ---- |
| **Размер**     | Минимальный | Средний | Большой |
| **Модель**     | Pub-Sub | Message Queue | Request-Response |
| **IoT**        | Отлично | Хорошо | Плохо |
| **Надежность** | QoS 0-2 | Гарантированная | Best-effort |

## **MQTT 5.0**

### **Новые возможности**

- **User Properties** — пользовательские свойства
- **Reason Codes** — детальные коды причин
- **Session Expiry** — истечение сессии
- **Shared Subscriptions** — общие подписки
- **Request/Response** — паттерн запрос-ответ

## **Будущее MQTT**

- **MQTT 5.0** — расширенное использование
- **Интеграция с облаками** — AWS IoT, Azure IoT
- **Улучшенная безопасность** — новые методы аутентификации
- **Стандартизация** — ISO/IEC 20922
