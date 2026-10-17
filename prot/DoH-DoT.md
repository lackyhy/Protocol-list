**DoT** (DNS over TLS) и **DoH** (DNS over HTTPS) — протоколы шифрования DNS-запросов между клиентом и резолвером. Обычный DNS передаёт запросы открытым текстом по UDP 53, поэтому провайдер, владелец Wi-Fi или любой посредник видит, какие сайты вы открываете, и может подменить ответ. DoT и DoH скрывают содержимое запросов и защищают их от изменения по пути. Существует также **DoQ** (DNS over QUIC).

## **Основные характеристики**

| Параметр                    | DoT                                  | DoH                                    | DoQ                          |
| --------------------------- | ------------------------------------ | -------------------------------------- | ---------------------------- |
| **Стандарт**                | RFC 7858 (2016)                      | RFC 8484 (2018)                        | RFC 9250 (2022)              |
| **Транспорт**               | TCP + TLS                            | HTTPS (HTTP/2 или HTTP/3)              | QUIC                         |
| **Порт**                    | 853                                  | 443                                    | 853 (UDP)                    |
| **Формат**                  | DNS wire format с префиксом длины    | DNS wire format (`application/dns-message`) или JSON | DNS wire format |
| **Отличим от другого трафика** | Да (отдельный порт)               | Нет (обычный HTTPS)                    | Да (UDP 853)                 |
| **Где настраивается**       | ОС, роутер                           | Браузер, приложение, ОС                | ОС, резолверы                |

## **Что защищают и что нет**

| Угроза                                       | Обычный DNS | DoT/DoH                     |
| -------------------------------------------- | ----------- | --------------------------- |
| Прослушивание запросов по пути               | Уязвим      | Защищено                    |
| Подмена ответов по пути                      | Уязвим      | Защищено                    |
| Резолвер видит все запросы                   | Да          | **Да** (доверие переносится на резолвер) |
| Видимость сайта через SNI в TLS / IP-адрес   | Да          | **Да** (нужен ECH)          |
| Подмена данных самим резолвером              | Возможна    | Возможна (защищает DNSSEC)  |

## **DNS over TLS (DoT)**

```
Клиент                                  Резолвер (1.1.1.1:853)
  |--- TCP SYN --------------------------->|
  |--- TLS ClientHello (SNI: one.one.one.one)
  |<-- TLS ServerHello, сертификат --------|
  |    Проверка сертификата по имени       |
  |--- [2 байта длины][DNS-запрос] ------->|  зашифровано
  |<-- [2 байта длины][DNS-ответ] ---------|
  |--- следующие запросы в том же соединении
```

### **Режимы профиля (RFC 8310)**

| Профиль           | Описание                                                        |
| ----------------- | --------------------------------------------------------------- |
| **Strict**        | Только зашифрованно с проверкой сертификата, иначе ошибка       |
| **Opportunistic** | Попытаться шифровать, при неудаче — обычный DNS                 |

## **DNS over HTTPS (DoH)**

### **Запрос GET**

```
GET /dns-query?dns=AAABAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB HTTP/2
Host: cloudflare-dns.com
Accept: application/dns-message
```

Параметр `dns` — DNS-запрос в формате wire, закодированный base64url.

### **Запрос POST**

```
POST /dns-query HTTP/2
Host: dns.google
Content-Type: application/dns-message
Accept: application/dns-message

<двоичный DNS-запрос>
```

### **JSON API (не стандарт, но популярен)**

```bash
curl -s -H 'accept: application/dns-json' \
  'https://cloudflare-dns.com/dns-query?name=example.com&type=A' | jq
```

```json
{
  "Status": 0,
  "AD": true,
  "Answer": [
    { "name": "example.com", "type": 1, "TTL": 300, "data": "93.184.216.34" }
  ]
}
```

## **Публичные резолверы**

| Провайдер       | DoT                         | DoH                                            |
| --------------- | --------------------------- | ---------------------------------------------- |
| **Cloudflare**  | `one.one.one.one` (1.1.1.1) | `https://cloudflare-dns.com/dns-query`         |
| **Google**      | `dns.google` (8.8.8.8)      | `https://dns.google/dns-query`                 |
| **Quad9**       | `dns.quad9.net` (9.9.9.9)   | `https://dns.quad9.net/dns-query`              |
| **AdGuard**     | `dns.adguard-dns.com`       | `https://dns.adguard-dns.com/dns-query`        |
| **NextDNS**     | `<id>.dns.nextdns.io`       | `https://dns.nextdns.io/<id>`                  |

## **Обнаружение зашифрованных резолверов**

| Механизм         | Описание                                                       |
| ---------------- | -------------------------------------------------------------- |
| **DDR** (RFC 9462) | Клиент запрашивает `_dns.resolver.arpa` SVCB у текущего резолвера и узнаёт его DoH/DoT-адрес |
| **DNR** (RFC 9463) | Адреса зашифрованных резолверов в DHCP / Router Advertisement |
| **Canary-домен** | `use-application-dns.net` — сеть может попросить Firefox отключить DoH |

## **Примеры настройки**

### **Linux (systemd-resolved)**

```
# /etc/systemd/resolved.conf
[Resolve]
DNS=1.1.1.1#cloudflare-dns.com 9.9.9.9#dns.quad9.net
DNSOverTLS=yes
DNSSEC=yes
```

```bash
systemctl restart systemd-resolved
resolvectl status
resolvectl query example.com
```

### **Android (9+)**

Настройки → Сеть → **Частный DNS** → имя хоста `dns.google` (это DoT).

### **Windows 11**

```powershell
# Зарегистрировать шаблон DoH для адреса
Add-DnsClientDohServerAddress -ServerAddress 1.1.1.1 `
    -DohTemplate https://cloudflare-dns.com/dns-query -AllowFallbackToUdp $false -AutoUpgrade $true
Get-DnsClientDohServerAddress
```

Или: Параметры → Сеть → свойства адаптера → DNS → «Шифрование DNS: только зашифрованный».

### **Браузеры**

- **Firefox**: Настройки → Конфиденциальность → «DNS через HTTPS»
- **Chrome / Edge**: Настройки → Безопасность → «Использовать безопасный DNS»

### **Локальный прокси (dnscrypt-proxy, cloudflared)**

```bash
cloudflared proxy-dns --port 5053 --upstream https://1.1.1.1/dns-query
dig @127.0.0.1 -p 5053 example.com
```

### **Проверка**

```bash
# DoT
kdig -d @1.1.1.1 +tls-ca +tls-host=cloudflare-dns.com example.com
openssl s_client -connect 1.1.1.1:853 -servername cloudflare-dns.com

# DoH
curl -s --doh-url https://dns.google/dns-query https://example.com -o /dev/null -w '%{http_code}\n'
dig @1.1.1.1 +https example.com      # dig из BIND 9.18+

# DoQ
q example.com @quic://dns.adguard-dns.com
```

Проверка в браузере: `https://1.1.1.1/help` (для Cloudflare).

### **Свой DoH/DoT-сервер**

| Сервер       | DoT | DoH | DoQ |
| ------------ | --- | --- | --- |
| **Unbound**  | Да  | Да  | Да (1.22+) |
| **BIND 9.18+** | Да | Да | Нет |
| **AdGuard Home** | Да | Да | Да |
| **CoreDNS**  | Да  | Да  | Да  |
| **Knot Resolver** | Да | Да | Нет |

## **Споры вокруг DoH**

1. **Обход корпоративных политик** — DoH маскируется под HTTPS и обходит фильтрацию DNS, родительский контроль и DNS-средства безопасности
2. **Централизация** — запросы уходят нескольким крупным компаниям вместо провайдера
3. **Сплит-DNS ломается** — внутренние имена компании не резолвятся через публичный DoH
4. **Использование вредоносным ПО** — DoH применяется для скрытого C2-канала

Ответ: корпоративные сети блокируют известные DoH-серверы, используют canary-домен и политики браузеров (GPO), а также поднимают собственный DoH-резолвер.

## **Сравнение DoT, DoH и DoQ**

| Характеристика         | DoT                  | DoH                   | DoQ                   |
| ---------------------- | -------------------- | --------------------- | --------------------- |
| **Порт**               | TCP 853              | TCP/UDP 443           | UDP 853               |
| **Скрытность**         | Легко заблокировать  | Неотличим от HTTPS    | Легко заблокировать   |
| **Задержка**           | TCP + TLS            | TCP + TLS (или QUIC)  | Минимальная (0-RTT)   |
| **HOL blocking**       | Да                   | На уровне TCP (нет при HTTP/3) | Нет        |
| **Уровень настройки**  | Система              | Приложение / браузер  | Система               |
| **Удобство для админов** | Высокое            | Низкое                | Высокое               |
