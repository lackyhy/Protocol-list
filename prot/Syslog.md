**Syslog** — стандартный протокол передачи журнальных сообщений (логов) от устройств и программ на центральный сервер сбора. Его поддерживают практически все сетевые устройства (маршрутизаторы, коммутаторы, файрволы), Unix/Linux-системы и многие приложения. Syslog лежит в основе централизованного логирования и SIEM-систем.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP 514 (классика), TCP 514/601, TLS 6514                                |
| **Стандарты**               | RFC 3164 (BSD syslog, старый формат), RFC 5424 (современный), RFC 5425 (TLS), RFC 6587 (TCP) |
| **Модель**                  | Однонаправленная: отправитель → сборщик, без подтверждений (UDP)         |
| **Реализации**              | rsyslog, syslog-ng, systemd-journald, Graylog, Splunk, ELK               |

## **Facility (источник сообщения)**

| Код  | Facility    | Описание                                  |
| ---- | ----------- | ----------------------------------------- |
| 0    | kern        | Ядро                                      |
| 1    | user        | Пользовательские программы                |
| 2    | mail        | Почтовая система                          |
| 3    | daemon      | Системные службы                          |
| 4    | auth        | Безопасность и авторизация                |
| 5    | syslog      | Сообщения самого syslog                   |
| 6    | lpr         | Печать                                    |
| 7    | news        | Новости (NNTP)                            |
| 8    | uucp        | UUCP                                      |
| 9    | cron        | Планировщик                               |
| 10   | authpriv    | Приватные сообщения безопасности          |
| 11   | ftp         | FTP-сервер                                |
| 12   | ntp         | NTP                                       |
| 13   | security    | Аудит журналов                            |
| 14   | console     | Тревоги журналов                          |
| 15   | clock       | Часы                                      |
| 16–23 | local0–local7 | Для локального использования (сетевое оборудование, приложения) |

## **Severity (уровень важности)**

| Код | Уровень         | Ключевое слово | Описание                                    |
| --- | --------------- | -------------- | ------------------------------------------- |
| 0   | Emergency       | `emerg`        | Система неработоспособна                    |
| 1   | Alert           | `alert`        | Нужно немедленное действие                  |
| 2   | Critical        | `crit`         | Критическая ошибка                          |
| 3   | Error           | `err`          | Ошибка                                      |
| 4   | Warning         | `warning`      | Предупреждение                              |
| 5   | Notice          | `notice`       | Нормальное, но значимое событие             |
| 6   | Informational   | `info`         | Информационное сообщение                    |
| 7   | Debug           | `debug`        | Отладка                                     |

### **PRI (приоритет)**

```
PRI = Facility × 8 + Severity

auth (4), warning (4)  → PRI = 4 × 8 + 4 = 36   → <36>
local7 (23), notice (5) → PRI = 23 × 8 + 5 = 189 → <189>
```

## **Формат сообщения**

### **RFC 3164 (BSD, устаревший)**

```
<34>Oct 17 10:15:42 router1 sshd[1234]: Failed password for root from 203.0.113.50
 │  │               │       │          │
PRI TIMESTAMP       HOSTNAME TAG        MSG
```

Недостатки: нет года и часового пояса, нет структурированных данных, произвольные отклонения от формата.

### **RFC 5424 (современный)**

```
<34>1 2026-10-17T10:15:42.123+03:00 router1 sshd 1234 ID47 [origin ip="10.0.0.1"][meta sequenceId="42"] Failed password for root
 │  │ │                             │       │    │    │    │                                          │
PRI │ TIMESTAMP (ISO 8601)        HOSTNAME APP  PROCID MSGID STRUCTURED-DATA                            MSG
  VERSION
```

| Поле               | Описание                                        |
| ------------------ | ----------------------------------------------- |
| **PRI**            | Приоритет                                       |
| **VERSION**        | 1                                               |
| **TIMESTAMP**      | Время с миллисекундами и часовым поясом         |
| **HOSTNAME**       | Имя или IP источника                            |
| **APP-NAME**       | Приложение                                      |
| **PROCID**         | ID процесса                                     |
| **MSGID**          | Тип сообщения                                   |
| **STRUCTURED-DATA** | Структурированные пары ключ-значение (или `-`) |
| **MSG**            | Текст (UTF-8)                                   |

## **Транспорт**

| Транспорт      | Порт  | Надёжность                     | Шифрование |
| -------------- | ----- | ------------------------------ | ---------- |
| **UDP**        | 514   | Сообщения могут теряться       | Нет        |
| **TCP**        | 514 / 601 | Надёжная доставка          | Нет        |
| **TLS**        | 6514  | Надёжная доставка              | Да         |
| **RELP**       | 2514 (обычно) | Подтверждения на уровне приложения (rsyslog) | Опционально |

## **Архитектура**

```
[Коммутаторы]──UDP 514──┐
[Маршрутизаторы]────────┤
[Linux-серверы]──TLS────┼──> [Сборщик syslog / relay] ──> [SIEM / ELK / Graylog]
[Файрволы]──────────────┘                                  Хранение, поиск, алерты
```

## **Примеры использования**

### **rsyslog — сервер (приём логов)**

```
# /etc/rsyslog.d/10-server.conf
module(load="imudp")
input(type="imudp" port="514")
module(load="imtcp")
input(type="imtcp" port="514")

# Раскладывать по файлам по имени хоста
template(name="PerHost" type="string" string="/var/log/remote/%HOSTNAME%/%PROGRAMNAME%.log")
*.* ?PerHost
& stop
```

### **rsyslog — клиент (отправка)**

```
# Всё на сервер по TCP (@@ = TCP, @ = UDP)
*.* @@logserver.example.com:514

# Только auth и ошибки
auth,authpriv.*   @@logserver.example.com:514
*.err             @logserver.example.com:514

# С очередью на диске на случай недоступности сервера
action(type="omfwd" target="logserver.example.com" port="6514" protocol="tcp"
       StreamDriver="gtls" StreamDriverMode="1" StreamDriverAuthMode="x509/name"
       queue.type="LinkedList" queue.filename="fwdq" queue.saveOnShutdown="on")
```

### **Отправка тестового сообщения**

```bash
logger "Тестовое сообщение"
logger -p auth.warning -t myapp "Подозрительный вход"
logger -n logserver.example.com -P 514 -T "Через TCP"   # util-linux

# Посмотреть локальные логи
tail -f /var/log/syslog          # Debian/Ubuntu
tail -f /var/log/messages        # RHEL
journalctl -f
```

### **Cisco IOS**

```
service timestamps log datetime msec localtime show-timezone
logging host 10.0.0.50 transport udp port 514
logging trap informational
logging source-interface Loopback0
logging facility local6
logging buffered 64000 debugging
```

```
show logging
```

### **Juniper Junos**

```
set system syslog host 10.0.0.50 any notice
set system syslog host 10.0.0.50 authorization info
set system syslog host 10.0.0.50 structured-data
```

### **MikroTik RouterOS**

```
/system logging action add name=remote target=remote remote=10.0.0.50 remote-port=514
/system logging add topics=info action=remote
```

### **Windows**

Windows использует собственный журнал событий (Event Log). Для отправки в syslog применяют агенты: NXLog, Winlogbeat, Snare, rsyslog Windows Agent.

### **Wireshark**

```
syslog
udp.port == 514
```

## **Безопасность Syslog**

### **Проблемы**

1. **UDP без доставки** — при нагрузке или атаке логи теряются
2. **Нет аутентификации** — можно отправить поддельные сообщения от имени любого хоста
3. **Нет шифрования** — логи могут содержать чувствительные данные
4. **Переполнение** — флуд логами скрывает реальные события или заполняет диск
5. **Удаление следов** — злоумышленник очищает локальные логи

### **Рекомендации**

- TLS (RFC 5425, порт 6514) или RELP для важных источников
- Ограничить приём ACL/файрволом
- Синхронизировать время (NTP) на всех источниках — иначе невозможно сопоставить события
- Хранить логи централизованно и неизменяемо (WORM, отдельный сервер)
- Ротация и контроль места (`logrotate`)
- Мониторинг «тишины» — источник перестал присылать логи

## **Сравнение Syslog и современных систем логирования**

| Характеристика      | Syslog                    | journald                    | OpenTelemetry Logs / агенты (Fluent Bit, Vector) |
| ------------------- | ------------------------- | --------------------------- | ------------------------------------------------ |
| **Формат**          | Текст (+ structured data) | Двоичный журнал с полями    | Структурированный (JSON, OTLP)                   |
| **Передача по сети** | Встроена                 | Через systemd-journal-remote или syslog | Встроена                             |
| **Поддержка оборудованием** | Везде             | Только Linux                | Только серверы                                   |
| **Применение**      | Сеть, legacy, универсально | Локальные логи Linux       | Облака, микросервисы                             |
