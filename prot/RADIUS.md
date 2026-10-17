**RADIUS** (Remote Authentication Dial-In User Service) — протокол централизованной аутентификации, авторизации и учёта (AAA) пользователей сетевого доступа. Его используют Wi-Fi точки доступа (WPA2/WPA3-Enterprise), коммутаторы (802.1X), VPN-шлюзы и провайдеры: устройство не хранит пароли, а спрашивает RADIUS-сервер, можно ли пустить пользователя.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP (RadSec — TCP/TLS)                                                   |
| **Порты**                   | 1812 (аутентификация), 1813 (учёт); устаревшие 1645/1646; RadSec — 2083  |
| **Стандарты**               | RFC 2865 (аутентификация), RFC 2866 (учёт), RFC 5176 (CoA)               |
| **Модель**                  | Клиент-сервер (клиент — NAS, а не пользователь)                          |
| **Функции**                 | AAA: Authentication, Authorization, Accounting                           |
| **Защита**                  | Общий секрет (shared secret) между NAS и сервером                        |
| **Реализации**              | FreeRADIUS, Microsoft NPS, Cisco ISE, Aruba ClearPass                    |

## **Участники**

| Участник               | Описание                                                        |
| ---------------------- | --------------------------------------------------------------- |
| **Пользователь (Supplicant)** | Устройство или человек, который хочет подключиться       |
| **NAS (Network Access Server)** | Точка доступа, коммутатор, VPN-шлюз — RADIUS-клиент    |
| **RADIUS-сервер**      | Проверяет учётные данные, возвращает решение и параметры        |
| **Хранилище**          | Active Directory, LDAP, SQL, файлы                              |

```
Пользователь  ──>  NAS (точка доступа)  ──RADIUS──>  RADIUS-сервер  ──>  AD / LDAP
```

## **Структура пакета**

| Поле               | Размер (байты) | Описание                                          |
| ------------------ | -------------- | ------------------------------------------------- |
| **Code**           | 1              | Тип пакета                                        |
| **Identifier**     | 1              | Сопоставление запроса и ответа                    |
| **Length**         | 2              | Длина пакета (20–4096 байт)                       |
| **Authenticator**  | 16             | Случайное значение в запросе / хэш в ответе       |
| **Attributes**     | Переменный     | Атрибуты в формате TLV (Type-Length-Value)        |

## **Типы пакетов**

| Code | Пакет                  | Направление         | Описание                                   |
| ---- | ---------------------- | ------------------- | ------------------------------------------ |
| 1    | **Access-Request**     | NAS → сервер        | Запрос на доступ                           |
| 2    | **Access-Accept**      | Сервер → NAS        | Доступ разрешён (+ параметры)              |
| 3    | **Access-Reject**      | Сервер → NAS        | Доступ запрещён                            |
| 4    | **Accounting-Request** | NAS → сервер        | Начало/конец/промежуточный учёт сессии     |
| 5    | **Accounting-Response** | Сервер → NAS       | Подтверждение учёта                        |
| 11   | **Access-Challenge**   | Сервер → NAS        | Нужны дополнительные данные (EAP, OTP)     |
| 40   | **Disconnect-Request** | Сервер → NAS        | Принудительно отключить сессию (RFC 5176)  |
| 41/42 | Disconnect-ACK / NAK  | NAS → сервер        | Ответ на отключение                        |
| 43   | **CoA-Request**        | Сервер → NAS        | Изменить параметры активной сессии         |
| 44/45 | CoA-ACK / NAK         | NAS → сервер        | Ответ на CoA                               |

## **Важные атрибуты**

| Тип | Атрибут                    | Описание                                         |
| --- | -------------------------- | ------------------------------------------------ |
| 1   | **User-Name**              | Имя пользователя                                 |
| 2   | **User-Password**          | Пароль (скрыт с помощью MD5 и общего секрета)    |
| 4   | **NAS-IP-Address**         | IP-адрес NAS                                     |
| 5   | **NAS-Port**               | Порт NAS                                         |
| 6   | **Service-Type**           | Тип сервиса (Login, Framed, Administrative)      |
| 8   | **Framed-IP-Address**      | IP-адрес, выдаваемый пользователю                |
| 11  | **Filter-Id**              | Имя ACL для пользователя                         |
| 18  | **Reply-Message**          | Сообщение пользователю                           |
| 25  | **Class**                  | Метка сервера, возвращается в учёте              |
| 26  | **Vendor-Specific**        | Атрибуты производителя (Cisco, Microsoft, MikroTik) |
| 27  | **Session-Timeout**        | Максимальная длительность сессии                 |
| 31  | **Calling-Station-Id**     | MAC-адрес или номер клиента                      |
| 40  | **Acct-Status-Type**       | Start / Stop / Interim-Update                    |
| 64–66, 81 | **Tunnel-Type**, **Tunnel-Medium-Type**, **Tunnel-Private-Group-ID** | Назначение VLAN |
| 79  | **EAP-Message**            | EAP-пакет внутри RADIUS                          |
| 80  | **Message-Authenticator**  | HMAC-MD5 всего пакета (обязателен для EAP и после BlastRADIUS) |

## **Процесс аутентификации**

### **PAP (простой пароль)**

```
Пользователь      NAS                     RADIUS-сервер
    |--- логин/пароль --->|                         |
    |                     |--- Access-Request ----->|
    |                     |    User-Name, User-Password
    |                     |<-- Access-Accept -------|
    |                     |    VLAN 20, Session-Timeout
    |<-- доступ ----------|                         |
    |                     |--- Accounting-Request ->|  Start
    |                     |<-- Accounting-Response -|
```

### **EAP (802.1X, WPA-Enterprise)**

```
Клиент          Точка доступа            RADIUS-сервер
  |--- EAPOL ------->|                         |
  |                  |--- Access-Request ----->|  EAP-Message
  |                  |<-- Access-Challenge ----|  EAP-Message
  |<-- EAPOL --------|                         |
  |      ... несколько раундов (TLS-туннель для PEAP/EAP-TLS) ...
  |                  |<-- Access-Accept -------|  + ключи MS-MPPE для Wi-Fi
  |<-- EAP-Success --|                         |
```

## **Методы аутентификации**

| Метод          | Описание                                                  | Безопасность |
| -------------- | --------------------------------------------------------- | ------------ |
| **PAP**        | Пароль скрыт общим секретом                               | Слабая (без TLS) |
| **CHAP**       | Challenge-Response                                        | Слабая       |
| **MS-CHAPv2**  | Вариант Microsoft, используется внутри PEAP               | Слабая без туннеля |
| **EAP-TLS**    | Взаимная аутентификация по сертификатам                   | Высокая      |
| **PEAP**       | MS-CHAPv2 внутри TLS-туннеля                              | Средняя      |
| **EAP-TTLS**   | Любой метод внутри TLS-туннеля                            | Средняя      |

## **Примеры использования**

### **FreeRADIUS — клиент и пользователь**

```
# /etc/freeradius/3.0/clients.conf
client office-ap {
    ipaddr = 192.168.1.0/24
    secret = Str0ng-Sh4red-S3cret
}

# /etc/freeradius/3.0/mods-config/files/authorize
alice   Cleartext-Password := "password"
        Tunnel-Type = VLAN,
        Tunnel-Medium-Type = IEEE-802,
        Tunnel-Private-Group-Id = "20"
```

```bash
# Запуск в режиме отладки
freeradius -X

# Тестовый запрос
radtest alice password 127.0.0.1 0 testing123

# Произвольный запрос
echo "User-Name=alice,User-Password=password" | radclient -x 127.0.0.1 auth testing123

# Отключить сессию (CoA/Disconnect)
echo "User-Name=alice" | radclient -x 192.168.1.5:3799 disconnect secret
```

### **Cisco IOS — коммутатор как NAS**

```
aaa new-model
radius server NPS1
 address ipv4 10.0.0.10 auth-port 1812 acct-port 1813
 key Str0ng-Sh4red-S3cret
aaa group server radius RADIUS-GROUP
 server name NPS1
aaa authentication dot1x default group RADIUS-GROUP
aaa authorization network default group RADIUS-GROUP
aaa accounting dot1x default start-stop group RADIUS-GROUP
```

### **Wireshark**

```
radius
radius.code == 3          # Access-Reject
```

Для расшифровки User-Password укажите общий секрет в настройках протокола RADIUS.

## **Безопасность RADIUS**

### **Слабые места**

1. **MD5** — защита пароля и ответов основана на MD5 и общем секрете
2. **UDP без шифрования** — атрибуты (кроме пароля) передаются открыто
3. **Слабый общий секрет** — подбирается офлайн по перехваченному трафику
4. **BlastRADIUS (CVE-2024-3596)** — коллизия MD5 позволяет подделать Access-Accept
5. **Нет защиты от повтора** на уровне протокола

### **Защита**

- Длинный случайный общий секрет (не менее 32 символов), свой для каждого NAS
- Обязательный **Message-Authenticator** во всех пакетах (защита от BlastRADIUS)
- **RadSec** (RADIUS over TLS, RFC 6614) или RADIUS over DTLS
- RADIUS-трафик — в изолированной сети управления
- EAP-TLS вместо паролей

## **Применение**

1. **Wi-Fi Enterprise** — WPA2/WPA3-Enterprise, eduroam
2. **802.1X на проводных портах**
3. **VPN** — проверка пользователей OpenVPN, IPsec, Cisco AnyConnect
4. **Провайдеры** — PPPoE-абоненты, учёт трафика, выдача IP
5. **Вход на сетевое оборудование** (хотя чаще используют TACACS+)

## **Сравнение RADIUS и TACACS+**

| Характеристика      | RADIUS                         | TACACS+                          |
| ------------------- | ------------------------------ | -------------------------------- |
| **Транспорт**       | UDP 1812/1813                  | TCP 49                           |
| **Шифрование**      | Только пароль                  | Всё тело пакета                  |
| **AAA**             | Аутентификация и авторизация вместе | Раздельно                   |
| **Авторизация команд** | Нет                         | Да, по каждой команде            |
| **Стандарт**        | Открытый (IETF)                | Изначально Cisco, RFC 8907       |
| **Основное применение** | Доступ к сети (Wi-Fi, VPN, 802.1X) | Администрирование устройств |
