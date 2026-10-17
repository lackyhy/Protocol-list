**PPPoE** (Point-to-Point Protocol over Ethernet) — протокол, который передаёт PPP-сессии поверх Ethernet. Он позволяет провайдеру использовать преимущества PPP — аутентификацию по логину и паролю, выдачу IP-адреса, учёт трафика и отключение должников — в сетях на базе Ethernet (DSL, FTTB, FTTH). Именно поэтому во многих домашних роутерах нужно вводить «логин и пароль от интернета».

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Канальный (Data Link Layer)                                              |
| **Стандарт**                | RFC 2516                                                                 |
| **EtherType**               | `0x8863` (Discovery), `0x8864` (Session)                                 |
| **Накладные расходы**       | 8 байт (6 — PPPoE + 2 — PPP Protocol ID)                                 |
| **MTU**                     | 1492 байта (1500 − 8)                                                    |
| **Аутентификация**          | PPP: PAP, CHAP, MS-CHAPv2                                                |
| **Сервер**                  | BRAS / BNG (Broadband Network Gateway) провайдера, часто + RADIUS        |

## **Участники**

| Участник                    | Описание                                         |
| --------------------------- | ------------------------------------------------ |
| **Host (клиент)**           | Роутер абонента или компьютер                    |
| **Access Concentrator (AC)** | BRAS/BNG провайдера — завершает PPP-сессии      |
| **RADIUS**                  | Проверяет логин и пароль, выдаёт параметры       |

## **Этапы работы**

PPPoE состоит из двух стадий: **Discovery** (поиск сервера) и **Session** (передача PPP).

### **1. Discovery**

| Пакет     | Код  | Направление          | Описание                                       |
| --------- | ---- | -------------------- | ---------------------------------------------- |
| **PADI**  | 0x09 | Клиент → broadcast   | Initiation — «Есть здесь концентраторы?»       |
| **PADO**  | 0x07 | AC → клиент          | Offer — «Я концентратор такой-то»              |
| **PADR**  | 0x19 | Клиент → AC (unicast) | Request — «Выбираю тебя»                      |
| **PADS**  | 0x65 | AC → клиент          | Session-confirmation — выдан Session ID        |
| **PADT**  | 0xA7 | Любая сторона        | Terminate — закрытие сессии                    |

```
Клиент                                      BRAS (AC)
  |                                             |
  |--- PADI (broadcast ff:ff:ff:ff:ff:ff) ----->|
  |<-- PADO (AC-Name, Service-Name) ------------|
  |--- PADR ----------------------------------->|
  |<-- PADS (Session ID = 0x1A2B) --------------|
  |                                             |
  |=========== Session stage (0x8864) =========>|
  |--- LCP Configure-Request (MRU 1492) ------->|
  |<-- LCP Configure-Ack -----------------------|
  |--- CHAP / PAP (логин, пароль) ------------->|  → RADIUS
  |<-- Success ---------------------------------|
  |--- IPCP (запрос IP) ----------------------->|
  |<-- IPCP (IP 100.64.12.34, DNS) -------------|
  |--- IPv6CP + DHCPv6-PD (префикс /56) ------->|
  |<========== IP-трафик ======================>|
  |                                             |
  |--- PADT ----------------------------------->|  закрытие
```

### **2. Session**

После PADS все кадры имеют EtherType `0x8864` и Session ID. Внутри — обычные кадры PPP: LCP (keepalive — LCP Echo), аутентификация, IPCP/IPv6CP, данные.

## **Структура заголовка PPPoE**

| Поле             | Размер   | Описание                                     |
| ---------------- | -------- | -------------------------------------------- |
| **Version**      | 4 бита   | 1                                            |
| **Type**         | 4 бита   | 1                                            |
| **Code**         | 1 байт   | Тип пакета (PADI, PADO… или 0x00 для данных) |
| **Session ID**   | 2 байта  | Идентификатор сессии (0 на этапе Discovery)  |
| **Length**       | 2 байта  | Длина полезной нагрузки                      |
| **Payload**      | —        | Теги Discovery или PPP-кадр                  |

### **Теги Discovery**

| Тег      | Название              | Описание                                       |
| -------- | --------------------- | ---------------------------------------------- |
| 0x0101   | Service-Name          | Имя сервиса (обычно пустое)                    |
| 0x0102   | AC-Name               | Имя концентратора                              |
| 0x0103   | Host-Uniq             | Уникальный ID клиента для сопоставления ответов |
| 0x0104   | AC-Cookie             | Защита от DoS                                  |
| 0x0105   | Vendor-Specific       | Атрибуты вендора (Circuit-ID, Remote-ID)       |
| 0x0120   | PPP-Max-Payload       | MTU больше 1492 (RFC 4638, «baby jumbo»)       |
| 0x0201   | Service-Name-Error    | Ошибка сервиса                                 |
| 0x0203   | Generic-Error         | Общая ошибка                                   |

## **Проблема MTU**

```
Ethernet MTU:   1500
PPPoE:          − 8
PPPoE MTU:      1492
TCP MSS:        1492 − 40 = 1452
```

Если в сети блокируется ICMP, PMTUD не работает, и некоторые сайты «зависают» при загрузке. Решение — **MSS clamping** на роутере. RFC 4638 позволяет MTU 1500 внутри PPPoE, если сеть поддерживает кадры 1508 байт.

## **Примеры конфигурации**

### **Linux (pppd + rp-pppoe)**

```
# /etc/ppp/peers/provider
plugin rp-pppoe.so eth0
user "login@isp"
noauth
defaultroute
replacedefaultroute
persist
maxfail 0
mtu 1492
mru 1492
usepeerdns
+ipv6

# /etc/ppp/chap-secrets
"login@isp" * "password"
```

```bash
pon provider
plog          # лог соединения
poff provider

# MSS clamping
iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu
```

### **OpenWrt**

```
# /etc/config/network
config interface 'wan'
    option device 'eth0.2'
    option proto 'pppoe'
    option username 'login@isp'
    option password 'password'
    option ipv6 'auto'
```

### **MikroTik RouterOS**

```
/interface pppoe-client add name=pppoe-out1 interface=ether1 user=login@isp \
    password=password add-default-route=yes use-peer-dns=yes disabled=no
/ip firewall mangle add chain=forward protocol=tcp tcp-flags=syn \
    action=change-mss new-mss=clamp-to-pmtu passthrough=yes
```

### **Windows**

Подключение создаётся в «Параметры → Сеть и Интернет → Набор номера → Настройка нового подключения → Высокоскоростное (PPPoE)», после чего его можно поднимать из командной строки:

```powershell
rasdial "Высокоскоростное подключение" login@isp password
rasdial "Высокоскоростное подключение" /disconnect
```

### **Поиск PPPoE-серверов в сети**

```bash
pppoe-discovery -I eth0
```

### **Wireshark**

```
pppoed           # Discovery
pppoes           # Session
pppoed.code == 0x09
```

## **Использование провайдерами**

| Функция                | Как реализуется                                     |
| ---------------------- | --------------------------------------------------- |
| **Аутентификация**     | Логин/пароль через RADIUS                           |
| **Тарифы и скорость**  | RADIUS передаёт ограничения (shaping) для сессии    |
| **Учёт трафика**       | RADIUS Accounting                                   |
| **Отключение должников** | RADIUS CoA / Disconnect, перенаправление на страницу оплаты |
| **IPv6**               | IPv6CP + DHCPv6 Prefix Delegation                   |
| **Привязка к порту**   | Option 82 / PPPoE Intermediate Agent (Circuit-ID)   |

## **Безопасность**

### **Угрозы**

1. **Rogue PPPoE Server** — поддельный концентратор отвечает на PADI раньше настоящего и получает пароль (особенно при PAP)
2. **PADI Flood** — DoS на BRAS
3. **Перехват PAP** — пароль передаётся открыто

### **Защита**

- CHAP вместо PAP
- **PPPoE Intermediate Agent** — коммутатор добавляет метку порта, фильтрует PADO с клиентских портов
- Изоляция абонентов (port isolation / PVLAN)
- AC-Cookie против DoS

## **Сравнение PPPoE и IPoE (DHCP)**

| Характеристика       | PPPoE                       | IPoE (DHCP + Option 82)       |
| -------------------- | --------------------------- | ----------------------------- |
| **Аутентификация**   | Логин и пароль              | По порту/MAC/VLAN             |
| **MTU**              | 1492                        | 1500                          |
| **Накладные расходы** | 8 байт на пакет            | Нет                           |
| **Настройка у клиента** | Нужны логин и пароль     | Подключил — работает          |
| **Нагрузка на BRAS** | Выше (терминация PPP)       | Ниже                          |
| **Тенденция**        | Постепенно вытесняется      | Набирает популярность         |
