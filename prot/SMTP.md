**SMTP** (Simple Mail Transfer Protocol) — протокол для отправки исходящей почты от клиента к серверу и для передачи почты между серверами. SMTP является основным протоколом для отправки электронной почты в интернете.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 25, 587 с TLS, 465 для SMTPS)                                 |
| **Тип протокола**           | Текстовый протокол (команды и ответы)                                    |
| **Назначение**              | Отправка электронной почты                                               |
| **Расширения**              | ESMTP (Extended SMTP)                                                    |
| **Безопасность**            | STARTTLS, SMTPS                                                          |

## **Базовый процесс отправки почты**

```
Отправитель (MUA) → SMTP Server → SMTP Server → Получатель (MUA)
                      (исходящий)    (входящий)      (через POP3/IMAP)
```

**Этапы:**
1. MUA подключается к исходящему SMTP серверу
2. SMTP сервер отправляет письмо на SMTP сервер получателя
3. Получатель загружает письмо через POP3/IMAP

## **SMTP команды**

### **Основные команды**

| Команда      | Описание                                    | Пример                                    |
| ------------ | ------------------------------------------- | ----------------------------------------- |
| **HELO**     | Приветствие (базовое)                       | `HELO example.com`                         |
| **EHLO**     | Расширенное приветствие (ESMTP)             | `EHLO example.com`                         |
| **MAIL FROM** | Отправитель                                 | `MAIL FROM: sender@example.com`          |
| **RCPT TO**  | Получатель                                  | `RCPT TO: recipient@example.com`          |
| **DATA**     | Начало передачи тела письма                 | `DATA`                                    |
| **QUIT**     | Завершение сессии                           | `QUIT`                                    |
| **RSET**     | Сброс текущей транзакции                    | `RSET`                                    |
| **NOOP**     | Пустая операция (keep-alive)                | `NOOP`                                    |
| **VRFY**     | Проверка существования адреса               | `VRFY user@example.com`                    |
| **EXPN**     | Раскрытие списка рассылки                   | `EXPN list@example.com`                    |

## **SMTP ответы**

### **Формат ответов**

Трехзначный код + текст:
```
250 OK
550 Mailbox not found
```

### **Коды ответов**

| Код | Категория | Описание                                    |
| --- | --------- | ------------------------------------------- |
| 2xx | Success   | Команда успешно выполнена                   |
| 3xx | Intermediate | Требуется дополнительная информация      |
| 4xx | Transient Error | Временная ошибка, повторить позже    |
| 5xx | Permanent Error | Постоянная ошибка                      |

### **Основные коды**

| Код | Описание                                    |
| --- | ------------------------------------------- |
| 220 | Сервис готов                                |
| 250 | OK (команда выполнена)                      |
| 354 | Начать ввод данных                          |
| 421 | Сервис недоступен                           |
| 450 | Mailbox недоступен                          |
| 451 | Локальная ошибка                            |
| 452 | Недостаточно места                           |
| 500 | Синтаксическая ошибка                       |
| 501 | Параметр не реализован                      |
| 502 | Команда не реализована                      |
| 550 | Mailbox недоступен                          |
| 551 | Пользователь не локальный                   |
| 552 | Превышен лимит размера                      |
| 553 | Mailbox имя недопустимо                     |
| 554 | Транзакция не удалась                       |

## **Пример сессии SMTP**

```
S: 220 mail.example.com ESMTP Postfix
C: EHLO client.example.com
S: 250-mail.example.com
S: 250-PIPELINING
S: 250-SIZE 52428800
S: 250-STARTTLS
S: 250-AUTH PLAIN LOGIN
S: 250-ENHANCEDSTATUSCODES
S: 250 8BITMIME
C: AUTH PLAIN dXNlcm5hbWUAcGFzc3dvcmQ=
S: 235 2.7.0 Authentication successful
C: MAIL FROM: sender@example.com
S: 250 2.1.0 OK
C: RCPT TO: recipient@example.com
S: 250 2.1.5 OK
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: sender@example.com
C: To: recipient@example.com
C: Subject: Test
C:
C: This is a test message.
C: .
S: 250 2.0.0 OK: queued
C: QUIT
S: 221 2.0.0 Bye
```

## **ESMTP расширения**

### **Основные расширения**

| Расширение   | Описание                                    |
| ------------ | ------------------------------------------- |
| **STARTTLS**  | Защита соединения через TLS                  |
| **AUTH**      | Аутентификация                              |
| **SIZE**      | Максимальный размер сообщения               |
| **PIPELINING** | Отправка нескольких команд подряд        |
| **8BITMIME**  | Поддержка 8-битных символов                 |
| **ENHANCEDSTATUSCODES** | Расширенные коды статуса           |

## **Безопасность SMTP**

### **STARTTLS**

Защита соединения через TLS:

```
C: EHLO client.example.com
S: 250-mail.example.com
S: 250-STARTTLS
S: 250-AUTH PLAIN LOGIN
S: 250 8BITMIME
C: STARTTLS
S: 220 Ready to start TLS
[TLS handshake]
C: EHLO client.example.com
S: 250-mail.example.com
S: 250-AUTH PLAIN LOGIN
S: 250 8BITMIME
```

### **SMTPS (SMTP over SSL)**

Прямое SSL/TLS соединение на порту 465.

### **Аутентификация**

**Методы:**
- **PLAIN** — пароль в base64
- **LOGIN** — имя пользователя и пароль в base64
- **CRAM-MD5** — challenge-response
- **DIGEST-MD5** — digest аутентификация

## **Примеры использования**

### **Командная строка**

```bash
# Telnet подключение к SMTP
telnet mail.example.com 25

# Отправка письма
echo -e "EHLO example.com\nMAIL FROM: sender@example.com\nRCPT TO: recipient@example.com\nDATA\nSubject: Test\n\nTest message.\n.\nQUIT" | telnet mail.example.com 25
```

### **Python**

```python
import smtplib
from email.mime.text import MIMEText

# Создание сообщения
msg = MIMEText('Test message')
msg['Subject'] = 'Test'
msg['From'] = 'sender@example.com'
msg['To'] = 'recipient@example.com'

# Отправка
smtp = smtplib.SMTP('mail.example.com', 587)
smtp.starttls()
smtp.login('username', 'password')
smtp.send_message(msg)
smtp.quit()
```

### **cURL**

```bash
# Отправка через SMTP
curl --url 'smtp://mail.example.com:587' \
  --mail-from 'sender@example.com' \
  --mail-rcpt 'recipient@example.com' \
  --user 'username:password' \
  --upload-file message.txt
```

## **Настройка SMTP сервера**

### **Postfix (Linux)**

```bash
# Установка
sudo apt-get install postfix

# Конфигурация /etc/postfix/main.cf
myhostname = mail.example.com
mydomain = example.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, $mydomain
relayhost =
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
home_mailbox = Maildir/

# Запуск
sudo systemctl start postfix
sudo systemctl enable postfix
```

### **Sendmail (альтернатива)**

```bash
# Установка
sudo apt-get install sendmail

# Конфигурация /etc/mail/sendmail.mc
# (требует компиляции)
```

## **SPF, DKIM, DMARC**

### **SPF (Sender Policy Framework)**

TXT запись DNS для проверки отправителя:

```
example.com. IN TXT "v=spf1 include:_spf.google.com ~all"
```

### **DKIM (DomainKeys Identified Mail)**

Цифровая подпись писем:

```
default._domainkey.example.com. IN TXT "v=DKIM1; k=rsa; p=..."
```

### **DMARC (Domain-based Message Authentication)**

Политика аутентификации:

```
_dmarc.example.com. IN TXT "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"
```

## **Мониторинг SMTP**

```bash
# Просмотр логов
tail -f /var/log/mail.log

# Проверка очереди
postqueue -p

# Тестирование
swaks --to recipient@example.com \
  --from sender@example.com \
  --server mail.example.com
```

## **Применение SMTP**

1. **Отправка почты** — от клиента к серверу
2. **Передача между серверами** — сервер к серверу
3. **Уведомления** — системные уведомления
4. **Рассылки** — массовая рассылка

## **Ограничения SMTP**

1. **Безопасность** — требует STARTTLS/SMTPS
2. **Спам** — уязвим к спаму
3. **Аутентификация** — не всегда требуется
4. **Размер** — ограничения на размер письма

## **Порты SMTP**

| Порт | Описание                                    |
| ---- | ------------------------------------------- |
| 25   | Стандартный SMTP (часто блокируется)        |
| 587  | Submission (с аутентификацией, STARTTLS)    |
| 465  | SMTPS (SSL/TLS с самого начала)            |

## **Диагностика SMTP**

### **Проблемы и решения**

| Проблема                   | Причина                                  | Решение                                   |
| -------------------------- | ---------------------------------------- | ----------------------------------------- |
| **Connection refused**     | Сервер не запущен                        | Проверить сервис SMTP                     |
| **Authentication failed**   | Неверные учетные данные                  | Проверить username/password               |
| **Mail rejected**          | SPF/DKIM/DMARC проверка                   | Настроить DNS записи                      |
| **Relay denied**           | Сервер не разрешает ретрансляцию         | Настроить mynetworks или аутентификацию   |

## **Будущее SMTP**

- **Улучшенная безопасность** — обязательный STARTTLS
- **Проверка отправителя** — SPF, DKIM, DMARC
- **Упрощение** — автоматическая конфигурация
- **Интеграция** — облачные почтовые сервисы
