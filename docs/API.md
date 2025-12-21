# 📡 Documentação da API

## Supabase Edge Functions

### bitrix24-sync
```http
POST /functions/v1/bitrix24-sync
Content-Type: application/json

{ "action": "sync", "entity": "deals" }
```

### send-email-report
```http
POST /functions/v1/send-email-report
Content-Type: application/json

{ "to": "user@example.com", "reportType": "daily" }
```

### ml-predictions
```http
POST /functions/v1/ml-predictions
Content-Type: application/json

{ "machineId": "uuid", "type": "maintenance" }
```

## Endpoints Principais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| /jobs | GET/POST | Gestão de jobs |
| /operators | GET/POST | Gestão de operadores |
| /machines | GET/POST | Gestão de máquinas |
| /quality-checks | GET/POST | Verificações de qualidade |

## Autenticação
Todas as requisições requerem header:
```
Authorization: Bearer <supabase_token>
```

## Rate Limits
- 100 req/min por usuário
- 1000 req/min por IP
