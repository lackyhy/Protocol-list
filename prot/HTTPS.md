**HTTPS** (Hypertext Transfer Protocol Secure) — безопасная версия HTTP, где данные шифруются с помощью протоколов TLS/SSL. HTTPS обеспечивает конфиденциальность, целостность данных и аутентификацию сервера, защищая пользователей от перехвата и подделки данных.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 443)                                                            |
| **Базовый протокол**        | HTTP поверх TLS/SSL                                                       |
| **Шифрование**             | TLS 1.2, TLS 1.3 (SSL устарел)                                           |
| **Аутентификация**          | Сертификаты X.509                                                        |
| **Назначение**              | Безопасная передача данных в интернете                                    |

## **Как работает HTTPS**

### **Процесс установления соединения**

```
1. Клиент → Сервер: TCP соединение на порт 443
2. Клиент → Сервер: Client Hello (версия TLS, поддерживаемые cipher suites)
3. Сервер → Клиент: Server Hello (выбранный cipher suite, сертификат)
4. Клиент: Проверка сертификата
5. Клиент → Сервер: Client Key Exchange (premaster secret)
6. Обе стороны: Генерация сессионных ключей
7. Клиент → Сервер: Change Cipher Spec, Finished
8. Сервер → Клиент: Change Cipher Spec, Finished
9. Начинается зашифрованная передача HTTP данных
```

### **TLS Handshake (детально)**

**Этап 1: Negotiation**
- Клиент и сервер согласовывают версию TLS
- Выбирают cipher suite
- Определяют методы сжатия

**Этап 2: Authentication**
- Сервер отправляет сертификат
- Клиент проверяет сертификат
- Опционально: клиент отправляет свой сертификат

**Этап 3: Key Exchange**
- Обмен ключами (RSA, Diffie-Hellman, ECDHE)
- Генерация premaster secret
- Создание сессионных ключей

**Этап 4: Secure Communication**
- Все данные шифруются
- Проверяется целостность (MAC)
- Защита от replay атак

## **SSL/TLS сертификаты**

### **Структура сертификата X.509**

| Поле                    | Описание                                    |
| ----------------------- | ------------------------------------------- |
| **Version**             | Версия сертификата (обычно v3)              |
| **Serial Number**       | Уникальный номер                            |
| **Signature Algorithm** | Алгоритм подписи (RSA, ECDSA)               |
| **Issuer**              | Кто выдал сертификат (CA)                   |
| **Validity**            | Период действия (Not Before, Not After)    |
| **Subject**             | Владелец сертификата                        |
| **Public Key**          | Публичный ключ                              |
| **Extensions**          | Расширения (SAN, Key Usage и т.д.)          |
| **Signature**           | Цифровая подпись CA                         |

### **Типы сертификатов**

| Тип           | Описание                                    | Использование                              |
| ------------- | ------------------------------------------- | ------------------------------------------- |
| **DV**        | Domain Validated                            | Базовое подтверждение домена               |
| **OV**        | Organization Validated                      | Подтверждение организации                  |
| **EV**        | Extended Validated                           | Расширенная проверка (зеленая строка)      |
| **Wildcard**  | Для поддоменов                              | *.example.com                              |
| **SAN**       | Subject Alternative Names                   | Несколько доменов в одном сертификате     |

### **Центры сертификации (CA)**

**Публичные CA:**
- Let's Encrypt (бесплатный)
- DigiCert
- GlobalSign
- Comodo
- GoDaddy

**Самоподписанные сертификаты:**
- Для внутреннего использования
- Требуют ручной установки в браузер
- Не доверяются по умолчанию

## **Cipher Suites**

### **Компоненты cipher suite**

Формат: `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`

- **TLS** — протокол
- **ECDHE** — алгоритм обмена ключами
- **RSA** — алгоритм аутентификации
- **AES_256_GCM** — алгоритм шифрования
- **SHA384** — алгоритм хеширования (MAC)

### **Рекомендуемые cipher suites**

**TLS 1.3:**
- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_GCM_SHA256

**TLS 1.2:**
- TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256

### **Устаревшие cipher suites (не использовать)**

- SSLv2, SSLv3
- TLS 1.0, TLS 1.1
- RC4, MD5, SHA1
- Экспортные cipher suites

## **Примеры использования**

### **Проверка сертификата**

```bash
# Просмотр сертификата
openssl s_client -connect example.com:443 -showcerts

# Проверка срока действия
echo | openssl s_client -connect example.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# Просмотр информации о сертификате
echo | openssl s_client -connect example.com:443 2>/dev/null | \
  openssl x509 -noout -text

# Проверка цепочки сертификатов
openssl s_client -connect example.com:443 -showcerts
```

### **cURL с HTTPS**

```bash
# Базовый HTTPS запрос
curl https://example.com

# Игнорирование проверки сертификата (не рекомендуется)
curl -k https://example.com

# Сохранение сертификата
curl -v https://example.com 2>&1 | grep -i "SSL certificate"

# Указание клиентского сертификата
curl --cert client.crt --key client.key https://example.com
```

### **Проверка SSL/TLS конфигурации**

```bash
# SSL Labs SSL Test (онлайн)
# https://www.ssllabs.com/ssltest/

# testssl.sh (локально)
./testssl.sh example.com

# Проверка версии TLS
openssl s_client -connect example.com:443 -tls1_2
openssl s_client -connect example.com:443 -tls1_3
```

## **Настройка HTTPS сервера**

### **Nginx**

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # TLS версии
    ssl_protocols TLSv1.2 TLSv1.3;

    # Cipher suites
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    location / {
        proxy_pass http://backend;
    }
}

# Редирект HTTP → HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### **Apache**

```apache
<VirtualHost *:443>
    ServerName example.com

    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLCertificateChainFile /path/to/chain.crt

    # TLS версии
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1

    # Cipher suites
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    SSLHonorCipherOrder on

    # HSTS
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>
```

## **Безопасность HTTPS**

### **Рекомендации**

1. **Использовать TLS 1.2+ (предпочтительно TLS 1.3)**
   ```
   ssl_protocols TLSv1.2 TLSv1.3;
   ```

2. **Сильные cipher suites**
   ```
   ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
   ```

3. **HSTS (HTTP Strict Transport Security)**
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```

4. **OCSP Stapling**
   ```
   ssl_stapling on;
   ssl_stapling_verify on;
   ```

5. **Perfect Forward Secrecy (PFS)**
   - Использовать ECDHE или DHE
   - Каждая сессия имеет уникальный ключ

6. **Отключить слабые протоколы**
   - SSLv2, SSLv3
   - TLS 1.0, TLS 1.1

### **Угрозы и защита**

| Угроза              | Описание                                    | Защита                                     |
| -------------------- | ------------------------------------------- | ------------------------------------------ |
| **Man-in-the-Middle** | Перехват трафика                          | Сертификаты, проверка CA                  |
| **Certificate Spoofing** | Подделка сертификатов                  | Certificate Pinning, HSTS                  |
| **BEAST**            | Атака на TLS 1.0                            | TLS 1.2+                                   |
| **POODLE**           | Атака на SSL 3.0                            | Отключить SSL 3.0                          |
| **Heartbleed**       | Уязвимость в OpenSSL                        | Обновление OpenSSL                         |
| **DROWN**            | Атака через SSLv2                           | Отключить SSLv2                            |

## **Let's Encrypt (бесплатные сертификаты)**

### **Установка Certbot**

```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### **Получение сертификата**

```bash
# Автоматическая настройка Nginx
sudo certbot --nginx -d example.com -d www.example.com

# Только получение сертификата
sudo certbot certonly --nginx -d example.com

# Ручная настройка
sudo certbot certonly --manual -d example.com
```

### **Автоматическое обновление**

```bash
# Тест обновления
sudo certbot renew --dry-run

# Автоматическое обновление (cron)
# Certbot создает cron job автоматически
```

## **HTTP/2 и HTTPS**

HTTP/2 требует HTTPS (кроме localhost):

- Все современные браузеры требуют HTTPS для HTTP/2
- Улучшенная производительность
- Multiplexing, header compression
- Server push

## **Мониторинг HTTPS**

### **Проверка срока действия**

```bash
# Скрипт проверки
#!/bin/bash
DOMAIN="example.com"
PORT="443"

echo | openssl s_client -connect $DOMAIN:$PORT -servername $DOMAIN 2>/dev/null | \
  openssl x509 -noout -dates
```

### **Мониторинг трафика**

```bash
# tcpdump (только метаданные, данные зашифрованы)
sudo tcpdump -i eth0 'tcp port 443'

# Wireshark
# Можно анализировать TLS handshake, но не данные
```

## **Производительность HTTPS**

### **Накладные расходы**

- **TLS Handshake**: ~100-200ms (первое соединение)
- **Шифрование**: ~1-5% CPU
- **Размер данных**: минимальное увеличение

### **Оптимизация**

1. **TLS Session Resumption**
   - Переиспользование сессий
   - Уменьшение handshake

2. **OCSP Stapling**
   - Встроенная проверка отзыва
   - Уменьшение запросов

3. **HTTP/2**
   - Multiplexing
   - Header compression

4. **CDN с HTTPS**
   - Географическое распределение
   - Кеширование

## **Применение HTTPS**

1. **Веб-сайты** — защита пользовательских данных
2. **API** — безопасная передача данных
3. **Мобильные приложения** — защита трафика
4. **E-commerce** — защита платежей
5. **Корпоративные сети** — защита внутреннего трафика

## **Ограничения HTTPS**

1. **Производительность** — небольшие накладные расходы
2. **Стоимость** — сертификаты (хотя Let's Encrypt бесплатный)
3. **Сложность** — требует настройки и обновления
4. **Совместимость** — старые системы могут не поддерживать

## **Будущее HTTPS**

- **TLS 1.3** — улучшенная безопасность и производительность
- **QUIC/HTTP3** — встроенное шифрование
- **Автоматические сертификаты** — Let's Encrypt и аналоги
- **Всеобщее шифрование** — HTTPS по умолчанию
