**IS-IS** (Intermediate System to Intermediate System) — протокол динамической маршрутизации по состоянию каналов (link-state), как и OSPF. Изначально создан ISO для стека OSI (CLNS), затем расширен для IP (Integrated IS-IS). IS-IS работает прямо поверх канального уровня, хорошо масштабируется и легко расширяется, поэтому популярен в магистральных сетях провайдеров и дата-центрах.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Сетевой (Network Layer), инкапсуляция прямо в L2                         |
| **Инкапсуляция**            | Кадр канального уровня (LLC, SAP `0xFE`), не IP                          |
| **Стандарты**               | ISO/IEC 10589, RFC 1195 (IP), RFC 5308 (IPv6)                            |
| **Тип протокола**           | Link-State                                                               |
| **Алгоритм**                | SPF (Дейкстры)                                                           |
| **Назначение**              | Внутренняя маршрутизация (IGP)                                           |
| **Метрика**                 | Narrow (6 бит, до 63) или Wide (24/32 бита)                              |
| **Multicast MAC**           | `01:80:C2:00:00:14` (L1), `01:80:C2:00:00:15` (L2)                       |

## **Терминология OSI**

| Термин IS-IS              | Аналог в IP/OSPF                      |
| ------------------------- | ------------------------------------- |
| **IS (Intermediate System)** | Маршрутизатор                      |
| **ES (End System)**       | Хост                                  |
| **Area**                  | Область                               |
| **PDU**                   | Пакет                                 |
| **LSP (Link State PDU)**  | LSA в OSPF                            |
| **IIH (IS-IS Hello)**     | Hello                                 |
| **DIS**                   | Designated Router (DR)                |
| **NET**                   | Адрес маршрутизатора (Router ID + Area) |
| **SNPA**                  | MAC-адрес                             |

## **Адрес NET**

Каждый маршрутизатор идентифицируется адресом **NET** (Network Entity Title):

```
49.0001.1921.6800.1001.00
│  │    │              └─ NSEL = 00 (всегда для маршрутизатора)
│  │    └─ System ID (6 байт), часто из IP loopback: 192.168.001.001
│  └─ Area ID = 0001
└─ AFI = 49 (частная адресация)
```

## **Уровни (Levels)**

| Уровень       | Описание                                                        | Аналог в OSPF        |
| ------------- | --------------------------------------------------------------- | -------------------- |
| **Level 1**   | Маршрутизация внутри области                                    | Внутренний маршрутизатор |
| **Level 2**   | Маршрутизация между областями (магистраль)                      | Backbone             |
| **Level 1-2** | Участвует в обоих уровнях, связывает область с магистралью      | ABR                  |

```
        Area 49.0001                    Area 49.0002
   [R1 L1]──[R2 L1/L2]════L2════[R3 L1/L2]──[R4 L1]
                    ║                 ║
                    ╚═══ L2 backbone ═╝
```

Отличие от OSPF: граница областей проходит **по каналу между маршрутизаторами**, а не через маршрутизатор. Магистраль L2 — это непрерывная цепочка L2-маршрутизаторов, а не специальная область 0.

## **Типы PDU**

| PDU          | Назначение                                                  |
| ------------ | ----------------------------------------------------------- |
| **IIH**      | Hello — обнаружение соседей, выборы DIS (L1, L2, P2P)       |
| **LSP**      | Информация о каналах и префиксах                            |
| **CSNP**     | Complete Sequence Numbers PDU — сводка всей базы (от DIS)   |
| **PSNP**     | Partial SNP — запрос недостающих LSP или подтверждение      |

## **TLV — расширяемость**

Вся информация в LSP передаётся в виде TLV, поэтому добавить новую функцию = добавить новый TLV:

| TLV  | Назначение                              |
| ---- | --------------------------------------- |
| 1    | Area Addresses                          |
| 22   | Extended IS Reachability (wide metric)  |
| 128/130 | IP Reachability (narrow)             |
| 135  | Extended IP Reachability                |
| 137  | Hostname (имя маршрутизатора)           |
| 232  | IPv6 Interface Address                  |
| 236  | IPv6 Reachability                       |
| 242  | Router Capability (Segment Routing)     |

Благодаря TLV IS-IS легко поддерживает IPv6, Traffic Engineering и **Segment Routing**.

## **Принцип работы**

```
1. Обмен IIH — установление соседства (adjacency)
2. На broadcast-сегменте выбирается DIS (наибольший приоритет, затем MAC)
3. Каждый маршрутизатор генерирует LSP о своих каналах и префиксах
4. LSP рассылаются всем маршрутизаторам уровня (flooding)
5. Синхронизация баз через CSNP/PSNP
6. Каждый строит дерево кратчайших путей (SPF)
7. Лучшие маршруты попадают в таблицу маршрутизации
```

### **Таймеры по умолчанию (Cisco)**

| Таймер              | Значение                    |
| ------------------- | --------------------------- |
| Hello Interval      | 10 с (DIS — 3,3 с)          |
| Hold Time           | 30 с (3 × Hello)            |
| LSP Refresh         | 900 с                       |
| LSP Max Lifetime    | 1200 с                      |

## **Примеры конфигурации**

### **Cisco IOS**

```
router isis CORE
 net 49.0001.1921.6800.1001.00
 is-type level-2-only
 metric-style wide
 log-adjacency-changes

interface Loopback0
 ip address 192.168.1.1 255.255.255.255
 ip router isis CORE

interface GigabitEthernet0/0
 ip address 10.0.12.1 255.255.255.252
 ip router isis CORE
 isis network point-to-point
 isis metric 10
```

```
show isis neighbors
show isis database detail
show isis topology
show ip route isis
```

### **FRRouting (Linux)**

```
router isis CORE
 net 49.0001.1921.6800.1001.00
 is-type level-2-only
 metric-style wide
!
interface eth0
 ip router isis CORE
 isis network point-to-point
!
interface lo
 ip router isis CORE
 isis passive
```

### **Juniper Junos**

```
set interfaces lo0 unit 0 family iso address 49.0001.1921.6800.1001.00
set interfaces ge-0/0/0 unit 0 family iso
set protocols isis interface ge-0/0/0.0 point-to-point
set protocols isis interface lo0.0 passive
set protocols isis level 1 disable
```

### **Wireshark**

```
isis
isis.lsp
```

## **Безопасность IS-IS**

- IS-IS не использует IP, поэтому его нельзя атаковать удалённо из другой сети — только из того же L2-сегмента
- **Аутентификация** — HMAC-MD5 или HMAC-SHA (RFC 5310) для IIH и LSP

```
key chain ISIS-KEY
 key 1
  key-string S3cret
  cryptographic-algorithm hmac-sha-256
router isis CORE
 authentication mode md5 level-2
 authentication key-chain ISIS-KEY level-2
```

## **Сравнение IS-IS и OSPF**

| Характеристика       | IS-IS                            | OSPF                              |
| -------------------- | -------------------------------- | --------------------------------- |
| **Инкапсуляция**     | Прямо в L2                       | IP (протокол 89)                  |
| **IPv4 и IPv6**      | Один процесс для обоих           | OSPFv2 и OSPFv3 отдельно          |
| **Иерархия**         | L1 / L2, граница на канале       | Области, граница на ABR, область 0 |
| **Типы областей**    | Проще                            | Stub, NSSA, Totally stubby…       |
| **Расширяемость**    | TLV, очень гибкая                | Новые типы LSA                    |
| **Масштабируемость** | Сотни маршрутизаторов в области  | Ниже                              |
| **Применение**       | Провайдеры, дата-центры          | Предприятия                       |
| **Сложность изучения** | Терминология OSI               | Более привычен                    |
