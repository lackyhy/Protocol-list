**LLDP** (Link Layer Discovery Protocol) и **CDP** (Cisco Discovery Protocol) — протоколы обнаружения соседних устройств на канальном уровне. Каждое устройство периодически сообщает соседям по кабелю, кто оно: имя, модель, порт, IP-адрес управления, VLAN, возможности. Это помогает строить карту сети, находить, куда воткнут кабель, и автоматически настраивать IP-телефоны.

## **Основные характеристики**

| Параметр                    | LLDP                                       | CDP                                   |
| --------------------------- | ------------------------------------------ | ------------------------------------- |
| **Уровень OSI**             | Канальный                                  | Канальный                             |
| **Стандарт**                | IEEE 802.1AB (открытый)                    | Проприетарный Cisco                   |
| **Инкапсуляция**            | EtherType `0x88CC`                         | SNAP (LLC), Protocol ID `0x2000`      |
| **Multicast MAC**           | `01:80:C2:00:00:0E`                        | `01:00:0C:CC:CC:CC`                   |
| **Интервал отправки**       | 30 с                                       | 60 с                                  |
| **Hold Time**               | 120 с (4 × интервал)                       | 180 с                                 |
| **Направление**             | Только объявление (без запросов)           | Только объявление                     |
| **Пересылка**               | Не пересылается коммутаторами              | Не пересылается                       |
| **Поддержка**               | Все вендоры, Linux, Windows, VMware        | Cisco, частично другие                |

## **Что передаёт LLDP**

LLDP-кадр (LLDPDU) состоит из TLV.

### **Обязательные TLV**

| Type | TLV                | Описание                                     |
| ---- | ------------------ | -------------------------------------------- |
| 1    | **Chassis ID**     | Идентификатор устройства (обычно MAC)        |
| 2    | **Port ID**        | Идентификатор порта (имя интерфейса или MAC) |
| 3    | **Time To Live**   | Сколько секунд хранить информацию            |
| 0    | **End of LLDPDU**  | Конец                                        |

### **Необязательные TLV**

| Type | TLV                       | Описание                                    |
| ---- | ------------------------- | ------------------------------------------- |
| 4    | **Port Description**      | Описание порта                              |
| 5    | **System Name**           | Имя хоста                                   |
| 6    | **System Description**    | Модель, версия ПО                           |
| 7    | **System Capabilities**   | Bridge, Router, Telephone, WLAN AP, Station |
| 8    | **Management Address**    | IP-адрес управления                         |
| 127  | **Organizationally Specific** | Расширения IEEE 802.1, 802.3, LLDP-MED  |

### **Расширения**

| Расширение     | Что добавляет                                                  |
| -------------- | -------------------------------------------------------------- |
| **IEEE 802.1** | Port VLAN ID, VLAN Name, Link Aggregation                      |
| **IEEE 802.3** | Скорость/дуплекс, PoE (мощность), MTU                          |
| **LLDP-MED**   | Media Endpoint Discovery (ANSI/TIA-1057): Voice VLAN, DSCP, PoE, инвентаризация, местоположение для экстренных вызовов |

## **Что передаёт CDP**

| Поле                   | Описание                                    |
| ---------------------- | ------------------------------------------- |
| **Device ID**          | Имя устройства                              |
| **Addresses**          | IP-адреса                                   |
| **Port ID**            | Порт отправителя                            |
| **Capabilities**       | Router, Switch, IGMP, Phone и т.д.          |
| **Software Version**   | Полная версия IOS                           |
| **Platform**           | Модель                                      |
| **Native VLAN**        | Native VLAN на порту                        |
| **Duplex**             | Дуплекс                                     |
| **VTP Domain**         | Домен VTP                                   |
| **Voice VLAN (Appliance VLAN)** | VLAN для IP-телефона               |
| **Power Available**    | PoE                                         |

## **Пример работы**

```
   [Switch-Core]  Gi1/0/24 ─────────── Gi0/1  [Switch-Access-3]
         │                                         │
   LLDP: "Я Switch-Core,                     LLDP: "Я Switch-Access-3,
          порт Gi1/0/24,                            порт Gi0/1,
          10.0.0.1, Bridge+Router"                  10.0.0.13, Bridge"

Результат на Switch-Core:
Device ID          Local Intf   Hold-time  Capability  Port ID
Switch-Access-3    Gi1/0/24     120        B           Gi0/1
```

## **Применение**

1. **Карта сети** — системы мониторинга (Zabbix, LibreNMS, NetBox) строят топологию по LLDP через SNMP (LLDP-MIB)
2. **Поиск кабеля** — к какому порту коммутатора подключён сервер
3. **IP-телефоны** — автоматическое получение Voice VLAN и QoS (LLDP-MED, CDP)
4. **PoE** — согласование мощности питания
5. **Проверка кабельной разводки** — сравнение с документацией
6. **Обнаружение ошибок** — несовпадение native VLAN или дуплекса (CDP предупреждает)

## **Примеры использования**

### **Cisco IOS**

```
! Включение
lldp run
cdp run

! На интерфейсе
interface GigabitEthernet0/1
 lldp transmit
 lldp receive
 cdp enable

! Отключение на портах к недоверенным устройствам
interface GigabitEthernet0/48
 no lldp transmit
 no cdp enable
```

```
show lldp neighbors
show lldp neighbors detail
show cdp neighbors
show cdp neighbors detail
show cdp entry *
```

### **Linux (lldpd)**

```bash
apt install lldpd
systemctl enable --now lldpd

lldpcli show neighbors
lldpcli show neighbors details
lldpcli show chassis

# lldpd умеет и CDP
lldpcli configure lldp portidsubtype ifname
```

### **Linux (без демона — захват одного кадра)**

```bash
tcpdump -i eth0 -nn -v -c 1 'ether proto 0x88cc'
tcpdump -i eth0 -nn -v -c 1 'ether dst 01:00:0c:cc:cc:cc'   # CDP
```

### **Windows**

```powershell
# Модуль PSDiscoveryProtocol (из PowerShell Gallery)
Install-Module PSDiscoveryProtocol
Invoke-DiscoveryProtocolCapture -Type LLDP | Get-DiscoveryProtocolData
```

### **VMware ESXi**

На distributed switch: **Discovery Protocol → LLDP или CDP, Operation → Both**.

### **Wireshark**

```
lldp
cdp
```

## **Безопасность**

### **Риски**

1. **Утечка информации** — модель, точная версия ПО (поиск уязвимостей), IP управления, VLAN
2. **CDP Flood** — переполнение таблицы соседей, высокая загрузка CPU (старые IOS)
3. **Подмена Voice VLAN** — атакующий притворяется IP-телефоном и попадает в голосовой VLAN
4. **Уязвимости разбора** — CDPwn (2020): удалённое выполнение кода через CDP на Cisco

### **Защита**

- Отключать LLDP/CDP на портах к пользователям, в интернет и к недоверенным сетям
- Оставлять только на портах между инфраструктурными устройствами и к IP-телефонам
- Своевременно обновлять ПО
- 802.1X для IP-телефонов вместо доверия CDP/LLDP

## **Сравнение LLDP и CDP**

| Характеристика      | LLDP                       | CDP                       |
| ------------------- | -------------------------- | ------------------------- |
| **Стандарт**        | IEEE 802.1AB               | Cisco                     |
| **Вендоры**         | Все                        | Cisco (частично HPE и др.) |
| **Расширяемость**   | TLV, организационные TLV   | Ограничена                |
| **Voice VLAN**      | LLDP-MED                   | Да                        |
| **Информация о версии ПО** | System Description  | Подробная                 |
| **По умолчанию на Cisco** | Выключен (на многих моделях) | Включён            |
