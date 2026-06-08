import nodemailer from 'nodemailer'

function criarTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

function templateBase(titulo, conteudo) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);width:48px;height:48px;border-radius:14px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:22px;line-height:48px;">💳</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:800;color:#f8fafc;">Finance</span><span style="font-size:22px;font-weight:400;color:#818cf8;">App</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#1e293b;border-radius:20px;border:1px solid #334155;padding:36px 32px;">
              ${conteudo}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="color:#475569;font-size:12px;margin:0;">Este e-mail foi enviado automaticamente pelo FinanceApp. Não responda.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function conteudoCodigo(nome, codigo, acao, validade = '15 minutos') {
  return `
    <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 8px;">${acao}</h1>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 28px;">Olá, <strong style="color:#e2e8f0;">${nome}</strong>! Use o código abaixo para continuar.</p>

    <!-- Código -->
    <div style="background:#0f172a;border:1px solid #334155;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
      <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px;">Seu código de verificação</p>
      <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#818cf8;font-family:'Courier New',monospace;">${codigo}</div>
    </div>

    <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:14px 16px;">
      <p style="color:#fbbf24;font-size:13px;margin:0;">⏱ Este código expira em <strong>${validade}</strong>. Se você não solicitou isso, ignore este e-mail.</p>
    </div>
  `
}

class EmailService {
  async enviarCodigoVerificacao(email, nome, codigo) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EmailService] MODO DEV — código de verificação para ${email}: ${codigo}`)
      return
    }

    const transporter = criarTransporter()
    const html = templateBase(
      'Verifique seu e-mail — FinanceApp',
      conteudoCodigo(nome, codigo, 'Confirme seu cadastro')
    )

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"FinanceApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${codigo} é o seu código de verificação — FinanceApp`,
      html,
    })
  }

  async enviarCodigoResetSenha(email, nome, codigo) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EmailService] MODO DEV — código de reset para ${email}: ${codigo}`)
      return
    }

    const transporter = criarTransporter()
    const html = templateBase(
      'Redefinição de senha — FinanceApp',
      conteudoCodigo(nome, codigo, 'Redefinição de senha')
    )

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"FinanceApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${codigo} é o seu código para redefinir a senha — FinanceApp`,
      html,
    })
  }
}

export default new EmailService()
