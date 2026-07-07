import models from '@/models/index.js'
import { randomUUID } from 'crypto'

const { Despesa, ContaCartao, ParcelamentoAgrupador, sequelize } = models

// ── Categorização automática por palavras-chave ───────────────────────────────
const KEYWORDS = {
  'Alimentação':    ['mercado', 'supermercad', 'padaria', 'acougue', 'restaurante', 'lanche', 'pizza',
                     'ifood', 'rappi', 'hamburgue', 'assai', 'carrefour', 'extra', 'atacad', 'hortifruti',
                     'pao de acucar', 'dia%', 'sams club'],
  'Transporte':     ['uber', '99pop', '99 taxi', 'taxi', 'onibus', 'metro', 'combustivel', 'gasolina',
                     'posto ', 'estacionamento', 'pedágio', 'pedagio', 'buser', 'passagem'],
  'Saúde':          ['farmacia', 'drogaria', 'medico', 'hospital', 'clinica', 'dentista', 'exame',
                     'remedios', 'remedio', 'manipulac', 'laboratorio', 'otica', 'plano saude'],
  'Entretenimento': ['netflix', 'spotify', 'disney', 'hbo', 'globoplay', 'amazon prime', 'cinema',
                     'steam', 'playstation', 'xbox', 'apple music', 'prime video', 'ingresso',
                     'show ', 'jogo ', 'game'],
  'Educação':       ['escola', 'faculdade', 'universidade', 'curso', 'udemy', 'alura', 'livraria',
                     'livro ', 'apostila', 'material escolar'],
  'Roupas':         ['renner', 'hering', 'zara', 'c&a', 'riachuelo', 'roupa', 'calcado', 'sapato',
                     'tenis ', 'moda', 'nike', 'adidas', 'puma', 'cea '],
  'Contas':         ['enel', 'cedae', 'sabesp', 'claro', 'vivo', 'tim ', ' oi ', 'internet',
                     'energia ', 'agua ', 'gas ', 'seguro', 'recarga', 'fatura'],
  'Moradia':        ['aluguel', 'condominio', 'manutencao', 'reforma', 'chuveiro', 'encanador',
                     'eletricista', 'construcao', 'tinta ', 'material construc'],
  'Eletrônicos':    ['notebook', 'celular', 'iphone', 'samsung', 'dell', 'apple store', 'computador',
                     'tablet', 'monitor', 'teclado', 'mouse ', 'fone ', 'headphone', 'carregador'],
}

function sugerirCategoria(descricao) {
  const lower = descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [cat, palavras] of Object.entries(KEYWORDS)) {
    if (palavras.some(p => lower.includes(p))) return cat
  }
  return 'Outros'
}

// ── Parser CSV ────────────────────────────────────────────────────────────────
function detectarSeparador(texto) {
  const linhas = texto.split('\n').filter(l => l.trim()).slice(0, 5)
  const pontoVirgulas = linhas.reduce((s, l) => s + (l.match(/;/g) || []).length, 0)
  const virgulas = linhas.reduce((s, l) => s + (l.match(/,/g) || []).length, 0)
  return pontoVirgulas >= virgulas ? ';' : ','
}

function parsearLinha(linha, sep) {
  // Suporta campos entre aspas
  const resultado = []
  let atual = ''
  let dentroAspas = false
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]
    if (c === '"') { dentroAspas = !dentroAspas; continue }
    if (c === sep && !dentroAspas) { resultado.push(atual.trim()); atual = ''; continue }
    atual += c
  }
  resultado.push(atual.trim())
  return resultado
}

function parsearNumero(valor) {
  if (!valor) return null
  const str = String(valor).trim()
  // Remove símbolo R$, espaços, etc.
  const limpo = str.replace(/[R$\s]/g, '')
  // Formato brasileiro: 1.234,56  → inverter
  if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(limpo)) {
    return parseFloat(limpo.replace(/\./g, '').replace(',', '.'))
  }
  // Formato 1234,56
  if (/^\d+(,\d+)?$/.test(limpo)) {
    return parseFloat(limpo.replace(',', '.'))
  }
  // Formato padrão 1234.56 ou -1234.56
  const n = parseFloat(limpo.replace(',', '.'))
  return isNaN(n) ? null : n
}

function parsearData(valor) {
  if (!valor) return null
  const str = String(valor).trim()
  // DD/MM/YYYY ou DD/MM/YY
  const br = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (br) {
    const [, d, m, a] = br
    const ano = a.length === 2 ? `20${a}` : a
    return `${ano}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10)
  // MM/DD/YYYY
  const us = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (us) {
    const [, m, d, a] = us
    if (parseInt(m) <= 12 && parseInt(d) <= 31) {
      return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
  }
  return null
}

// Detecta padrão de parcela:
//   "NOTEBOOK DELL 05/12"          → { atual: 5, total: 12, descBase: "NOTEBOOK DELL" }
//   "Mp *Aliexpress - Parcela 6/10" → { atual: 6, total: 10, descBase: "Mp *Aliexpress" }
function detectarParcela(descricao) {
  const match = descricao.match(/\b(\d{1,2})\/(\d{1,2})\s*$/)
  if (!match) return null
  const atual = parseInt(match[1])
  const total = parseInt(match[2])
  if (atual < 1 || total < 2 || atual > total || total > 60) return null
  // Remove o sufixo "- Parcela" (ou variações) antes do X/Y
  const descBase = descricao
    .slice(0, match.index)
    .replace(/[-–\s]*parcela\s*$/i, '')
    .trim()
  return { atual, total, descBase }
}

function normalizarDesc(desc) {
  return desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
}

// ── Serviço principal ─────────────────────────────────────────────────────────
class ImportacaoService {

  // Parseia o texto CSV e retorna metadados para o frontend escolher mapeamento
  parsearPreview(csvText) {
    const sep = detectarSeparador(csvText)
    const linhas = csvText.split('\n').map(l => l.trim()).filter(Boolean)
    if (linhas.length < 2) throw Object.assign(new Error('CSV deve ter pelo menos 2 linhas'), { statusCode: 400 })

    const cabecalho = parsearLinha(linhas[0], sep)
    const amostra = linhas.slice(1, 4).map(l => parsearLinha(l, sep))

    // Tenta detectar automaticamente as colunas
    const colData = cabecalho.findIndex(h => /data|date|dt/i.test(h))
    const colDesc = cabecalho.findIndex(h => /desc|lancamento|historico|memo|titulo|nome/i.test(h))
    const colValor = cabecalho.findIndex(h => /valor|value|amount|montante|total/i.test(h))

    return {
      separador: sep,
      cabecalho,
      amostra,
      totalLinhas: linhas.length - 1,
      sugestao: {
        colData:  colData  >= 0 ? colData  : 0,
        colDesc:  colDesc  >= 0 ? colDesc  : 1,
        colValor: colValor >= 0 ? colValor : 2,
      }
    }
  }

  // Processa CSV com mapeamento de colunas e retorna transações + grupos
  processarCSV(csvText, { colData, colDesc, colValor, ignorarNegativo = false }) {
    const sep = detectarSeparador(csvText)
    const linhas = csvText.split('\n').map(l => l.trim()).filter(Boolean)

    const transacoes = []
    const erros = []

    for (let i = 1; i < linhas.length; i++) {
      const cols = parsearLinha(linhas[i], sep)
      const dataRaw  = cols[colData]  || ''
      const descRaw  = cols[colDesc]  || ''
      const valorRaw = cols[colValor] || ''

      const data  = parsearData(dataRaw)
      const valor = parsearNumero(valorRaw)
      const desc  = descRaw.trim()

      if (!data)  { erros.push({ linha: i + 1, motivo: `Data inválida: "${dataRaw}"` }); continue }
      if (valor === null) { erros.push({ linha: i + 1, motivo: `Valor inválido: "${valorRaw}"` }); continue }
      if (!desc)  { erros.push({ linha: i + 1, motivo: 'Descrição vazia' }); continue }

      const valorAbs = Math.abs(valor)
      if (valorAbs === 0) continue
      if (ignorarNegativo && valor < 0) continue  // ignora créditos/estornos (valores negativos)

      const parcela = detectarParcela(desc)
      const id = randomUUID()

      transacoes.push({
        id,
        descricao:       desc,
        descricaoBase:   parcela ? parcela.descBase : desc,
        data,
        valor:           parseFloat(valorAbs.toFixed(2)),
        categoria:       sugerirCategoria(parcela ? parcela.descBase : desc),
        parcela,          // { atual, total, descBase } ou null
        ehParcelamento:  parcela !== null,
      })
    }

    // Agrupa parcelamentos pelo descricaoBase normalizado + total de parcelas
    // (ex: "Amazon 6/10" e "Amazon 2/6" são compras diferentes → chaves diferentes)
    const grupos = {}
    for (const t of transacoes) {
      if (!t.parcela) continue
      const chave = `${normalizarDesc(t.parcela.descBase)}__${t.parcela.total}`
      if (!grupos[chave]) {
        grupos[chave] = {
          chave,
          descricao:  t.parcela.descBase,
          categoria:  t.categoria,
          valorParcela: t.valor,
          parcelas: [],
          dataBase:   t.data,  // data da parcela detectada no CSV
          parcelaAtual: t.parcela.atual,
          totalParcelas: t.parcela.total,
        }
      }
      grupos[chave].parcelas.push({ atual: t.parcela.atual, data: t.data })
    }

    // Para cada grupo, calcula data de início (retrocede X-1 meses)
    for (const g of Object.values(grupos)) {
      const dataRef = new Date(g.dataBase + 'T00:00:00')
      dataRef.setMonth(dataRef.getMonth() - (g.parcelaAtual - 1))
      g.dataInicio = dataRef.toISOString().split('T')[0]
      g.valorTotal = parseFloat((g.valorParcela * g.totalParcelas).toFixed(2))
    }

    return {
      transacoes,
      grupos: Object.values(grupos),
      erros,
      resumo: {
        total: transacoes.length,
        parcelamentos: Object.keys(grupos).length,
        avulsas: transacoes.filter(t => !t.ehParcelamento).length,
      }
    }
  }

  // Grava no banco: cria todos os parcelamentos (passado + futuro) e despesas avulsas
  async confirmarImportacao({ idUsuario, idConta, transacoes, grupos }) {
    // Valida conta
    const conta = await ContaCartao.findOne({ where: { Id_Conta: idConta, Id_Usuario: idUsuario } })
    if (!conta) throw Object.assign(new Error('Conta não encontrada'), { statusCode: 404 })

    const transaction = await sequelize.transaction()
    const resultado = {
      parcelamentosCriados: 0,
      despesasCriadas: 0,
      despesasAvulsas: 0,
      // IDs para desfazer
      idsParcelamentos: [],
      idsDespesasAvulsas: [],
    }

    try {
      // 1. Cria todos os parcelamentos detectados (todas as parcelas, passado e futuro)
      for (const g of grupos) {
        const idParc = randomUUID()
        await ParcelamentoAgrupador.create({
          Id_Parcelamento: idParc,
          Id_Usuario:      idUsuario,
          Descricao_Parcela: g.descricao,
          Valor_Total:     g.valorTotal,
          Qtd_Parcelas:    g.totalParcelas,
          Data_Inicio:     g.dataInicio,
        }, { transaction })

        const dataBase = new Date(g.dataInicio + 'T00:00:00')
        for (let i = 0; i < g.totalParcelas; i++) {
          const d = new Date(dataBase)
          d.setMonth(d.getMonth() + i)
          await Despesa.create({
            Id_Despesa:       randomUUID(),
            Id_Usuario:       idUsuario,
            Id_Conta:         idConta,
            Id_Parcelamento:  idParc,
            Descricao_Despesa: g.descricao,
            Valor_Parcela:    g.valorParcela,
            Data:             d.toISOString().split('T')[0],
            Categoria:        g.categoria,
            Numero_Parcela:   i + 1,
          }, { transaction })
          resultado.despesasCriadas++
        }
        resultado.parcelamentosCriados++
        resultado.idsParcelamentos.push(idParc)
      }

      // 2. Cria despesas avulsas (sem parcela)
      const avulsas = transacoes.filter(t => !t.ehParcelamento)
      for (const t of avulsas) {
        const idDespesa = randomUUID()
        await Despesa.create({
          Id_Despesa:       idDespesa,
          Id_Usuario:       idUsuario,
          Id_Conta:         idConta,
          Descricao_Despesa: t.descricao,
          Valor_Parcela:    t.valor,
          Data:             t.data,
          Categoria:        t.categoria,
          Numero_Parcela:   1,
        }, { transaction })
        resultado.despesasAvulsas++
        resultado.despesasCriadas++
        resultado.idsDespesasAvulsas.push(idDespesa)
      }

      await transaction.commit()
      return resultado
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }

  // Desfaz uma importação: deleta os parcelamentos (cascade para despesas) e despesas avulsas
  async desfazerImportacao({ idUsuario, idsParcelamentos, idsDespesasAvulsas }) {
    const { Op } = await import('sequelize')
    const transaction = await sequelize.transaction()
    try {
      // Deletar parcelamentos (cascade deleta as despesas filhas)
      if (idsParcelamentos?.length) {
        await ParcelamentoAgrupador.destroy({
          where: { Id_Parcelamento: { [Op.in]: idsParcelamentos }, Id_Usuario: idUsuario },
          transaction,
        })
      }
      // Deletar despesas avulsas
      if (idsDespesasAvulsas?.length) {
        await Despesa.destroy({
          where: { Id_Despesa: { [Op.in]: idsDespesasAvulsas }, Id_Usuario: idUsuario },
          transaction,
        })
      }
      await transaction.commit()
      return { mensagem: 'Importação desfeita com sucesso' }
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
}

export default new ImportacaoService()
