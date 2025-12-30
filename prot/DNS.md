**DNS** (Domain Name System) — распределенная система имен, преобразующая удобные для человека доменные имена (например, google.com) в машинные IP-адреса (например, 172.217.164.110). DNS является критически важной частью интернета, обеспечивая работу веб-браузинга, электронной почты и других сетевых сервисов.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP (порт 53), TCP (порт 53 для больших ответов)                        |
| **Тип протокола**           | Запрос-ответ (Request-Response)                                         |
| **Архитектура**             | Распределенная иерархическая система                                      |
| **Кеширование**             | Многоуровневое кеширование                                               |
| **Рекурсия**                | Рекурсивные и итеративные запросы                                        |

## **Структура DNS сообщения**

### **DNS Header (Заголовок)**

| Поле                    | Размер (биты) | Описание                                    |
| ----------------------- | -------------- | ------------------------------------------- |
| **ID**                  | 16             | Идентификатор запроса                       |
| **QR**                  | 1              | 0=Query, 1=Response                          |
| **Opcode**              | 4              | Тип запроса (0=Standard, 1=Inverse, 2=Status) |
| **AA**                  | 1              | Authoritative Answer                        |
| **TC**                  | 1              | Truncated (обрезано)                        |
| **RD**                  | 1              | Recursion Desired                           |
| **RA**                  | 1              | Recursion Available                         |
| **Z**                   | 3              | Зарезервировано (должно быть 0)             |
| **RCODE**                | 4              | Код ответа (0=No Error, 3=NXDOMAIN и т.д.)   |
| **QDCOUNT**              | 16             | Количество вопросов                         |
| **ANCOUNT**              | 16             | Количество ответов                          |
| **NSCOUNT**              | 16             | Количество записей authority                |
| **ARCOUNT**              | 16             | Количество дополнительных записей           |

### **DNS Question (Вопрос)**

| Поле                    | Описание                                    |
| ----------------------- | ------------------------------------------- |
| **QNAME**               | Имя домена (сжатое)                         |
| **QTYPE**               | Тип записи (A, AAAA, MX, NS и т.д.)         |
| **QCLASS**              | Класс (обычно IN = Internet)                |

### **DNS Resource Record (Запись ресурса)**

| Поле                    | Описание                                    |
| ----------------------- | ------------------------------------------- |
| **NAME**                | Имя домена                                  |
| **TYPE**                | Тип записи                                  |
| **CLASS**               | Класс (обычно IN)                           |
| **TTL**                 | Time To Live (время жизни в секундах)       |
| **RDLENGTH**            | Длина данных                                |
| **RDATA**               | Данные записи                               |

## **Типы DNS записей**

| Тип  | Название        | Описание                                    | Пример                                    |
| ---- | --------------- | ------------------------------------------- | ----------------------------------------- |
| **A** | Address        | IPv4 адрес                                  | `192.168.1.1`                             |
| **AAAA** | IPv6 Address | IPv6 адрес                                  | `2001:db8::1`                             |
| **CNAME** | Canonical Name | Каноническое имя (алиас)                    | `www.example.com CNAME example.com`        |
| **MX** | Mail Exchange  | Почтовый сервер                             | `10 mail.example.com`                     |
| **NS** | Name Server    | DNS сервер для домена                       | `ns1.example.com`                         |
| **PTR** | Pointer        | Обратное разрешение (IP → имя)              | `1.1.168.192.in-addr.arpa PTR host.example.com` |
| **SOA** | Start of Authority | Начало зоны ответственности            | См. ниже                                  |
| **TXT** | Text           | Текстовая информация                        | `"v=spf1 include:_spf.google.com ~all"`   |
| **SRV** | Service        | Сервисная запись                            | `_http._tcp.example.com SRV 10 5 80 www`  |
| **CAA** | Certificate Authority Authorization | Авторизация CA для SSL | `0 issue "letsencrypt.org"`          |

### **SOA запись (Start of Authority)**

```
example.com. IN SOA ns1.example.com. admin.example.com. (
    2024010101  ; Serial number
    3600        ; Refresh (1 hour)
    1800        ; Retry (30 minutes)
    604800      ; Expire (7 days)
    86400       ; Minimum TTL (1 day)
)
```

**Поля SOA:**
- **MNAME** — первичный DNS сервер
- **RNAME** — email администратора (с заменой @ на .)
- **SERIAL** — номер версии зоны
- **REFRESH** — интервал обновления
- **RETRY** — интервал повтора при ошибке
- **EXPIRE** — время истечения зоны
- **MINIMUM** — минимальный TTL

## **Иерархия DNS**

### **Структура доменных имен**

```
. (root)
├── com
│   ├── example
│   │   ├── www
│   │   ├── mail
│   │   └── ftp
│   └── google
├── org
│   └── example
├── net
└── ...
```

### **Типы DNS серверов**

| Тип           | Описание                                    |
| ------------- | ------------------------------------------- |
| **Root Servers** | Корневые серверы (13 серверов)            |
| **TLD Servers** | Серверы доменов верхнего уровня (.com, .org) |
| **Authoritative Servers** | Авторитетные серверы для домена      |
| **Recursive Resolvers** | Рекурсивные резолверы (клиентские)    |
| **Caching Servers** | Кеширующие серверы                        |

## **Процесс DNS запроса**

### **Рекурсивный запрос**

```
1. Клиент → Рекурсивный резолвер: Запрос google.com
2. Рекурсивный резолвер → Root Server: Запрос .com
3. Root Server → Рекурсивный резолвер: Ответ (адреса .com серверов)
4. Рекурсивный резолвер → .com TLD Server: Запрос google.com
5. .com TLD Server → Рекурсивный резолвер: Ответ (адреса authoritative серверов)
6. Рекурсивный резолвер → Authoritative Server: Запрос google.com
7. Authoritative Server → Рекурсивный резолвер: Ответ (IP адрес)
8. Рекурсивный резолвер → Клиент: Ответ (IP адрес)
```

### **Итеративный запрос**

```
1. Клиент → DNS Server: Запрос google.com
2. DNS Server → Клиент: Ответ (адреса .com серверов)
3. Клиент → .com TLD Server: Запрос google.com
4. .com TLD Server → Клиент: Ответ (адреса authoritative серверов)
5. Клиент → Authoritative Server: Запрос google.com
6. Authoritative Server → Клиент: Ответ (IP адрес)
```

## **Примеры использования**

### **Командная строка**

```bash
# Базовый запрос
nslookup google.com

# Запрос определенного типа
nslookup -type=MX example.com
nslookup -type=NS example.com
nslookup -type=TXT example.com

# Запрос определенного сервера
nslookup google.com 8.8.8.8

# dig (более детальная информация)
dig google.com
dig @8.8.8.8 google.com
dig google.com MX
dig google.com +short

# Обратное разрешение
dig -x 8.8.8.8

# host
host google.com
host -t MX example.com
host 8.8.8.8
```

### **Python**

```python
import socket

# Прямое разрешение
ip = socket.gethostbyname('google.com')
print(ip)

# Обратное разрешение
hostname = socket.gethostbyaddr('8.8.8.8')
print(hostname)

# DNS запросы (dnspython)
import dns.resolver

# A запись
answers = dns.resolver.resolve('google.com', 'A')
for rdata in answers:
    print(rdata)

# MX запись
answers = dns.resolver.resolve('example.com', 'MX')
for rdata in answers:
    print(rdata.preference, rdata.exchange)
```

### **Мониторинг DNS**

```bash
# tcpdump - DNS трафик
sudo tcpdump -i eth0 port 53

# Только запросы
sudo tcpdump -i eth0 'udp port 53 and udp[10] & 0x80 = 0'

# Только ответы
sudo tcpdump -i eth0 'udp port 53 and udp[10] & 0x80 != 0'

# Wireshark фильтры
dns
dns.flags.response == 0  # Запросы
dns.flags.response == 1   # Ответы
dns.qry.type == 1         # A запросы
```

## **DNS коды ответов (RCODE)**

| Код | Название        | Описание                                    |
| --- | --------------- | ------------------------------------------- |
| 0   | No Error        | Успешный ответ                              |
| 1   | Format Error    | Ошибка формата запроса                      |
| 2   | Server Failure  | Ошибка сервера                               |
| 3   | NXDOMAIN        | Домен не существует                          |
| 4   | Not Implemented | Запрос не поддерживается                     |
| 5   | Refused         | Запрос отклонен                              |
| 6-15 | Reserved        | Зарезервировано                              |

## **DNS кеширование**

### **TTL (Time To Live)**

Время жизни записи в кеше.

**Примеры TTL:**
- **Короткий TTL (300-600 сек)** — для часто меняющихся записей
- **Средний TTL (3600 сек)** — стандартный
- **Длинный TTL (86400+ сек)** — для стабильных записей

### **Уровни кеширования**

1. **Браузер** — кеш DNS в браузере
2. **ОС** — системный кеш DNS
3. **Рекурсивный резолвер** — кеш на DNS сервере
4. **Authoritative сервер** — источник данных

## **Безопасность DNS**

### **Угрозы**

1. **DNS Spoofing** — подделка DNS ответов
2. **DNS Cache Poisoning** — отравление кеша
3. **DNS Amplification** — DDoS атаки
4. **Man-in-the-Middle** — перехват DNS запросов

### **Защита**

1. **DNSSEC** (DNS Security Extensions)
   - Цифровые подписи записей
   - Проверка подлинности
   - Защита от подделки

2. **DNS over HTTPS (DoH)**
   - Шифрование DNS запросов
   - Защита от перехвата
   - Порт 443 (HTTPS)

3. **DNS over TLS (DoT)**
   - Шифрование через TLS
   - Порт 853

4. **Фильтрация**
   - Блокировка вредоносных доменов
   - Родительский контроль

## **Специальные DNS записи**

### **SPF (Sender Policy Framework)**

TXT запись для защиты от спама:

```
example.com. IN TXT "v=spf1 include:_spf.google.com ~all"
```

### **DKIM (DomainKeys Identified Mail)**

TXT запись для подписи почты:

```
default._domainkey.example.com. IN TXT "v=DKIM1; k=rsa; p=..."
```

### **DMARC (Domain-based Message Authentication)**

TXT запись для политики аутентификации:

```
_dmarc.example.com. IN TXT "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"
```

## **DNS зоны**

### **Прямая зона (Forward Zone)**

Разрешение имени → IP адрес.

**Файл зоны:**
```
$TTL 3600
example.com. IN SOA ns1.example.com. admin.example.com. (
    2024010101
    3600
    1800
    604800
    86400
)

example.com.    IN NS    ns1.example.com.
example.com.    IN NS    ns2.example.com.
example.com.    IN A     192.168.1.1
www             IN A     192.168.1.1
mail            IN A     192.168.1.2
example.com.    IN MX    10 mail.example.com.
```

### **Обратная зона (Reverse Zone)**

Разрешение IP адреса → имя.

**Файл зоны:**
```
$TTL 3600
1.168.192.in-addr.arpa. IN SOA ns1.example.com. admin.example.com. (
    2024010101
    3600
    1800
    604800
    86400
)

1.168.192.in-addr.arpa. IN NS ns1.example.com.
1                       IN PTR example.com.
2                       IN PTR mail.example.com.
```

## **Настройка DNS сервера**

### **BIND (Berkeley Internet Name Domain)**

```bash
# Установка
sudo apt-get install bind9

# Конфигурация /etc/bind/named.conf.local
zone "example.com" {
    type master;
    file "/etc/bind/db.example.com";
};

# Запуск
sudo systemctl start bind9
sudo systemctl enable bind9
```

### **Проверка конфигурации**

```bash
# Проверка синтаксиса
named-checkconf
named-checkzone example.com /etc/bind/db.example.com

# Тестирование
dig @localhost example.com
```

## **Производительность DNS**

### **Оптимизация**

1. **Кеширование** — правильные TTL значения
2. **Локальные резолверы** — уменьшение задержек
3. **Anycast** — распределение нагрузки
4. **CDN** — географическое распределение

### **Измерение производительности**

```bash
# Измерение времени запроса
time dig google.com

# Трассировка DNS запроса
dig +trace google.com

# Тестирование нескольких серверов
for server in 8.8.8.8 1.1.1.1 9.9.9.9; do
    echo "Testing $server"
    dig @$server google.com +stats
done
```

## **Публичные DNS серверы**

| Провайдер | IPv4 адреса        | IPv6 адреса                    |
| --------- | ------------------ | ------------------------------ |
| **Google** | 8.8.8.8, 8.8.4.4 | 2001:4860:4860::8888, 2001:4860:4860::8844 |
| **Cloudflare** | 1.1.1.1, 1.0.0.1 | 2606:4700:4700::1111, 2606:4700:4700::1001 |
| **Quad9** | 9.9.9.9, 149.112.112.112 | 2620:fe::fe, 2620:fe::9 |
| **OpenDNS** | 208.67.222.222, 208.67.220.220 | 2620:0:ccc::2, 2620:0:ccd::2 |

## **Применение DNS**

1. **Веб-браузинг** — разрешение доменных имен
2. **Электронная почта** — MX записи для доставки почты
3. **Сервисы** — SRV записи для обнаружения сервисов
4. **Безопасность** — SPF, DKIM, DMARC
5. **CDN** — географическое распределение контента

## **Ограничения DNS**

1. **Задержка** — может быть медленным
2. **Кеширование** — изменения не сразу видны
3. **Безопасность** — требует DNSSEC
4. **Размер ответа** — ограничен 512 байт (UDP), больше требует TCP

## **Будущее DNS**

- **DNS over HTTPS/TLS** — шифрование запросов
- **DNSSEC** — повсеместное внедрение
- **IPv6** — больше AAAA записей
- **Новые типы записей** — для новых сервисов
