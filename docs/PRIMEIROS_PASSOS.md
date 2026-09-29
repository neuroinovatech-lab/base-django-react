# Seu primeiro projeto com a Base

## O que você está recebendo

Uma aplicação funcionando com login, sidebar, painel e um cadastro chamado **Registros**. Ele é o exemplo para aprender como uma tela conversa com uma API e como a API salva no banco.

| Nome | O que faz |
|---|---|
| Python | Linguagem do servidor |
| Django | Organiza o backend, o banco, as contas e o painel administrativo |
| Django REST Framework | Expõe os dados em endpoints JSON |
| React + TypeScript | Constrói as telas e verifica os tipos do frontend |
| Vite | Executa o frontend em desenvolvimento e gera a versão compilada |
| SQLite | Banco em um arquivo, usado na configuração local |
| PostgreSQL | Banco configurável para ambientes compartilhados |
| Git | Histórico de alterações do código |
| GitHub | Repositório compartilhado, revisão e execução do CI |

## 1. Crie o repositório do seu sistema

Abra [base-django-react](https://github.com/neuroinovatech-lab/base-django-react), clique em **Use this template → Create a new repository** e escolha o nome do novo sistema e a conta combinada com a equipe. O template é privado: você precisa estar conectado a uma conta que tenha acesso.

Copie a URL HTTPS do **novo repositório** no botão Code e execute:

```bash
git clone URL_DO_NOVO_REPOSITORIO
cd NOME_DO_NOVO_REPOSITORIO
```

Substitua os dois textos em maiúsculas pelos valores do seu projeto. Use uma pasta comum, como `C:\projetos`, para evitar problemas de sincronização com arquivos do banco e dependências.

## 2. Instale e inicie

Confira `python --version` e `node --version`. Use Python 3.12+ e Node 22.12+ ou 24. Se o Windows só reconhecer `py`, passe `-Python py` ao script.

No PowerShell, dentro da pasta do projeto:

```powershell
.\scripts\setup.ps1 -Demo
.\scripts\dev.ps1
```

Se o Python for encontrado como `py`, o primeiro comando fica `scripts/setup.ps1 -Python py -Demo`.

O setup cria o ambiente `.venv`, instala as dependências, cria as tabelas e pede uma senha para a conta local `admin`. O modo `-Demo` adiciona quatro registros fictícios. Use uma senha com pelo menos 10 caracteres. Não há senha padrão compartilhada.

Abra **http://127.0.0.1:5173** e entre com a conta criada. Mantenha o terminal do `dev.ps1` aberto. `Ctrl+C` encerra os servidores. O setup é feito na primeira instalação; no dia a dia, rode apenas `dev.ps1`.

Para Linux/macOS, siga a instalação manual no [README](../README.md).

## 3. Explore um fluxo completo

Crie um registro, recarregue a página, edite o nome e veja o histórico. Depois siga o código nesta ordem:

1. `frontend/src/pages/Records.tsx`: formulário e listagem.
2. `frontend/src/lib/api.ts`: requisição HTTP e proteção CSRF.
3. `backend/config/urls.py`: endereço da API.
4. `backend/records/views.py`: consulta, permissão de acesso e operação.
5. `backend/records/serializers.py`: campos e validação.
6. `backend/records/models.py`: estrutura da tabela.
7. `backend/records/tests.py`: comportamento esperado e isolamento dos usuários.

Uma mudança no banco exige migração. Uma mudança só de cor ou texto normalmente exige apenas editar o frontend; Vite atualiza a página durante o desenvolvimento.

## 4. Faça sua primeira alteração

Comece trocando o nome em `frontend/src/config.ts`. As cores ficam em `styles.css`, incluindo um bloco específico da sidebar. Depois siga [Como reutilizar](REUTILIZAR.md) para criar seu primeiro módulo.

Crie uma branch antes de editar:

```bash
git switch -c feat/identidade-do-projeto
```

Faça a alteração, valide e abra um PR seguindo [Como contribuir](../CONTRIBUTING.md). O GitHub executará os testes e a compilação. Um resultado verde não substitui a revisão da equipe.

## Problemas comuns

| Sintoma | Próximo passo |
|---|---|
| `python` não encontrado | Instale Python ou use `setup.ps1 -Python py` |
| `npm.ps1` bloqueado | Use `npm.cmd`; os scripts de instalação já fazem isso |
| PowerShell bloqueia `setup.ps1` | Abra `powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1 -Demo` para essa execução local; políticas da empresa devem ser tratadas com a equipe |
| Porta ocupada | Rode `scripts/dev.ps1 -BackendPort 18770 -FrontendPort 18771` e acesse a porta 18771 |
| Interface abre, mas API falha | Veja `.artifacts/backend-error.log` e confira se o servidor continua aberto |
| Esqueci a senha local | Execute `.venv\Scripts\python.exe backend/manage.py changepassword admin` |
| Demo diz que usuário já existe | Entre com a conta existente ou crie outra com `createsuperuser`; não repita o setup para iniciar o sistema |
| Alterei o model e a tela falha | Gere `makemigrations`, revise o arquivo e execute `migrate` |
| CI acusa migração ausente | Inclua no commit a migração gerada pelo Django |

## O que não compartilhar

Não envie sua pasta `.venv`, `node_modules`, `.artifacts`, arquivos `.env` ou bancos locais. Eles estão ignorados pelo Git. Cada pessoa configura seu próprio ambiente. Compartilhe código por commit e PR, com dados fictícios nos exemplos.
