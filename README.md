# Base · ponto de partida para sistemas web

Template de sistemas web da equipe Neuroinova, com **Python + Django + React + TypeScript**. Reutilize a infraestrutura e acrescente os módulos de cada projeto.

## Comece por aqui

1. No GitHub, clique em **Use this template → Create a new repository** para criar o repositório do novo sistema.
2. Clone o **novo repositório** no seu computador e abra a pasta em seu editor.
3. Siga a instalação abaixo. Cada pessoa cria seu próprio banco e sua própria conta local.

Para aprender, siga o [guia dos primeiros passos](docs/PRIMEIROS_PASSOS.md). Para melhorar esta base, leia [como contribuir](CONTRIBUTING.md). Os projetos criados pelo template têm histórico independente; atualizações futuras da base não são aplicadas automaticamente.

## O que já funciona

- Login e logout com sessão do Django, cookies HttpOnly e proteção CSRF.
- Usuário personalizado desde a primeira migração; perfil e troca de senha.
- Sidebar recolhível, navegação no celular e temas claro/escuro/sistema.
- Identidade azul-marinho com sidebar escura e cores configuráveis.
- Painel com contagens reais e últimas alterações.
- Módulo de exemplo **Registros**: criar, consultar, editar, excluir, buscar, filtrar e paginar.
- Registros e histórico isolados por usuário na API; nem usuários staff acessam registros de terceiros pela API.
- Lista de usuários para staff. Contas, grupos e permissões gerenciados pelo Django Admin.
- SQLite para desenvolvimento simples; PostgreSQL via configuração e Docker Compose.
- Migrações, testes do backend, testes de navegador e workflow de CI.

## Iniciar no Windows

Pré-requisitos: Python 3.12+ e Node.js 22.12+ (ou Node 24), com npm no PATH.

```powershell
# Instala dependências, cria banco e solicita dados da primeira conta.
.\scripts\setup.ps1

# Inicia backend + frontend; Ctrl+C encerra ambos.
.\scripts\dev.ps1
```

Abra **http://127.0.0.1:5173**. O painel administrativo fica em **http://127.0.0.1:5173/admin/**.

Se essas portas estiverem ocupadas, execute `scripts/dev.ps1 -BackendPort 18770 -FrontendPort 18771` e abra **http://127.0.0.1:18771**.

Para criar uma conta local com exemplos, use `setup.ps1 -Demo` na primeira configuração. A senha é escolhida no terminal, nunca vem fixa no código. Se o Python não estiver no PATH, use `setup.ps1 -Python 'C:\caminho\python.exe'`.

### Instalação manual (Linux/macOS)

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.lock.txt
cp backend/.env.example backend/.env
python backend/manage.py migrate
python backend/manage.py createsuperuser
cd frontend
npm ci
```

Em dois terminais, na raiz do projeto:

```bash
.venv/bin/python backend/manage.py runserver 127.0.0.1:8000
# Segundo terminal:
cd frontend && npm run dev
```

### PostgreSQL com Docker (ambiente local)

```bash
cp .env.example .env
# Edite as duas senhas no .env. Use senha alfanumérica na URL do PostgreSQL;
# caracteres especiais em DATABASE_URL precisam ser codificados como URL.
docker compose up --build -d
docker compose exec backend python manage.py createsuperuser
```

Abra **http://127.0.0.1:8080**. O banco fica no volume `postgres_data`; ele não é exposto em uma porta pública. Esse Compose é de **desenvolvimento**, com `DEBUG=True` e HTTP local.

## Organização

```text
backend/
  config/       configuração, URLs e WSGI
  accounts/     usuário, autenticação, perfil e senha
  core/         modelo de datas, histórico e painel
  records/      cadastro de exemplo para novos módulos
frontend/
  src/
    config.ts   nome e menu da aplicação
    components/ layout e elementos compartilhados
    lib/        cliente da API e autenticação
    pages/      páginas por funcionalidade
    styles.css  tokens visuais, temas e responsividade
  tests/        fluxos reais no navegador
scripts/        instalação, execução e banco isolado de testes
docs/           arquitetura e guia de reutilização
```

Veja [como criar o próximo sistema](docs/REUTILIZAR.md) e as [decisões de arquitetura](docs/ARQUITETURA.md).

## Validar

Na raiz, com o ambiente virtual ativo e o `backend/.env` configurado:

```bash
python backend/manage.py check
python backend/manage.py makemigrations --check --dry-run
python backend/manage.py test accounts records --settings=config.test_settings
cd frontend
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes de navegador usam **portas 18760/18761** e **`.artifacts/e2e.sqlite3`**, separados do banco local. Eles iniciam e encerram seus próprios servidores. Capturas do painel desktop e celular ficam em `.artifacts/`. O backend é testado com banco temporário do Django.

## Limites desta primeira base

O isolamento é por usuário; ainda não existe organização/equipe compartilhando registros. O Django Admin permite operações globais conforme as permissões concedidas. Histórico aqui significa alterações de registros, não uma trilha de auditoria completa ou imutável. Recuperação de senha por e-mail, convites, MFA, upload de arquivos, billing e integrações são extensões futuras.

Antes de publicar, configure HTTPS, `DEBUG=False`, segredo aleatório, hosts e origens reais, cookies seguros, backups testados e observabilidade. Configure um cache compartilhado ou controle no proxy para limite de tentativas entre múltiplos processos; o limite atual usa o cache local do Django e cobre o endpoint de login da API. Proteja também o acesso ao admin. Não trate o Compose local como configuração de produção. Veja o [checklist oficial de deployment](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/).
