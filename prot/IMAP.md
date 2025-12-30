**IMAP** (Internet Message Access Protocol) — протокол для управления почтой непосредственно на сервере. IMAP позволяет синхронизировать состояние писем (прочтение, папки) между несколькими устройствами, в отличие от POP3, который загружает письма локально.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 143, 993 для IMAPS)                                            |
| **Тип протокола**           | Текстовый протокол (команды и ответы)                                    |
| **Назначение**              | Управление почтой на сервере                                             |
| **Режим работы**            | Письма остаются на сервере                                              |
| **Синхронизация**           | Множественные устройства                                                  |
| **Безопасность**            | IMAPS (IMAP over SSL/TLS)                                                |
| **Версии**                  | IMAP4 (текущая)                                                           |

## **IMAP команды**

### **Основные команды**

| Команда      | Описание                                    | Пример                                    |
| ------------ | ------------------------------------------- | ----------------------------------------- |
| **LOGIN**    | Аутентификация                              | `LOGIN username password`                 |
| **SELECT**   | Выбор почтового ящика                       | `SELECT INBOX`                            |
| **EXAMINE**  | Выбор ящика только для чтения               | `EXAMINE INBOX`                           |
| **FETCH**    | Получение писем                             | `FETCH 1 BODY[]`                          |
| **STORE**    | Изменение флагов писем                      | `STORE 1 +FLAGS (\Seen)`                  |
| **SEARCH**   | Поиск писем                                 | `SEARCH UNSEEN`                           |
| **COPY**     | Копирование письма                          | `COPY 1 Sent`                             |
| **MOVE**     | Перемещение письма (IMAP4)                  | `MOVE 1 Sent`                             |
| **CREATE**   | Создание папки                               | `CREATE Projects`                         |
| **DELETE**   | Удаление папки                               | `DELETE Projects`                         |
| **LIST**     | Список папок                                 | `LIST "" *`                                |
| **STATUS**   | Статус папки                                 | `STATUS INBOX (MESSAGES UNSEEN)`           |
| **LOGOUT**   | Завершение сессии                           | `LOGOUT`                                   |

## **Флаги писем**

### **Системные флаги**

| Флаг      | Описание                                    |
| --------- | ------------------------------------------- |
| **\Seen** | Письмо прочитано                            |
| **\Answered** | На письмо ответили                        |
| **\Flagged** | Письмо помечено                            |
| **\Deleted** | Письмо помечено для удаления                |
| **\Draft** | Черновик                                    |
| **\Recent** | Новое письмо (системное)                    |

### **Пользовательские флаги**

Могут быть определены пользователем.

## **Пример сессии IMAP**

```
C: * OK IMAP4 server ready
C: A1 LOGIN username password
S: A1 OK LOGIN completed
C: A2 SELECT INBOX
S: * 5 EXISTS
S: * 2 RECENT
S: * OK [UNSEEN 3]
S: A2 OK [READ-WRITE] SELECT completed
C: A3 FETCH 1 BODY[]
S: * 1 FETCH (BODY[] {3045}
S: [тело письма]
S: )
S: A3 OK FETCH completed
C: A4 STORE 1 +FLAGS (\Seen)
S: * 1 FETCH (FLAGS (\Seen))
S: A4 OK STORE completed
C: A5 LOGOUT
S: * BYE IMAP4 server logging out
S: A5 OK LOGOUT completed
```

## **IMAP ответы**

### **Формат ответов**

- **+ продолжение** — требуется дополнительная информация
- **OK** — успешная команда
- **NO** — ошибка команды
- **BAD** — синтаксическая ошибка

### **Теги**

- **Команды с тегами** — A1, A2, B1 и т.д.
- **Ответы без тегов** — серверные сообщения (*)

## **Безопасность IMAP**

### **IMAPS (IMAP over SSL/TLS)**

```bash
# Подключение через IMAPS
openssl s_client -connect mail.example.com:993
```

**Порты:**
- **143** — обычный IMAP
- **993** — IMAPS (SSL/TLS)

### **STARTTLS**

Переключение на TLS в процессе сессии:

```
C: A1 STARTTLS
S: A1 OK Begin TLS negotiation now
[TLS handshake]
C: A2 LOGIN username password
```

## **Примеры использования**

### **Python**

```python
import imaplib

# Подключение
mail = imaplib.IMAP4_SSL('mail.example.com', 993)
mail.login('username', 'password')

# Выбор папки
mail.select('INBOX')

# Поиск писем
status, messages = mail.search(None, 'UNSEEN')

# Получение писем
for num in messages[0].split():
    status, data = mail.fetch(num, '(RFC822)')
    email_body = data[0][1]
    # Обработка письма

# Закрытие
mail.logout()
```

### **Командная строка**

```bash
# Подключение
telnet mail.example.com 143

# Или через openssl для IMAPS
openssl s_client -connect mail.example.com:993
```

## **Папки в IMAP**

### **Стандартные папки**

- **INBOX** — входящие
- **Sent** — отправленные
- **Draft** — черновики
- **Trash** — корзина
- **Junk/Spam** — спам

### **Работа с папками**

```
C: A1 LIST "" *
S: * LIST (\HasNoChildren) "/" INBOX
S: * LIST (\HasNoChildren) "/" Sent
S: A1 OK LIST completed

C: A2 CREATE Projects
S: A2 OK CREATE completed

C: A3 STATUS INBOX (MESSAGES UNSEEN)
S: * STATUS INBOX (MESSAGES 5 UNSEEN 2)
S: A3 OK STATUS completed
```

## **SEARCH команды**

### **Критерии поиска**

| Критерий | Описание                                    |
| -------- | ------------------------------------------- |
| **ALL** | Все письма                                  |
| **UNSEEN** | Непрочитанные                              |
| **SEEN** | Прочитанные                                  |
| **FROM** | От отправителя                               |
| **TO** | Кому                                         |
| **SUBJECT** | По теме                                     |
| **SINCE** | С даты                                       |
| **BEFORE** | До даты                                      |

### **Примеры**

```
SEARCH UNSEEN
SEARCH FROM "sender@example.com"
SEARCH SUBJECT "test"
SEARCH SINCE 01-Jan-2024
SEARCH UNSEEN FROM "sender@example.com"
```

## **Применение IMAP**

1. **Множественные устройства** — синхронизация между устройствами
2. **Управление на сервере** — организация папок на сервере
3. **Офлайн доступ** — кеширование для офлайн работы
4. **Совместная работа** — доступ к общим папкам

## **Сравнение IMAP и POP3**

| Характеристика | IMAP | POP3 |
| -------------- | ---- | ---- |
| **Хранение** | На сервере | Локально |
| **Синхронизация** | Да | Нет |
| **Множественные устройства** | Да | Нет |
| **Удаление с сервера** | Нет | Обычно да |
| **Папки** | Да | Нет |
| **Поиск** | На сервере | Локально |

## **Ограничения IMAP**

1. **Производительность** — медленнее, чем POP3
2. **Требует соединения** — для работы нужен доступ к серверу
3. **Место на сервере** — письма хранятся на сервере
4. **Сложность** — сложнее, чем POP3

## **Будущее IMAP**

- **Расширения** — новые возможности
- **Улучшенная производительность** — оптимизация
- **Интеграция** — с современными почтовыми клиентами
- **IMAP4rev2** — новая версия протокола
