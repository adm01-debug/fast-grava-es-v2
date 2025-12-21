# 🗄️ Documentação do Banco

## Tabelas Principais

### jobs
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| title | TEXT | Título |
| status | ENUM | Status |
| machine_id | UUID | FK |
| operator_id | UUID | FK |

### machines
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | TEXT | Nome |
| code | TEXT | Código |
| status | ENUM | Status |

### profiles
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| name | TEXT | Nome |
| email | TEXT | Email |
| role | TEXT | Função |

## Relacionamentos
```
jobs ──┬── machines
       └── profiles
```

## Índices
- jobs_status_idx
- jobs_machine_idx
- jobs_operator_idx
- jobs_created_at_idx

## RLS Policies
Todas tabelas têm RLS ativo.
