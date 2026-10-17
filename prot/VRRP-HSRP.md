**VRRP** (Virtual Router Redundancy Protocol) и **HSRP** (Hot Standby Router Protocol) — протоколы резервирования шлюза по умолчанию (FHRP, First Hop Redundancy Protocol). Несколько маршрутизаторов делят один виртуальный IP- и MAC-адрес. Хосты используют этот адрес как шлюз, и если активный маршрутизатор выходит из строя, его роль за секунды подхватывает резервный — без перенастройки клиентов.

## **Основные характеристики**

| Параметр                    | VRRP                                      | HSRP                                       |
| --------------------------- | ----------------------------------------- | ------------------------------------------ |
| **Уровень OSI**             | Сетевой                                   | Прикладной (UDP)                           |
| **Стандарт**                | Открытый: RFC 5798 (VRRPv3), RFC 9568     | Проприетарный Cisco (RFC 2281 — информационный) |
| **Инкапсуляция**            | IP, протокол 112                          | UDP 1985 (v1, v2), UDP 2029 (v2 для IPv6)  |
| **Multicast-адрес**         | `224.0.0.18`, `ff02::12`                  | `224.0.0.2` (v1), `224.0.0.102` (v2)       |
| **Виртуальный MAC**         | `00:00:5E:00:01:XX` (XX = VRID)           | `00:00:0C:07:AC:XX` (v1), `00:00:0C:9F:FX:XX` (v2) |
| **Роли**                    | Master / Backup                           | Active / Standby / Listen                  |
| **Номер группы**            | VRID 1–255                                | 0–255 (v1), 0–4095 (v2)                    |
| **Приоритет по умолчанию**  | 100 (255 — владелец IP-адреса)            | 100                                        |
| **Preempt по умолчанию**    | Включён                                   | Выключен                                   |
| **Hello / Hold**            | 1 с / ~3,6 с                              | 3 с / 10 с                                 |
| **IP = адрес интерфейса**   | Можно                                     | Нельзя                                     |

## **Проблема, которую решают FHRP**

```
Без FHRP:                              С FHRP:
  Хосты: шлюз 192.168.1.1                Хосты: шлюз 192.168.1.1 (виртуальный)
         |                                       |
     [Router A]  ← отказ = сеть без        [Router A]  [Router B]
     192.168.1.1   интернета               .2 Active    .3 Standby
                                              \         /
                                         виртуальный IP .1
                                         При отказе A шлюзом станет B
```

## **Как работает VRRP**

```
1. Маршрутизаторы в группе VRID 10 обмениваются Advertisement-сообщениями
2. Выбирается Master — наибольший приоритет (при равенстве — наибольший IP)
3. Master отвечает на ARP-запросы о виртуальном IP своим виртуальным MAC
4. Master раз в секунду рассылает Advertisement на 224.0.0.18
5. Если Backup не получает Advertisement в течение Master_Down_Interval,
   он становится Master и отправляет Gratuitous ARP
6. Коммутаторы обновляют MAC-таблицы — трафик идёт на новый Master
```

### **Структура пакета VRRPv3**

| Поле                | Описание                                     |
| ------------------- | -------------------------------------------- |
| **Version**         | 3                                            |
| **Type**            | 1 = Advertisement                            |
| **Virtual Rtr ID**  | Номер группы                                 |
| **Priority**        | 0–255 (0 = Master уходит, 255 = владелец IP) |
| **Count IPvX Addr** | Количество виртуальных адресов               |
| **Max Adver Int**   | Интервал (в сотых долях секунды)             |
| **Checksum**        | Контрольная сумма                            |
| **IPvX Address(es)** | Виртуальные адреса                          |

## **Как работает HSRP**

### **Состояния HSRP**

| Состояние    | Описание                                                    |
| ------------ | ----------------------------------------------------------- |
| **Initial**  | Начальное состояние                                         |
| **Learn**    | Ждёт сообщения от Active, чтобы узнать виртуальный IP       |
| **Listen**   | Знает виртуальный IP, но не Active и не Standby              |
| **Speak**    | Участвует в выборах                                         |
| **Standby**  | Резерв, готов стать Active                                  |
| **Active**   | Пересылает трафик на виртуальный адрес                      |

### **Типы сообщений**

| Сообщение   | Описание                                               |
| ----------- | ------------------------------------------------------ |
| **Hello**   | Периодическое, сообщает состояние и приоритет          |
| **Coup**    | Маршрутизатор с большим приоритетом забирает роль Active (preempt) |
| **Resign**  | Active сообщает, что уходит                            |

### **Версии HSRP**

| Характеристика     | HSRPv1           | HSRPv2                   |
| ------------------ | ---------------- | ------------------------ |
| **Группы**         | 0–255            | 0–4095                   |
| **Multicast**      | 224.0.0.2        | 224.0.0.102              |
| **IPv6**           | Нет              | Да                       |
| **Миллисекундные таймеры** | Нет      | Да                       |

## **Отслеживание (Tracking)**

Если у Active маршрутизатора упал канал в интернет, он остаётся Active, но трафик уходит в никуда. **Tracking** снижает приоритет при отказе отслеживаемого объекта:

```
track 1 interface GigabitEthernet0/0 line-protocol
track 2 ip sla 1 reachability       ! пинг до 8.8.8.8
```

Приоритет 110 − 20 = 90 < 100 → при включённом preempt роль переходит на Standby.

## **Балансировка нагрузки**

FHRP не балансируют нагрузку в одной группе — работает только Master/Active. Варианты:

| Способ                     | Описание                                                    |
| -------------------------- | ----------------------------------------------------------- |
| **Несколько групп**        | Группа 1 Active на A, группа 2 Active на B, половина хостов использует шлюз группы 1, половина — группы 2 |
| **Разные VLAN**            | VLAN 10 — Active на A, VLAN 20 — Active на B                |
| **GLBP** (Cisco)           | Один виртуальный IP, несколько виртуальных MAC — настоящая балансировка |

## **Примеры конфигурации**

### **HSRP (Cisco IOS)**

```
! Router A
interface GigabitEthernet0/1
 ip address 192.168.1.2 255.255.255.0
 standby version 2
 standby 10 ip 192.168.1.1
 standby 10 priority 110
 standby 10 preempt
 standby 10 timers msec 200 msec 750
 standby 10 authentication md5 key-string S3cret
 standby 10 track 1 decrement 20

! Router B
interface GigabitEthernet0/1
 ip address 192.168.1.3 255.255.255.0
 standby version 2
 standby 10 ip 192.168.1.1
 standby 10 preempt
 standby 10 authentication md5 key-string S3cret
```

```
show standby
show standby brief
```

### **VRRP (Cisco IOS XE)**

```
interface GigabitEthernet0/1
 ip address 192.168.1.2 255.255.255.0
 vrrp 10 address-family ipv4
  address 192.168.1.1 primary
  priority 110
  preempt
```

```
show vrrp brief
```

### **VRRP на Linux (keepalived)**

```
# /etc/keepalived/keepalived.conf
vrrp_script chk_nginx {
    script "pidof nginx"
    interval 2
    weight -20
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 10
    priority 110
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass S3cret
    }
    virtual_ipaddress {
        192.168.1.100/24
    }
    track_script {
        chk_nginx
    }
}
```

keepalived часто используется для отказоустойчивости балансировщиков (HAProxy, nginx).

### **MikroTik RouterOS**

```
/interface vrrp add name=vrrp10 interface=ether2 vrid=10 priority=110
/ip address add address=192.168.1.1/32 interface=vrrp10
```

### **Wireshark**

```
vrrp
hsrp || hsrp2
```

## **Безопасность**

### **Атаки**

1. **Перехват роли Active/Master** — злоумышленник отправляет Hello с приоритетом 255 и становится шлюзом (MITM)
2. **DoS** — постоянная смена ролей
3. **Открытая аутентификация** — пароль в открытом виде (HSRP plain text, VRRPv2 simple)

### **Защита**

- MD5-аутентификация для HSRP
- В VRRPv3 аутентификации нет — защищать ACL и изоляцией сегмента
- ACL на интерфейсах: разрешать FHRP только от известных маршрутизаторов
- Отдельный VLAN для серверов/инфраструктуры

## **Сравнение FHRP-протоколов**

| Характеристика     | VRRP              | HSRP              | GLBP                     |
| ------------------ | ----------------- | ----------------- | ------------------------ |
| **Стандарт**       | IETF (открытый)   | Cisco             | Cisco                    |
| **Активных маршрутизаторов** | 1       | 1                 | До 4 (балансировка)      |
| **Preempt по умолчанию** | Да          | Нет               | Нет                      |
| **Виртуальный IP = реальный** | Да     | Нет               | Нет                      |
| **Поддержка вендорами** | Все (Juniper, MikroTik, Linux) | Cisco | Cisco               |
