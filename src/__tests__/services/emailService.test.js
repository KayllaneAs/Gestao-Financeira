jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}))

import nodemailer from 'nodemailer'
import emailService from '@/services/emailService.js'

describe('EmailService', () => {
  let mockSendMail

  beforeEach(() => {
    jest.clearAllMocks()

    mockSendMail = jest.fn().mockResolvedValue({
      messageId: 'test-message-id'
    })

    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    })

    delete process.env.EMAIL_USER
    delete process.env.EMAIL_PASS
    delete process.env.EMAIL_HOST
    delete process.env.EMAIL_PORT
    delete process.env.EMAIL_SECURE
    delete process.env.EMAIL_FROM
  })

  describe('enviarCodigoVerificacao', () => {
    it('deve funcionar em modo DEV quando email não está configurado', async () => {
      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {})

      await emailService.enviarCodigoVerificacao(
        'joao@email.com',
        'João',
        '123456'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EmailService] MODO DEV — código de verificação para joao@email.com: 123456'
      )

      expect(nodemailer.createTransport).not.toHaveBeenCalled()
      expect(mockSendMail).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('deve enviar código de verificação por email', async () => {
      process.env.EMAIL_USER = 'financeapp@email.com'
      process.env.EMAIL_PASS = 'senha-teste'

      await emailService.enviarCodigoVerificacao(
        'joao@email.com',
        'João',
        '123456'
      )

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'financeapp@email.com',
          pass: 'senha-teste'
        }
      })

      expect(mockSendMail).toHaveBeenCalledTimes(1)

      const email = mockSendMail.mock.calls[0][0]

      expect(email.from).toBe(
        '"FinanceApp" <financeapp@email.com>'
      )

      expect(email.to).toBe('joao@email.com')

      expect(email.subject).toContain('123456')
      expect(email.subject).toContain('código de verificação')
      expect(email.subject).toContain('FinanceApp')

      expect(email.html).toContain('João')
      expect(email.html).toContain('123456')
      expect(email.html).toContain('Confirme seu cadastro')
      expect(email.html).toContain('15 minutos')
      expect(email.html).toContain('FinanceApp')
    })

    it('deve usar EMAIL_FROM quando configurado', async () => {
      process.env.EMAIL_USER = 'financeapp@email.com'
      process.env.EMAIL_PASS = 'senha-teste'
      process.env.EMAIL_FROM = '"FinanceApp Teste" <teste@email.com>'

      await emailService.enviarCodigoVerificacao(
        'joao@email.com',
        'João',
        '654321'
      )

      const email = mockSendMail.mock.calls[0][0]

      expect(email.from).toBe(
        '"FinanceApp Teste" <teste@email.com>'
      )
    })
  })

  describe('enviarCodigoResetSenha', () => {
    it('deve funcionar em modo DEV quando email não está configurado', async () => {
      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => {})

      await emailService.enviarCodigoResetSenha(
        'maria@email.com',
        'Maria',
        '987654'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EmailService] MODO DEV — código de reset para maria@email.com: 987654'
      )

      expect(nodemailer.createTransport).not.toHaveBeenCalled()
      expect(mockSendMail).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('deve enviar código de reset de senha por email', async () => {
      process.env.EMAIL_USER = 'financeapp@email.com'
      process.env.EMAIL_PASS = 'senha-teste'

      await emailService.enviarCodigoResetSenha(
        'maria@email.com',
        'Maria',
        '987654'
      )

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'financeapp@email.com',
          pass: 'senha-teste'
        }
      })

      expect(mockSendMail).toHaveBeenCalledTimes(1)

      const email = mockSendMail.mock.calls[0][0]

      expect(email.from).toBe(
        '"FinanceApp" <financeapp@email.com>'
      )

      expect(email.to).toBe('maria@email.com')

      expect(email.subject).toContain('987654')
      expect(email.subject).toContain('redefinir a senha')
      expect(email.subject).toContain('FinanceApp')

      expect(email.html).toContain('Maria')
      expect(email.html).toContain('987654')
      expect(email.html).toContain('Redefinição de senha')
      expect(email.html).toContain('15 minutos')
      expect(email.html).toContain('FinanceApp')
    })

    it('deve respeitar configurações SMTP personalizadas', async () => {
      process.env.EMAIL_USER = 'financeapp@email.com'
      process.env.EMAIL_PASS = 'senha-teste'
      process.env.EMAIL_HOST = 'smtp.example.com'
      process.env.EMAIL_PORT = '465'
      process.env.EMAIL_SECURE = 'true'

      await emailService.enviarCodigoResetSenha(
        'maria@email.com',
        'Maria',
        '111222'
      )

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        auth: {
          user: 'financeapp@email.com',
          pass: 'senha-teste'
        }
      })
    })
  })
})
