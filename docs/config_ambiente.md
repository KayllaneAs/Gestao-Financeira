# 🚀 FinanceApp - Guia de Configuração do Ambiente (Sprint 1)

Este guia prático foi estruturado para auxiliar toda a equipe de desenvolvimento (**Guilherme, Kayllane e Laura**) a clonar, configurar e rodar o ambiente local do **FinanceApp** de forma idêntica, mitigando erros de versões e arquitetura.

---

## 📋 1. Pré-requisitos Técnicos

O projeto utiliza recursos modernos do **Next.js (App Router)** que exigem uma versão específica e atualizada do Node.js.

* **Versão Mínima do Node.js:** `v20.9.0` ou superior (Recomendado: `v20.20.2` LTS).

### 🛠️ Correção de Versão com NVM (Se necessário)
Se ao rodar `node -v` o teu terminal indicar uma versão antiga (como a v18), utiliza o **NVM-Windows** no PowerShell para atualizar:
```powershell
nvm install 20
nvm use 20


2. Como Baixar e Rodar o Projeto
Abra o terminal (PowerShell ou Bash) na pasta onde costuma salvar seus projetos e execute os seguintes comandos:

PowerShell
# 1. Clonar o repositório oficial do projeto
git clone [https://github.com/SEU_USUARIO/financeapp.git](https://github.com/SEU_USUARIO/financeapp.git)

# 2. Entrar na pasta do projeto
cd financeapp

# 3. Instalar todas as dependências necessárias
npm install

3. Configurar Variáveis de Ambiente
Na raiz da pasta financeapp, crie um arquivo de texto chamado exatamente .env.local e adicione as chaves de configuração abaixo para que o backend funcione localmente:

Snippet de código
DATABASE_URL="postgresql://laura_admin:senha_provisoria@ep-pool-temporario.us-east-1.aws.neon.tech/financeapp_dev?sslmode=require"
JWT_SECRET="projeto_finance_app_secreto_2026"

4. Inicializar a Aplicação
Com tudo instalado e o arquivo .env.local criado, execute o comando para iniciar o servidor local:

powershell
npm run dev