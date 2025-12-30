**LDAP** (Lightweight Directory Access Protocol) — протокол для доступа и управления службами каталогов, которые хранят информацию о пользователях и ресурсах в сети. LDAP является облегчённой версией X.500 DAP и широко используется для централизованной аутентификации и управления пользователями.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (Application Layer)                                           |
| **Транспорт**               | TCP (порт 389, 636 для LDAPS)                                           |
| **Тип протокола**           | Клиент-сервер                                                            |
| **Назначение**              | Доступ к службам каталогов                                               |
| **Безопасность**            | LDAPS (LDAP over SSL/TLS), SASL                                          |
| **Версии**                  | LDAPv2 (устаревший), LDAPv3 (текущая)                                    |

## **Структура LDAP**

### **DIT (Directory Information Tree)**

Иерархическая структура данных:

```
dc=example,dc=com
├── ou=People
│   ├── cn=John Doe,ou=People,dc=example,dc=com
│   └── cn=Jane Smith,ou=People,dc=example,dc=com
├── ou=Groups
│   └── cn=Admins,ou=Groups,dc=example,dc=com
└── ou=Computers
    └── cn=Server1,ou=Computers,dc=example,dc=com
```

### **DN (Distinguished Name)**

Уникальное имя записи:

```
cn=John Doe,ou=People,dc=example,dc=com
```

**Компоненты:**
- **cn** (Common Name) — общее имя
- **ou** (Organizational Unit) — организационное подразделение
- **dc** (Domain Component) — компонент домена

### **RDN (Relative Distinguished Name)**

Относительное имя:

```
cn=John Doe
```

## **LDAP атрибуты**

### **Стандартные атрибуты**

| Атрибут | Описание                                    |
| ------- | ------------------------------------------- |
| **cn**  | Common Name (общее имя)                     |
| **sn**  | Surname (фамилия)                           |
| **givenName** | Имя                                        |
| **mail** | Email адрес                                |
| **uid** | User ID (идентификатор пользователя)        |
| **ou**  | Organizational Unit                         |
| **dc**  | Domain Component                            |
| **objectClass** | Класс объекта                             |

### **Пример записи**

```
dn: cn=John Doe,ou=People,dc=example,dc=com
objectClass: inetOrgPerson
cn: John Doe
sn: Doe
givenName: John
mail: john.doe@example.com
uid: jdoe
```

## **LDAP операции**

### **Основные операции**

| Операция    | Описание                                    |
| ----------- | ------------------------------------------- |
| **Bind**    | Аутентификация                              |
| **Search**  | Поиск записей                                |
| **Add**     | Добавление записи                           |
| **Modify**  | Изменение записи                            |
| **Delete**  | Удаление записи                             |
| **Compare** | Сравнение значений                          |
| **Unbind**  | Завершение сессии                           |

## **Примеры использования**

### **Командная строка (ldapsearch)**

```bash
# Поиск всех пользователей
ldapsearch -x -H ldap://ldap.example.com -b "dc=example,dc=com" "(objectClass=person)"

# С аутентификацией
ldapsearch -x -H ldap://ldap.example.com \
  -D "cn=admin,dc=example,dc=com" \
  -w password \
  -b "dc=example,dc=com" \
  "(cn=John Doe)"

# Поиск по email
ldapsearch -x -H ldap://ldap.example.com \
  -b "dc=example,dc=com" \
  "(mail=john.doe@example.com)"
```

### **Python (ldap3)**

```python
from ldap3 import Server, Connection, ALL

# Подключение
server = Server('ldap.example.com', get_info=ALL)
conn = Connection(server, 'cn=admin,dc=example,dc=com', 'password', auto_bind=True)

# Поиск
conn.search('dc=example,dc=com', '(cn=John Doe)', attributes=['cn', 'mail'])

# Получение результатов
for entry in conn.entries:
    print(entry)

# Добавление записи
conn.add('cn=New User,ou=People,dc=example,dc=com',
         ['inetOrgPerson', 'organizationalPerson', 'person'],
         {'cn': 'New User', 'sn': 'User', 'mail': 'newuser@example.com'})

# Изменение записи
conn.modify('cn=John Doe,ou=People,dc=example,dc=com',
            {'mail': [('MODIFY_REPLACE', ['newemail@example.com'])]})

# Закрытие
conn.unbind()
```

### **ldapadd (добавление)**

```bash
# Создание LDIF файла
cat > user.ldif <<EOF
dn: cn=John Doe,ou=People,dc=example,dc=com
objectClass: inetOrgPerson
cn: John Doe
sn: Doe
givenName: John
mail: john.doe@example.com
EOF

# Добавление
ldapadd -x -H ldap://ldap.example.com \
  -D "cn=admin,dc=example,dc=com" \
  -w password \
  -f user.ldif
```

## **Настройка LDAP сервера**

### **OpenLDAP (Linux)**

```bash
# Установка
sudo apt-get install slapd ldap-utils

# Настройка
sudo dpkg-reconfigure slapd

# Конфигурация /etc/ldap/ldap.conf
BASE    dc=example,dc=com
URI     ldap://ldap.example.com
```

### **Active Directory (Windows)**

Active Directory использует LDAP для доступа к каталогу.

## **Безопасность LDAP**

### **LDAPS (LDAP over SSL/TLS)**

```bash
# Подключение через LDAPS
ldapsearch -x -H ldaps://ldap.example.com -b "dc=example,dc=com"
```

**Порты:**
- **389** — обычный LDAP
- **636** — LDAPS (SSL/TLS)

### **SASL (Simple Authentication and Security Layer)**

Поддержка различных методов аутентификации:
- **PLAIN** — простая аутентификация
- **DIGEST-MD5** — digest аутентификация
- **GSSAPI** — Kerberos аутентификация

### **ACL (Access Control List)**

Контроль доступа к записям:

```
olcAccess: to * by dn="cn=admin,dc=example,dc=com" write
olcAccess: to attrs=userPassword by self write by anonymous auth
olcAccess: to * by users read
```

## **Применение LDAP**

1. **Централизованная аутентификация** — единая база пользователей
2. **Управление пользователями** — централизованное управление
3. **Интеграция приложений** — единый каталог для приложений
4. **Active Directory** — основа AD
5. **Email системы** — адресные книги

## **Ограничения LDAP**

1. **Сложность настройки** — требует знаний
2. **Производительность** — может быть медленным при больших базах
3. **Безопасность** — требует правильной настройки
4. **Совместимость** — различия в реализациях

## **Будущее LDAP**

- **Улучшенная безопасность** — новые методы аутентификации
- **Производительность** — оптимизация запросов
- **Интеграция** — с современными системами
- **Стандартизация** — дальнейшее развитие протокола
