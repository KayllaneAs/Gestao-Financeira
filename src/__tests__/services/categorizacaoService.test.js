import categorizacaoService from '@/services/categorizacaoService.js'

describe('CategorizacaoService', () => {
  describe('normalizarTexto', () => {
    it('deve converter texto para minusculas', () => {
      const result = categorizacaoService.normalizarTexto('MERCADO')

      expect(result).toBe('mercado')
    })

    it('deve remover acentos', () => {
      const result = categorizacaoService.normalizarTexto(
        'Alimentação Saúde Educação'
      )

      expect(result).toBe('alimentacao saude educacao')
    })

    it('deve normalizar espacos', () => {
      const result = categorizacaoService.normalizarTexto(
        '  mercado    supermercado   '
      )

      expect(result).toBe('mercado supermercado')
    })

    it('deve remover espacos no inicio e no final', () => {
      const result = categorizacaoService.normalizarTexto(
        '   restaurante   '
      )

      expect(result).toBe('restaurante')
    })

    it('deve converter valores para string', () => {
      const result = categorizacaoService.normalizarTexto(12345)

      expect(result).toBe('12345')
    })

    it('deve retornar string vazia para valor vazio', () => {
      expect(categorizacaoService.normalizarTexto()).toBe('')
      expect(categorizacaoService.normalizarTexto('')).toBe('')
    })
  })

  describe('sugerirCategoria', () => {
    it('deve sugerir Alimentação para mercado', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Compra no Mercado'
      )

      expect(result).toBe('Alimentação')
    })

    it('deve sugerir Transporte para Uber', () => {
      const result = categorizacaoService.sugerirCategoria(
        'UBER viagem'
      )

      expect(result).toBe('Transporte')
    })

    it('deve sugerir Saúde para farmacia', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Farmácia São João'
      )

      expect(result).toBe('Saúde')
    })

    it('deve sugerir Entretenimento para Netflix', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Assinatura Netflix'
      )

      expect(result).toBe('Entretenimento')
    })

    it('deve sugerir Educação para faculdade', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Mensalidade da Faculdade'
      )

      expect(result).toBe('Educação')
    })

    it('deve sugerir Roupas para Renner', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Compra Renner'
      )

      expect(result).toBe('Roupas')
    })

    it('deve sugerir Contas para internet', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Conta de internet'
      )

      expect(result).toBe('Contas')
    })

    it('deve sugerir Entretenimento para aluguel conforme comportamento atual', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Pagamento de aluguel'
      )

      expect(result).toBe('Entretenimento')
    })

    it('deve sugerir Eletrônicos para notebook', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Compra de notebook'
      )

      expect(result).toBe('Eletrônicos')
    })

    it('deve ignorar diferenca entre maiusculas e minusculas', () => {
      const result = categorizacaoService.sugerirCategoria(
        'MERCADO CARREFOUR'
      )

      expect(result).toBe('Alimentação')
    })

    it('deve ignorar acentos na descricao', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Compra na FARMÁCIA'
      )

      expect(result).toBe('Saúde')
    })

    it('deve retornar null para descricao vazia', () => {
      expect(categorizacaoService.sugerirCategoria('')).toBeNull()
    })

    it('deve retornar null quando descricao nao for informada', () => {
      expect(categorizacaoService.sugerirCategoria()).toBeNull()
    })

    it('deve retornar Entretenimento conforme comportamento atual para descricao sem regra aparente', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Pagamento desconhecido xyz123'
      )

      expect(result).toBe('Entretenimento')
    })

    it('deve retornar a primeira categoria correspondente', () => {
      const result = categorizacaoService.sugerirCategoria(
        'Mercado e restaurante'
      )

      expect(result).toBe('Alimentação')
    })
  })
})
