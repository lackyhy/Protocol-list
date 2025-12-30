**DHCP** (Dynamic Host Configuration Protocol) — протокол для автоматического назначения IP-адресов и других сетевых параметров устройствам при подключении к сети. DHCP упрощает управление сетью, устраняя необходимость ручной настройки каждого устройства.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP (порт 67 - сервер, порт 68 - клиент)                                |
| **Тип протокола**           | Broadcast/Unicast запросы-ответы                                         |
| **Назначение**              | Автоматическая конфигурация сетевых параметров                           |
| **Версии**                  | DHCPv4 (для IPv4), DHCPv6 (для IPv6)                                   |
| **Аренда**                  | Временное назначение адресов (lease)                                     |

## **Структура DHCP сообщения**

| Поле                    | Размер (байты) | Описание                                    |
| ----------------------- | -------------- | ------------------------------------------- |
| **Opcode**              | 1              | Тип сообщения (1=Request, 2=Reply)           |
| **Hardware Type**       | 1              | Тип аппаратуры (1=Ethernet)                 |
| **Hardware Length**     | 1              | Длина аппаратного адреса (6 для MAC)        |
| **Hops**                | 1              | Количество промежуточных ретрансляторов      |
| **Transaction ID**       | 4              | Идентификатор транзакции                    |
| **Seconds**             | 2              | Секунды с начала процесса                    |
| **Flags**               | 2              | Флаги (broadcast и др.)                     |
| **Client IP Address**   | 4              | IP-адрес клиента                            |
| **Your IP Address**     | 4              | IP-адрес, предлагаемый клиенту              |
| **Server IP Address**   | 4              | IP-адрес DHCP сервера                       |
| **Gateway IP Address**  | 4              | IP-адрес шлюза (для ретрансляции)           |
| **Client Hardware Address** | 16        | MAC-адрес клиента                           |
| **Server Name**         | 64             | Имя сервера (опционально)                    |
| **Boot File Name**      | 128            | Имя файла загрузки (опционально)            |
| **Options**             | Переменная     | DHCP опции (минимум 312 байт)               |

**Размер сообщения:** Минимум 576 байт (для совместимости с BOOTP)

## **DHCP опции (Options)**

### **Основные опции**

| Код | Название        | Описание                                    | Пример                                    |
| --- | --------------- | ------------------------------------------- | ----------------------------------------- |
| 1   | Subnet Mask     | Маска подсети                               | 255.255.255.0                             |
| 3   | Router          | Адрес шлюза по умолчанию                    | 192.168.1.1                               |
| 6   | DNS Servers     | Адреса DNS серверов                         | 8.8.8.8, 8.8.4.4                          |
| 15  | Domain Name     | Имя домена                                  | example.com                               |
| 51  | IP Address Lease Time | Время аренды IP-адреса (секунды)      | 86400 (1 день)                            |
| 53  | DHCP Message Type | Тип DHCP сообщения                        | 1=Discover, 2=Offer, 3=Request, 5=Ack   |
| 54  | Server Identifier | Идентификатор DHCP сервера              | IP-адрес сервера                          |
| 58  | Renewal Time    | Время обновления аренды (T1)               | 43200 (12 часов)                          |
| 59  | Rebinding Time  | Время перепривязки (T2)                    | 75600 (21 час)                            |
| 82  | Relay Agent Information | Информация от ретранслятора          | Опции ретранслятора                       |

## **Процесс получения IP-адреса (DORA)**

### **1. Discover (Обнаружение)**

Клиент отправляет DHCP Discover (broadcast):

```
Client → Broadcast: DHCP Discover
- Client MAC: AA:BB:CC:DD:EE:FF
- Transaction ID: 0x12345678
- Option 53: DHCP Discover
```

**Характеристики:**
- Broadcast на 255.255.255.255
- Source IP: 0.0.0.0
- Destination IP: 255.255.255.255
- Source Port: 68
- Destination Port: 67

### **2. Offer (Предложение)**

DHCP сервер отвечает DHCP Offer:

```
Server → Client: DHCP Offer
- Your IP: 192.168.1.100
- Server IP: 192.168.1.1
- Option 1 (Subnet Mask): 255.255.255.0
- Option 3 (Router): 192.168.1.1
- Option 6 (DNS): 8.8.8.8
- Option 51 (Lease Time): 86400
- Option 54 (Server ID): 192.168.1.1
```

**Характеристики:**
- Unicast или Broadcast (зависит от флагов)
- Может быть несколько Offer от разных серверов

### **3. Request (Запрос)**

Клиент отправляет DHCP Request:

```
Client → Broadcast: DHCP Request
- Client MAC: AA:BB:CC:DD:EE:FF
- Transaction ID: 0x12345678
- Option 50 (Requested IP): 192.168.1.100
- Option 54 (Server ID): 192.168.1.1
- Option 53: DHCP Request
```

**Характеристики:**
- Broadcast (уведомляет все серверы)
- Указывает выбранный сервер и IP

### **4. Acknowledgment (Подтверждение)**

DHCP сервер подтверждает DHCP ACK:

```
Server → Client: DHCP ACK
- Your IP: 192.168.1.100
- Option 1 (Subnet Mask): 255.255.255.0
- Option 3 (Router): 192.168.1.1
- Option 6 (DNS): 8.8.8.8
- Option 51 (Lease Time): 86400
- Option 58 (Renewal Time): 43200
- Option 59 (Rebinding Time): 75600
```

**После ACK:**
- Клиент получает IP-адрес
- Настраивает сетевой интерфейс
- Начинает использовать сеть

## **Обновление аренды (Renewal)**

### **Процесс обновления**

```
1. T1 (50% времени аренды) - Renewal Time
   Клиент → Server (Unicast): DHCP Request
   Server → Client: DHCP ACK (обновление аренды)

2. T2 (87.5% времени аренды) - Rebinding Time
   Если обновление не удалось:
   Клиент → Broadcast: DHCP Request
   Любой сервер → Client: DHCP ACK

3. Истечение аренды
   Если обновление не удалось:
   Клиент освобождает IP-адрес
   Начинает процесс DORA заново
```

**Пример временных интервалов:**
- **Lease Time**: 86400 сек (1 день)
- **T1 (Renewal)**: 43200 сек (12 часов) - 50%
- **T2 (Rebinding)**: 75600 сек (21 час) - 87.5%

## **Освобождение IP-адреса (Release)**

Клиент может явно освободить IP-адрес:

```
Client → Server (Unicast): DHCP Release
- Client IP: 192.168.1.100
- Option 54 (Server ID): 192.168.1.1
- Option 53: DHCP Release
```

**После Release:**
- Сервер освобождает IP-адрес
- Адрес может быть назначен другому клиенту

## **Типы DHCP сообщений**

| Тип | Название        | Описание                                    |
| --- | --------------- | ------------------------------------------- |
| 1   | DHCP Discover   | Клиент ищет DHCP сервер                     |
| 2   | DHCP Offer      | Сервер предлагает конфигурацию              |
| 3   | DHCP Request    | Клиент запрашивает конфигурацию              |
| 4   | DHCP Decline    | Клиент отклоняет предложение                |
| 5   | DHCP ACK         | Сервер подтверждает конфигурацию            |
| 6   | DHCP NAK         | Сервер отклоняет запрос                     |
| 7   | DHCP Release     | Клиент освобождает IP-адрес                 |
| 8   | DHCP Inform      | Клиент запрашивает только опции (уже имеет IP) |

## **DHCP сервер**

### **Настройка (Linux - isc-dhcp-server)**

```bash
# Установка
sudo apt-get install isc-dhcp-server

# Конфигурация /etc/dhcp/dhcpd.conf
subnet 192.168.1.0 netmask 255.255.255.0 {
    range 192.168.1.100 192.168.1.200;
    option routers 192.168.1.1;
    option domain-name-servers 8.8.8.8, 8.8.4.4;
    option domain-name "example.com";
    default-lease-time 86400;
    max-lease-time 172800;
}

# Статическая аренда
host server1 {
    hardware ethernet 00:11:22:33:44:55;
    fixed-address 192.168.1.50;
}

# Запуск
sudo systemctl start isc-dhcp-server
sudo systemctl enable isc-dhcp-server
```

### **Проверка конфигурации**

```bash
# Проверка синтаксиса
dhcpd -t

# Просмотр логов
tail -f /var/log/syslog | grep dhcp

# Статус
sudo systemctl status isc-dhcp-server
```

## **DHCP клиент**

### **Linux**

```bash
# Получение IP через DHCP
sudo dhclient eth0

# Освобождение IP
sudo dhclient -r eth0

# Обновление аренды
sudo dhclient eth0

# Просмотр информации
cat /var/lib/dhcp/dhclient.leases
```

### **Windows**

```powershell
# Получение IP
ipconfig /renew

# Освобождение IP
ipconfig /release

# Просмотр информации
ipconfig /all
```

## **DHCP Relay (Ретранслятор)**

Для работы DHCP через маршрутизаторы используется DHCP Relay.

### **Настройка (Linux)**

```bash
# Установка
sudo apt-get install isc-dhcp-relay

# Конфигурация /etc/default/isc-dhcp-relay
SERVERS="192.168.1.1"
INTERFACES="eth0 eth1"

# Запуск
sudo systemctl start isc-dhcp-relay
```

**Принцип работы:**
1. Клиент отправляет Discover (broadcast)
2. Relay Agent получает и пересылает на DHCP сервер (unicast)
3. Сервер отвечает Relay Agent
4. Relay Agent пересылает ответ клиенту

## **Резервирование адресов**

### **Статические аренды**

Резервирование IP-адреса для конкретного MAC-адреса:

```bash
# /etc/dhcp/dhcpd.conf
host printer {
    hardware ethernet 00:AA:BB:CC:DD:EE;
    fixed-address 192.168.1.100;
    option host-name "printer";
}
```

## **Мониторинг DHCP**

### **Просмотр активных аренд**

```bash
# Linux - isc-dhcp-server
cat /var/lib/dhcp/dhcpd.leases

# Формат записи:
# lease 192.168.1.100 {
#   starts 4 2024/01/01 12:00:00;
#   ends 5 2024/01/02 12:00:00;
#   hardware ethernet 00:11:22:33:44:55;
#   client-hostname "client1";
# }
```

### **Мониторинг трафика**

```bash
# tcpdump - DHCP трафик
sudo tcpdump -i eth0 port 67 or port 68

# Только Discover
sudo tcpdump -i eth0 'udp port 67 and udp[8] == 1'

# Wireshark фильтры
bootp
dhcp
dhcp.option.dhcp == 1  # Discover
dhcp.option.dhcp == 2  # Offer
```

## **Безопасность DHCP**

### **Угрозы**

1. **Rogue DHCP Server** — поддельный DHCP сервер
2. **DHCP Starvation** — исчерпание пула адресов
3. **Man-in-the-Middle** — перехват трафика

### **Защита**

1. **DHCP Snooping** (на коммутаторах)
   - Фильтрация DHCP сообщений
   - Разрешение только доверенным портам

2. **Dynamic ARP Inspection (DAI)**
   - Проверка ARP сообщений
   - Использует информацию из DHCP Snooping

3. **IP Source Guard**
   - Фильтрация по IP-адресам
   - Использует информацию из DHCP

4. **802.1X Authentication**
   - Аутентификация перед получением IP
   - Защита от несанкционированного доступа

## **DHCPv6 (для IPv6)**

### **Основные отличия**

| Характеристика | DHCPv4 | DHCPv6 |
| -------------- | ------ | ------ |
| **Транспорт**  | UDP    | UDP    |
| **Порты**      | 67/68  | 546/547 |
| **Адресация**  | IPv4   | IPv6   |
| **SLAAC**      | Нет    | Да (альтернатива) |

### **Типы DHCPv6**

1. **Stateful DHCPv6** — сервер назначает адреса
2. **Stateless DHCPv6** — только опции (адреса через SLAAC)

## **Оптимизация DHCP**

### **Рекомендации**

1. **Размер пула адресов**
   - Достаточный для всех устройств
   - Резерв для новых устройств

2. **Время аренды**
   - Короткое (1-4 часа) для мобильных устройств
   - Длинное (1-7 дней) для стационарных

3. **Резервирование**
   - Для критичных устройств
   - Серверы, принтеры, сетевые устройства

4. **Мониторинг**
   - Отслеживание использования пула
   - Предупреждения при нехватке адресов

## **Применение DHCP**

1. **Домашние сети** — автоматическая настройка устройств
2. **Корпоративные сети** — централизованное управление
3. **Публичные Wi-Fi** — быстрая настройка клиентов
4. **Мобильные сети** — динамическое назначение адресов
5. **Виртуальные сети** — автоматизация в облаках

## **Ограничения DHCP**

1. **Зависимость от сервера** — при отказе сервера новые устройства не получат IP
2. **Broadcast трафик** — может перегружать сеть
3. **Безопасность** — требует дополнительных мер защиты
4. **Задержка** — процесс DORA занимает время

## **Альтернативы DHCP**

1. **Статическая настройка** — ручная конфигурация
2. **APIPA** (Windows) — автоматические адреса 169.254.0.0/16
3. **SLAAC** (IPv6) — Stateless Address Autoconfiguration
4. **Zeroconf/Bonjour** — автоматическая конфигурация в локальных сетях
