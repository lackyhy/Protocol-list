**AMQP** (Advanced Message Queuing Protocol) — открытый протокол обмена сообщениями через брокер. В отличие от лёгких IoT-протоколов, AMQP ориентирован на корпоративные системы: он гарантирует надёжную доставку, поддерживает очереди, транзакции, маршрутизацию по правилам и подтверждения. Самая известная реализация — RabbitMQ (AMQP 0-9-1). Существует и несовместимая с ней версия **AMQP 1.0** (ISO/IEC 19464), используемая в Azure Service Bus и ActiveMQ.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP                                                                      |
| **Порты**                   | 5672 (AMQP), 5671 (AMQPS/TLS)                                            |
| **Версии**                  | 0-9-1 (RabbitMQ), 1.0 (OASIS, ISO/IEC 19464) — несовместимы между собой  |
| **Модель**                  | Брокер сообщений с очередями и обменниками                               |
| **Гарантии доставки**       | At-most-once, at-least-once, exactly-once (с условиями)                  |
| **Формат**                  | Двоичный, с типизированными данными                                      |

## **Две версии AMQP**

| Характеристика      | AMQP 0-9-1                      | AMQP 1.0                         |
| ------------------- | ------------------------------- | -------------------------------- |
| **Модель**          | Брокерная (exchanges + queues в протоколе) | Транспорт сообщений (топология — на брокере) |
| **Exchanges в протоколе** | Да                        | Нет (понятие брокера)            |
| **Основной брокер** | RabbitMQ                        | Azure Service Bus, ActiveMQ Artemis, Qpid |
| **Совместимость**   | —                               | Не совместима с 0-9-1            |

Дальше — модель **AMQP 0-9-1** (RabbitMQ), как самая распространённая.

## **Модель AMQP 0-9-1**

```
Producer → [Exchange] --(binding по routing key)--> [Queue] → Consumer
```

| Компонент       | Описание                                                       |
| --------------- | -------------------------------------------------------------- |
| **Producer**    | Отправитель сообщений                                          |
| **Exchange**    | Приёмник сообщений, маршрутизирует их в очереди по правилам     |
| **Queue**       | Хранилище сообщений до доставки потребителю                    |
| **Binding**     | Правило связи обменника и очереди (по routing key)             |
| **Consumer**    | Получатель сообщений                                           |
| **Routing Key** | Метка сообщения, по которой происходит маршрутизация           |
| **Channel**     | Логическое соединение внутри одного TCP (мультиплексирование)  |
| **Virtual Host** | Изолированное пространство (как отдельный брокер)             |

## **Типы обменников (Exchange)**

| Тип         | Маршрутизация                                                      |
| ----------- | ----------------------------------------------------------------- |
| **direct**  | Точное совпадение routing key с binding key                       |
| **fanout**  | Во все привязанные очереди (broadcast), routing key игнорируется  |
| **topic**   | По шаблону: `*` — одно слово, `#` — ноль и более слов (`logs.*.error`) |
| **headers** | По заголовкам сообщения, а не по routing key                      |

```
Пример topic:
Сообщение routing key "orders.eu.created"
Binding "orders.#"       → совпадает
Binding "orders.*.created" → совпадает
Binding "orders.us.*"    → не совпадает
```

## **Структура кадра (AMQP 0-9-1)**

| Поле           | Описание                                       |
| -------------- | ---------------------------------------------- |
| **Type**       | 1 = Method, 2 = Header, 3 = Body, 8 = Heartbeat |
| **Channel**    | Номер канала                                   |
| **Size**       | Размер полезной нагрузки                        |
| **Payload**    | Метод/заголовок/данные                          |
| **Frame-End**  | `0xCE`                                         |

## **Классы методов**

| Класс          | Назначение                                        |
| -------------- | ------------------------------------------------- |
| **Connection** | Установление соединения, аутентификация           |
| **Channel**    | Управление каналами                               |
| **Exchange**   | Объявление и удаление обменников                   |
| **Queue**      | Объявление, привязка, очистка очередей             |
| **Basic**      | Публикация, доставка, подтверждения сообщений      |
| **Tx**         | Транзакции                                        |
| **Confirm**    | Publisher confirms (подтверждение публикации)     |

## **Надёжность доставки**

| Механизм               | Описание                                                    |
| ---------------------- | ----------------------------------------------------------- |
| **Acknowledgements (ack)** | Потребитель подтверждает обработку; без ack сообщение возвращается в очередь |
| **Publisher Confirms** | Брокер подтверждает приём сообщения от издателя             |
| **Durable queues**     | Очередь переживает перезапуск брокера                       |
| **Persistent messages** | Сообщение сохраняется на диск                              |
| **Dead Letter Exchange (DLX)** | Куда отправлять отвергнутые/просроченные сообщения  |
| **TTL**                | Срок жизни сообщения или очереди                            |
| **Prefetch (QoS)**     | Сколько неподтверждённых сообщений выдавать потребителю      |

## **Примеры использования**

### **Python (pika, AMQP 0-9-1)**

Издатель:

```python
import pika

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.exchange_declare(exchange="logs", exchange_type="topic", durable=True)
ch.basic_publish(
    exchange="logs",
    routing_key="orders.eu.created",
    body=b'{"id": 42}',
    properties=pika.BasicProperties(delivery_mode=2),  # persistent
)
conn.close()
```

Потребитель:

```python
import pika

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.queue_declare(queue="orders", durable=True)
ch.queue_bind(queue="orders", exchange="logs", routing_key="orders.#")
ch.basic_qos(prefetch_count=10)

def handle(ch, method, props, body):
    print("Получено:", body)
    ch.basic_ack(delivery_tag=method.delivery_tag)

ch.basic_consume(queue="orders", on_message_callback=handle)
ch.start_consuming()
```

### **CLI RabbitMQ**

```bash
rabbitmqctl list_queues name messages consumers
rabbitmqctl list_exchanges
rabbitmqctl list_bindings
rabbitmqadmin publish routing_key=orders.eu.created payload='{"id":1}'
rabbitmqadmin get queue=orders
```

### **AMQP 1.0 (Python, qpid-proton)**

```python
from proton import Message
from proton.utils import BlockingConnection

conn = BlockingConnection("amqp://localhost:5672")
sender = conn.create_sender("my-queue")
sender.send(Message(body="Привет"))
conn.close()
```

### **Строка подключения**

```
amqp://user:pass@host:5672/vhost
amqps://user:pass@host:5671/vhost      # TLS
```

### **Wireshark**

```
amqp
amqp.method.class
tcp.port == 5672
```

## **Безопасность**

| Механизм               | Описание                                                    |
| ---------------------- | ----------------------------------------------------------- |
| **TLS (AMQPS, 5671)**  | Шифрование соединения                                       |
| **SASL**               | Аутентификация (PLAIN, EXTERNAL по сертификату, SCRAM)      |
| **Virtual Hosts**      | Изоляция приложений/клиентов                                |
| **Права доступа**      | Разрешения на configure/write/read для пользователей и vhost |

### **Рекомендации**

- TLS и отключение гостевого пользователя `guest` (по умолчанию доступен только с localhost)
- Минимальные права на конкретные vhost и ресурсы
- Ограничение размера очередей и памяти (защита от переполнения)
- Не выставлять 5672 в интернет без TLS и файрвола

## **Сравнение AMQP, MQTT и Kafka**

| Характеристика       | AMQP (RabbitMQ)             | MQTT                       | Apache Kafka               |
| -------------------- | --------------------------- | -------------------------- | -------------------------- |
| **Модель**           | Очереди + гибкая маршрутизация | Публикация-подписка (топики) | Распределённый лог       |
| **Применение**       | Задачи, интеграция систем, RPC | IoT, телеметрия          | Потоки событий, аналитика  |
| **Гарантии**         | Гибкие (ack, confirms, транзакции) | QoS 0/1/2            | At-least-once, exactly-once |
| **Маршрутизация**    | Богатая (direct/topic/fanout/headers) | По топикам         | По партициям               |
| **Хранение истории** | До доставки                 | Обычно нет (retained — одно) | Долгое (лог с offset)    |
| **Накладные расходы** | Средние                    | Минимальные                | Средние                    |
| **Масштаб**          | Десятки тысяч сообщений/с   | Миллионы устройств         | Миллионы сообщений/с       |
