**SAML** (Security Assertion Markup Language) — открытый стандарт на основе XML для обмена данными об аутентификации и авторизации между поставщиком удостоверений (IdP) и поставщиком сервиса (SP). SAML 2.0 — основа корпоративного единого входа (SSO): сотрудник один раз входит в корпоративный портал (Okta, Microsoft Entra ID, ADFS) и без повторного ввода пароля попадает в Salesforce, Slack, AWS, Jira и другие сервисы.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (поверх HTTP/HTTPS)                                           |
| **Формат**                  | XML, подпись XML Signature, шифрование XML Encryption                    |
| **Стандарт**                | OASIS SAML 2.0 (2005)                                                    |
| **Транспорт**               | HTTPS через браузер (редиректы и POST-формы), SOAP                       |
| **Назначение**              | Web SSO, федерация удостоверений между организациями                     |
| **Реализации**              | Microsoft Entra ID, ADFS, Okta, Keycloak, Shibboleth, SimpleSAMLphp      |

## **Участники**

| Участник                       | Описание                                                    |
| ------------------------------ | ----------------------------------------------------------- |
| **Principal (пользователь)**   | Сотрудник с браузером                                       |
| **Identity Provider (IdP)**    | Проверяет пользователя и выпускает утверждение (Assertion)  |
| **Service Provider (SP)**      | Приложение, которое доверяет IdP                            |

Доверие между IdP и SP настраивается заранее обменом **метаданными** (XML с адресами и сертификатами).

## **Основные компоненты**

| Компонент       | Описание                                                          |
| --------------- | ----------------------------------------------------------------- |
| **Assertion**   | Утверждение IdP о пользователе (подписанный XML)                  |
| **Protocol**    | Сообщения запросов и ответов (AuthnRequest, Response, LogoutRequest) |
| **Binding**     | Как сообщения передаются (HTTP-Redirect, HTTP-POST, Artifact, SOAP) |
| **Profile**     | Сценарии использования (Web Browser SSO, Single Logout)           |
| **Metadata**    | Описание IdP и SP: entityID, URL-адреса, сертификаты              |

### **Типы утверждений (Statements)**

| Тип                           | Содержание                                         |
| ----------------------------- | -------------------------------------------------- |
| **AuthnStatement**            | Пользователь аутентифицирован в такое-то время таким-то способом |
| **AttributeStatement**        | Атрибуты: email, имя, отдел, группы                |
| **AuthzDecisionStatement**    | Решение об авторизации (используется редко)        |

### **Bindings**

| Binding           | Описание                                                     |
| ----------------- | ------------------------------------------------------------ |
| **HTTP-Redirect** | Сообщение сжато (DEFLATE), закодировано в Base64 и передано в URL — для AuthnRequest |
| **HTTP-POST**     | Сообщение в Base64 в скрытом поле HTML-формы — для Response  |
| **HTTP-Artifact** | Передаётся ссылка, само сообщение запрашивается по SOAP      |
| **SOAP**          | Прямой обмен сервер-сервер                                   |

## **SP-Initiated SSO**

```
Пользователь (браузер)          SP (app.example.com)          IdP (idp.corp.com)
       |                                |                              |
       |-- GET /dashboard ------------->|                              |
       |<-- 302 Redirect: idp.corp.com/sso?SAMLRequest=...&RelayState=|
       |                                                               |
       |-- GET /sso?SAMLRequest=... ---------------------------------->|
       |<-- Страница входа (если нет сессии) --------------------------|
       |-- Логин, пароль, MFA ---------------------------------------->|
       |<-- HTML-форма с SAMLResponse (auto-submit) -------------------|
       |                                |                              |
       |-- POST /saml/acs  SAMLResponse=... -->|                       |
       |                                | Проверка подписи, сроков,    |
       |                                | Audience, InResponseTo       |
       |<-- Сессия создана, /dashboard -|                              |
```

**IdP-Initiated SSO** — пользователь начинает с портала IdP (плитки приложений), и IdP сразу отправляет Response в SP. Удобно, но менее безопасно (нет связи с запросом).

## **Пример SAML Assertion (упрощённо)**

```xml
<saml:Assertion ID="_a75adf55" IssueInstant="2026-10-17T10:00:00Z" Version="2.0">
  <saml:Issuer>https://idp.corp.com/saml</saml:Issuer>
  <ds:Signature>...</ds:Signature>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
      alice@corp.com
    </saml:NameID>
    <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
      <saml:SubjectConfirmationData InResponseTo="_req123"
          NotOnOrAfter="2026-10-17T10:05:00Z"
          Recipient="https://app.example.com/saml/acs"/>
    </saml:SubjectConfirmation>
  </saml:Subject>
  <saml:Conditions NotBefore="2026-10-17T09:59:30Z" NotOnOrAfter="2026-10-17T10:05:00Z">
    <saml:AudienceRestriction>
      <saml:Audience>https://app.example.com</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AuthnStatement AuthnInstant="2026-10-17T10:00:00Z" SessionIndex="_s1">
    <saml:AuthnContext>
      <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
    </saml:AuthnContext>
  </saml:AuthnStatement>
  <saml:AttributeStatement>
    <saml:Attribute Name="groups">
      <saml:AttributeValue>engineering</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>
```

## **Коды статуса**

| Статус                                          | Описание                              |
| ----------------------------------------------- | ------------------------------------- |
| `urn:oasis:names:tc:SAML:2.0:status:Success`    | Успех                                 |
| `...:status:Requester`                          | Ошибка в запросе SP                   |
| `...:status:Responder`                          | Ошибка на стороне IdP                 |
| `...:status:VersionMismatch`                    | Неверная версия                       |
| `...:status:AuthnFailed`                        | Аутентификация не удалась             |
| `...:status:NoPassive`                          | Нужен интерактивный вход (IsPassive)  |
| `...:status:RequestDenied`                      | Запрос отклонён                       |

## **Что должен проверять SP**

1. **Подпись** Response или Assertion сертификатом IdP из метаданных
2. **Issuer** — ожидаемый IdP
3. **Audience** — совпадает с entityID SP
4. **Recipient / Destination** — URL ACS этого SP
5. **NotBefore / NotOnOrAfter** — срок действия (с небольшим допуском по времени)
6. **InResponseTo** — соответствует отправленному запросу
7. **ID утверждения** не использовался ранее (защита от повтора)

## **Примеры использования**

### **Декодирование SAMLRequest (HTTP-Redirect)**

```bash
python3 -c "import sys,zlib,base64,urllib.parse as u; \
print(zlib.decompress(base64.b64decode(u.unquote(sys.argv[1])), -15).decode())" "$SAMLRequest"
```

### **Декодирование SAMLResponse (HTTP-POST)**

```bash
echo "$SAMLResponse" | base64 -d | xmllint --format -
```

### **Инструменты отладки**

- Расширения браузера **SAML-tracer** (Firefox/Chrome)
- Burp Suite — плагин SAML Raider
- samltool.com (только для тестовых данных!)

### **Метаданные SP (фрагмент)**

```xml
<md:EntityDescriptor entityID="https://app.example.com">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
                      AuthnRequestsSigned="true" WantAssertionsSigned="true">
    <md:AssertionConsumerService index="0"
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="https://app.example.com/saml/acs"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```

### **Библиотеки**

| Язык      | Библиотека                             |
| --------- | -------------------------------------- |
| Python    | python3-saml (OneLogin), pysaml2       |
| Java      | Spring Security SAML, OpenSAML         |
| Node.js   | passport-saml (@node-saml)             |
| PHP       | SimpleSAMLphp, php-saml                |
| Go        | crewjam/saml                           |

## **Безопасность SAML**

### **Известные атаки**

| Атака                           | Описание                                                          |
| ------------------------------- | ----------------------------------------------------------------- |
| **XML Signature Wrapping (XSW)** | Подписанный элемент перемещается, а приложение читает неподписанный поддельный |
| **Отсутствие проверки подписи** | SP принимает неподписанные утверждения                            |
| **Comment Injection** (2018)    | `alice@corp.com<!---->.evil.com` — разные парсеры по-разному читают NameID |
| **XXE**                         | Внешние сущности XML для чтения файлов на сервере                 |
| **Replay**                      | Повторная отправка перехваченного Response                        |
| **Golden SAML**                 | Кража ключа подписи IdP (ADFS) — подделка входа в любой SP        |
| **Подмена Audience/Recipient**  | Утверждение для одного SP используется в другом                   |

### **Рекомендации**

- Использовать проверенные библиотеки, не разбирать SAML вручную
- Требовать подпись, проверять все условия (см. выше)
- Отключить DTD и внешние сущности в XML-парсере
- Хранить использованные ID утверждений до их истечения
- Защищать ключ подписи IdP (HSM), мониторить выпуск токенов
- Ограничить IdP-Initiated SSO

## **Сравнение SAML 2.0 и OpenID Connect**

| Характеристика       | SAML 2.0                       | OpenID Connect               |
| -------------------- | ------------------------------ | ---------------------------- |
| **Год**              | 2005                           | 2014                         |
| **Формат**           | XML                            | JSON / JWT                   |
| **Размер сообщений** | Большой                        | Компактный                   |
| **Мобильные приложения** | Неудобно                   | Удобно                       |
| **Доступ к API**     | Нет                            | Да (вместе с OAuth 2.0)      |
| **Сложность**        | Высокая (XML Signature)        | Средняя                      |
| **Распространённость** | Корпоративные SaaS, университеты, госсектор | Новые приложения, потребительские сервисы |
