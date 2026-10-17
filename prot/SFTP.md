**SFTP** (SSH File Transfer Protocol) — протокол передачи файлов и управления файловой системой, работающий как подсистема SSH. Весь трафик (команды, данные, пароли) шифруется SSH. Несмотря на похожее название, SFTP **не имеет отношения к FTP** — это отдельный двоичный протокол.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | SSH (TCP)                                                                |
| **Порт**                    | 22 (порт SSH)                                                            |
| **Спецификация**            | draft-ietf-secsh-filexfer (версии 3–6), так и не стал RFC                |
| **Распространённая версия** | 3 (OpenSSH)                                                              |
| **Аутентификация**          | Средствами SSH (пароль, ключи, сертификаты)                              |
| **Шифрование**              | Средствами SSH                                                           |
| **Тип протокола**           | Двоичный, запрос-ответ с идентификаторами запросов                       |

## **Чем SFTP отличается от похожих протоколов**

| Протокол  | Расшифровка                    | Описание                                         |
| --------- | ------------------------------ | ------------------------------------------------ |
| **SFTP**  | SSH File Transfer Protocol     | Подсистема SSH, порт 22                          |
| **FTPS**  | FTP over TLS                   | Классический FTP с шифрованием TLS               |
| **SCP**   | Secure Copy                    | Простое копирование через SSH, без управления файлами |
| **Simple FTP** | RFC 913                   | Старый, не используется — тоже «SFTP»            |

## **Как работает SFTP**

```
Клиент                                          Сервер
  |                                                |
  |====== SSH соединение (TCP 22) ================>|
  |   Обмен ключами, аутентификация                |
  |                                                |
  |--- Открыть канал "session" ------------------->|
  |--- subsystem "sftp" -------------------------->|  запуск sftp-server
  |                                                |
  |--- SSH_FXP_INIT (version 3) ------------------>|
  |<-- SSH_FXP_VERSION (3) ------------------------|
  |                                                |
  |--- SSH_FXP_OPEN "/data/file.txt" (id=1) ------>|
  |<-- SSH_FXP_HANDLE (id=1, handle) --------------|
  |--- SSH_FXP_READ (id=2, handle, offset, len) -->|
  |<-- SSH_FXP_DATA (id=2) ------------------------|
  |--- SSH_FXP_CLOSE (id=3, handle) -------------->|
  |<-- SSH_FXP_STATUS (id=3, OK) ------------------|
```

Клиент может отправлять несколько запросов, не дожидаясь ответа (по id), — это ускоряет передачу.

## **Типы пакетов (версия 3)**

| Пакет                 | Код | Описание                                    |
| --------------------- | --- | ------------------------------------------- |
| **SSH_FXP_INIT**      | 1   | Начало сеанса, версия клиента               |
| **SSH_FXP_VERSION**   | 2   | Версия сервера и расширения                 |
| **SSH_FXP_OPEN**      | 3   | Открыть файл                                |
| **SSH_FXP_CLOSE**     | 4   | Закрыть файл/каталог                        |
| **SSH_FXP_READ**      | 5   | Чтение                                      |
| **SSH_FXP_WRITE**     | 6   | Запись                                      |
| **SSH_FXP_LSTAT**     | 7   | Атрибуты (без перехода по ссылке)           |
| **SSH_FXP_FSTAT**     | 8   | Атрибуты открытого файла                    |
| **SSH_FXP_SETSTAT**   | 9   | Изменить атрибуты (права, время)            |
| **SSH_FXP_OPENDIR**   | 11  | Открыть каталог                             |
| **SSH_FXP_READDIR**   | 12  | Прочитать список файлов                     |
| **SSH_FXP_REMOVE**    | 13  | Удалить файл                                |
| **SSH_FXP_MKDIR**     | 14  | Создать каталог                             |
| **SSH_FXP_RMDIR**     | 15  | Удалить каталог                             |
| **SSH_FXP_REALPATH**  | 16  | Абсолютный путь                             |
| **SSH_FXP_STAT**      | 17  | Атрибуты                                    |
| **SSH_FXP_RENAME**    | 18  | Переименовать                               |
| **SSH_FXP_READLINK**  | 19  | Прочитать символическую ссылку              |
| **SSH_FXP_SYMLINK**   | 20  | Создать символическую ссылку                |
| **SSH_FXP_STATUS**    | 101 | Результат операции (код ошибки)             |
| **SSH_FXP_HANDLE**    | 102 | Дескриптор файла                            |
| **SSH_FXP_DATA**      | 103 | Данные                                      |
| **SSH_FXP_NAME**      | 104 | Список имён                                 |
| **SSH_FXP_ATTRS**     | 105 | Атрибуты                                    |
| **SSH_FXP_EXTENDED**  | 200 | Расширения (например, `posix-rename@openssh.com`) |

## **Коды статуса (SSH_FXP_STATUS)**

| Код | Статус                       | Описание                          |
| --- | ---------------------------- | --------------------------------- |
| 0   | SSH_FX_OK                    | Успех                             |
| 1   | SSH_FX_EOF                   | Конец файла / списка              |
| 2   | SSH_FX_NO_SUCH_FILE          | Файл не найден (аналог 404)       |
| 3   | SSH_FX_PERMISSION_DENIED     | Нет прав (аналог 403)             |
| 4   | SSH_FX_FAILURE               | Общая ошибка (аналог 500)         |
| 5   | SSH_FX_BAD_MESSAGE           | Некорректный пакет                |
| 6   | SSH_FX_NO_CONNECTION         | Нет соединения (на стороне клиента) |
| 7   | SSH_FX_CONNECTION_LOST       | Соединение потеряно               |
| 8   | SSH_FX_OP_UNSUPPORTED        | Операция не поддерживается        |

## **Примеры использования**

### **Интерактивный клиент OpenSSH**

```bash
sftp user@server.example.com
sftp -P 2222 -i ~/.ssh/id_ed25519 user@server
```

| Команда               | Описание                              |
| --------------------- | ------------------------------------- |
| `ls`, `cd`, `pwd`     | Работа с удалённым каталогом          |
| `lls`, `lcd`, `lpwd`  | Работа с локальным каталогом          |
| `get file.txt`        | Скачать файл                          |
| `get -r dir/`         | Скачать каталог                       |
| `put file.txt`        | Загрузить файл                        |
| `put -r dir/`         | Загрузить каталог                     |
| `reget` / `reput`     | Продолжить прерванную передачу        |
| `mkdir`, `rmdir`, `rm`, `rename` | Управление файлами         |
| `chmod 644 file`      | Изменить права                        |
| `df -h`               | Свободное место                       |
| `bye` / `exit`        | Выход                                 |

### **Пакетный режим**

```bash
# Команды из файла
sftp -b commands.txt user@server

# Одной строкой
echo "put backup.tar.gz /backups/" | sftp user@server
```

### **Другие клиенты**

```bash
# curl
curl -u user: --key ~/.ssh/id_ed25519 sftp://server/path/file.txt -o file.txt

# lftp (зеркалирование)
lftp sftp://user@server -e "mirror -R ./site /var/www; bye"

# rclone, WinSCP, FileZilla, Cyberduck — графические и CLI-клиенты
```

### **Python (paramiko)**

```python
import paramiko

client = paramiko.SSHClient()
client.load_system_host_keys()
client.connect("server.example.com", username="user", key_filename="/home/user/.ssh/id_ed25519")
sftp = client.open_sftp()
sftp.put("local.txt", "/remote/local.txt")
sftp.get("/remote/data.csv", "data.csv")
sftp.close()
client.close()
```

## **Настройка сервера (OpenSSH)**

### **SFTP-only пользователи с chroot**

```
# /etc/ssh/sshd_config
Subsystem sftp internal-sftp

Match Group sftpusers
    ChrootDirectory /srv/sftp/%u
    ForceCommand internal-sftp
    AllowTcpForwarding no
    X11Forwarding no
    PermitTTY no
```

```bash
groupadd sftpusers
useradd -g sftpusers -s /usr/sbin/nologin alice
# Каталог chroot должен принадлежать root и не быть доступным на запись другим
mkdir -p /srv/sftp/alice/upload
chown root:root /srv/sftp/alice
chmod 755 /srv/sftp/alice
chown alice:sftpusers /srv/sftp/alice/upload
systemctl restart sshd
```

### **Журналирование операций**

```
Subsystem sftp internal-sftp -l INFO -f AUTH
```

## **Безопасность SFTP**

### **Преимущества**

- Один порт — легко пропустить через файрвол (в отличие от FTP)
- Шифрование и проверка целостности средствами SSH
- Аутентификация по ключам и сертификатам
- Проверка подлинности сервера через host key

### **Риски и рекомендации**

1. **Доступ к shell** — ограничивать через `ForceCommand internal-sftp`
2. **Выход из каталога** — использовать `ChrootDirectory`
3. **Перебор паролей** — только ключи, fail2ban
4. **Проброс портов** — отключать `AllowTcpForwarding`
5. **Проверка host key** — не игнорировать предупреждения о смене ключа

## **Сравнение SFTP, SCP и FTPS**

| Характеристика      | SFTP                   | SCP                    | FTPS                       |
| ------------------- | ---------------------- | ---------------------- | -------------------------- |
| **Основа**          | SSH                    | SSH                    | FTP + TLS                  |
| **Порты**           | 22                     | 22                     | 21 / 990 + диапазон данных |
| **Список файлов**   | Да                     | Нет                    | Да                         |
| **Докачка**         | Да                     | Нет                    | Да                         |
| **Удаление, переименование** | Да            | Нет                    | Да                         |
| **Работа через NAT/файрвол** | Просто        | Просто                 | Сложно                     |
| **Аутентификация**  | Ключи SSH, пароли      | Ключи SSH, пароли      | Пароли, X.509 сертификаты  |
