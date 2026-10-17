**ICMPv6** (Internet Control Message Protocol for IPv6) — служебный протокол для IPv6, отвечающий за сообщения об ошибках и диагностику. В отличие от ICMP в IPv4, ICMPv6 берёт на себя гораздо больше функций: обнаружение соседей (NDP, замена ARP), управление multicast-группами (MLD, замена IGMP) и автоконфигурацию адресов.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Сетевой (Network Layer)                                                  |
| **Стандарт**                | RFC 4443                                                                 |
| **Инкапсуляция**            | IPv6, Next Header = 58                                                   |
| **Назначение**              | Ошибки, диагностика, NDP, MLD                                            |
| **Блокировка**              | Полностью блокировать нельзя — IPv6 перестанет работать                  |

## **Структура ICMPv6 сообщения**

| Поле           | Размер (байты) | Описание                                         |
| -------------- | -------------- | ------------------------------------------------ |
| **Type**       | 1              | Тип сообщения                                    |
| **Code**       | 1              | Уточнение типа                                   |
| **Checksum**   | 2              | Контрольная сумма (с учётом псевдозаголовка IPv6) |
| **Message Body** | Переменный   | Содержимое зависит от типа                       |

Типы делятся на две группы:
- **0–127** — сообщения об ошибках
- **128–255** — информационные сообщения

## **Сообщения об ошибках**

| Type | Название                     | Code | Описание                                       |
| ---- | ---------------------------- | ---- | ---------------------------------------------- |
| 1    | Destination Unreachable      | 0    | Нет маршрута до получателя                     |
|      |                              | 1    | Связь запрещена администратором (файрвол)      |
|      |                              | 2    | За пределами области действия адреса источника |
|      |                              | 3    | Адрес недоступен                               |
|      |                              | 4    | Порт недоступен                                |
|      |                              | 5    | Адрес источника не прошёл политику             |
|      |                              | 6    | Маршрут отклонён                               |
| 2    | Packet Too Big               | 0    | Пакет больше MTU канала (используется PMTUD)   |
| 3    | Time Exceeded                | 0    | Hop Limit достиг нуля в пути                   |
|      |                              | 1    | Время сборки фрагментов истекло                |
| 4    | Parameter Problem            | 0    | Ошибка в поле заголовка                        |
|      |                              | 1    | Неизвестный тип Next Header                    |
|      |                              | 2    | Неизвестная опция IPv6                         |

## **Информационные сообщения**

| Type | Название                          | Протокол | Описание                                     |
| ---- | --------------------------------- | -------- | -------------------------------------------- |
| 128  | Echo Request                      | ping     | Запрос эха                                   |
| 129  | Echo Reply                        | ping     | Ответ эха                                    |
| 130  | Multicast Listener Query          | MLD      | Запрос участников multicast-групп            |
| 131  | Multicast Listener Report         | MLDv1    | Сообщение о подписке на группу               |
| 132  | Multicast Listener Done           | MLDv1    | Выход из группы                              |
| 133  | Router Solicitation (RS)          | NDP      | Запрос маршрутизатора                        |
| 134  | Router Advertisement (RA)         | NDP      | Объявление маршрутизатора (префикс, шлюз)    |
| 135  | Neighbor Solicitation (NS)        | NDP      | Запрос MAC-адреса соседа, проверка DAD       |
| 136  | Neighbor Advertisement (NA)       | NDP      | Ответ с MAC-адресом                          |
| 137  | Redirect                          | NDP      | Перенаправление на лучший шлюз               |
| 143  | Multicast Listener Report v2      | MLDv2    | Подписка с фильтрацией по источнику          |

## **Функции ICMPv6**

### **Диагностика**

- **ping** — Echo Request / Echo Reply (типы 128/129)
- **traceroute** — использует Time Exceeded (тип 3)

### **Path MTU Discovery**

```
Отправитель                Маршрутизатор (MTU 1400)           Получатель
    |                              |                               |
    |--- Пакет 1500 байт -------->|                               |
    |<-- Packet Too Big (MTU=1400)|                               |
    |                              |                               |
    |--- Пакет 1400 байт -------->|--- Пакет 1400 байт ---------->|
```

### **NDP (Neighbor Discovery Protocol)**

Типы 133–137 образуют протокол NDP, который заменяет ARP, ICMP Router Discovery и ICMP Redirect. Подробнее — в [NDP](NDP.md).

### **MLD (Multicast Listener Discovery)**

MLD — аналог IGMP для IPv6. Хосты сообщают маршрутизатору, на какие multicast-группы они подписаны.

| Версия    | Аналог в IPv4 | Особенности                         |
| --------- | ------------- | ----------------------------------- |
| **MLDv1** | IGMPv2        | Подписка на группу                  |
| **MLDv2** | IGMPv3        | Подписка с выбором источника (SSM)  |

## **Фильтрация ICMPv6 (RFC 4890)**

Блокировать ICMPv6 целиком нельзя. Минимальный набор, который нужно разрешать:

| Тип      | Сообщение               | Почему нужно                          |
| -------- | ----------------------- | ------------------------------------- |
| 1        | Destination Unreachable | Корректные ошибки соединения          |
| 2        | Packet Too Big          | Без него ломается PMTUD               |
| 3        | Time Exceeded           | traceroute и диагностика              |
| 4        | Parameter Problem       | Сообщения об ошибках заголовка        |
| 128/129  | Echo Request/Reply      | Диагностика (можно ограничить)        |
| 133–137  | NDP                     | Без него не работает сеть в сегменте  |
| 130–132, 143 | MLD                 | Multicast в локальной сети            |

### **Пример для ip6tables**

```bash
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type destination-unreachable -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type packet-too-big -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type time-exceeded -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type parameter-problem -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type echo-request -m limit --limit 10/s -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type router-advertisement -m hl --hl-eq 255 -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type neighbor-solicitation -m hl --hl-eq 255 -j ACCEPT
ip6tables -A INPUT -p ipv6-icmp --icmpv6-type neighbor-advertisement -m hl --hl-eq 255 -j ACCEPT
```

Сообщения NDP всегда отправляются с **Hop Limit = 255**. Если пришло с меньшим значением — пакет пришёл из другой сети и его нужно отбросить.

## **Примеры использования**

### **ping**

```bash
# Linux / macOS
ping -6 2001:4860:4860::8888
ping6 ipv6.google.com

# Пинг всех узлов в сегменте (link-local multicast)
ping -6 ff02::1%eth0

# Windows
ping -6 2001:4860:4860::8888
```

### **traceroute**

```bash
traceroute -6 google.com
tracert -6 google.com
mtr -6 google.com
```

### **Захват трафика**

```bash
tcpdump -i eth0 icmp6
tcpdump -i eth0 'icmp6 and ip6[40] == 134'   # только Router Advertisement
```

**Фильтр Wireshark:**
```
icmpv6
icmpv6.type == 135
```

## **Безопасность ICMPv6**

### **Угрозы**

1. **Rogue RA** — подмена маршрутизатора по умолчанию
2. **NS/NA Spoofing** — перехват трафика (MITM), аналог ARP Spoofing
3. **DAD DoS** — атакующий отвечает на каждую проверку DAD, узел не может получить адрес
4. **RA Flood** — массовая рассылка RA с тысячами префиксов (перегрузка хостов)
5. **Redirect-атаки** — перенаправление трафика через атакующего

### **Защита**

- **RA Guard** (RFC 6105) на коммутаторах
- **SEND** (Secure Neighbor Discovery, RFC 3971) — криптографическая защита NDP, редко внедряется
- Проверка Hop Limit = 255
- Ограничение частоты (rate limiting) ICMPv6

## **Сравнение с ICMP (IPv4)**

| Функция                | IPv4                     | IPv6                     |
| ---------------------- | ------------------------ | ------------------------ |
| **Ошибки и ping**      | ICMP                     | ICMPv6                   |
| **Разрешение адресов** | ARP (отдельный протокол) | NDP (внутри ICMPv6)      |
| **Multicast-группы**   | IGMP (отдельный протокол) | MLD (внутри ICMPv6)     |
| **Поиск маршрутизатора** | ICMP Router Discovery (редко) | RS/RA (обязательно) |
| **Номер протокола**    | 1                        | 58                       |
| **Блокировка**         | Возможна (с потерями PMTUD) | Нельзя                |
