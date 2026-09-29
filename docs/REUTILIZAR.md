# Transformar a Base em um novo sistema

## 1. Comece com uma cópia limpa

Use o repositório como template ou copie os arquivos versionados para uma pasta nova. Não copie `.env`, `.venv`, `node_modules`, `.artifacts`, bancos `.sqlite3` ou credenciais. Crie outro banco e outro segredo para cada sistema.

Não exclua nem recrie migrações depois que um sistema já tiver dados reais. Personalize o usuário antes da primeira migração se o novo produto exigir campos obrigatórios adicionais.

## 2. Troque a identidade

- `frontend/src/config.ts`: nome, descrição e entradas do menu.
- `frontend/src/styles.css`: tokens `--brand`, `--bg`, `--surface`, `--text`, `--line` e temas.
- `frontend/index.html`: título e cor do navegador.
- `frontend/src/components/Layout.tsx`: rótulo do espaço e informações do rodapé.
- `backend/accounts/admin.py`: identificação do painel administrativo.
- `.env` e `backend/.env`: credenciais, hosts, origens e banco próprios.

O layout usa fontes web com fallback local. Para ambientes sem acesso externo, hospede as fontes ou remova o `@import` no CSS.

## 3. Acrescente um módulo de negócio

Por exemplo, para cadastrar produtos:

1. Crie `backend/products/` com `python backend/manage.py startapp products backend/products` após criar a pasta.
2. Adicione o app a `INSTALLED_APPS`.
3. Crie o model herdando de `core.models.TimestampedModel`.
4. Implemente serializer e viewset, seguindo `records/`.
5. Defina quem pode ver e alterar os objetos. A filtragem de proprietário deve ocorrer no backend.
6. Registre a rota em `backend/config/urls.py`.
7. Gere e aplique a migração.
8. Crie páginas no React, registre as rotas em `main.tsx` e o menu em `config.ts`.
9. Teste o cadastro e a tentativa de acesso por outro usuário.

O módulo `records` é um exemplo que funciona. Pode ser mantido como cadastro genérico ou substituído pelo primeiro módulo de negócio. Não renomeie tabelas de um sistema com dados reais sem migração correspondente.

## 4. Mantenha o núcleo pequeno

Autenticação, layout, componentes comuns, cliente HTTP e convenções pertencem à base. Regras de pacientes, vendas, agenda, estoque ou financeiro ficam em módulos próprios.

Se o produto precisar de empresas/equipes, modele organização e vínculo de membro explicitamente. Depois, adapte queries, permissões, unicidade e testes a esse limite de acesso. O campo `is_staff` atual permite acesso administrativo e não representa uma organização.

## 5. Atualize com controle

As dependências instaláveis estão em `backend/requirements.lock.txt` e `frontend/package-lock.json`. Os intervalos de atualização do Python estão em `backend/requirements.txt`. Atualize em ambiente separado, regenere o lock e execute os testes antes de levar a mudança aos sistemas derivados.
