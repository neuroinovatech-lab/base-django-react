# Como trabalhar nesta base

Use este repositório para melhorias que sirvam a vários sistemas: autenticação, componentes, instalação, documentação e correções do núcleo. Funcionalidades específicas de um produto devem ficar no repositório criado a partir do template.

## Fluxo de contribuição

1. Atualize a branch `main`: `git switch main` e `git pull --ff-only`.
2. Crie uma branch descritiva, como `feat/filtro-registros`, `fix/login` ou `docs/instalacao`.
3. Faça uma alteração pequena e completa. Use o módulo `records` como referência.
4. Rode as verificações relacionadas à mudança e os comandos abaixo antes do PR.
5. Confira `git diff` e `git status`. Adicione somente os arquivos da alteração e faça o commit.
6. Envie a branch e abra um pull request para `main`. Explique o problema, a mudança e como verificou.
7. Peça revisão a alguém da equipe e aguarde o CI passar antes de fazer merge.

Essa é a convenção da equipe; a proteção automática da branch depende das configurações e do plano do repositório no GitHub.

## Validação

Com o ambiente virtual ativo, na raiz:

```bash
python backend/manage.py check
python backend/manage.py makemigrations --check --dry-run
python backend/manage.py test accounts records --settings=config.test_settings
cd frontend
npm run format:check
npm run build
npm run test:e2e
```

Na primeira execução do teste de navegador, instale Chromium com `npx playwright install chromium`. Os testes de navegador usam banco e portas exclusivos; não precisam dos servidores de desenvolvimento abertos. No Linux, pode ser necessário `npx playwright install --with-deps chromium`.

Use `npm run format` dentro de `frontend` para padronizar automaticamente o código antes do commit.

## Convenções essenciais

- Python cuida da validação, das permissões e do acesso ao banco. Ocultar um botão no React não é controle de acesso.
- Novos modelos ficam no app da funcionalidade; componentes compartilhados ficam em `frontend/src/components/`.
- Mantenha o isolamento por proprietário, a menos que o projeto implemente outro modelo de acesso explicitamente.
- Se mudar modelos, gere e inclua a migração. Não apague migrações aplicadas em ambientes com dados.
- Reutilize `api()` para chamadas HTTP e os tokens do CSS para cores.
- Use dados fictícios em exemplos e testes. `.env`, bancos, senhas, chaves e arquivos locais não entram no Git.
- Atualize a documentação quando mudar instalação, configuração ou comportamento de uma funcionalidade.

## Se você está começando

Antes de abrir um PR grande, escreva o resultado esperado com um exemplo e confirme o escopo com quem revisará. Comece por mudanças pequenas. Se encontrar um erro, registre o comando, a mensagem e os passos para reproduzir, removendo senhas e dados privados.
