**VXLAN** (Virtual eXtensible Local Area Network) — протокол оверлейной виртуализации сетей, который передаёт Ethernet-кадры (L2) внутри UDP-пакетов (L3). VXLAN позволяет растянуть L2-сегменты поверх маршрутизируемой IP-сети и снимает ограничение в 4094 VLAN: идентификатор сети занимает 24 бита, то есть около 16 миллионов сегментов. Это основа сетей современных дата-центров и облаков.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | L2 поверх L4 (Ethernet в UDP)                                            |
| **Транспорт**               | UDP                                                                      |
| **Порт**                    | 4789 (IANA); старые реализации Linux — 8472                              |
| **Стандарт**                | RFC 7348                                                                 |
| **Идентификатор сети**      | VNI (VXLAN Network Identifier), 24 бита — до 16 777 216 сегментов        |
| **Накладные расходы**       | 50 байт (IPv4) / 70 байт (IPv6)                                          |
| **Control plane**           | Flood-and-learn (multicast) или BGP EVPN                                 |
| **Разработчики**            | VMware, Arista, Cisco                                                    |

## **Зачем нужен VXLAN**

| Проблема классических VLAN                  | Решение VXLAN                                     |
| ------------------------------------------- | ------------------------------------------------- |
| Только 4094 VLAN                            | 16 млн VNI — по сегменту на каждого клиента облака |
| L2 ограничен одной площадкой/STP            | L2 поверх любой IP-сети, между стойками и ЦОД     |
| STP блокирует резервные каналы              | Underlay — маршрутизация с ECMP, все каналы активны |
| Миграция ВМ требует того же L2              | Виртуальная машина сохраняет IP при переезде      |
| Огромные MAC-таблицы в ядре сети            | Ядро видит только IP-адреса VTEP                  |

## **Основные понятия**

| Понятие        | Описание                                                              |
| -------------- | --------------------------------------------------------------------- |
| **VTEP**       | VXLAN Tunnel Endpoint — устройство, которое инкапсулирует и декапсулирует кадры (коммутатор, гипервизор) |
| **VNI**        | Идентификатор VXLAN-сегмента (аналог VLAN ID)                         |
| **Underlay**   | Физическая IP-сеть, по которой ходят VXLAN-пакеты (обычно Leaf-Spine с OSPF/BGP) |
| **Overlay**    | Виртуальные L2-сети поверх underlay                                   |
| **NVE**        | Network Virtualization Edge — интерфейс VTEP                          |

## **Структура пакета**

```
| Внешний Ethernet | Внешний IP | UDP (dst 4789) | VXLAN | Исходный Ethernet-кадр |
     14 байт          20 байт      8 байт         8 байт
                                                         ← 50 байт накладных расходов
```

### **Заголовок VXLAN (8 байт)**

| Поле           | Размер (биты) | Описание                                        |
| -------------- | ------------- | ----------------------------------------------- |
| **Flags**      | 8             | Бит I = 1 — VNI действителен                    |
| **Reserved**   | 24            | Зарезервировано                                 |
| **VNI**        | 24            | Идентификатор сегмента                          |
| **Reserved**   | 8             | Зарезервировано                                 |

**UDP Source Port** вычисляется хэшем от внутреннего кадра — это даёт энтропию для ECMP-балансировки в underlay.

## **Как работает VXLAN**

```
   ВМ-A (10.1.1.10, VNI 5000)                 ВМ-B (10.1.1.20, VNI 5000)
          |                                            |
     [VTEP 1] 192.168.0.1 ===== IP underlay ===== 192.168.0.2 [VTEP 2]
                           (Spine-коммутаторы)

1. ВМ-A отправляет Ethernet-кадр для ВМ-B
2. VTEP 1 ищет MAC ВМ-B в таблице VNI 5000 → находится за VTEP 2
3. VTEP 1 упаковывает кадр: IP 192.168.0.1 → 192.168.0.2, UDP 4789, VNI 5000
4. Underlay маршрутизирует пакет как обычный IP
5. VTEP 2 снимает заголовки и передаёт исходный кадр ВМ-B
```

## **Обработка BUM-трафика**

**BUM** = Broadcast, Unknown unicast, Multicast (например, ARP-запросы). Их нужно доставить всем VTEP в VNI:

| Способ                       | Описание                                                    |
| ---------------------------- | ----------------------------------------------------------- |
| **Multicast underlay**       | Каждому VNI — multicast-группа; требует PIM в underlay      |
| **Ingress Replication (Head-End Replication)** | VTEP отправляет копию каждому соседнему VTEP по unicast |
| **ARP suppression (EVPN)**   | VTEP отвечает на ARP сам, зная MAC/IP из BGP               |

## **Control Plane: Flood-and-Learn vs BGP EVPN**

| Характеристика       | Flood-and-Learn                  | BGP EVPN (RFC 7432, RFC 8365)        |
| -------------------- | -------------------------------- | ------------------------------------ |
| **Изучение MAC**     | По трафику (как обычный коммутатор) | Объявляются через BGP              |
| **Обнаружение VTEP** | Статически или через multicast   | Автоматически через BGP              |
| **BUM-трафик**       | Много                            | Минимум (ARP suppression)            |
| **Маршрутизация между VNI** | Централизованная          | Distributed Anycast Gateway на каждом Leaf |
| **Multi-tenancy (L3VNI, VRF)** | Нет                    | Да                                   |
| **Масштабируемость** | Низкая                           | Высокая — стандарт для ЦОД           |

### **Типы маршрутов EVPN**

| Тип | Название                     | Назначение                                |
| --- | ---------------------------- | ----------------------------------------- |
| 1   | Ethernet Auto-Discovery      | Multihoming                               |
| 2   | MAC/IP Advertisement         | MAC и IP хостов                           |
| 3   | Inclusive Multicast Ethernet Tag | Обнаружение VTEP для BUM              |
| 4   | Ethernet Segment             | Выбор Designated Forwarder (multihoming)  |
| 5   | IP Prefix                    | Внешние префиксы (L3)                     |

## **MTU**

Чтобы виртуальные машины могли использовать MTU 1500, underlay должен пропускать **минимум 1550 байт** (с IPv6 — 1570). На практике в ЦОД ставят **MTU 9000–9216** (jumbo frames).

## **Примеры конфигурации**

### **Linux — точка-точка**

```bash
# VTEP 1
ip link add vxlan100 type vxlan id 100 local 192.168.0.1 remote 192.168.0.2 dstport 4789 dev eth0
ip link set vxlan100 up
ip link add br100 type bridge
ip link set vxlan100 master br100
ip link set br100 up

# Посмотреть таблицу пересылки
bridge fdb show dev vxlan100
```

### **Linux — с multicast underlay**

```bash
ip link add vxlan100 type vxlan id 100 group 239.1.1.100 dev eth0 dstport 4789
```

### **Linux — ручное добавление удалённых VTEP (ingress replication)**

```bash
ip link add vxlan100 type vxlan id 100 local 192.168.0.1 dstport 4789 nolearning
bridge fdb append 00:00:00:00:00:00 dev vxlan100 dst 192.168.0.2
bridge fdb append 00:00:00:00:00:00 dev vxlan100 dst 192.168.0.3
```

### **Cisco NX-OS — VXLAN BGP EVPN**

```
feature bgp
feature nv overlay
feature vn-segment-vlan-based
nv overlay evpn

vlan 100
  vn-segment 10100

interface nve1
  no shutdown
  host-reachability protocol bgp
  source-interface loopback1
  member vni 10100
    ingress-replication protocol bgp

router bgp 65001
  neighbor 10.0.0.100
    remote-as 65001
    address-family l2vpn evpn
      send-community extended

evpn
  vni 10100 l2
    rd auto
    route-target import auto
    route-target export auto
```

```
show nve peers
show nve vni
show bgp l2vpn evpn
show l2route evpn mac all
```

### **FRRouting — EVPN на Linux**

```
router bgp 65001
 neighbor 10.0.0.100 remote-as 65001
 address-family l2vpn evpn
  neighbor 10.0.0.100 activate
  advertise-all-vni
```

### **Wireshark**

```
vxlan
udp.port == 4789
```

## **Где используется**

1. **Дата-центры** — фабрики Leaf-Spine с EVPN
2. **Облака** — изоляция сетей клиентов (VPC)
3. **VMware NSX** (раньше VXLAN, теперь Geneve), **OpenStack**, **Kubernetes** (Flannel, Calico в режиме VXLAN, Cilium)
4. **Docker Swarm** — overlay-сети
5. **Соединение ЦОД** — L2 между площадками (DCI)

## **Безопасность VXLAN**

### **Риски**

1. **Нет шифрования и аутентификации** — любой, кто может отправить UDP на 4789, может внедрить кадры в любой VNI
2. **Атаки изнутри underlay** — подделка VTEP
3. **Утечка между клиентами** при ошибках конфигурации VNI

### **Защита**

- Underlay — изолированная сеть, ACL на UDP 4789 только между VTEP
- BGP EVPN вместо flood-and-learn (контроль над тем, какие VTEP легитимны)
- **MACsec** в underlay или IPsec между площадками
- Шифрование внутри overlay (WireGuard в Cilium/Calico)

## **Сравнение оверлейных протоколов**

| Характеристика    | VXLAN             | Geneve              | NVGRE             | STT          |
| ----------------- | ----------------- | ------------------- | ----------------- | ------------ |
| **Транспорт**     | UDP 4789          | UDP 6081            | GRE               | TCP-подобный |
| **ID сети**       | 24 бита           | 24 бита             | 24 бита           | 64 бита      |
| **Расширяемость** | Нет (фиксированный заголовок) | Да (TLV-опции) | Нет          | Ограничена   |
| **Стандарт**      | RFC 7348          | RFC 8926            | RFC 7637          | Черновик     |
| **Распространённость** | Самый популярный | Растёт (NSX, OVN) | Hyper-V (устаревает) | Не используется |
