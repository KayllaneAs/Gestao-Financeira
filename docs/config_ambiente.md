# 🚀 FinanceApp — Guia de Configuração do Ambiente

Este guia orienta toda a equipe (**Guilherme, Kayllane e Laura**) a clonar, configurar e rodar o ambiente local do FinanceApp de forma idêntica.

---

## 1. Pré-requisitos

- **Node.js** `v20.9.0` ou superior (recomendado: `v20.20.2` LTS)
- **Git** instalado

### Verificar versão do Node.js
```bash
node -v
```

### Atualizar com NVM se necessário
```powershell
nvm install 20
nvm use 20
```

---

## 2. Clonar e instalar

```bash
# Clonar o repositório
git clone https://github.com/SEU_USUARIO/financeapp.git

# Entrar na pasta
cd financeapp

# Instalar dependências
npm install
```

---

## 3. Configurar variáveis de ambiente

Na raiz do projeto, crie um arquivo chamado exatamente `.env.local` com o seguinte conteúdo:

```dotenv
DATABASE_URL="sua_string_de_conexao_do_neon_aqui"
JWT_SECRET="defina_um_segredo_aqui"
```

> **Como obter a `DATABASE_URL`:** acesse o painel do Neon → selecione o projeto FinanceApp → Connection string → copie a string completa.
>
> ⚠️ Nunca compartilhe o `.env.local` com ninguém nem suba ele para o GitHub. Confirme que `.env.local` está no `.gitignore` antes de fazer qualquer commit.

---

## 4. Criar as tabelas no banco de dados

```bash
npx sequelize-cli db:migrate
```

A saída esperada no terminal é:

```
== 02-create-usuario: migrated (0.Xs)
== 03-create-conta-cartao: migrated (0.Xs)
== 04-create-renda: migrated (0.Xs)
== 05-create-parcelamento-agrupador: migrated (0.Xs)
== 06-create-despesa: migrated (0.Xs)
== 07-create-reserva: migrated (0.Xs)
```

Para confirmar que tudo foi criado corretamente, rode no SQL Editor do Neon:

```sql
SELECT * FROM "SequelizeMeta";
```

Devem aparecer 8 linhas, uma para cada migration.

---

## 5. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## ⚠️ Problemas comuns

**Erro de versão do Node.js**
Rode `node -v` e confirme que está na v20+. Se não estiver, use o NVM para atualizar.

**Erro nas migrations**
Confirme que o arquivo `.env.local` existe na raiz do projeto e que a `DATABASE_URL` está correta. Sem esse arquivo, o Sequelize não consegue se conectar ao Neon.

**Tabelas já existem no banco**
Se o banco já tiver as tabelas de uma configuração anterior, rode antes:
```bash
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```