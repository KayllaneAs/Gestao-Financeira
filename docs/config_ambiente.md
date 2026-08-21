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

> ⚠️ **Não use apenas `sudo apt install nodejs`.** O Node que vem por padrão no Ubuntu e no Debian é antigo (v12 ou v18) e o projeto exige v20+. Use um dos métodos abaixo.

**Método A — NodeSource (mais simples):**
```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
```

**Método B — NVM (permite ter várias versões do Node):**
```bash
sudo apt update && sudo apt install -y curl git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

Confirme antes de continuar:
```bash
node -v      # precisa ser v20.0.0 ou maior
```

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
> ⚠️ A `DATABASE_URL` precisa ficar em **uma linha só**. Ao copiar do PDF ela costuma quebrar em duas — junte novamente antes de salvar, senão o Sequelize não conecta. Para conferir no Linux: `grep -c "^DATABASE_URL" .env.local` deve responder `1`.
>
> ⚠️ Nunca suba o `.env.local` para o GitHub. Confirme que ele está no `.gitignore`.

---

### 4. Banco de dados

> **O banco já está criado e populado.** As tabelas e os usuários de teste já existem no Neon. Se você está usando a `DATABASE_URL` fornecida no PDF, **pule direto para o passo 5**.

Usuários disponíveis:

| Perfil | Email | Senha |
|---|---|---|
| Admin | laura@financeapp.com | Teste@123 |
| Usuário comum | user@financeapp.com | Senha123 |

Os comandos abaixo só são necessários se você apontar a `DATABASE_URL` para um banco PostgreSQL **próprio e vazio**:

```bash
# cria as tabelas
npx sequelize-cli db:migrate

# insere os usuários de teste
npx sequelize-cli db:seed:all
```

Usando o banco compartilhado, a saída esperada é:

```
No migrations were executed, database schema was already up to date.

ERROR: Validation error
ERROR DETAIL: Key (id_usuario)=(b2c3d4e5-...) already exists.
```

> ℹ️ **O erro no seed é esperado e pode ser ignorado.** Ele apenas informa que os usuários de teste já foram inseridos antes. Nada é apagado — siga para o passo 5.
>
> O `db:seed:all` não é idempotente: o seeder insere UUIDs fixos, `id_usuario` é chave primária e não há `seederStorage` configurado, então ele tenta reinserir a cada execução.

---

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

### 6. Executar os testes unitários

```bash
npx jest
```

Resultado esperado: **27 suítes e 396 testes aprovados**, com cerca de 95% de cobertura. Os testes não dependem de internet nem do banco.

---

## ⚠️ Problemas comuns

**Erro de versão do Node.js**
Rode `node -v` e confirme que está na v20+. Se não estiver, use o NVM para atualizar.

**Erro nas migrations**
Confirme que o `.env.local` existe na raiz e que a `DATABASE_URL` está correta. Sem esse arquivo o Sequelize não consegue se conectar ao Neon.

**`already exists` ao rodar `db:seed:all`**
Esperado. Os usuários de teste já existem no banco. Ignore e siga para o `npm run dev`.

> 🚨 **Nunca rode `npx sequelize-cli db:migrate:undo:all` no banco compartilhado.** Ele apaga todas as tabelas e destrói os dados de todos que usam esse banco. Use somente em um banco local seu.

**`SequelizeConnectionError` / `ENOTFOUND`**
A `DATABASE_URL` quebrou em duas linhas ao ser colada. Abra o `.env.local` e junte tudo em uma linha só.

**`path length ... exceeds max length of filesystem` (Windows)**
Caminho longo demais. O Windows limita a 260 caracteres. Mova o projeto para uma pasta rasa (ex.: `C:\projetos`), apague a pasta `.next` e rode `npm run dev` de novo.

**Porta 3000 em uso**
O Next.js troca sozinho para a 3001. Use o endereço exibido no terminal.

**Erro de conexão com o banco (ETIMEDOUT)**
A rede universitária pode bloquear a porta 5432 do PostgreSQL. Use um hotspot de celular (4G/5G).

**Erro de arquivo não encontrado nos controllers (Linux)**
O Linux é case-sensitive. Confirme que todos os controllers estão com a primeira letra minúscula (ex: `despesaController.js`).

---

## Dependências externas

O projeto depende de três serviços de terceiros permanecerem ativos: o banco **Neon** (planos gratuitos suspendem por inatividade), a **senha de aplicativo do Gmail** usada no envio de OTP e o **deploy na Vercel**. Se for rodar o projeto semanas depois, vale repetir o roteiro na véspera para confirmar que os três seguem no ar.
