**OAuth 2.0** — протокол **авторизации**, который позволяет приложению получить ограниченный доступ к ресурсам пользователя на другом сервисе, не узнавая его пароль (например, «разрешить приложению читать мой Google Календарь»). **OpenID Connect (OIDC)** — надстройка над OAuth 2.0 для **аутентификации**: она добавляет ID Token, из которого приложение узнаёт, кто вошёл. Кнопки «Войти через Google / GitHub / Apple» работают именно на OIDC.

## **Основные характеристики**

| Параметр                    | Описание                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| **Уровень OSI**             | Прикладной (поверх HTTPS)                                                |
| **Транспорт**               | HTTPS (TLS обязателен)                                                   |
| **Стандарты**               | OAuth 2.0 — RFC 6749, RFC 6750 (Bearer), RFC 7636 (PKCE), RFC 9700 (Security BCP); OIDC — OpenID Connect Core 1.0 |
| **Формат токенов**          | Access Token — любой (часто JWT), ID Token — всегда JWT                  |
| **Развитие**                | OAuth 2.1 (черновик) — объединяет лучшие практики                        |
| **Применение**              | API, мобильные и SPA-приложения, SSO, «Войти через…»                     |

## **OAuth 2.0 vs OIDC**

| Вопрос                         | OAuth 2.0                       | OpenID Connect                       |
| ------------------------------ | ------------------------------- | ------------------------------------ |
| **Отвечает на вопрос**         | «Что приложению можно делать?»  | «Кто этот пользователь?»             |
| **Главный токен**              | Access Token                    | ID Token (+ Access Token)            |
| **Scope**                      | Любые (`read:repo`)             | Обязательный `openid` + `profile`, `email` |
| **Информация о пользователе**  | Не стандартизирована            | ID Token, эндпоинт `/userinfo`       |
| **Discovery**                  | RFC 8414 (опционально)          | `/.well-known/openid-configuration`  |

## **Роли**

| Роль                         | Описание                                        | Пример                       |
| ---------------------------- | ----------------------------------------------- | ---------------------------- |
| **Resource Owner**           | Владелец данных — пользователь                  | Вы                           |
| **Client**                   | Приложение, которое хочет доступ                | Сервис планирования встреч   |
| **Authorization Server (AS)** | Выдаёт токены после согласия пользователя (в OIDC — OpenID Provider) | accounts.google.com, Keycloak |
| **Resource Server (RS)**     | API с данными, принимает Access Token           | Google Calendar API          |

## **Токены**

| Токен              | Назначение                                    | Срок жизни        |
| ------------------ | --------------------------------------------- | ----------------- |
| **Access Token**   | Доступ к API (`Authorization: Bearer ...`)    | Минуты – час      |
| **Refresh Token**  | Получение нового Access Token без пользователя | Дни – месяцы     |
| **ID Token** (OIDC) | Информация о пользователе и факте входа (JWT) | Минуты           |
| **Authorization Code** | Одноразовый код для обмена на токены      | ~1 минута         |

### **Пример ID Token (декодированный payload)**

```json
{
  "iss": "https://accounts.google.com",
  "sub": "110169484474386276334",
  "aud": "my-client-id.apps.googleusercontent.com",
  "exp": 1760700000,
  "iat": 1760696400,
  "nonce": "n-0S6_WzA2Mj",
  "email": "alice@example.com",
  "email_verified": true,
  "name": "Alice"
}
```

Приложение обязано проверить: подпись (по ключам из `jwks_uri`), `iss`, `aud`, `exp`, `nonce`.

## **Grant Types (способы получения токена)**

| Grant Type                     | Применение                                     | Статус               |
| ------------------------------ | ---------------------------------------------- | -------------------- |
| **Authorization Code + PKCE**  | Веб, мобильные, SPA — пользователь входит       | **Рекомендуется**    |
| **Client Credentials**         | Сервис-сервис без пользователя                 | Рекомендуется        |
| **Refresh Token**              | Обновление токена                              | Рекомендуется        |
| **Device Authorization** (RFC 8628) | Телевизоры, консоли, CLI («введите код на сайте») | Рекомендуется |
| **Implicit**                   | Токен сразу в URL (старые SPA)                 | **Устарел**, запрещён в OAuth 2.1 |
| **Resource Owner Password**    | Приложение получает пароль пользователя        | **Устарел**, запрещён в OAuth 2.1 |

## **Authorization Code Flow + PKCE**

```
Пользователь    Приложение (Client)          Authorization Server       API
     |                 |                              |                   |
     |-- "Войти" ----->|                              |                   |
     |                 | code_verifier = случайная строка                 |
     |                 | code_challenge = BASE64URL(SHA256(verifier))     |
     |<-- 302 Redirect -----------------------------> |                   |
     |   /authorize?response_type=code&client_id=...  |                   |
     |   &redirect_uri=...&scope=openid email         |                   |
     |   &state=xyz&code_challenge=...&code_challenge_method=S256         |
     |                                                |                   |
     |-- Вход и согласие ---------------------------->|                   |
     |<-- 302 redirect_uri?code=AUTH_CODE&state=xyz --|                   |
     |-- code -------->|                              |                   |
     |                 |-- POST /token -------------->|                   |
     |                 |   code, code_verifier,       |                   |
     |                 |   client_id (+ secret)       |                   |
     |                 |<-- access_token, id_token, --|                   |
     |                 |    refresh_token             |                   |
     |                 |                                                  |
     |                 |-- GET /api  Authorization: Bearer access_token ->|
     |                 |<-- данные ---------------------------------------|
```

**PKCE** (Proof Key for Code Exchange) защищает от перехвата кода: без `code_verifier` код нельзя обменять на токены.

## **Основные эндпоинты**

| Эндпоинт                             | Назначение                                     |
| ------------------------------------ | ---------------------------------------------- |
| `/authorize`                         | Вход пользователя и согласие                   |
| `/token`                             | Обмен кода / refresh token на токены           |
| `/userinfo` (OIDC)                   | Данные о пользователе                          |
| `/.well-known/openid-configuration`  | Метаданные провайдера (Discovery)              |
| `jwks_uri`                           | Публичные ключи для проверки подписи JWT       |
| `/revoke` (RFC 7009)                 | Отзыв токена                                   |
| `/introspect` (RFC 7662)             | Проверка состояния токена                      |
| `end_session_endpoint` (OIDC)        | Выход                                          |

## **Ошибки**

| Ошибка                      | Описание                                          |
| --------------------------- | ------------------------------------------------- |
| `invalid_request`           | Неверный запрос (нет параметра)                   |
| `invalid_client`            | Ошибка аутентификации клиента                     |
| `invalid_grant`             | Код/refresh token недействителен или истёк        |
| `unauthorized_client`       | Клиенту запрещён этот grant type                  |
| `unsupported_grant_type`    | Grant type не поддерживается                      |
| `invalid_scope`             | Недопустимый scope                                |
| `access_denied`             | Пользователь отказал в доступе                    |
| `login_required` (OIDC)     | Нужен интерактивный вход                          |

API при неверном токене возвращает HTTP **401** с заголовком `WWW-Authenticate: Bearer error="invalid_token"`, при нехватке прав — **403** (`insufficient_scope`).

## **Примеры использования**

### **Discovery**

```bash
curl https://accounts.google.com/.well-known/openid-configuration | jq
```

### **Client Credentials (сервис-сервис)**

```bash
curl -X POST https://auth.example.com/oauth2/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials&scope=reports.read"

curl -H "Authorization: Bearer eyJhbGciOi..." https://api.example.com/reports
```

### **Обмен кода на токен**

```bash
curl -X POST https://auth.example.com/oauth2/token \
  -d grant_type=authorization_code \
  -d code=AUTH_CODE \
  -d redirect_uri=https://app.example.com/callback \
  -d client_id=CLIENT_ID \
  -d code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

### **Device Flow (CLI)**

```bash
gh auth login           # GitHub CLI
az login --use-device-code
```

### **Python (Authlib)**

```python
from authlib.integrations.requests_client import OAuth2Session

client = OAuth2Session(CLIENT_ID, CLIENT_SECRET, scope="openid email",
                       redirect_uri="https://app.example.com/callback",
                       code_challenge_method="S256")
uri, state = client.create_authorization_url("https://auth.example.com/authorize")
# ... после редиректа:
token = client.fetch_token("https://auth.example.com/token", authorization_response=callback_url)
```

### **Декодирование JWT**

```bash
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq
```

## **Провайдеры и серверы**

| Тип                  | Примеры                                              |
| -------------------- | ---------------------------------------------------- |
| **Публичные**        | Google, Microsoft Entra ID, Apple, GitHub, Яндекс ID |
| **Облачные IdP**     | Auth0, Okta, AWS Cognito                             |
| **Self-hosted**      | Keycloak, Authentik, Ory Hydra, Zitadel, Dex         |

## **Безопасность**

### **Типичные уязвимости**

| Уязвимость                     | Защита                                                  |
| ------------------------------ | ------------------------------------------------------- |
| **Перехват кода**              | PKCE для всех клиентов                                  |
| **CSRF при входе**             | Параметр `state` (и `nonce` в OIDC)                     |
| **Open Redirect / подмена redirect_uri** | Точное совпадение redirect_uri на сервере      |
| **Утечка токена в URL**        | Не использовать Implicit, токены — не в query           |
| **Кража Refresh Token**        | Ротация refresh token, привязка к клиенту (DPoP, mTLS)  |
| **Неправильная проверка JWT**  | Проверять подпись, `alg` (не `none`), `iss`, `aud`, `exp` |
| **Mix-up атаки**               | Параметр `iss` в ответе авторизации (RFC 9207)          |
| **Хранение токенов в localStorage** | Backend-for-Frontend (BFF), httpOnly cookie         |
| **Слишком широкие scope**      | Принцип минимальных привилегий                          |

## **Сравнение OAuth/OIDC, SAML и Kerberos**

| Характеристика       | OAuth 2.0 / OIDC          | SAML 2.0                  | Kerberos                 |
| -------------------- | ------------------------- | ------------------------- | ------------------------ |
| **Формат**           | JSON, JWT                 | XML                       | ASN.1 (двоичный)         |
| **Транспорт**        | HTTPS, редиректы          | HTTPS, редиректы и POST   | TCP/UDP 88               |
| **Мобильные и SPA**  | Отлично                   | Плохо                     | Нет                      |
| **Авторизация API**  | Да (Access Token)         | Нет                       | Да (в домене)            |
| **Типичное применение** | Современные веб и мобильные приложения, API | Корпоративный SSO в SaaS | Внутренняя сеть, AD |
