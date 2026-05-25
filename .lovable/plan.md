O objetivo é elevar a estabilidade e observabilidade do sistema para 10/10, focando em testes E2E robustos, tratamento de falhas resiliente e monitoramento em tempo real.

### 1. Testes E2E (Playwright)
* **Login/Logout sem Flicker:** Refinar `tests/e2e/auth.spec.ts` para validar transições suaves em Desktop e Mobile, garantindo que loaders não causem saltos de layout.
* **Sincronização Offline:** Atualizar `tests/e2e/offline.spec.ts` para simular cenários reais de perda de conexão e verificar se as ações pendentes no `OfflineProvider` são persistidas e enviadas corretamente ao retornar.
* **Bypass de Admin:** Adicionar validações em `tests/e2e/admin.spec.ts` para garantir que o papel de Administrador ignore restrições de rota de forma consistente.

### 2. Monitoramento e Telemetria
* **Dashboard em Tempo Real:** Reforçar `AdminTelemetriaPage.tsx` para garantir captura imediata de erros de console e degradações de API.
* **Sentry & Web Vitals:** Verificar a integração no `main.tsx` para garantir que erros silenciosos e métricas de performance (LCP, FID) cheguem ao dashboard.

### 3. Resiliência da Interface
* **Fallback de API/Supabase:** Melhorar o `GlobalErrorBoundary` para lidar especificamente com falhas de infraestrutura (telemetria, inventário, realtime) com mensagens amigáveis que não travam o layout principal.
* **Error Boundaries Granulares:** Adicionar `SectionErrorBoundary` em áreas críticas (como `InventoryPage`) para isolar falhas de componentes específicos.

### 4. Reforço de Guards
* **Segurança de Rotas:** Revisar `ProtectedRoute.tsx` para garantir que a lógica de bypass de admin seja processada antes de qualquer checagem de permissão assíncrona, eliminando flickers de "Acesso Negado".

---

**Detalhes Técnicos:**
- **Local:** `src/components/auth/ProtectedRoute.tsx`, `src/pages/AdminTelemetriaPage.tsx`, `tests/e2e/*.spec.ts`.
- **Ferramentas:** Playwright para E2E, Sentry para observabilidade, Supabase Realtime para telemetria.
- **Segurança:** O bypass de admin no `ProtectedRoute` será otimizado para ser determinístico e imediato.
