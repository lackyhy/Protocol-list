**WPA2/WPA3** (Wi-Fi Protected Access) — протоколы безопасности для защиты беспроводных сетей Wi-Fi. WPA2 и WPA3 шифруют трафик между устройством и точкой доступа, защищая от перехвата и несанкционированного доступа.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Канальный (Data Link Layer)                                              |
| **Применение**              | Защита Wi-Fi сетей (IEEE 802.11)                                         |
| **Версии**                  | WPA, WPA2, WPA3                                                          |
| **Шифрование**             | AES-CCMP (WPA2), GCMP (WPA3)                                             |
| **Аутентификация**          | PSK, 802.1X/EAP                                                          |

## **Версии WPA**

### **WPA (Wi-Fi Protected Access)**

- Временное решение после WEP
- Использует TKIP (Temporal Key Integrity Protocol)
- Устаревший, заменён на WPA2

### **WPA2**

- Текущий стандарт
- Использует AES-CCMP
- Два режима: Personal (PSK) и Enterprise (802.1X)

### **WPA3**

- Современный стандарт
- Улучшенная безопасность
- SAE (Simultaneous Authentication of Equals)
- Защита от атак перебора

## **WPA2 Personal (PSK)**

### **Принцип работы**

Использует общий пароль (Pre-Shared Key):

```
1. Устройство подключается к сети
2. Вводится пароль (PSK)
3. Выполняется 4-way handshake
4. Устанавливается PTK (Pairwise Transient Key)
5. Начинается зашифрованная передача
```

### **4-Way Handshake**

```
AP (Access Point)              Client
  |                               |
  |-------- ANonce --------------→|
  |                               |
  |←------- SNonce + MIC ---------|
  |                               |
  |-------- GTK + MIC ------------→|
  |                               |
  |←------- ACK -----------------|
  |                               |
  |     PTK установлен               |
```

### **Настройка**

```bash
# Настройка точки доступа
# SSID: MyNetwork
# Security: WPA2-Personal
# Password: MySecurePassword123
# Encryption: AES
```

## **WPA2 Enterprise**

### **Принцип работы**

Использует 802.1X/EAP для аутентификации:

```
1. Устройство подключается к сети
2. Требуется аутентификация через RADIUS сервер
3. Используется EAP (Extensible Authentication Protocol)
4. После аутентификации устанавливается PTK
5. Начинается зашифрованная передача
```

### **Типы EAP**

| Тип      | Описание                                    |
| -------- | ------------------------------------------- |
| **EAP-PEAP** | Protected EAP (пароль)                    |
| **EAP-TLS** | Certificate-based                          |
| **EAP-TTLS** | Tunneled TLS                               |
| **EAP-SIM** | SIM карта                                  |

## **WPA3**

### **Основные улучшения**

1. **SAE (Simultaneous Authentication of Equals)**
   - Замена PSK
   - Защита от атак перебора
   - Perfect Forward Secrecy

2. **192-bit security**
   - Для корпоративных сетей
   - Усиленная криптография

3. **Enhanced Open**
   - Защита для открытых сетей
   - Индивидуальное шифрование

### **WPA3 Personal**

```
1. Устройство подключается к сети
2. Выполняется SAE handshake
3. Устанавливается PMK (Pairwise Master Key)
4. Начинается зашифрованная передача
```

### **WPA3 Enterprise**

- Обязательное использование 192-bit шифрования
- Улучшенная безопасность
- Для корпоративных сетей

## **Шифрование**

### **WPA2**

- **AES-CCMP** (Advanced Encryption Standard - Counter Mode with CBC-MAC Protocol)
- 128-bit ключ
- Защита данных и аутентификация

### **WPA3**

- **GCMP** (Galois/Counter Mode Protocol)
- 128-bit (Personal) или 192-bit (Enterprise)
- Улучшенная производительность

## **Примеры настройки**

### **Linux (hostapd)**

```bash
# /etc/hostapd/hostapd.conf
interface=wlan0
driver=nl80211
ssid=MyNetwork
hw_mode=g
channel=6
wpa=2
wpa_passphrase=MySecurePassword123
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP CCMP
rsn_pairwise=CCMP
```

### **WPA3 настройка**

```bash
# /etc/hostapd/hostapd.conf
interface=wlan0
driver=nl80211
ssid=MyNetwork
hw_mode=g
channel=6
wpa=3
wpa_key_mgmt=SAE
wpa_pairwise=CCMP
rsn_pairwise=CCMP
sae_password=MySecurePassword123
```

### **Подключение клиента**

```bash
# wpa_supplicant
network={
    ssid="MyNetwork"
    psk="MySecurePassword123"
    key_mgmt=WPA2-PSK
    proto=RSN
    pairwise=CCMP
    group=CCMP
}

# WPA3
network={
    ssid="MyNetwork"
    key_mgmt=SAE
    psk="MySecurePassword123"
}
```

## **Безопасность**

### **Рекомендации**

1. **Использовать WPA3** — если поддерживается
2. **Сильные пароли** — минимум 12 символов, сложные
3. **Отключить WPS** — уязвим к атакам
4. **Регулярное обновление** — обновлять прошивку
5. **Ограничить доступ** — MAC filtering (дополнительно)

### **Угрозы**

1. **Brute-force** — перебор паролей (защита в WPA3)
2. **KRACK** — Key Reinstallation Attack (исправлено)
3. **WPS PIN** — уязвимость WPS
4. **Evil Twin** — поддельные точки доступа

## **Сравнение WPA2 и WPA3**

| Характеристика | WPA2 | WPA3 |
| -------------- | ---- | ---- |
| **Аутентификация** | PSK, 802.1X | SAE, 802.1X |
| **Шифрование** | AES-CCMP | GCMP |
| **Защита от перебора** | Слабая | Сильная |
| **Perfect Forward Secrecy** | Нет | Да |
| **Поддержка** | Везде | Растущая |

## **Применение WPA2/WPA3**

1. **Домашние сети** — защита Wi-Fi
2. **Корпоративные сети** — безопасный доступ
3. **Публичные сети** — защита пользователей
4. **IoT устройства** — безопасное подключение
5. **Мобильные устройства** — защита трафика

## **Ограничения**

1. **Совместимость** — старые устройства могут не поддерживать WPA3
2. **Производительность** — небольшое влияние на скорость
3. **Настройка** — требует правильной конфигурации
4. **WPS** — уязвимость в некоторых реализациях

## **Будущее WPA**

- **WPA3** — расширенное внедрение
- **Улучшенная безопасность** — новые методы
- **Интеграция** — с современными устройствами
- **Стандартизация** — дальнейшее развитие
