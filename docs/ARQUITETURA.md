# Decisões da base

## Stack

| Parte | Escolha | Função |
|---|---|---|
| Backend | Python 3.12 + Django 5.2 | Modelos, migrações, usuários, sessões e admin |
| API | Django REST Framework | Validação, permissões e CRUD JSON |
| Frontend | React 19 + TypeScript + Vite | Interface e navegação |
| Rotas | React Router | Páginas públicas e autenticadas |
| Visual | CSS com tokens + Lucide | Sidebar, formulários, tabelas e temas |
| Banco | SQLite local / PostgreSQL | Persistência relacional |
| Execução em contêiner | Nginx + Gunicorn | Arquivos do React e API sob a mesma origem |

Django 5.2 foi escolhido pela linha LTS. Referências: [release oficial](https://docs.djangoproject.com/en/5.2/releases/5.2/) e [requisitos do Vite](https://vite.dev/guide/).

## Caminho de uma requisição

```text
Navegador → React → /api/ → Django REST Framework → Models → Banco
                       ↘ Sessão + CSRF + permissões
```

No desenvolvimento, o proxy do Vite encaminha `/api`, `/admin` e `/static` para o Django. No Compose, Nginx faz esse papel. O navegador trabalha com a mesma origem; não é necessário liberar CORS amplamente.

## Autenticação

A sessão fica em cookie HttpOnly. O React consulta `/api/auth/me/` ao iniciar. Antes de mutações, obtém token CSRF do Django e o envia em `X-CSRFToken`. O próprio endpoint de login tem proteção CSRF explícita, incluindo requisições anônimas, conforme a [documentação de SessionAuthentication](https://www.django-rest-framework.org/api-guide/authentication/#sessionauthentication).

Nenhuma senha ou token de sessão é guardado no localStorage; apenas a preferência visual. A troca de senha verifica a senha anterior, aplica os validadores do Django e mantém a sessão atual.

## Contrato principal da API

| Método | Rota | Uso |
|---|---|---|
| GET | `/api/health/` | Saúde e disponibilidade do banco |
| GET | `/api/auth/csrf/` | Cookie e token CSRF |
| POST | `/api/auth/login/` | `username`, `password` |
| POST | `/api/auth/logout/` | Encerrar sessão |
| GET/PATCH | `/api/auth/me/` | Consultar/editar perfil |
| POST | `/api/auth/password/` | `current_password`, `new_password` |
| GET | `/api/users/` | Usuários ativos, somente staff |
| GET | `/api/dashboard/` | Contagens e atividade do usuário |
| GET | `/api/activity/` | Histórico paginado do usuário |
| GET/POST | `/api/records/` | Listar e criar |
| GET/PATCH/PUT/DELETE | `/api/records/{id}/` | Consultar, atualizar e excluir |

Listagens retornam `{count, next, previous, results}` com 12 itens por página. Registros aceitam `search`, `status`, `page` e `ordering`. Campos graváveis: `title`, `category`, `status`, `notes`; proprietário é sempre atribuído pelo servidor.

## Permissões e consistência

- Rotas da API são autenticadas por padrão; apenas saúde, CSRF e login são públicas.
- A API filtra registros pelo proprietário antes de buscar o objeto, retornando 404 para IDs de terceiros.
- O perfil não permite alterar `is_staff`, `is_superuser` ou username.
- Alteração de registro e histórico são gravados na mesma transação.
- Histórico registra nome do objeto, ação, autor e data; não guarda valores anteriores.
- O admin é uma ferramenta separada com permissões do Django. Superusuários têm acesso global.

## Testes

Os testes Python cobrem CSRF, sessão, senha, limitação de tentativas, elevação de privilégio, CRUD, isolamento, busca e paginação. Os testes Playwright usam uma base separada e cobrem rotas protegidas, credenciais inválidas, persistência após recarga, exclusão, perfil, tema, saída e navegação mobile. O CI repete as verificações em Linux.

## Evolução prevista

Este núcleo é deliberadamente pequeno. Organizações, e-mail transacional, jobs assíncronos, recuperação de senha, storage e auditoria avançada devem ser adicionados quando um sistema realmente exigir essas capacidades.
