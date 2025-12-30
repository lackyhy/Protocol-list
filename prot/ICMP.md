**ICMP** (Internet Control Message Protocol) — протокол сетевого уровня, используемый для передачи служебных и диагностических сообщений в IP сетях. ICMP является неотъемлемой частью стека TCP/IP и используется для сообщения об ошибках, диагностики сети и управления трафиком.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Сетевой (Network Layer)                                                  |
| **Протокол**                | Часть стека IP (протокол номер 1)                                        |
| **Инкапсуляция**            | Инкапсулируется в IP пакеты                                              |
| **Назначение**              | Диагностика, сообщения об ошибках, управление                            |
| **Надежность**              | Не гарантирует доставку (best-effort)                                    |
| **Версии**                  | ICMPv4 (для IPv4), ICMPv6 (для IPv6)                                     |

## **Структура ICMP пакета**

| Поле                    | Размер (байты) | Описание                                    | Пример/Значение                    |
| ----------------------- | -------------- | ------------------------------------------- | ---------------------------------- |
| **Type**                | 1              | Тип ICMP сообщения                          | `0x00` (Echo Reply), `0x08` (Echo Request) |
| **Code**                | 1              | Код, уточняющий тип сообщения               | Зависит от Type                    |
| **Checksum**             | 2              | Контрольная сумма всего ICMP пакета         | Рассчитывается на лету             |
| **Message Body**         | Переменная     | Данные сообщения (зависит от типа)          | Зависит от типа сообщения          |

**Инкапсуляция:**
```
IP Header | ICMP Header | ICMP Data
```

## **Типы ICMP сообщений**

### **Запросы и ответы (Echo)**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 0    | 0    | Echo Reply      | Ответ на Echo Request (ping ответ)          |
| 8    | 0    | Echo Request    | Запрос эха (ping запрос)                    |

### **Сообщения об ошибках доставки**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 3    | 0    | Destination Unreachable - Net Unreachable | Сеть недоступна |
| 3    | 1    | Destination Unreachable - Host Unreachable | Хост недоступен |
| 3    | 2    | Destination Unreachable - Protocol Unreachable | Протокол недоступен |
| 3    | 3    | Destination Unreachable - Port Unreachable | Порт недоступен |
| 3    | 4    | Destination Unreachable - Fragmentation Needed | Требуется фрагментация |
| 3    | 5    | Destination Unreachable - Source Route Failed | Ошибка исходного маршрута |
| 3    | 6    | Destination Unreachable - Destination Network Unknown | Сеть назначения неизвестна |
| 3    | 7    | Destination Unreachable - Destination Host Unknown | Хост назначения неизвестен |
| 3    | 8    | Destination Unreachable - Source Host Isolated | Исходный хост изолирован |
| 3    | 9    | Destination Unreachable - Communication Administratively Prohibited | Связь запрещена административно |
| 3    | 10   | Destination Unreachable - Host Precedence Violation | Нарушение приоритета хоста |
| 3    | 11   | Destination Unreachable - Precedence Cutoff | Превышен приоритет |
| 3    | 12   | Destination Unreachable - Precedence Cutoff In Effect | Превышен приоритет (активен) |

### **Перенаправление (Redirect)**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 5    | 0    | Redirect - Network | Перенаправление для сети |
| 5    | 1    | Redirect - Host | Перенаправление для хоста |
| 5    | 2    | Redirect - Type of Service and Network | Перенаправление для TOS и сети |
| 5    | 3    | Redirect - Type of Service and Host | Перенаправление для TOS и хоста |

### **Превышение времени (Time Exceeded)**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 11   | 0    | Time Exceeded - TTL Exceeded in Transit | Превышен TTL при передаче |
| 11   | 1    | Time Exceeded - Fragment Reassembly Time Exceeded | Превышено время сборки фрагментов |

### **Проблемы с параметрами (Parameter Problem)**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 12   | 0    | Parameter Problem - Pointer Indicates Error | Указатель указывает на ошибку |
| 12   | 1    | Parameter Problem - Missing Required Option | Отсутствует обязательная опция |
| 12   | 2    | Parameter Problem - Bad Length | Неверная длина |

### **Управление трафиком (Timestamp)**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 13   | 0    | Timestamp Request | Запрос временной метки |
| 14   | 0    | Timestamp Reply | Ответ с временной меткой |

### **Информационные запросы (устаревшие)**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 15   | 0    | Information Request | Информационный запрос (устаревший) |
| 16   | 0    | Information Reply | Информационный ответ (устаревший) |

### **Управление адресами (устаревшие)**

| Type | Code | Название        | Описание                                    |
| ---- | ---- | --------------- | ------------------------------------------- |
| 17   | 0    | Address Mask Request | Запрос маски адреса (устаревший) |
| 18   | 0    | Address Mask Reply | Ответ с маской адреса (устаревший) |

## **Детальная структура сообщений**

### **Echo Request/Reply (Type 8/0)**

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Identifier          |        Sequence Number        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Data (variable length)                                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Поля:**
- **Type**: 8 (Request) или 0 (Reply)
- **Code**: 0
- **Identifier**: Идентификатор процесса (обычно PID)
- **Sequence Number**: Номер последовательности
- **Data**: Данные для передачи (обычно timestamp)

### **Destination Unreachable (Type 3)**

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                             Unused                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      Internet Header + 64 bits of Original Data Datagram      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Поля:**
- **Type**: 3
- **Code**: Код причины недоступности (0-12)
- **Unused**: Не используется (должен быть 0)
- **Original Datagram**: Первые 64 бита исходного IP пакета

### **Time Exceeded (Type 11)**

Структура аналогична Destination Unreachable.

### **Redirect (Type 5)**

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                 Gateway Internet Address                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      Internet Header + 64 bits of Original Data Datagram      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Поля:**
- **Type**: 5
- **Code**: Тип перенаправления (0-3)
- **Gateway**: IP-адрес шлюза для перенаправления
- **Original Datagram**: Первые 64 бита исходного пакета

## **Примеры использования**

### **Ping (Echo Request/Reply)**

```bash
# Базовый ping
ping 8.8.8.8

# С указанием количества пакетов
ping -c 4 8.8.8.8

# С указанием размера пакета
ping -s 1000 8.8.8.8

# С интервалом
ping -i 2 8.8.8.8

# Вывод:
# PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
# 64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=12.3 ms
# 64 bytes from 8.8.8.8: icmp_seq=2 ttl=118 time=11.8 ms
```

**Что происходит:**
1. Отправляется ICMP Echo Request (Type 8)
2. Получатель отвечает ICMP Echo Reply (Type 0)
3. Измеряется время оборота (RTT)

### **Traceroute (Time Exceeded)**

```bash
# Базовый traceroute
traceroute google.com

# С указанием максимального количества прыжков
traceroute -m 30 google.com

# Вывод:
# traceroute to google.com (172.217.164.110), 30 hops max, 60 byte packets
#  1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.456 ms
#  2  10.0.0.1 (10.0.0.1)  5.678 ms  5.432 ms  5.890 ms
#  3  * * *
#  4  8.8.8.8 (8.8.8.8)  12.345 ms  12.123 ms  12.567 ms
```

**Как работает:**
1. Отправляется UDP пакет с TTL=1
2. Первый маршрутизатор отвечает ICMP Time Exceeded (Type 11)
3. TTL увеличивается до 2, процесс повторяется
4. Продолжается до достижения цели

### **Мониторинг ICMP трафика**

```bash
# Linux - tcpdump
sudo tcpdump -i eth0 icmp

# Только Echo Request
sudo tcpdump -i eth0 'icmp[0] == 8'

# Только Destination Unreachable
sudo tcpdump -i eth0 'icmp[0] == 3'

# Wireshark фильтры
icmp
icmp.type == 8
icmp.type == 3
icmp.code == 1
```

## **ICMP и безопасность**

### **ICMP атаки**

#### **1. Ping Flood (ICMP Flood)**

Отправка большого количества ICMP Echo Request пакетов.

**Защита:**
- Ограничение скорости ICMP запросов
- Блокировка ICMP на firewall
- Rate limiting

#### **2. Smurf Attack**

Отправка ICMP Echo Request на broadcast адрес с поддельным исходным IP.

**Механизм:**
```
1. Злоумышленник отправляет ICMP Echo Request:
   Source IP: IP жертвы
   Destination IP: Broadcast адрес сети
2. Все устройства отвечают жертве
3. Жертва получает лавину ответов
```

**Защита:**
- Отключение ответов на broadcast ping
- Фильтрация на маршрутизаторах
- Использование unicast только

#### **3. Ping of Death**

Пример:
```bash
ping -l 65510 example.com
```
Отправка ICMP пакета размером больше максимального.

**Защита:**
- Современные системы игнорируют такие пакеты
- Фильтрация на firewall

#### **4. ICMP Redirect Attack**

Отправка поддельных ICMP Redirect сообщений для изменения маршрутизации.

**Защита:**
- Игнорирование ICMP Redirect (по умолчанию в большинстве ОС)
- Фильтрация на firewall

### **Рекомендации по безопасности**

1. **Ограничение ICMP на периметре**
   ```bash
   # Блокировка входящих ICMP (кроме необходимых)
   iptables -A INPUT -p icmp --icmp-type echo-request -j DROP
   iptables -A INPUT -p icmp --icmp-type echo-reply -j ACCEPT
   iptables -A INPUT -p icmp --icmp-type destination-unreachable -j ACCEPT
   iptables -A INPUT -p icmp --icmp-type time-exceeded -j ACCEPT
   ```

2. **Rate Limiting**
   ```bash
   # Ограничение ping запросов
   iptables -A INPUT -p icmp --icmp-type echo-request -m limit --limit 1/s -j ACCEPT
   ```

3. **Отключение ответов на broadcast**
   ```bash
   # Linux
   sysctl -w net.ipv4.icmp_echo_ignore_broadcasts=1
   ```

## **ICMPv6 (для IPv6)**

ICMPv6 расширяет функциональность ICMP для IPv6 и включает:

### **Основные отличия**

| Характеристика | ICMPv4 | ICMPv6 |
| -------------- | ------ | ------ |
| **Протокол**   | Протокол 1 | Next Header 58 |
| **Функции**    | Диагностика, ошибки | Диагностика, ошибки, NDP |
| **NDP**        | Отдельный (ARP) | Встроен в ICMPv6 |

### **Типы ICMPv6 сообщений**

| Type | Название        | Описание                                    |
| ---- | --------------- | ------------------------------------------- |
| 1    | Destination Unreachable | Аналог ICMPv4 Type 3 |
| 2    | Packet Too Big  | Пакет слишком большой |
| 3    | Time Exceeded   | Аналог ICMPv4 Type 11 |
| 4    | Parameter Problem | Аналог ICMPv4 Type 12 |
| 128  | Echo Request    | Аналог ICMPv4 Type 8 |
| 129  | Echo Reply      | Аналог ICMPv4 Type 0 |
| 133  | Router Solicitation | Запрос информации о маршрутизаторе |
| 134  | Router Advertisement | Объявление маршрутизатора |
| 135  | Neighbor Solicitation | Запрос соседа (аналог ARP) |
| 136  | Neighbor Advertisement | Объявление соседа |

## **Диагностика с помощью ICMP**

### **Проверка доступности**

```bash
# Ping для проверки доступности
ping -c 1 192.168.1.1

# Если ответ получен - хост доступен
# Если нет ответа - возможные причины:
# - Хост выключен
# - Сеть недоступна
# - Firewall блокирует ICMP
```

### **Определение MTU (Path MTU Discovery)**

```bash
# Отправка пакета с DF флагом
ping -M do -s 1500 8.8.8.8

# Если получен ICMP "Fragmentation Needed" (Type 3, Code 4)
# - MTU пути меньше размера пакета
# - Нужно уменьшить размер пакета
```

### **Определение маршрута**

```bash
# Traceroute использует ICMP Time Exceeded
traceroute google.com

# mtr (комбинация ping и traceroute)
mtr google.com
```

## **Применение ICMP**

1. **Диагностика сети**
   - Ping для проверки доступности
   - Traceroute для определения маршрута
   - Path MTU Discovery

2. **Сообщения об ошибках**
   - Destination Unreachable
   - Time Exceeded
   - Parameter Problem

3. **Управление трафиком**
   - Source Quench (устаревший)
   - Redirect

4. **IPv6 функции**
   - Neighbor Discovery (NDP)
   - Router Discovery
   - Address Autoconfiguration

## **Ограничения и особенности**

1. **Не гарантирует доставку**
   - ICMP пакеты могут быть потеряны
   - Не влияет на работу приложений

2. **Может быть заблокирован**
   - Многие firewall блокируют ICMP
   - Может мешать диагностике

3. **Не для передачи данных**
   - ICMP не предназначен для передачи пользовательских данных
   - Используется только для служебных целей

4. **Rate Limiting**
   - Многие системы ограничивают частоту ICMP сообщений
   - Защита от атак

## **Сравнение с другими протоколами**

| Протокол | Уровень | Назначение | Надежность |
| -------- | ------- | ---------- | ---------- |
| **ICMP** | Сетевой | Диагностика, ошибки | Best-effort |
| **TCP**  | Транспортный | Надежная передача данных | Гарантированная |
| **UDP**  | Транспортный | Быстрая передача данных | Best-effort |
| **ARP**  | Канальный | Разрешение адресов | Best-effort |
