# Painel Administrativo Labora (Labora Admin Panel)

Este é o painel administrativo da plataforma **Labora**, desenvolvido com **Next.js 16** e **React 19**. Ele atua como um BFF (Backend For Frontend) robusto e seguro, oferecendo uma interface administrativa completa para gerenciamento de filiais, laboratórios, exames, agendamentos, equipe e relatórios do ecossistema Labora.

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema web para garantir alto desempenho, segurança e uma interface visualmente rica:

- **Framework**: [Next.js 16.2](https://nextjs.org/) (App Router, Turbopack, Route Groups e Server Actions)
- **Biblioteca Base**: [React 19](https://react.dev/)
- **Estilização**: [Tailwind CSS 4.0](https://tailwindcss.com/) (com suporte nativo a OKLCH, variáveis de tema customizadas e efeito glassmorphism)
- **Gráficos e Relatórios**: [Recharts](https://recharts.org/) (visualização interativa de dados e indicadores do Dashboard)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Geração de Tipos**: [openapi-typescript](https://openapi-ts.pages.dev/) (integração type-safe a partir do OpenAPI Schema da API)

---

## ⚙️ Arquitetura e Padrões

O projeto implementa padrões arquiteturais de nível enterprise para segurança e resiliência:

### 1. BFF (Backend For Frontend) & Proxy Seguro
As requisições passam por um proxy unificado ([src/proxy.ts](file:///Users/evana/Projetos/Labora/labora-admin-panel/src/proxy.ts)) que realiza validações de CORS e gerencia o fluxo de sessão de ponta a ponta, evitando exposição de dados sensíveis ao browser.

### 2. Autenticação e Gestão de JWT (HttpOnly)
- **Cookies Dedicados**: A autenticação utiliza dois cookies separados: `labify_admin_access` (Access Token) e `labify_admin_refresh` (Refresh Token). Eles possuem as flags `httpOnly: true`, `secure: true` (em produção), `sameSite: 'lax'` e `path: '/'`.
- **Auto-Refresh de Token**: Se a API retornar `401 token_expired`, o cliente HTTP intercepta e tenta renovar o acesso chamando `/auth/refresh` de forma transparente antes de reexecutar a chamada original.
- **Isolamento de Sessão**: Os nomes dos cookies são específicos para evitar colisões ou Single Sign-On indesejado com o aplicativo do paciente.

### 3. Resiliência de API
O cliente HTTP ([src/lib/api.ts](file:///Users/evana/Projetos/Labora/labora-admin-panel/src/lib/api.ts)) contém mecanismos avançados de tolerância a falhas:
- **Exponential Backoff**: Em caso de erros de servidor (`5xx`), o cliente realiza até **3 tentativas adicionais** com atraso exponencial (começando em 200ms).
- **Circuit Breaker (Disjuntor)**: Se ocorrerem **5 falhas consecutivas em 30 segundos**, o circuito se abre. Todas as chamadas subsequentes falharão imediatamente com o erro `503 Service Unavailable` por um período de 30 segundos, protegendo o backend contra sobrecargas.

---

## 📁 Estrutura de Pastas

```bash
src/
├── actions/            # Server Actions que executam lógicas de negócio e integram com a API
├── app/                # Estrutura do Next.js App Router
│   ├── (admin)/        # Rotas administrativas restritas (Dashboard, equipes, exames, etc.)
│   ├── (auth)/         # Fluxos de login e primeiro acesso
│   ├── api/            # Endpoints de API internos do Next.js
│   ├── globals.css     # Definições globais de estilo e temas Tailwind CSS v4
│   └── layout.tsx      # Layout raiz do projeto
├── components/         # Componentes reutilizáveis da interface
├── lib/                # Clientes de API, helpers de sessão, exportação e utilitários
└── proxy.ts            # Proxy de BFF / Middleware customizado
```

---

## 🛠️ Configuração do Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis de ambiente:

```env
# URL da API do Backend (Labify API)
LABIFY_API_URL=http://localhost:8080

# URL de Chamadas Internas do Next (BFF)
INTERNAL_API_URL=http://localhost:3001

# Segredo para assinatura local de tokens JWT
JWT_SECRET=labora-admin-super-secret-key-development

# Domínio dos Cookies em Produção
LABIFY_BFF_COOKIE_DOMAIN=admin.labify.com.br

# Origens permitidas para CORS (Separadas por vírgula)
BFF_ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão LTS recomendada, v20 ou superior)
- Backend da API (`labora-api`) rodando

### 1. Instalar as Dependências
```bash
npm install
```

### 2. Sincronizar Tipos com o OpenAPI do Backend
Se a API estiver online, você pode atualizar as interfaces do TypeScript de forma totalmente type-safe baseando-se no schema OpenAPI:
```bash
npm run gen:api-types
```

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
O painel estará disponível em [http://localhost:3000](http://localhost:3000).

### 4. Build de Produção
```bash
npm run build
npm start
```

---

## 🎯 Funcionalidades Principais

1. **Dashboard Consolidado**: Métricas gerenciais de exames e indicadores de performance.
2. **Agendamentos**: Gerenciamento integrado das agendas de coletas e exames de pacientes.
3. **Controle de Filiais**: Cadastro e troca de contexto de filiais ativas.
4. **Gerenciamento de Equipes**: Controle de operadores, permissões e perfis de acesso.
5. **Auditoria**: Log completo de ações do sistema para conformidade e segurança.
6. **Exportação de Relatórios**: Relatórios gerenciais e de auditoria exportáveis em CSV.
