**TACACS+** (Terminal Access Controller Access-Control System Plus) — протокол AAA (аутентификация, авторизация, учёт), созданный Cisco для централизованного управления доступом администраторов к сетевому оборудованию. В отличие от RADIUS, TACACS+ разделяет три функции AAA, шифрует всё тело пакета и умеет авторизовывать **каждую введённую команду** — поэтому его используют для входа на маршрутизаторы, коммутаторы и файрволы.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP                                                                      |
| **Порт**                    | 49                                                                       |
| **Стандарт**                | RFC 8907 (2020, информационный); отдельно стандартизирован TACACS+ over TLS 1.3 |
| **Шифрование**              | Обфускация тела пакета (MD5 + общий секрет); TLS в новых версиях         |
| **Функции**                 | Аутентификация, авторизация и учёт — раздельно                           |
| **Реализации**              | Cisco ISE, Aruba ClearPass, tac_plus (Shrubbery), tac_plus-ng            |

## **История**

| Протокол     | Описание                                                       |
| ------------ | -------------------------------------------------------------- |
| **TACACS**   | 1984, UDP 49, для доступа к ARPANET (RFC 1492)                 |
| **XTACACS**  | Расширенный TACACS от Cisco, устарел                           |
| **TACACS+**  | 1993, полностью новый протокол Cisco на TCP, несовместим с TACACS |

## **Структура пакета**

### **Заголовок (12 байт)**

| Поле             | Размер (байты) | Описание                                       |
| ---------------- | -------------- | ---------------------------------------------- |
| **major_version** | 4 бита        | 0xC                                            |
| **minor_version** | 4 бита        | 0x0 или 0x1                                    |
| **type**         | 1              | 1 = Authentication, 2 = Authorization, 3 = Accounting |
| **seq_no**       | 1              | Номер пакета в сессии (клиент — нечётные, сервер — чётные) |
| **flags**        | 1              | UNENCRYPTED (0x01), SINGLE_CONNECT (0x04)      |
| **session_id**   | 4              | Случайный идентификатор сессии                 |
| **length**       | 4              | Длина тела                                     |

Тело пакета обфусцируется XOR с псевдослучайной последовательностью из MD5(session_id, key, version, seq_no, …).

## **Аутентификация**

| Пакет                  | Направление      | Описание                                 |
| ---------------------- | ---------------- | ---------------------------------------- |
| **START**              | NAS → сервер     | Начало (тип: ASCII, PAP, CHAP…)          |
| **REPLY**              | Сервер → NAS     | Статус: PASS, FAIL, GETUSER, GETPASS, GETDATA, ERROR |
| **CONTINUE**           | NAS → сервер     | Ответ пользователя (логин, пароль)       |

```
Администратор      Коммутатор (NAS)              TACACS+ сервер
     |                    |                            |
     |-- ssh admin@sw --->|                            |
     |                    |--- START (ASCII) --------->|
     |                    |<-- REPLY: GETPASS ---------|
     |<-- "Password:" ----|                            |
     |-- ******** ------->|                            |
     |                    |--- CONTINUE (password) --->|
     |                    |<-- REPLY: PASS ------------|
     |<-- Вход выполнен --|                            |
```

Сервер управляет диалогом: может запросить OTP, сменить пароль, вывести сообщение.

## **Авторизация**

Авторизация выполняется отдельно и может происходить **для каждой команды**:

| Пакет        | Описание                                                   |
| ------------ | ---------------------------------------------------------- |
| **REQUEST**  | NAS спрашивает: можно ли пользователю выполнить `service=shell cmd=configure` |
| **RESPONSE** | PASS_ADD, PASS_REPL, FAIL, ERROR + атрибуты (например, `priv-lvl=15`) |

```
admin# configure terminal
  → REQUEST: user=alice, cmd=configure, cmd-arg=terminal
  ← RESPONSE: PASS_ADD
admin(config)# no router bgp 65000
  → REQUEST: user=alice, cmd=no, cmd-arg=router bgp 65000
  ← RESPONSE: FAIL        → "Command authorization failed"
```

### **Атрибуты авторизации (AV-пары)**

| Атрибут          | Пример               | Описание                            |
| ---------------- | -------------------- | ----------------------------------- |
| `service`        | `shell`, `ppp`       | Тип сервиса                         |
| `priv-lvl`       | `15`                 | Уровень привилегий Cisco (0–15)     |
| `cmd`            | `show`               | Команда                             |
| `cmd-arg`        | `running-config`     | Аргументы                           |
| `timeout`        | `30`                 | Таймаут сессии                      |
| `acl`            | `MGMT-ONLY`          | ACL для сессии                      |

## **Учёт (Accounting)**

| Флаг       | Описание                                    |
| ---------- | ------------------------------------------- |
| **START**  | Начало сессии / команды                     |
| **STOP**   | Конец сессии / команды                      |
| **WATCHDOG** | Промежуточная запись                      |

Сервер сохраняет журнал: **кто, когда, с какого адреса и какую команду выполнил** — важно для аудита и расследований.

## **Примеры конфигурации**

### **Cisco IOS**

```
aaa new-model

tacacs server ISE1
 address ipv4 10.0.0.20
 key 7 S3cretKey
 single-connection

aaa group server tacacs+ TAC-GROUP
 server name ISE1

! Аутентификация: сначала TACACS+, при недоступности — локальные учётки
aaa authentication login default group TAC-GROUP local
aaa authorization exec default group TAC-GROUP local if-authenticated
aaa authorization commands 15 default group TAC-GROUP local if-authenticated
aaa accounting exec default start-stop group TAC-GROUP
aaa accounting commands 15 default start-stop group TAC-GROUP

ip tacacs source-interface Loopback0

! Резервная локальная учётка
username backup privilege 15 secret Str0ngLocal
```

```
show tacacs
test aaa group TAC-GROUP alice password legacy
debug tacacs
```

### **Сервер tac_plus (Linux)**

```
key = S3cretKey

accounting file = /var/log/tac_plus.acct

group = netadmins {
    default service = permit
    service = exec {
        priv-lvl = 15
    }
}

group = helpdesk {
    service = exec {
        priv-lvl = 1
    }
    cmd = show {
        permit .*
    }
    cmd = ping {
        permit .*
    }
}

user = alice {
    member = netadmins
    login = des <хэш>
}

user = bob {
    member = helpdesk
    login = PAM
}
```

### **Juniper Junos**

```
set system tacplus-server 10.0.0.20 secret S3cretKey
set system authentication-order [ tacplus password ]
set system accounting events [ login change-log interactive-commands ]
set system accounting destination tacplus
```

### **Wireshark**

```
tacplus
tcp.port == 49
```

Для расшифровки укажите общий ключ в настройках протокола TACACS+.

## **Безопасность**

### **Слабые места**

1. **Обфускация на MD5** — это не настоящее шифрование, при слабом ключе тело восстанавливается
2. **Общий ключ** часто одинаков для всех устройств
3. **Нет аутентификации сервера** в классической версии
4. **Недоступность сервера** = невозможность войти (нужна резервная локальная учётка)

### **Рекомендации**

- Длинный уникальный ключ для каждого устройства или группы
- **TACACS+ over TLS 1.3** там, где поддерживается
- Трафик TACACS+ — только через управляющую сеть
- Несколько серверов для отказоустойчивости
- Резервная локальная учётка с длинным паролем

## **Сравнение TACACS+ и RADIUS**

| Характеристика       | TACACS+                       | RADIUS                          |
| -------------------- | ----------------------------- | ------------------------------- |
| **Транспорт**        | TCP 49                        | UDP 1812/1813                   |
| **Шифрование**       | Всё тело пакета               | Только пароль                   |
| **AAA**              | Раздельно                     | Аутентификация + авторизация вместе |
| **Авторизация команд** | Да                          | Нет                             |
| **Учёт команд**      | Да                            | Ограниченно                     |
| **Мультипротокольность** | Есть, но применяется для shell | Широко (PPP, 802.1X, Wi-Fi) |
| **Основное применение** | Администрирование устройств | Доступ пользователей к сети    |
| **Стандарт**         | Cisco → RFC 8907              | IETF RFC 2865                   |
