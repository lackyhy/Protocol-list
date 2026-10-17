**mDNS** (Multicast DNS) — протокол разрешения имён в локальной сети без DNS-сервера: устройства отвечают на запросы о своих именах вида `printer.local` через multicast. **DNS-SD** (DNS-Based Service Discovery) — способ находить сервисы (принтеры, AirPlay, Chromecast, общие папки) с помощью обычных DNS-записей. Вместе они образуют **Zero Configuration Networking** (Zeroconf), известный как Apple **Bonjour** и Linux **Avahi**.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP                                                                      |
| **Порт**                    | 5353 (и источник, и назначение)                                          |
| **Multicast-адрес**         | `224.0.0.251` (IPv4), `ff02::fb` (IPv6)                                  |
| **Домен**                   | `.local`                                                                 |
| **Стандарты**               | RFC 6762 (mDNS), RFC 6763 (DNS-SD)                                       |
| **TTL пакетов IP**          | 255 (не маршрутизируется за пределы сегмента)                            |
| **Реализации**              | Bonjour (Apple, Windows), Avahi (Linux), systemd-resolved, Windows 10+   |

## **Как работает mDNS**

```
Ноутбук                                   Сеть (224.0.0.251:5353)
   |                                               |
   |--- Запрос: "printer.local A?" --------------->|  всем в сегменте
   |                                               |
   |<-- Ответ от принтера: printer.local A 192.168.1.50 (multicast)
   |                                               |
   |   Все устройства в сети кэшируют ответ        |
```

### **Особенности mDNS**

| Особенность              | Описание                                                       |
| ------------------------ | -------------------------------------------------------------- |
| **Нет сервера**          | Каждое устройство отвечает за свои имена                       |
| **Probing**              | Перед использованием имени устройство проверяет, что оно свободно (3 запроса) |
| **Announcing**           | После занятия имени устройство объявляет о нём                 |
| **Конфликт имён**        | Устройство переименовывается: `printer-2.local`                |
| **Known-Answer Suppression** | Клиент перечисляет уже известные ответы, чтобы их не повторяли |
| **Cache-flush бит**      | Ответ заменяет старые записи в кэше                            |
| **Goodbye-пакет**        | Запись с TTL = 0 при отключении устройства                     |
| **QU-бит**               | Запрос «ответь мне unicast»                                    |

## **Как работает DNS-SD**

DNS-SD использует три типа записей в цепочке:

```
1. PTR — какие экземпляры сервиса есть?
   _ipp._tcp.local.  PTR  Office Printer._ipp._tcp.local.

2. SRV — где находится экземпляр (хост и порт)?
   Office Printer._ipp._tcp.local.  SRV  0 0 631 printer.local.

3. TXT — дополнительные параметры
   Office Printer._ipp._tcp.local.  TXT  "rp=ipp/print" "color=T" "duplex=T"

4. A / AAAA — адрес хоста
   printer.local.  A  192.168.1.50
```

### **Формат имени сервиса**

```
<Экземпляр>._<сервис>._<протокол>.<домен>
Office Printer._ipp._tcp.local
```

### **Перечисление всех типов сервисов**

```
_services._dns-sd._udp.local.  PTR  _ipp._tcp.local.
                               PTR  _airplay._tcp.local.
                               PTR  _googlecast._tcp.local.
```

## **Распространённые типы сервисов**

| Тип сервиса          | Назначение                               |
| -------------------- | ---------------------------------------- |
| `_http._tcp`         | Веб-интерфейс                            |
| `_ipp._tcp` / `_ipps._tcp` | Печать по IPP (AirPrint)           |
| `_printer._tcp`      | Печать LPD                               |
| `_airplay._tcp`      | Apple AirPlay                            |
| `_raop._tcp`         | AirPlay Audio                            |
| `_googlecast._tcp`   | Chromecast                               |
| `_spotify-connect._tcp` | Spotify Connect                       |
| `_smb._tcp`          | Общие папки SMB                          |
| `_afpovertcp._tcp`   | Apple File Protocol                      |
| `_ssh._tcp`          | SSH                                      |
| `_sftp-ssh._tcp`     | SFTP                                     |
| `_hap._tcp`          | Apple HomeKit                            |
| `_matter._tcp`       | Matter (умный дом)                       |
| `_companion-link._tcp` | Устройства Apple                       |
| `_homeassistant._tcp` | Home Assistant                          |

## **Unicast DNS-SD**

DNS-SD работает и через обычный DNS-сервер — для поиска сервисов за пределами локального сегмента (Wide-Area Bonjour). Записи PTR/SRV/TXT публикуются в обычной зоне `example.com`.

## **Примеры использования**

### **Linux (Avahi)**

```bash
# Найти все сервисы
avahi-browse -a -r -t

# Найти принтеры
avahi-browse -r -t _ipp._tcp

# Разрешить имя
avahi-resolve -n printer.local
avahi-resolve -a 192.168.1.50

# Опубликовать сервис
avahi-publish -s "My Web" _http._tcp 8080 "path=/"
```

### **Опубликовать сервис постоянно (Avahi)**

```xml
<!-- /etc/avahi/services/web.service -->
<service-group>
  <name replace-wildcards="yes">Web on %h</name>
  <service>
    <type>_http._tcp</type>
    <port>80</port>
    <txt-record>path=/</txt-record>
  </service>
</service-group>
```

### **macOS (Bonjour)**

```bash
dns-sd -B _services._dns-sd._udp      # все типы сервисов
dns-sd -B _airplay._tcp               # поиск AirPlay
dns-sd -L "Living Room" _airplay._tcp # подробности
dns-sd -G v4 printer.local            # адрес
dns-sd -R "My Web" _http._tcp . 8080 path=/   # регистрация
```

### **Linux (systemd-resolved)**

```bash
resolvectl mdns eth0 yes
resolvectl query printer.local
```

### **Windows**

```powershell
Resolve-DnsName printer.local
ping printer.local
```

### **Python (zeroconf)**

```python
from zeroconf import Zeroconf, ServiceBrowser

class Listener:
    def add_service(self, zc, type_, name):
        info = zc.get_service_info(type_, name)
        print(name, info.parsed_addresses(), info.port)
    def remove_service(self, *a): pass
    def update_service(self, *a): pass

zc = Zeroconf()
ServiceBrowser(zc, "_http._tcp.local.", Listener())
```

### **Wireshark**

```
mdns
udp.port == 5353
```

## **mDNS в больших сетях**

mDNS работает только в пределах одного L2-сегмента. В корпоративных и гостевых сетях с VLAN устройства не видят друг друга.

| Решение                  | Описание                                                    |
| ------------------------ | ----------------------------------------------------------- |
| **mDNS Reflector**       | Avahi `enable-reflector=yes`, функции роутеров — пересылает между VLAN |
| **mDNS Gateway / Service Discovery Gateway** | Cisco, Aruba, Ubiquiti — с фильтрацией по политикам |
| **Discovery Proxy** (RFC 8766) | Перевод mDNS в unicast DNS-SD                         |

При большом количестве устройств multicast-трафик mDNS нагружает Wi-Fi, поэтому его ограничивают.

## **Безопасность**

### **Риски**

1. **Утечка информации** — имена устройств (часто «iPhone-Ивана»), модели, сервисы
2. **Подмена ответов** — любой в сегменте может ответить за чужое имя
3. **DDoS-усиление** — открытые в интернет mDNS-респондеры использовались для amplification
4. **Перегрузка Wi-Fi** — шторм multicast

### **Защита**

- Блокировать UDP 5353 на внешнем интерфейсе
- Ограничивать mDNS в гостевых сетях (client isolation)
- Отключать публикацию лишних сервисов
- Не доверять mDNS-именам для аутентификации

## **Сравнение протоколов локального разрешения имён**

| Характеристика      | mDNS                | LLMNR                 | NetBIOS-NS             |
| ------------------- | ------------------- | --------------------- | ---------------------- |
| **Порт**            | UDP 5353            | UDP 5355              | UDP 137                |
| **Домен**           | `.local`            | Одно слово            | Имя NetBIOS (15 символов) |
| **Обнаружение сервисов** | Да (DNS-SD)     | Нет                   | Ограниченно            |
| **Платформы**       | Все                 | Windows               | Windows (legacy)       |
| **Статус**          | Активно развивается | Устаревает (Microsoft отказывается) | Устарел      |
