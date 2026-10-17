**LLMNR** (Link-Local Multicast Name Resolution) — протокол разрешения имён в локальном сегменте, разработанный Microsoft. Если DNS не смог найти имя, Windows отправляет multicast-запрос всем устройствам сегмента: «у кого имя FILESERVER?». LLMNR — преемник NetBIOS Name Service и аналог mDNS, но широко известен прежде всего как **источник уязвимостей**: на нём основаны атаки с перехватом NTLM-хэшей (Responder). Microsoft объявила о постепенном отказе от LLMNR.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP (запросы), TCP (большие ответы)                                      |
| **Порт**                    | 5355                                                                     |
| **Multicast-адрес**         | `224.0.0.252` (IPv4), `ff02::1:3` (IPv6)                                 |
| **Стандарт**                | RFC 4795 (информационный)                                                |
| **Формат**                  | Как у DNS-сообщений                                                      |
| **Платформы**               | Windows (с Vista), systemd-resolved в Linux                              |
| **Статус**                  | Устаревает, рекомендуется отключать                                      |

## **Порядок разрешения имён в Windows**

```
1. Файл hosts и кэш DNS
2. DNS-сервер
3. LLMNR (multicast 224.0.0.252:5355)        ← если DNS не нашёл имя
4. NetBIOS Name Service (broadcast UDP 137)  ← если LLMNR не ответил
5. mDNS (в новых версиях Windows)
```

Именно из-за этого порядка опечатка в имени (`\\fileserevr\share`) приводит к multicast-запросу, на который может ответить кто угодно.

## **Как работает LLMNR**

```
Клиент                              Сегмент (224.0.0.252:5355)
   |                                         |
   |--- Запрос: "FILESERVER A?" ------------>|  multicast
   |                                         |
   |<-- Ответ (unicast) от FILESERVER: 10.0.0.20
   |                                         |
   |--- Подключение к 10.0.0.20 ------------>|
```

### **Структура сообщения**

| Поле         | Описание                                                   |
| ------------ | ---------------------------------------------------------- |
| **ID**       | Идентификатор запроса                                      |
| **Flags**    | QR (запрос/ответ), OPCODE, **C** (конфликт), **TC** (усечено), **T** (tentative) |
| **QDCOUNT**  | Количество вопросов (1)                                    |
| **ANCOUNT**  | Количество ответов                                         |
| **Question** | Имя и тип (A, AAAA, PTR)                                   |
| **Answer**   | Записи ответа                                              |

Ответ отправляется **unicast** запрашивающему. Ответчик должен отвечать только за свои имена — но протокол никак этого не проверяет.

## **Атака LLMNR/NBT-NS Poisoning**

Классическая атака внутренней сети (MITRE ATT&CK T1557.001):

```
Жертва                    Злоумышленник (Responder)         DNS
   |                               |                          |
   |--- DNS: fileserevr? ---------------------------------->|
   |<-- NXDOMAIN ------------------------------------------- |
   |--- LLMNR: fileserevr? (multicast)                       |
   |<-- "Это я! 10.0.0.66" --------|                          |
   |--- SMB-подключение ---------->|                          |
   |<-- Запрос NTLM-аутентификации |                          |
   |--- NetNTLMv2 хэш ------------>|  ← захвачен              |
```

После этого злоумышленник может:
1. **Подобрать пароль** офлайн по NetNTLMv2-хэшу (hashcat, режим 5600)
2. **Выполнить NTLM Relay** — переслать аутентификацию на другой сервер (если нет SMB Signing) и получить доступ от имени жертвы

### **Типичные источники запросов**

- Опечатки в путях к общим папкам
- Устаревшие ярлыки и подключённые диски на несуществующие серверы
- **WPAD** — браузер ищет `wpad` для автонастройки прокси
- Приложения, пытающиеся подключиться к выключенным серверам

## **Примеры использования**

### **Проверка, включён ли LLMNR (Windows)**

```powershell
Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Name EnableMulticast -ErrorAction SilentlyContinue
# 0 = отключён; нет значения = включён по умолчанию
```

### **Linux (systemd-resolved)**

```bash
resolvectl llmnr eth0 no       # отключить на интерфейсе
resolvectl status | grep -i llmnr

# /etc/systemd/resolved.conf
[Resolve]
LLMNR=no
```

### **Обнаружение запросов в сети**

```bash
tcpdump -i eth0 -n udp port 5355
```

**Wireshark:**
```
llmnr
udp.port == 5355
```

### **Аудит (для авторизованного тестирования на проникновение)**

```bash
# Режим анализа — только слушать, не отвечать
responder -I eth0 -A
```

Анализ показывает, какие хосты и какие имена запрашивают через LLMNR/NBT-NS, — это список того, что нужно исправить.

## **Отключение LLMNR**

### **Групповая политика (рекомендуется)**

```
Конфигурация компьютера
 → Административные шаблоны
   → Сеть
     → DNS-клиент
       → «Отключить многоадресное разрешение имён» = Включено
```

### **Реестр**

```powershell
New-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Force
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Name EnableMulticast -Value 0 -Type DWord
```

### **Вместе с LLMNR отключить NetBIOS over TCP/IP**

```powershell
Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=true" |
    Invoke-CimMethod -MethodName SetTcpipNetbios -Arguments @{TcpipNetbiosOptions = 2}
```

Или через DHCP: опция Microsoft **001** (Disable NetBIOS over TCP/IP).

## **Комплексная защита от атак на разрешение имён**

| Мера                                 | Защищает от                         |
| ------------------------------------ | ----------------------------------- |
| Отключить LLMNR                      | LLMNR poisoning                     |
| Отключить NetBIOS-NS                 | NBT-NS poisoning                    |
| Ограничить mDNS                      | mDNS poisoning                      |
| Запись `wpad` в DNS / отключить WPAD | Перехват автонастройки прокси       |
| **SMB Signing** обязательно          | NTLM Relay на SMB                   |
| **LDAP Signing и Channel Binding**   | NTLM Relay на LDAP                  |
| **EPA** для HTTP-сервисов            | NTLM Relay на веб                   |
| Отказ от NTLM в пользу Kerberos      | Перехват и relay NTLM в целом       |
| Сложные пароли                       | Офлайн-подбор хэшей                 |
| IDS-правила на ответы LLMNR          | Обнаружение атакующего              |

## **Сравнение LLMNR, mDNS и NetBIOS-NS**

| Характеристика      | LLMNR                | mDNS                  | NetBIOS-NS             |
| ------------------- | -------------------- | --------------------- | ---------------------- |
| **Порт**            | UDP 5355             | UDP 5353              | UDP 137                |
| **Рассылка**        | Multicast            | Multicast             | Broadcast              |
| **Ответ**           | Unicast              | Обычно multicast      | Unicast                |
| **IPv6**            | Да                   | Да                    | Нет                    |
| **Имена**           | Одно слово           | `*.local`             | 15 символов            |
| **Обнаружение сервисов** | Нет             | Да (DNS-SD)           | Нет                    |
| **Будущее**         | Отключается Microsoft | Продвигается вместо LLMNR | Устарел            |
