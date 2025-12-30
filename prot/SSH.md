**SSH** (Secure Shell) — криптографический сетевой протокол для безопасного удаленного управления операционной системой, туннелирования и передачи файлов. SSH обеспечивает шифрованную связь между клиентом и сервером, защищая данные от перехвата и подделки.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 22)                                                            |
| **Тип протокола**           | С установлением соединения                                              |
| **Безопасность**            | Шифрование, аутентификация, целостность данных                          |
| **Версии**                  | SSH-1 (устаревший), SSH-2 (текущий)                                      |
| **Применение**              | Удаленное управление, туннелирование, передача файлов (SFTP, SCP)       |

## **Архитектура SSH**

### **Компоненты SSH**

1. **SSH Client** — клиентское приложение
2. **SSH Server (sshd)** — серверное приложение
3. **SSH Protocol** — протокол обмена данными
4. **Key Management** — управление ключами

### **Слои SSH протокола**

1. **Transport Layer** — шифрование, сжатие, целостность
2. **User Authentication Layer** — аутентификация пользователя
3. **Connection Layer** — мультиплексирование каналов

## **Процесс установления SSH соединения**

### **Этап 1: Установление TCP соединения**

```
Client → Server: TCP SYN
Server → Client: TCP SYN-ACK
Client → Server: TCP ACK
```

### **Этап 2: Обмен версиями протокола**

```
Client → Server: SSH-2.0-ClientName
Server → Client: SSH-2.0-ServerName
```

### **Этап 3: Обмен ключами (Key Exchange)**

```
1. Client и Server обмениваются алгоритмами
2. Генерация общих секретов (Diffie-Hellman)
3. Создание сессионных ключей
4. Проверка host key сервера
```

### **Этап 4: Аутентификация**

```
1. Client → Server: Запрос методов аутентификации
2. Server → Client: Список поддерживаемых методов
3. Client → Server: Аутентификация (password/key)
4. Server → Client: Успех/Неудача
```

### **Этап 5: Установление каналов**

После аутентификации устанавливаются каналы для различных целей:
- Интерактивная сессия
- Порт-форвардинг
- SFTP/SCP

## **Методы аутентификации**

### **1. Password Authentication**

Аутентификация по паролю:

```
Client → Server: Username + Password
Server → Client: Success/Failure
```

**Безопасность:**
- Пароль передается в зашифрованном виде
- Уязвим к brute-force атакам
- Рекомендуется отключить для публичных серверов

### **2. Public Key Authentication**

Аутентификация по ключам:

```
1. Client генерирует пару ключей (public/private)
2. Public key копируется на сервер (~/.ssh/authorized_keys)
3. При подключении:
   Client → Server: Запрос с public key
   Server → Client: Challenge (зашифрованный случайным ключом)
   Client → Server: Response (расшифрованный challenge)
   Server → Client: Success
```

**Преимущества:**
- Более безопасно, чем пароль
- Можно отключить пароли
- Удобно для автоматизации

### **3. Host-based Authentication**

Аутентификация по имени хоста (редко используется).

### **4. Keyboard-Interactive**

Интерактивная аутентификация (может запрашивать несколько полей).

## **SSH ключи**

### **Генерация ключей**

```bash
# Генерация RSA ключа (2048 бит)
ssh-keygen -t rsa -b 2048

# Генерация ED25519 ключа (рекомендуется)
ssh-keygen -t ed25519

# Генерация с комментарием
ssh-keygen -t ed25519 -C "user@example.com"

# Генерация с парольной фразой
ssh-keygen -t ed25519 -N "passphrase"
```

### **Типы ключей**

| Тип      | Размер ключа | Безопасность | Скорость |
| -------- | ------------ | ------------ | -------- |
| **RSA**  | 2048, 4096   | Хорошая      | Средняя  |
| **DSA**  | 1024        | Устаревший   | Быстрая  |
| **ECDSA** | 256, 384, 521 | Хорошая    | Быстрая  |
| **ED25519** | 256       | Отличная     | Очень быстрая |

### **Копирование ключа на сервер**

```bash
# Автоматическое копирование
ssh-copy-id user@server.example.com

# Ручное копирование
cat ~/.ssh/id_ed25519.pub | ssh user@server 'cat >> ~/.ssh/authorized_keys'

# Проверка
ssh user@server 'cat ~/.ssh/authorized_keys'
```

## **Конфигурация SSH**

### **Клиентская конфигурация (~/.ssh/config)**

```
Host server1
    HostName 192.168.1.100
    User admin
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    Compression yes
    ServerAliveInterval 60

Host *.example.com
    User admin
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking yes
```

### **Серверная конфигурация (/etc/ssh/sshd_config)**

```
# Порт
Port 22

# Протокол
Protocol 2

# Разрешенные методы аутентификации
PasswordAuthentication no
PubkeyAuthentication yes

# Разрешенные пользователи
AllowUsers admin user1
DenyUsers root

# Ограничения
MaxAuthTries 3
MaxSessions 10

# Логирование
LogLevel INFO

# Отключение root входа
PermitRootLogin no
```

### **Применение изменений**

```bash
# Проверка конфигурации
sudo sshd -t

# Перезагрузка сервиса
sudo systemctl restart sshd

# Просмотр статуса
sudo systemctl status sshd
```

## **Использование SSH**

### **Базовое подключение**

```bash
# Подключение с паролем
ssh user@server.example.com

# Подключение с указанием порта
ssh -p 2222 user@server.example.com

# Подключение с ключом
ssh -i ~/.ssh/id_ed25519 user@server.example.com

# Выполнение команды
ssh user@server.example.com "ls -la"

# Интерактивная сессия
ssh -t user@server.example.com "sudo bash"
```

### **SCP (Secure Copy)**

```bash
# Копирование файла на сервер
scp file.txt user@server.example.com:/path/to/destination/

# Копирование файла с сервера
scp user@server.example.com:/path/to/file.txt ./

# Копирование директории
scp -r directory/ user@server.example.com:/path/to/

# С указанием порта
scp -P 2222 file.txt user@server.example.com:/path/
```

### **SFTP (SSH File Transfer Protocol)**

```bash
# Интерактивный режим
sftp user@server.example.com

# Команды SFTP:
# put file.txt          - загрузить файл
# get file.txt          - скачать файл
# ls                    - список файлов
# cd directory          - смена директории
# pwd                   - текущая директория
# quit                  - выход

# Неинтерактивный режим
sftp user@server.example.com <<EOF
put file.txt
get remote_file.txt
quit
EOF
```

### **Rsync через SSH**

```bash
# Синхронизация через SSH
rsync -avz -e ssh /local/path/ user@server:/remote/path/

# С указанием порта
rsync -avz -e "ssh -p 2222" /local/path/ user@server:/remote/path/
```

## **SSH туннелирование (Port Forwarding)**

### **Локальный порт-форвардинг**

Перенаправление локального порта на удаленный сервер:

```bash
# Синтаксис: -L [локальный_порт]:[удаленный_хост]:[удаленный_порт]
ssh -L 8080:localhost:80 user@server.example.com

# Теперь localhost:8080 → server:80
# Использование:
curl http://localhost:8080
```

**Применение:**
- Доступ к веб-серверу на удаленном сервере
- Обход firewall
- Безопасный доступ к внутренним сервисам

### **Удаленный порт-форвардинг**

Перенаправление удаленного порта на локальный сервер:

```bash
# Синтаксис: -R [удаленный_порт]:[локальный_хост]:[локальный_порт]
ssh -R 8080:localhost:80 user@server.example.com

# Теперь server:8080 → localhost:80
```

**Применение:**
- Предоставление доступа к локальному серверу
- Разработка и тестирование
- Временный доступ к сервисам

### **Динамический порт-форвардинг (SOCKS)**

Создание SOCKS прокси:

```bash
# Синтаксис: -D [локальный_порт]
ssh -D 1080 user@server.example.com

# Настройка браузера:
# SOCKS прокси: localhost:1080
```

**Применение:**
- Обход цензуры
- Безопасный просмотр через удаленный сервер
- Анонимность

### **Примеры комбинаций**

```bash
# Локальный + удаленный
ssh -L 8080:localhost:80 -R 9090:localhost:3000 user@server

# С фоновым режимом
ssh -f -N -L 8080:localhost:80 user@server

# С автопереподключением
ssh -o ServerAliveInterval=60 -L 8080:localhost:80 user@server
```

## **SSH Agent**

Управление ключами без ввода парольной фразы:

```bash
# Запуск SSH agent
eval $(ssh-agent)

# Добавление ключа
ssh-add ~/.ssh/id_ed25519

# С парольной фразой (один раз)
ssh-add

# Список ключей
ssh-add -l

# Удаление ключа
ssh-add -d ~/.ssh/id_ed25519

# Удаление всех ключей
ssh-add -D
```

### **Автозапуск SSH agent**

Добавить в `~/.bashrc` или `~/.zshrc`:

```bash
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval $(ssh-agent)
    ssh-add ~/.ssh/id_ed25519
fi
```

## **Безопасность SSH**

### **Рекомендации**

1. **Отключить парольную аутентификацию**
   ```
   PasswordAuthentication no
   ```

2. **Использовать ключи ED25519**
   ```bash
   ssh-keygen -t ed25519
   ```

3. **Ограничить пользователей**
   ```
   AllowUsers admin user1
   DenyUsers root
   ```

4. **Изменить порт по умолчанию**
   ```
   Port 2222
   ```

5. **Ограничить попытки входа**
   ```
   MaxAuthTries 3
   ```

6. **Использовать fail2ban**
   ```bash
   sudo apt-get install fail2ban
   ```

7. **Отключить root вход**
   ```
   PermitRootLogin no
   ```

8. **Использовать двухфакторную аутентификацию**

### **Мониторинг**

```bash
# Просмотр активных соединений
who
w

# Просмотр логов
sudo tail -f /var/log/auth.log | grep ssh

# Просмотр неудачных попыток
sudo grep "Failed password" /var/log/auth.log

# Статистика подключений
sudo last | grep ssh
```

## **Диагностика SSH**

### **Отладка подключения**

```bash
# Подробный вывод
ssh -v user@server.example.com

# Очень подробный вывод
ssh -vv user@server.example.com

# Максимальная детализация
ssh -vvv user@server.example.com
```

### **Проверка конфигурации**

```bash
# Проверка серверной конфигурации
sudo sshd -t

# Тестовая конфигурация
sudo sshd -T

# Проверка клиентской конфигурации
ssh -F ~/.ssh/config -T server1
```

### **Типичные проблемы**

| Проблема                   | Причина                                  | Решение                                   |
| -------------------------- | ---------------------------------------- | ----------------------------------------- |
| **Connection refused**     | SSH сервер не запущен                    | sudo systemctl start sshd                 |
| **Permission denied**     | Неверный ключ или пароль                 | Проверить authorized_keys, пароль         |
| **Host key verification failed** | Изменился host key сервера      | Удалить старый ключ из known_hosts       |
| **Too many authentication failures** | Превышен лимит попыток      | Подождать или изменить MaxAuthTries      |

## **Применение SSH**

1. **Удаленное управление серверами**
   - Администрирование Linux/Unix систем
   - Выполнение команд удаленно

2. **Передача файлов**
   - SCP для копирования файлов
   - SFTP для интерактивной передачи
   - Rsync для синхронизации

3. **Туннелирование**
   - Доступ к внутренним сервисам
   - Обход firewall
   - Безопасный просмотр

4. **Git операции**
   - Клонирование репозиториев
   - Push/Pull через SSH

5. **Автоматизация**
   - Скрипты с SSH
   - CI/CD пайплайны
   - Управление конфигурациями

## **Ограничения SSH**

1. **Производительность**
   - Шифрование добавляет накладные расходы
   - Медленнее, чем незашифрованные протоколы

2. **Сложность настройки**
   - Требует управления ключами
   - Конфигурация может быть сложной

3. **Зависимость от сети**
   - Требует TCP соединения
   - Проблемы с нестабильными соединениями

## **Альтернативы SSH**

1. **Telnet** — незашифрованный (небезопасный)
2. **RDP** — для Windows систем
3. **VNC** — графический доступ
4. **Mosh** — улучшенный SSH для мобильных сетей

## **Расширения SSH**

1. **Mosh (Mobile Shell)**
   - Улучшенная работа с мобильными сетями
   - Автоматическое переподключение

2. **SSHFS**
   - Монтирование удаленной файловой системы
   ```bash
   sshfs user@server:/remote/path /local/mount/point
   ```

3. **Autossh**
   - Автоматическое переподключение
   ```bash
   autossh -M 20000 -N -L 8080:localhost:80 user@server
   ```
