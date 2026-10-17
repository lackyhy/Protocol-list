**NetFlow** — технология Cisco для сбора статистики о сетевых потоках (кто, с кем, по какому протоколу и сколько данных передал). **IPFIX** (IP Flow Information Export) — открытый стандарт IETF, основанный на NetFlow v9. Маршрутизаторы и коммутаторы агрегируют пакеты в потоки и экспортируют записи на коллектор, где строятся отчёты о загрузке каналов, топ-потребителях, аномалиях и атаках.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP (обычно), IPFIX — также SCTP и TCP                                   |
| **Порты**                   | Нет стандартного для NetFlow: 2055, 9995, 9996; IPFIX — 4739 (4740 TLS)  |
| **Стандарты**               | NetFlow v5, v9 (RFC 3954, информационный), IPFIX (RFC 7011, 7012)        |
| **Модель**                  | Экспортёр (устройство) → Коллектор → Анализатор                          |
| **Аналоги**                 | sFlow (выборка пакетов), J-Flow (Juniper), NetStream (Huawei)            |

## **Что такое поток (Flow)**

Поток — набор пакетов с одинаковыми ключевыми полями, прошедших через интерфейс за определённое время. Классический ключ — **7 полей**:

| Ключевое поле          |
| ---------------------- |
| IP-адрес источника     |
| IP-адрес назначения    |
| Порт источника         |
| Порт назначения        |
| Протокол (TCP/UDP/ICMP) |
| ToS (DSCP)             |
| Входной интерфейс      |

Для каждого потока считаются: количество пакетов и байтов, время начала и конца, TCP-флаги, выходной интерфейс, next-hop, номера AS.

## **Архитектура**

```
[Маршрутизатор]──┐ Flow Export (UDP)
[Коммутатор L3]──┼──────────────────> [Коллектор] ──> [Анализ и визуализация]
[Файрвол]────────┘                     nfcapd,           ntopng, Grafana,
  Flow Cache: агрегирует              ElastiFlow,       SIEM, системы DDoS-защиты
  пакеты в потоки                     pmacct, GoFlow2
```

## **Когда поток экспортируется**

| Условие                  | Значение по умолчанию (Cisco) | Описание                              |
| ------------------------ | ----------------------------- | ------------------------------------- |
| **Inactive timeout**     | 15 с                          | Пакетов по потоку не было             |
| **Active timeout**       | 30 мин (рекомендуют 1 мин)    | Длинный поток экспортируется периодически |
| **Флаги FIN / RST**      | —                             | TCP-соединение завершено              |
| **Переполнение кэша**    | —                             | Самые старые записи вытесняются       |

## **Версии**

| Версия     | Описание                                                             |
| ---------- | -------------------------------------------------------------------- |
| **v1**     | Первая версия, устарела                                              |
| **v5**     | Самая распространённая классическая версия: фиксированный формат, только IPv4 |
| **v7**     | Для коммутаторов Catalyst                                            |
| **v8**     | Агрегация на маршрутизаторе                                          |
| **v9**     | **Шаблоны** (templates) — гибкий набор полей, IPv6, MPLS             |
| **IPFIX** («v10») | Стандарт IETF на основе v9: переменная длина полей, enterprise-поля |

### **Формат записи NetFlow v5 (48 байт)**

| Поле                | Описание                          |
| ------------------- | --------------------------------- |
| srcaddr / dstaddr   | IP-адреса                         |
| nexthop             | Следующий маршрутизатор           |
| input / output      | Индексы интерфейсов (SNMP ifIndex) |
| dPkts / dOctets     | Пакеты и байты                    |
| First / Last        | Время начала и конца              |
| srcport / dstport   | Порты                             |
| tcp_flags           | Объединение TCP-флагов            |
| prot                | Протокол                          |
| tos                 | ToS                               |
| src_as / dst_as     | Номера автономных систем          |
| src_mask / dst_mask | Маски префиксов                   |

### **Шаблоны в v9 и IPFIX**

```
Экспортёр → Коллектор:
  Template Set (ID 256): [srcIPv4, dstIPv4, srcPort, dstPort, proto, octets, packets]
  Data Set (ID 256):     [10.0.0.5, 93.184.216.34, 51234, 443, 6, 15320, 22]
                         [10.0.0.7, 8.8.8.8, 53012, 53, 17, 140, 2]
```

Коллектор сначала должен получить шаблон, иначе не сможет разобрать данные. Шаблоны периодически отправляются повторно.

### **Важные Information Elements IPFIX**

| ID   | Имя                        |
| ---- | -------------------------- |
| 1    | octetDeltaCount            |
| 2    | packetDeltaCount           |
| 4    | protocolIdentifier         |
| 7    | sourceTransportPort        |
| 8    | sourceIPv4Address          |
| 11   | destinationTransportPort   |
| 12   | destinationIPv4Address     |
| 27   | sourceIPv6Address          |
| 28   | destinationIPv6Address     |
| 152  | flowStartMilliseconds      |
| 153  | flowEndMilliseconds        |

## **Выборка (Sampling)**

На высокоскоростных каналах анализировать каждый пакет дорого. **Sampled NetFlow** учитывает каждый N-й пакет (например, 1:1000), а коллектор масштабирует результаты. Точность для мелких потоков падает, но крупные тенденции видны.

## **Применение**

1. **Мониторинг загрузки** — кто и чем загружает канал
2. **Обнаружение DDoS** — резкий рост потоков к одному адресу (FastNetMon, Kentik)
3. **Безопасность** — сканирование портов, связь с C2-серверами, утечки данных
4. **Биллинг** — учёт трафика абонентов у провайдеров
5. **Планирование ёмкости** — тренды роста трафика
6. **Пиринг** — анализ трафика по AS для договоров с другими сетями
7. **Расследование инцидентов** — история соединений

## **Примеры конфигурации**

### **Cisco IOS — Flexible NetFlow**

```
flow record REC-IPV4
 match ipv4 source address
 match ipv4 destination address
 match transport source-port
 match transport destination-port
 match ipv4 protocol
 match interface input
 collect counter bytes long
 collect counter packets long
 collect timestamp sys-uptime first
 collect timestamp sys-uptime last
 collect transport tcp flags

flow exporter EXP-COLLECTOR
 destination 10.0.0.60
 source Loopback0
 transport udp 2055
 export-protocol ipfix

flow monitor MON-IPV4
 record REC-IPV4
 exporter EXP-COLLECTOR
 cache timeout active 60
 cache timeout inactive 15

interface GigabitEthernet0/0
 ip flow monitor MON-IPV4 input
 ip flow monitor MON-IPV4 output
```

```
show flow monitor MON-IPV4 cache
show flow exporter statistics
```

### **Linux как экспортёр (softflowd)**

```bash
softflowd -i eth0 -n 10.0.0.60:2055 -v 10   # -v 10 = IPFIX
```

### **Коллектор nfdump**

```bash
# Приём
nfcapd -D -p 2055 -w /var/cache/nfdump

# Топ-10 адресов по байтам за период
nfdump -R /var/cache/nfdump -s ip/bytes -n 10

# Потоки к порту 22
nfdump -R /var/cache/nfdump 'dst port 22' -o long

# Топ портов назначения
nfdump -R /var/cache/nfdump -s dstport/bytes
```

### **MikroTik RouterOS (Traffic Flow)**

```
/ip traffic-flow set enabled=yes interfaces=ether1 active-flow-timeout=1m
/ip traffic-flow target add dst-address=10.0.0.60 port=2055 version=ipfix
```

### **Wireshark**

```
cflow
udp.port == 2055
```

## **Безопасность**

- Экспорт идёт **открытым UDP без аутентификации** — можно подделать или подслушать данные о трафике
- Направлять экспорт в изолированную сеть управления
- Записи о потоках — персональные данные (кто с кем связывался), их хранение регулируется законом
- Коллектор — ценная цель: содержит карту всех соединений

## **Сравнение NetFlow/IPFIX и sFlow**

| Характеристика      | NetFlow / IPFIX                    | sFlow                                |
| ------------------- | ---------------------------------- | ------------------------------------ |
| **Принцип**         | Агрегация пакетов в потоки на устройстве | Выборка пакетов, отправка заголовков |
| **Нагрузка на устройство** | Выше (кэш потоков)          | Ниже                                 |
| **Точность**        | Высокая (без выборки)              | Статистическая                       |
| **Задержка данных** | До active timeout                  | Почти в реальном времени             |
| **L2-информация**   | Ограниченно                        | Да (MAC, VLAN)                       |
| **Стандарт**        | IPFIX — IETF                       | sFlow.org (RFC 3176 — информационный) |
| **Распространённость** | Маршрутизаторы, Cisco           | Коммутаторы, дата-центры             |
