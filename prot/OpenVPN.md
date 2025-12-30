**OpenVPN** — популярный протокол VPN с открытым исходным кодом, гибкий и использующий TLS для шифрования. OpenVPN кроссплатформенный и поддерживает множество конфигураций.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP, TCP (порт по выбору, обычно 1194)                                  |
| **Тип протокола**           | VPN туннель                                                               |
| **Шифрование**             | TLS/SSL (OpenSSL)                                                        |
| **Режимы**                  | TUN (routing), TAP (bridging)                                            |
| **Кроссплатформенность**    | Windows, Linux, macOS, iOS, Android                                      |

## **Режимы OpenVPN**

### **TUN Mode (Routing)**

Виртуальный сетевой интерфейс для маршрутизации:

```
Client → TUN Interface → OpenVPN → Server → Internet
```

**Применение:**
- Маршрутизация трафика
- Site-to-Site VPN
- Удалённый доступ

### **TAP Mode (Bridging)**

Виртуальный Ethernet интерфейс для моста:

```
Client → TAP Interface → OpenVPN → Server → LAN
```

**Применение:**
- Доступ к локальной сети
- Broadcast трафик
- Windows сети

## **Настройка OpenVPN**

### **Генерация сертификатов**

```bash
# Установка easy-rsa
git clone https://github.com/OpenVPN/easy-rsa.git
cd easy-rsa/easyrsa3

# Инициализация PKI
./easyrsa init-pki

# Создание CA
./easyrsa build-ca

# Создание сертификата сервера
./easyrsa gen-req server nopass
./easyrsa sign-req server server

# Создание сертификата клиента
./easyrsa gen-req client1 nopass
./easyrsa sign-req client client1

# Создание DH параметров
./easyrsa gen-dh

# Создание TLS ключа
openvpn --genkey --secret ta.key
```

### **Конфигурация сервера**

```bash
# /etc/openvpn/server.conf
port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh.pem
tls-auth ta.key 0
server 10.8.0.0 255.255.255.0
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
keepalive 10 120
cipher AES-256-CBC
auth SHA256
comp-lzo
user nobody
group nogroup
persist-key
persist-tun
status openvpn-status.log
verb 3
```

### **Конфигурация клиента**

```bash
# client.ovpn
client
dev tun
proto udp
remote server.example.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert client1.crt
key client1.key
tls-auth ta.key 1
cipher AES-256-CBC
auth SHA256
comp-lzo
verb 3
```

## **Управление OpenVPN**

### **Запуск/остановка**

```bash
# Запуск сервера
sudo systemctl start openvpn@server
sudo systemctl enable openvpn@server

# Запуск клиента
sudo openvpn --config client.ovpn

# Или через systemd
sudo systemctl start openvpn@client
```

### **Проверка статуса**

```bash
# Статус сервера
sudo systemctl status openvpn@server

# Логи
sudo tail -f /var/log/openvpn/server.log

# Подключённые клиенты
cat /var/log/openvpn-status.log
```

## **Безопасность OpenVPN**

### **Рекомендации**

1. **Сильные сертификаты** — использовать 2048+ бит ключи
2. **TLS-Auth** — защита от DoS
3. **Шифрование** — AES-256-CBC или AES-256-GCM
4. **Аутентификация** — SHA256 или выше
5. **Ограничить доступ** — firewall правила

### **TLS-Auth**

Защита от DoS атак:

```bash
# Генерация ключа
openvpn --genkey --secret ta.key

# В конфигурации
tls-auth ta.key 0  # Сервер
tls-auth ta.key 1  # Клиент
```

## **Примеры использования**

### **Site-to-Site VPN**

```bash
# Сервер A
remote server-b.example.com
ifconfig 10.0.0.1 10.0.0.2

# Сервер B
remote server-a.example.com
ifconfig 10.0.0.2 10.0.0.1
```

### **Множественные клиенты**

```bash
# Использование CCD (Client Config Directory)
# /etc/openvpn/ccd/client1
ifconfig-push 10.8.0.10 10.8.0.9
iroute 192.168.1.0 255.255.255.0
```

## **Производительность OpenVPN**

### **Оптимизация**

1. **UDP вместо TCP** — для лучшей производительности
2. **Сжатие** — comp-lzo или comp-lz4
3. **MTU** — правильный размер MTU
4. **Аппаратное ускорение** — если доступно

### **Настройки производительности**

```bash
# В конфигурации
proto udp
comp-lzo
tun-mtu 1500
fragment 1300
mssfix 1200
```

## **Применение OpenVPN**

1. **Удалённый доступ** — доступ к корпоративной сети
2. **Site-to-Site VPN** — соединение сетей
3. **Мобильные устройства** — VPN на мобильных
4. **Обход цензуры** — доступ к заблокированным ресурсам
5. **Защита трафика** — шифрование в публичных сетях

## **Ограничения OpenVPN**

1. **Производительность** — медленнее, чем WireGuard
2. **Сложность** — сложная настройка
3. **Ресурсы** — требует больше ресурсов
4. **Масштабируемость** — ограничения при большом количестве клиентов

## **Будущее OpenVPN**

- **Улучшенная производительность** — оптимизация
- **Упрощение настройки** — автоматическая конфигурация
- **Интеграция** — с современными системами
- **Новые возможности** — расширение функциональности
