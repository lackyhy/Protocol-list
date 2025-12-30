**TLS/SSL** (Transport Layer Security / Secure Sockets Layer) — криптографические протоколы, обеспечивающие безопасную связь поверх TCP. TLS — современная версия, пришедшая на смену SSL. Используется для защиты HTTP (HTTPS), электронной почты, VPN и других протоколов.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Сеансовый/Транспортный (Session/Transport Layer)                        |
| **Транспорт**               | TCP                                                                       |
| **Тип протокола**           | С установлением соединения                                              |
| **Шифрование**             | Симметричное и асимметричное                                             |
| **Аутентификация**          | Сертификаты X.509                                                        |
| **Версии**                  | SSL 2.0, SSL 3.0 (устаревшие), TLS 1.0-1.3                              |

## **История версий**

| Версия | Год   | Статус        | Описание                                    |
| ------ | ----- | ------------- | ------------------------------------------- |
| SSL 2.0 | 1995  | Устаревший    | Первая версия, небезопасна                  |
| SSL 3.0 | 1996  | Устаревший    | Улучшенная версия, уязвима (POODLE)         |
| TLS 1.0 | 1999  | Устаревший    | Основан на SSL 3.0, уязвим (BEAST)         |
| TLS 1.1 | 2006  | Устаревший    | Улучшения безопасности                      |
| TLS 1.2 | 2008  | Рекомендуемый | Широко используется                         |
| TLS 1.3 | 2018  | Современный   | Улучшенная безопасность и производительность |

## **Процесс TLS Handshake**

### **TLS 1.2 Handshake**

```
Клиент                          Сервер
  |                               |
  |-------- Client Hello -------→|
  |         (версия, cipher suites, |
  |          random, extensions)    |
  |                               |
  |<-- Server Hello --------------|
  |         (версия, cipher suite, |
  |          random, extensions)    |
  |                               |
  |<-- Certificate --------------|
  |         (сертификат сервера)  |
  |                               |
  |<-- Server Key Exchange ------|
  |         (если нужно)          |
  |                               |
  |<-- Server Hello Done --------|
  |                               |
  |-------- Client Key Exchange →|
  |         (premaster secret)    |
  |                               |
  |-------- Change Cipher Spec →|
  |                               |
  |-------- Finished ------------→|
  |         (зашифровано)         |
  |                               |
  |<-- Change Cipher Spec --------|
  |                               |
  |<-- Finished -----------------|
  |         (зашифровано)        |
  |                               |
  |     Зашифрованная связь       |
```

**Этапы:**
1. **Client Hello** — клиент предлагает параметры
2. **Server Hello** — сервер выбирает параметры
3. **Certificate** — сервер отправляет сертификат
4. **Client Key Exchange** — обмен ключами
5. **Change Cipher Spec** — переключение на шифрование
6. **Finished** — подтверждение handshake

### **TLS 1.3 Handshake (упрощенный)**

```
Клиент                          Сервер
  |                               |
  |-------- Client Hello -------→|
  |         (cipher suites,      |
  |          key_share)           |
  |                               |
  |<-- Server Hello --------------|
  |         (cipher suite,       |
  |          key_share)           |
  |                               |
  |<-- Certificate --------------|
  |                               |
  |<-- Finished -----------------|
  |                               |
  |-------- Finished ------------→|
  |                               |
  |     Зашифрованная связь       |
```

**Преимущества TLS 1.3:**
- Меньше раундов (1-RTT вместо 2-RTT)
- Улучшенная безопасность
- Удалены слабые алгоритмы

## **Cipher Suites**

### **Компоненты**

Формат: `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`

- **TLS** — протокол
- **ECDHE** — алгоритм обмена ключами
- **RSA** — алгоритм аутентификации
- **AES_256_GCM** — алгоритм шифрования
- **SHA384** — алгоритм хеширования (MAC)

### **Алгоритмы обмена ключами**

| Алгоритм      | Описание                                    | Безопасность |
| ------------- | ------------------------------------------- | ------------ |
| **RSA**       | Rivest-Shamir-Adleman                       | Хорошая      |
| **DH**        | Diffie-Hellman                               | Хорошая      |
| **ECDH**      | Elliptic Curve Diffie-Hellman               | Хорошая      |
| **ECDHE**     | Ephemeral ECDH (Perfect Forward Secrecy)    | Отличная     |
| **DHE**       | Ephemeral DH (Perfect Forward Secrecy)      | Отличная     |

### **Алгоритмы шифрования**

| Алгоритм      | Размер ключа | Безопасность | Скорость |
| ------------- | ------------ | ------------ | -------- |
| **AES-128**   | 128 бит      | Хорошая      | Быстрая  |
| **AES-256**   | 256 бит      | Отличная     | Средняя  |
| **ChaCha20**  | 256 бит      | Отличная     | Очень быстрая |
| **3DES**      | 168 бит      | Устаревший   | Медленная |
| **RC4**       | 128-256 бит  | Небезопасен  | Быстрая  |

### **Режимы работы**

| Режим         | Описание                                    | Безопасность |
| ------------- | ------------------------------------------- | ------------ |
| **CBC**       | Cipher Block Chaining                       | Хорошая      |
| **GCM**       | Galois/Counter Mode                         | Отличная     |
| **CCM**       | Counter with CBC-MAC                       | Хорошая      |
| **Poly1305**  | Poly1305 MAC (с ChaCha20)                  | Отличная     |

## **Сертификаты X.509**

### **Структура сертификата**

| Поле                    | Описание                                    |
| ----------------------- | ------------------------------------------- |
| **Version**             | Версия (обычно v3)                          |
| **Serial Number**       | Уникальный номер                            |
| **Signature Algorithm** | Алгоритм подписи                            |
| **Issuer**              | Центр сертификации (CA)                    |
| **Validity**            | Период действия                             |
| **Subject**             | Владелец сертификата                        |
| **Public Key**          | Публичный ключ                              |
| **Extensions**         | Расширения (SAN, Key Usage и т.д.)          |
| **Signature**           | Цифровая подпись CA                         |

### **Типы сертификатов**

| Тип           | Описание                                    | Использование                              |
| ------------- | ------------------------------------------- | ------------------------------------------- |
| **DV**        | Domain Validated                            | Базовое подтверждение домена               |
| **OV**        | Organization Validated                      | Подтверждение организации                  |
| **EV**        | Extended Validated                           | Расширенная проверка                       |
| **Wildcard**  | Для поддоменов                              | *.example.com                              |
| **SAN**       | Subject Alternative Names                   | Несколько доменов                          |

## **Perfect Forward Secrecy (PFS)**

### **Концепция**

Каждая TLS сессия имеет уникальный ключ, независимый от долгосрочного ключа сервера.

**Преимущества:**
- Компрометация долгосрочного ключа не раскрывает прошлые сессии
- Защита от массового перехвата
- Требует ECDHE или DHE

**Без PFS:**
- Все сессии могут быть расшифрованы при компрометации ключа
- Уязвимость к массовому перехвату

## **Примеры использования**

### **Проверка TLS соединения**

```bash
# Просмотр сертификата
openssl s_client -connect example.com:443 -showcerts

# Проверка версии TLS
openssl s_client -connect example.com:443 -tls1_2
openssl s_client -connect example.com:443 -tls1_3

# Просмотр cipher suite
openssl s_client -connect example.com:443 | grep "Cipher"

# Проверка срока действия сертификата
echo | openssl s_client -connect example.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

### **Генерация самоподписанного сертификата**

```bash
# Генерация приватного ключа
openssl genrsa -out private.key 2048

# Генерация CSR
openssl req -new -key private.key -out certificate.csr

# Генерация самоподписанного сертификата
openssl x509 -req -days 365 -in certificate.csr \
  -signkey private.key -out certificate.crt
```

### **Проверка конфигурации TLS**

```bash
# testssl.sh
./testssl.sh example.com

# SSL Labs (онлайн)
# https://www.ssllabs.com/ssltest/
```

## **Настройка TLS сервера**

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

## **Безопасность TLS**

### **Рекомендации**

1. **Использовать TLS 1.2+ (предпочтительно TLS 1.3)**
   ```
   ssl_protocols TLSv1.2 TLSv1.3;
   ```

2. **Сильные cipher suites**
   ```
   ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
   ```

3. **Perfect Forward Secrecy**
   - Использовать ECDHE или DHE
   - Избегать RSA для key exchange

4. **HSTS (HTTP Strict Transport Security)**
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```

5. **OCSP Stapling**
   ```
   ssl_stapling on;
   ssl_stapling_verify on;
   ```

### **Угрозы и защита**

| Угроза              | Описание                                    | Защита                                     |
| -------------------- | ------------------------------------------- | ------------------------------------------ |
| **Man-in-the-Middle** | Перехват трафика                          | Сертификаты, проверка CA                  |
| **BEAST**            | Атака на TLS 1.0                            | TLS 1.2+                                   |
| **POODLE**           | Атака на SSL 3.0                            | Отключить SSL 3.0                          |
| **Heartbleed**       | Уязвимость в OpenSSL                        | Обновление OpenSSL                         |
| **DROWN**            | Атака через SSLv2                           | Отключить SSLv2                            |
| **Logjam**           | Атака на DH                                 | Использовать сильные параметры DH          |

## **Let's Encrypt**

### **Получение бесплатного сертификата**

```bash
# Установка Certbot
sudo apt-get install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d example.com -d www.example.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

## **Применение TLS**

1. **HTTPS** — защита веб-трафика
2. **SMTP/TLS** — защита электронной почты
3. **IMAP/POP3 TLS** — защита почтовых клиентов
4. **VPN** — OpenVPN, IPsec
5. **Базы данных** — защита соединений с БД

## **Ограничения TLS**

1. **Производительность** — накладные расходы на шифрование
2. **Сложность** — требует управления сертификатами
3. **Совместимость** — старые системы могут не поддерживать
4. **Стоимость** — сертификаты (хотя Let's Encrypt бесплатный)

## **Будущее TLS**

- **TLS 1.3** — улучшенная безопасность и производительность
- **QUIC** — встроенное шифрование в QUIC
- **Автоматические сертификаты** — Let's Encrypt и аналоги
- **Всеобщее шифрование** — TLS по умолчанию
