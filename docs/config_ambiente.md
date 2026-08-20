# FinanceApp - Gestão de Sistema Financeira

Sistema web de gestão financeira pessoal desenvolvido com Next.js, PostgreSQL (Neon) e Sequelize.

🔗 **Acesso online:** [https://gestao-financeira-topaz.vercel.app](https://gestao-financeira-topaz.vercel.app)

---

## Tecnologias

- **Frontend:** Next.js 16, React 19, Tailwind CSS, Recharts
- **Backend:** Next.js API Routes, Sequelize ORM
- **Banco de dados:** PostgreSQL (Neon serverless)
- **Autenticação:** JWT + OTP via email (Nodemailer)
- **Testes:** Jest

---

## Configuração do Ambiente

### 1. Pré-requisitos

- **Node.js** `v20.9.0` ou superior (recomendado: `v20.20.2` LTS)
- **Git** instalado

Verificar versão do Node.js:
```bash
node -v
```

Atualizar com NVM se necessário:
```bash
nvm install 20
nvm use 20
```

#### Windows
Baixe o instalador `.msi` em [https://nodejs.org](https://nodejs.org) e siga o assistente de instalação.

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm git
```

> ⚠️ Verifique se a versão instalada é 20+ com `node -v`. Se não for, use o NVM acima para atualizar.

---

### 2. Clonar e instalar

```bash
git clone https://github.com/KayllaneAs/Gestao-Financeira.git
cd Gestao-Financeira
npm install
```

---

### 3. Configurar variáveis de ambiente

Na raiz do projeto, crie um arquivo chamado exatamente `.env.local`:

```dotenv
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/DATABASE?sslmode=require"
JWT_SECRET="seu_jwt_secret_aqui"
JWT_EXPIRES_IN="7d"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="seu_email@gmail.com"
EMAIL_PASS="sua_senha_de_app_aqui"
EMAIL_FROM="FinanceApp <seu_email@gmail.com>"

```
**obs:** Os dados reais das credenciais estão no documento anexado no .zip (pdf)

> **Windows:** crie o arquivo pelo editor de texto ou pelo VS Code na raiz do projeto.
>
> **Linux:** crie o arquivo via terminal com `nano .env.local`, cole o conteúdo, salve com `Ctrl+O` e saia com `Ctrl+X`.
>
> ⚠️ Nunca suba o `.env.local` para o GitHub. Confirme que ele está no `.gitignore`.

---

### 4. Criar as tabelas no banco

```bash
npx sequelize-cli db:migrate
```

Para confirmar, rode no SQL Editor do Neon:
```sql
SELECT * FROM "SequelizeMeta";
```
Devem aparecer 6 linhas, uma para cada migration.

---

### 5. Popular o banco com dados iniciais

```bash
npx sequelize-cli db:seed:all
```

Usuários criados:

| Perfil | Email | Senha |
|---|---|---|
| Admin | laura@financeapp.com | Teste@123 |
| Usuário comum | user@financeapp.com | Senha123 |

---

### 6. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

### 7. Executar os testes unitários

```bash
npx jest
```

---

## ⚠️ Problemas comuns

**Erro de versão do Node.js**
Rode `node -v` e confirme que está na v20+. Se não estiver, use o NVM para atualizar.

**Erro nas migrations**
Confirme que o `.env.local` existe na raiz e que a `DATABASE_URL` está correta. Sem esse arquivo o Sequelize não consegue se conectar ao Neon.

**Tabelas já existem no banco**
```bash
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Erro de conexão com o banco (ETIMEDOUT)**
A rede universitária pode bloquear a porta 5432 do PostgreSQL. Use um hotspot de celular (4G/5G).

**Erro de arquivo não encontrado nos controllers (Linux)**
O Linux é case-sensitive. Confirme que todos os controllers estão com a primeira letra minúscula (ex: `despesaController.js`).
