**FTP** (File Transfer Protocol) — протокол для передачи файлов между клиентом и сервером. FTP использует раздельные каналы для команд (порт 21) и данных (порт 20 или динамический). Считается устаревшим и небезопасным, рекомендуется использовать SFTP или FTPS.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 21 - команды, порт 20 - данные)                                |
| **Тип протокола**           | С установлением соединения                                              |
| **Режимы**                  | Active (активный), Passive (пассивный)                                   |
| **Аутентификация**          | Username/Password (в открытом виде)                                      |
| **Безопасность**            | Небезопасен (данные в открытом виде)                                     |

## **Архитектура FTP**

### **Два соединения**

1. **Control Connection (порт 21)**
   - Команды и ответы
   - Постоянное соединение
   - Текстовый протокол

2. **Data Connection (порт 20 или динамический)**
   - Передача файлов
   - Временное соединение
   - Бинарные или текстовые данные

## **Режимы передачи**

### **Active Mode (Активный режим)**

```
Клиент                          Сервер
  |                               |
  |-------- TCP:21 (Control) -----→|
  |                               |
  |-------- PORT 192.168.1.10:5000 →|
  |                               |
  |← TCP:20 (Data) ----------------|
  |                               |
```

**Процесс:**
1. Клиент подключается к серверу на порт 21
2. Клиент отправляет PORT команду с IP и портом
3. Сервер подключается к клиенту на указанный порт
4. Передача данных

**Проблемы:**
- Не работает через NAT/Firewall
- Требует открытых портов на клиенте

### **Passive Mode (Пассивный режим)**

```
Клиент                          Сервер
  |                               |
  |-------- TCP:21 (Control) -----→|
  |                               |
  |-------- PASV -----------------→|
  |                               |
  |← 227 Entering Passive Mode ---|
  |   (192.168.1.100,5000)        |
  |                               |
  |-------- TCP:5000 (Data) -----→|
  |                               |
```

**Процесс:**
1. Клиент подключается к серверу на порт 21
2. Клиент отправляет PASV команду
3. Сервер отвечает IP и портом для данных
4. Клиент подключается к серверу на указанный порт
5. Передача данных

**Преимущества:**
- Работает через NAT/Firewall
- Не требует открытых портов на клиенте

## **FTP команды**

### **Основные команды**

| Команда      | Описание                                    |
| ------------ | ------------------------------------------- |
| **USER**     | Имя пользователя                            |
| **PASS**     | Пароль                                      |
| **QUIT**     | Выход                                       |
| **PWD**      | Текущая директория                          |
| **CWD**      | Смена директории                            |
| **LIST**     | Список файлов                               |
| **RETR**     | Получение файла                             |
| **STOR**     | Загрузка файла                              |
| **DELE**     | Удаление файла                              |
| **MKD**      | Создание директории                         |
| **RMD**      | Удаление директории                         |
| **TYPE**     | Тип передачи (A=ASCII, I=Binary)            |
| **PASV**     | Переключение в пассивный режим              |
| **PORT**     | Указание порта для активного режима         |
| **SIZE**     | Размер файла                                |

## **FTP ответы**

### **Формат ответов**

Трехзначный код + текст:
```
200 Command okay
150 File status okay; about to open data connection
226 Closing data connection
550 Requested action not taken
```

### **Коды ответов**

| Код | Категория | Описание                                    |
| --- | --------- | ------------------------------------------- |
| 1xx | Positive Preliminary | Команда принята, обработка продолжается |
| 2xx | Positive Completion | Команда успешно выполнена |
| 3xx | Positive Intermediate | Команда принята, требуется дополнительная информация |
| 4xx | Transient Negative | Временная ошибка, повторить позже |
| 5xx | Permanent Negative | Постоянная ошибка, не повторять |

## **Примеры использования**

### **Командная строка**

```bash
# Подключение
ftp ftp.example.com

# Интерактивные команды:
# user username
# pass password
# ls
# cd directory
# get file.txt
# put file.txt
# quit

# Неинтерактивный режим
ftp -n ftp.example.com <<EOF
user username password
cd /remote/path
get file.txt
quit
EOF
```

### **cURL**

```bash
# Список файлов
curl ftp://ftp.example.com/ --user username:password

# Загрузка файла
curl ftp://ftp.example.com/file.txt --user username:password -o file.txt

# Загрузка файла на сервер
curl -T file.txt ftp://ftp.example.com/ --user username:password
```

### **Python**

```python
from ftplib import FTP

# Подключение
ftp = FTP('ftp.example.com')
ftp.login('username', 'password')

# Список файлов
ftp.retrlines('LIST')

# Смена директории
ftp.cwd('/remote/path')

# Загрузка файла
with open('local_file.txt', 'wb') as f:
    ftp.retrbinary('RETR remote_file.txt', f.write)

# Загрузка файла на сервер
with open('local_file.txt', 'rb') as f:
    ftp.storbinary('STOR remote_file.txt', f)

# Закрытие
ftp.quit()
```

## **Безопасность FTP**

### **Проблемы**

1. **Данные в открытом виде**
   - Пароли передаются в открытом виде
   - Файлы передаются без шифрования
   - Уязвим к перехвату

2. **Нет целостности данных**
   - Нет проверки целостности
   - Данные могут быть изменены

3. **Уязвим к атакам**
   - Brute-force атаки
   - Man-in-the-Middle
   - Packet sniffing

### **Защита**

1. **Использовать SFTP** (SSH File Transfer Protocol)
   ```bash
   sftp user@server.example.com
   ```

2. **Использовать FTPS** (FTP over SSL/TLS)
   - Шифрование данных
   - Защита паролей

3. **VPN** — туннелирование FTP через VPN

4. **Ограничение доступа**
   - Firewall правила
   - IP whitelist
   - Rate limiting

## **FTPS (FTP Secure)**

### **Режимы FTPS**

1. **Explicit FTPS (FTPES)**
   - Клиент явно запрашивает TLS
   - Команда: `AUTH TLS`
   - Порт: 21

2. **Implicit FTPS**
   - TLS с самого начала
   - Порт: 990 (control), 989 (data)

### **Использование FTPS**

```bash
# cURL с FTPS
curl --ftp-ssl --user username:password ftps://ftp.example.com/

# Python с FTPS
from ftplib import FTP_TLS

ftp = FTP_TLS('ftp.example.com')
ftp.login('username', 'password')
ftp.prot_p()  # Защита данных
```

## **Настройка FTP сервера**

### **vsftpd (Linux)**

```bash
# Установка
sudo apt-get install vsftpd

# Конфигурация /etc/vsftpd.conf
listen=YES
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
xferlog_enable=YES
connect_from_port_20=YES
chroot_local_user=YES
secure_chroot_dir=/var/run/vsftpd/empty
pam_service_name=vsftpd
rsa_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
rsa_private_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
ssl_enable=YES

# Запуск
sudo systemctl start vsftpd
sudo systemctl enable vsftpd
```

## **Анонимный FTP**

### **Настройка**

```bash
# /etc/vsftpd.conf
anonymous_enable=YES
anon_root=/var/ftp
anon_upload_enable=YES
anon_mkdir_write_enable=YES
```

**Безопасность:**
- Ограничить права доступа
- Изолировать от системы
- Мониторинг активности

## **Ограничения FTP**

1. **Небезопасность** — данные в открытом виде
2. **Сложность с NAT** — проблемы с активным режимом
3. **Устаревший протокол** — заменен на SFTP/FTPS
4. **Ограничения firewall** — требует открытых портов

## **Альтернативы FTP**

1. **SFTP** (SSH File Transfer Protocol)
   - Безопасный
   - Один порт (22)
   - Широко поддерживается

2. **SCP** (Secure Copy)
   - Простой
   - Безопасный
   - Часть SSH

3. **Rsync**
   - Эффективная синхронизация
   - Может использовать SSH
   - Инкрементальные обновления

4. **HTTP/HTTPS**
   - Для веб-загрузки
   - Простой
   - Безопасный (HTTPS)

## **Применение FTP**

1. **Устаревшие системы** — где еще используется
2. **Публичные репозитории** — анонимный доступ
3. **Локальные сети** — в изолированных сетях
4. **Legacy приложения** — старые системы

## **Рекомендации**

1. **Не использовать FTP** для новых проектов
2. **Использовать SFTP** вместо FTP
3. **Если нужен FTP** — использовать FTPS
4. **Ограничить доступ** — firewall, IP whitelist
5. **Мониторинг** — отслеживание активности

## **Миграция с FTP**

### **На SFTP**

```bash
# Вместо FTP использовать SFTP
sftp user@server.example.com

# Автоматизация
sftp user@server <<EOF
put file.txt
get remote_file.txt
quit
EOF
```

### **На Rsync**

```bash
# Синхронизация через SSH
rsync -avz -e ssh /local/path/ user@server:/remote/path/
```

## **Диагностика FTP**

### **Проблемы и решения**

| Проблема                   | Причина                                  | Решение                                   |
| -------------------------- | ---------------------------------------- | ----------------------------------------- |
| **Connection refused**     | Сервер не запущен                        | Проверить сервис FTP                      |
| **Passive mode failed**    | Firewall блокирует                      | Настроить firewall, использовать активный режим |
| **Login failed**          | Неверные учетные данные                  | Проверить username/password                |
| **Transfer failed**       | Проблемы с data connection               | Проверить режим (active/passive), firewall |

## **Мониторинг FTP**

```bash
# Просмотр активных соединений
netstat -an | grep :21

# Логи vsftpd
tail -f /var/log/vsftpd.log

# Мониторинг трафика
sudo tcpdump -i eth0 port 21
```

## **Будущее FTP**

- **Заменен на SFTP** — для большинства применений
- **FTPS** — для случаев, где нужен FTP
- **Устаревание** — постепенное прекращение использования
- **Legacy поддержка** — только для старых систем
