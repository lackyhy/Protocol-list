**SNMP** (Simple Network Management Protocol) — протокол для управления и мониторинга сетевых устройств (маршрутизаторы, коммутаторы, серверы). SNMP позволяет собирать информацию о состоянии устройств, настраивать параметры и получать уведомления о событиях.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | UDP (порт 161 - запросы, порт 162 - traps)                              |
| **Тип протокола**           | Запрос-ответ, уведомления (traps)                                        |
| **Назначение**              | Управление и мониторинг сетевых устройств                                |
| **Версии**                  | SNMPv1, SNMPv2c, SNMPv3 (текущая)                                        |
| **Безопасность**            | Community strings (v1/v2c), шифрование (v3)                             |

## **Архитектура SNMP**

### **Компоненты**

1. **SNMP Manager** — система управления (клиент)
2. **SNMP Agent** — агент на устройстве (сервер)
3. **MIB** (Management Information Base) — база информации об устройстве
4. **OID** (Object Identifier) — идентификатор объекта

### **Типы сообщений**

| Тип | Название        | Описание                                    |
| --- | --------------- | ------------------------------------------- |
| **GET** | Get Request | Получение значения переменной               |
| **GETNEXT** | Get Next Request | Получение следующей переменной            |
| **GETBULK** | Get Bulk Request | Массовое получение (v2+)                  |
| **SET** | Set Request | Установка значения переменной               |
| **TRAP** | Trap | Асинхронное уведомление (v1)                |
| **INFORM** | Inform Request | Подтверждаемое уведомление (v2+)          |
| **RESPONSE** | Response | Ответ на запрос                             |

## **MIB (Management Information Base)**

### **Структура MIB**

Иерархическая структура OID:

```
1.3.6.1.2.1.1.1.0 = sysDescr
1.3.6.1.2.1.1.3.0 = sysUpTime
1.3.6.1.2.1.1.5.0 = sysName
```

### **Стандартные MIB**

| MIB | Описание                                    |
| --- | ------------------------------------------- |
| **MIB-II** | Стандартная MIB (1.3.6.1.2.1)              |
| **IF-MIB** | Интерфейсы (1.3.6.1.2.1.2)                  |
| **IP-MIB** | IP статистика (1.3.6.1.2.1.4)              |
| **TCP-MIB** | TCP статистика (1.3.6.1.2.1.6)              |
| **UDP-MIB** | UDP статистика (1.3.6.1.2.1.7)              |

## **SNMP версии**

### **SNMPv1**

- Простая аутентификация (community strings)
- Базовые операции
- Небезопасен

### **SNMPv2c**

- Улучшенные операции (GETBULK, INFORM)
- Та же аутентификация, что и v1
- Небезопасен

### **SNMPv3**

- Безопасная аутентификация
- Шифрование данных
- Контроль доступа

## **Примеры использования**

### **snmpget (получение значения)**

```bash
# SNMPv2c
snmpget -v2c -c public 192.168.1.1 1.3.6.1.2.1.1.1.0

# SNMPv3
snmpget -v3 -u username -l authPriv -a SHA -A password \
  -x AES -X password 192.168.1.1 1.3.6.1.2.1.1.1.0
```

### **snmpwalk (обход дерева)**

```bash
# Обход всей MIB
snmpwalk -v2c -c public 192.168.1.1

# Обход конкретной ветки
snmpwalk -v2c -c public 192.168.1.1 1.3.6.1.2.1.2
```

### **snmpset (установка значения)**

```bash
# Установка sysName
snmpset -v2c -c private 192.168.1.1 1.3.6.1.2.1.1.5.0 s "NewName"
```

### **snmptrap (отправка trap)**

```bash
# Отправка trap
snmptrap -v2c -c public manager.example.com "" \
  1.3.6.1.4.1.12345.1.0.1 \
  1.3.6.1.4.1.12345.1.0.1 s "Trap message"
```

### **Python (pysnmp)**

```python
from pysnmp.hlapi import *

# GET запрос
for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
    SnmpEngine(),
    CommunityData('public'),
    UdpTransportTarget(('192.168.1.1', 161)),
    ContextData(),
    ObjectType(ObjectIdentity('1.3.6.1.2.1.1.1.0'))
):
    if errorIndication:
        print(errorIndication)
    elif errorStatus:
        print(f'{errorStatus.prettyPrint()}')
    else:
        for varBind in varBinds:
            print(f'{varBind[0]} = {varBind[1]}')
```

## **Настройка SNMP агента**

### **Linux (snmpd)**

```bash
# Установка
sudo apt-get install snmpd snmp

# Конфигурация /etc/snmp/snmpd.conf
rocommunity public
rwcommunity private

# SNMPv3 пользователь
createUser username SHA "password" AES "password"
rouser username

# Запуск
sudo systemctl start snmpd
sudo systemctl enable snmpd
```

### **Windows**

```powershell
# Включение SNMP
Add-WindowsCapability -Online -Name Snmp.Client~~~~0.0.1.0

# Настройка через реестр или GUI
# Services > SNMP Service > Security
```

## **Безопасность SNMP**

### **Рекомендации**

1. **Использовать SNMPv3** вместо v1/v2c
2. **Сильные пароли** для community strings и v3
3. **Ограничить доступ** по IP (ACL)
4. **Отключить ненужные** community strings
5. **Шифрование** данных (SNMPv3)

### **Угрозы**

1. **Перехват community strings** — данные в открытом виде (v1/v2c)
2. **Несанкционированный доступ** — слабые пароли
3. **DoS атаки** — перегрузка устройства запросами

## **Мониторинг SNMP**

### **Инструменты**

1. **Nagios** — система мониторинга
2. **Zabbix** — комплексный мониторинг
3. **Cacti** — графики и статистика
4. **PRTG** — коммерческое решение

### **Пример конфигурации Nagios**

```
define service{
    use                     generic-service
    host_name               router1
    service_description     SNMP Uptime
    check_command           check_snmp!-C public -o 1.3.6.1.2.1.1.3.0
}
```

## **Применение SNMP**

1. **Мониторинг сети** — состояние устройств
2. **Сбор статистики** — трафик, производительность
3. **Управление устройствами** — настройка параметров
4. **Уведомления** — traps о событиях
5. **Инвентаризация** — информация об устройствах

## **Ограничения SNMP**

1. **Безопасность v1/v2c** — небезопасны
2. **Производительность** — может перегружать устройства
3. **Сложность** — требует знаний MIB
4. **Совместимость** — различия в реализациях

## **Будущее SNMP**

- **SNMPv3** — расширенное использование
- **Улучшенная безопасность** — новые методы
- **Производительность** — оптимизация
- **Интеграция** — с современными системами мониторинга
