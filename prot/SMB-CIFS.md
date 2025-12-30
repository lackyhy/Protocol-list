**SMB/CIFS** (Server Message Block / Common Internet File System) — сетевой протокол для общего доступа к файлам, принтерам и другим ресурсам в сетях Windows. SMB является основным протоколом для файловых сервисов в Windows-сетях.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 445), NetBIOS (порт 139)                                       |
| **Тип протокола**           | Клиент-сервер                                                            |
| **Назначение**              | Общий доступ к файлам и принтерам                                        |
| **Версии**                  | SMB1, SMB2, SMB2.1, SMB3, SMB3.1.1                                      |
| **Безопасность**            | NTLM, Kerberos, шифрование (SMB3)                                        |

## **Версии SMB**

### **SMB1 (CIFS)**

- Оригинальная версия
- Медленная
- Небезопасная
- Устаревшая (отключена в Windows 10)

### **SMB2**

- Улучшенная производительность
- Лучшая безопасность
- Windows Vista/Server 2008+

### **SMB2.1**

- Улучшения производительности
- Windows 7/Server 2008 R2+

### **SMB3**

- Шифрование
- Multi-channel
- Windows 8/Server 2012+

### **SMB3.1.1**

- Улучшенное шифрование
- Pre-authentication integrity
- Windows 10/Server 2016+

## **Настройка SMB сервера**

### **Linux (Samba)**

```bash
# Установка
sudo apt-get install samba

# Конфигурация /etc/samba/smb.conf
[global]
workgroup = WORKGROUP
server string = Samba Server
security = user
map to guest = Bad User

[shared]
comment = Shared Folder
path = /srv/shared
browsable = yes
writable = yes
valid users = user1, user2
create mask = 0664
directory mask = 0775

# Создание пользователя
sudo smbpasswd -a username

# Запуск
sudo systemctl start smbd
sudo systemctl enable smbd
```

### **Windows Server**

```powershell
# Включение SMB
Enable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol

# Создание общего ресурса
New-SmbShare -Name "Shared" -Path "C:\Shared" -FullAccess "Everyone"

# Настройка прав
Grant-SmbShareAccess -Name "Shared" -AccountName "User" -AccessRight Full
```

## **Подключение к SMB**

### **Windows**

```powershell
# Подключение сетевого диска
net use Z: \\server.example.com\shared /user:username password

# Или через GUI
# File Explorer > Map network drive
```

### **Linux**

```bash
# Установка клиента
sudo apt-get install cifs-utils

# Монтирование
sudo mount -t cifs //server.example.com/shared /mnt/smb \
  -o username=user,password=pass,uid=1000,gid=1000

# Автоматическое монтирование (/etc/fstab)
//server.example.com/shared /mnt/smb cifs \
  username=user,password=pass,uid=1000,gid=1000,iocharset=utf8 0 0
```

### **macOS**

```bash
# Монтирование
mount_smbfs //username@server.example.com/shared /mnt/smb

# Или через Finder
# Go > Connect to Server > smb://server.example.com/shared
```

## **Безопасность SMB**

### **Аутентификация**

- **NTLM** — базовая аутентификация
- **Kerberos** — для доменных сетей
- **Guest** — анонимный доступ (небезопасно)

### **Шифрование (SMB3)**

```powershell
# Включение шифрования на сервере
Set-SmbServerConfiguration -EncryptData $true

# Включение шифрования на клиенте
Set-SmbClientConfiguration -RequireSecuritySignature $true
```

### **Рекомендации**

1. **Отключить SMB1** — устаревший и небезопасный
2. **Использовать SMB3** — с шифрованием
3. **Сильные пароли** — для пользователей
4. **Ограничить доступ** — firewall правила
5. **VPN** — для дополнительной защиты

## **Примеры использования**

### **Просмотр общих ресурсов**

```bash
# Linux
smbclient -L //server.example.com -U username

# Windows
net view \\server.example.com
```

### **Доступ к файлам**

```bash
# Linux - smbclient
smbclient //server.example.com/shared -U username

# Команды в smbclient:
# ls - список файлов
# get file.txt - скачать файл
# put file.txt - загрузить файл
# cd directory - смена директории
```

### **Автоматическое монтирование**

```bash
# /etc/fstab
//server.example.com/shared /mnt/smb cifs \
  credentials=/etc/samba/credentials,uid=1000,gid=1000,iocharset=utf8 0 0

# /etc/samba/credentials
username=user
password=pass
domain=WORKGROUP
```

## **Применение SMB**

1. **Файловые серверы** — общие файлы в сети
2. **Принтеры** — сетевые принтеры
3. **Домашние директории** — пользовательские папки
4. **Резервное копирование** — централизованные бэкапы
5. **Коллаборация** — совместная работа с файлами

## **Ограничения SMB**

1. **Безопасность SMB1** — небезопасен
2. **Производительность** — зависит от сети
3. **Совместимость** — различия в версиях
4. **Сложность** — требует правильной настройки

## **Будущее SMB**

- **SMB3.1.1+** — расширенное использование
- **Улучшенная безопасность** — новые методы
- **Производительность** — оптимизация
- **Интеграция** — с облачными сервисами
