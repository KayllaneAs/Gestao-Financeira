/**
 * US36 – Categorizar transações automaticamente
 *
 * Centraliza as regras de categorização para que o cadastro manual
 * e a importação CSV utilizem exatamente o mesmo comportamento.
 */

// US36 - CA01: categorias e palavras-chave utilizadas na sugestão automática.
const REGRAS_CATEGORIZACAO = {
  'Alimentação': [
    'mercado', 'supermercad', 'padaria', 'acougue', 'restaurante', 'lanche',
    'pizza', 'ifood', 'rappi', 'hamburgue', 'assai', 'carrefour', 'extra',
    'atacad', 'hortifruti', 'pao de acucar', 'dia%', 'sams club'
  ],
  'Transporte': [
    'uber', '99pop', '99 taxi', 'taxi', 'onibus', 'metro', 'combustivel',
    'gasolina', 'posto ', 'estacionamento', 'pedagio', 'buser', 'passagem'
  ],
  'Saúde': [
    'farmacia', 'drogaria', 'medico', 'hospital', 'clinica', 'dentista',
    'exame', 'remedios', 'remedio', 'manipulac', 'laboratorio', 'otica',
    'plano saude'
  ],
  'Entretenimento': [
    'netflix', 'spotify', 'disney', 'hbo', 'globoplay', 'amazon prime',
    'cinema', 'steam', 'playstation', 'xbox', 'apple music', 'prime video',
    'ingresso', 'show ', 'jogo ', 'game'
  ],
  'Educação': [
    'escola', 'faculdade', 'universidade', 'curso', 'udemy', 'alura',
    'livraria', 'livro ', 'apostila', 'material escolar'
  ],
  'Roupas': [
    'renner', 'hering', 'zara', 'c&a', 'riachuelo', 'roupa', 'calcado',
    'sapato', 'tenis ', 'moda', 'nike', 'adidas', 'puma', 'cea '
  ],
  'Contas': [
    'enel', 'cedae', 'sabesp', 'claro', 'vivo', 'tim ', ' oi ', 'internet',
    'energia ', 'agua ', 'gas ', 'seguro', 'recarga', 'fatura'
  ],
  'Moradia': [
    'aluguel', 'condominio', 'manutencao', 'reforma', 'chuveiro',
    'encanador', 'eletricista', 'construcao', 'tinta ', 'material construc'
  ],
  'Eletrônicos': [
    'notebook', 'celular', 'iphone', 'samsung', 'dell', 'apple store',
    'computador', 'tablet', 'monitor', 'teclado', 'mouse ', 'fone ',
    'headphone', 'carregador'
  ]
}

class CategorizacaoService {
  normalizarTexto(texto = '') {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * US36 - CA01:
   * Analisa a descrição e retorna a categoria correspondente.
   *
   * US36 - CA03:
   * Retorna null quando nenhuma categoria puder ser sugerida.
   */
  sugerirCategoria(descricao) {
    const textoNormalizado = this.normalizarTexto(descricao)

    if (!textoNormalizado) {
      return null
    }

    for (const [categoria, palavrasChave] of Object.entries(REGRAS_CATEGORIZACAO)) {
      const encontrou = palavrasChave.some((palavra) =>
        textoNormalizado.includes(this.normalizarTexto(palavra))
      )

      if (encontrou) {
        return categoria
      }
    }

    return null
  }
}

export default new CategorizacaoService()
