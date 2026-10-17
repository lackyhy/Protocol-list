**L2TP** (Layer 2 Tunneling Protocol) — протокол туннелирования PPP-сессий (и других L2-кадров) через IP-сети. L2TP объединил лучшее из PPTP (Microsoft) и L2F (Cisco). Сам по себе он **не шифрует** данные, поэтому для VPN почти всегда используется в связке **L2TP/IPsec**. Также L2TP широко применяется провайдерами для доставки абонентских PPP-сессий до BRAS.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Канальный (туннелирует L2) поверх транспортного                         |
| **Транспорт**               | UDP 1701 (L2TPv2), L2TPv3 — UDP или напрямую IP (протокол 115)           |
| **Стандарты**               | RFC 2661 (L2TPv2), RFC 3931 (L2TPv3), RFC 3193 (L2TP/IPsec)              |
| **Шифрование**              | Нет (обеспечивает IPsec)                                                 |
| **Аутентификация**          | PPP (PAP, CHAP, MS-CHAPv2, EAP) + IPsec (PSK или сертификаты)            |
| **Порты для L2TP/IPsec**    | UDP 500 (IKE), UDP 4500 (NAT-T), протокол 50 (ESP), UDP 1701 внутри IPsec |
| **Поддержка**               | Встроен в Windows, macOS, iOS, Android (ограниченно), Linux              |

## **Участники**

| Компонент     | Описание                                                      |
| ------------- | ------------------------------------------------------------- |
| **LAC**       | L2TP Access Concentrator — инициирует туннель (клиент или оборудование провайдера) |
| **LNS**       | L2TP Network Server — завершает туннель и PPP-сессию (VPN-сервер, BRAS) |

```
Клиент ── PPP ── [LAC] ════ L2TP туннель (UDP 1701) ════ [LNS] ── Корпоративная сеть
```

При удалённом VPN клиент сам является LAC (**voluntary tunnel**). У провайдера LAC — это DSLAM/BRAS, а клиент о туннеле не знает (**compulsory tunnel**).

## **Туннели и сессии**

- **Tunnel** — управляющее соединение между LAC и LNS (Tunnel ID)
- **Session** — отдельная PPP-сессия внутри туннеля (Session ID)
- В одном туннеле может быть множество сессий

## **Структура заголовка L2TPv2**

| Поле              | Размер (биты) | Описание                                         |
| ----------------- | ------------- | ------------------------------------------------ |
| **T**             | 1             | 1 = управляющее сообщение, 0 = данные            |
| **L**             | 1             | Есть поле Length                                 |
| **S**             | 1             | Есть поля Ns/Nr (порядковые номера)              |
| **O**             | 1             | Есть Offset                                      |
| **P**             | 1             | Приоритет                                        |
| **Ver**           | 4             | Версия (2)                                       |
| **Length**        | 16 (опц.)     | Длина сообщения                                  |
| **Tunnel ID**     | 16            | Идентификатор туннеля                            |
| **Session ID**    | 16            | Идентификатор сессии                             |
| **Ns / Nr**       | 16 + 16 (опц.) | Номера отправленных и ожидаемых сообщений       |
| **Offset**        | 16 (опц.)     | Смещение до данных                               |

Управляющие сообщения передаются **надёжно** (с подтверждениями и повторами), данные — нет.

## **Управляющие сообщения**

| Сообщение   | Назначение                                     |
| ----------- | ---------------------------------------------- |
| **SCCRQ**   | Start-Control-Connection-Request — запрос туннеля |
| **SCCRP**   | Start-Control-Connection-Reply                 |
| **SCCCN**   | Start-Control-Connection-Connected             |
| **StopCCN** | Закрытие туннеля                               |
| **HELLO**   | Keepalive                                      |
| **ICRQ / ICRP / ICCN** | Incoming-Call — создание сессии     |
| **OCRQ / OCRP / OCCN** | Outgoing-Call                       |
| **CDN**     | Call-Disconnect-Notify — закрытие сессии       |
| **ZLB**     | Zero-Length Body — пустое подтверждение        |

## **Процесс установления**

```
LAC (клиент)                                          LNS (сервер)
   |                                                       |
   |========= IPsec: IKE (UDP 500/4500), ESP ============>|  1. Защищённый канал
   |                                                       |
   |--- SCCRQ ------------------------------------------->|  2. Туннель L2TP
   |<-- SCCRP --------------------------------------------|
   |--- SCCCN ------------------------------------------->|
   |                                                       |
   |--- ICRQ -------------------------------------------->|  3. Сессия
   |<-- ICRP ---------------------------------------------|
   |--- ICCN -------------------------------------------->|
   |                                                       |
   |--- PPP: LCP, аутентификация (MS-CHAPv2), IPCP ------>|  4. PPP
   |<-- IP-адрес 10.8.0.10, DNS --------------------------|
   |                                                       |
   |<=========== Данные: ESP(UDP 1701(L2TP(PPP(IP)))) ====>|
```

## **Инкапсуляция L2TP/IPsec**

```
| IP | ESP | UDP 1701 | L2TP | PPP | Исходный IP | Data | ESP Trailer |

С NAT-T:
| IP | UDP 4500 | ESP | UDP 1701 | L2TP | PPP | IP | Data | ESP Trailer |
```

Накладные расходы ~ **70–90 байт**, что снижает MTU до ~1400 байт.

## **L2TPv3**

L2TPv3 — обобщение для передачи **любого L2-трафика** (Ethernet, VLAN, Frame Relay) — используется как **pseudowire** между площадками:

| Характеристика     | L2TPv2          | L2TPv3                            |
| ------------------ | --------------- | --------------------------------- |
| **Полезная нагрузка** | Только PPP   | Ethernet, VLAN, PPP, HDLC и др.   |
| **Транспорт**      | UDP 1701        | IP протокол 115 или UDP           |
| **Session ID**     | 16 бит          | 32 бита                           |
| **Применение**     | Удалённый доступ VPN, провайдеры | L2-мосты между площадками |

## **Примеры конфигурации**

### **Сервер на Linux (strongSwan + xl2tpd)**

```
# /etc/ipsec.conf (strongSwan)
conn L2TP-PSK
    keyexchange=ikev1
    authby=secret
    type=transport
    left=%any
    leftprotoport=17/1701
    right=%any
    rightprotoport=17/%any
    auto=add

# /etc/ipsec.secrets
%any %any : PSK "Str0ng-Pre-Shared-Key"
```

```
# /etc/xl2tpd/xl2tpd.conf
[lns default]
ip range = 10.8.0.10-10.8.0.100
local ip = 10.8.0.1
require chap = yes
refuse pap = yes
require authentication = yes
pppoptfile = /etc/ppp/options.xl2tpd
```

### **Клиент Windows (PowerShell)**

```powershell
Add-VpnConnection -Name "Office" -ServerAddress "vpn.example.com" `
    -TunnelType L2tp -L2tpPsk "Str0ng-Pre-Shared-Key" `
    -AuthenticationMethod MSChapv2 -EncryptionLevel Required -Force
rasdial "Office" alice password
```

Если сервер за NAT, на Windows нужен ключ реестра `AssumeUDPEncapsulationContextOnSendRule = 2`.

### **MikroTik RouterOS**

```
/interface l2tp-server server set enabled=yes use-ipsec=required ipsec-secret=Str0ng-Pre-Shared-Key
/ppp secret add name=alice password=secret service=l2tp local-address=10.8.0.1 remote-address=10.8.0.10
```

### **L2TPv3 pseudowire (Linux)**

```bash
ip l2tp add tunnel tunnel_id 1 peer_tunnel_id 1 encap udp \
    local 203.0.113.1 remote 198.51.100.1 udp_sport 5000 udp_dport 5000
ip l2tp add session tunnel_id 1 session_id 10 peer_session_id 10
ip link set l2tpeth0 up master br0
```

### **Wireshark**

```
l2tp
udp.port == 1701
```

## **Безопасность**

### **Проблемы**

1. **Без IPsec** — данные и пароли PPP передаются открыто
2. **Общий PSK** — один ключ на всех пользователей; утечка ключа позволяет MITM
3. **MS-CHAPv2** — слабый, защищён только IPsec
4. **IKEv1** — устаревший режим согласования
5. **Блокировка** — легко обнаруживается и блокируется (фиксированные порты)

### **Рекомендации**

- Только L2TP/IPsec, никогда «голый» L2TP через интернет
- Сертификаты вместо PSK
- Для новых внедрений лучше **IKEv2**, **WireGuard** или **OpenVPN**

## **Сравнение VPN-протоколов**

| Характеристика    | L2TP/IPsec           | PPTP              | IKEv2/IPsec        | OpenVPN          | WireGuard       |
| ----------------- | -------------------- | ----------------- | ------------------ | ---------------- | --------------- |
| **Безопасность**  | Средняя              | Взломан           | Высокая            | Высокая          | Высокая         |
| **Скорость**      | Средняя (двойная инкапсуляция) | Высокая | Высокая         | Средняя          | Очень высокая   |
| **Встроен в ОС**  | Да                   | Удалён из новых ОС | Да                | Нет              | Linux (ядро)    |
| **Проход через NAT** | NAT-T (UDP 4500)  | Плохо (GRE)       | NAT-T              | Хорошо           | Хорошо          |
| **Мобильность**   | Нет                  | Нет               | Да (MOBIKE)        | Нет              | Да              |
