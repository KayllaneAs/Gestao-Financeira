let cacheService
let TTL
let CACHE_KEYS

describe('CacheService', () => {
  beforeAll(() => {
    jest.useFakeTimers()

    jest.isolateModules(() => {
      const cacheModule = require('@/services/cacheService.js')

      cacheService = cacheModule.default
      TTL = cacheModule.TTL
      CACHE_KEYS = cacheModule.CACHE_KEYS
    })
  })

  afterAll(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  beforeEach(() => {
    cacheService.clear()
  })

  describe('generateKey', () => {
    it('deve gerar chave no formato prefix:userId:params', () => {
      const key = cacheService.generateKey(
        'dashboard:resumo',
        'u1',
        { mes: 7, ano: 2026 }
      )

      expect(key).toBe('dashboard:resumo:u1:ano:2026|mes:7')
    })

    it('deve ordenar params alfabeticamente', () => {
      const key1 = cacheService.generateKey(
        'prefix',
        'u1',
        { z: 1, a: 2 }
      )

      const key2 = cacheService.generateKey(
        'prefix',
        'u1',
        { a: 2, z: 1 }
      )

      expect(key1).toBe(key2)
    })

    it('deve gerar chave sem params', () => {
      const key = cacheService.generateKey('prefix', 'u1')

      expect(key).toBe('prefix:u1:')
    })
  })

  describe('get e set', () => {
    it('deve armazenar e recuperar valor do cache', () => {
      cacheService.set('key1', { data: 'valor' }, TTL.SHORT)

      const result = cacheService.get('key1')

      expect(result).toEqual({ data: 'valor' })
    })

    it('deve retornar null para chave inexistente', () => {
      const result = cacheService.get('nao-existe')

      expect(result).toBeNull()
    })

    it('deve retornar null e remover chave expirada', () => {
      cacheService.set('key-expirada', 'valor', -1000)

      const result = cacheService.get('key-expirada')

      expect(result).toBeNull()
    })

    it('deve retornar o valor setado', () => {
      const result = cacheService.set(
        'key1',
        'meu-valor',
        TTL.SHORT
      )

      expect(result).toBe('meu-valor')
    })
  })

  describe('delete', () => {
    it('deve deletar chave existente', () => {
      cacheService.set('key1', 'valor', TTL.SHORT)

      cacheService.delete('key1')

      expect(cacheService.get('key1')).toBeNull()
    })

    it('deve retornar false para chave inexistente', () => {
      const result = cacheService.delete('nao-existe')

      expect(result).toBe(false)
    })
  })

  describe('invalidateUser', () => {
    it('deve invalidar todas as chaves do usuario', () => {
      cacheService.set(
        'dashboard:resumo:u1:mes:7',
        'v1',
        TTL.SHORT
      )

      cacheService.set(
        'rendas:lista:u1:mes:7',
        'v2',
        TTL.SHORT
      )

      cacheService.set(
        'dashboard:resumo:u2:mes:7',
        'v3',
        TTL.SHORT
      )

      cacheService.invalidateUser('u1')

      expect(
        cacheService.get('dashboard:resumo:u1:mes:7')
      ).toBeNull()

      expect(
        cacheService.get('rendas:lista:u1:mes:7')
      ).toBeNull()

      expect(
        cacheService.get('dashboard:resumo:u2:mes:7')
      ).toBe('v3')
    })
  })

  describe('invalidatePrefix', () => {
    it('deve invalidar todas as chaves com o prefix', () => {
      cacheService.set(
        'dashboard:resumo:u1:',
        'v1',
        TTL.SHORT
      )

      cacheService.set(
        'dashboard:relatorio:u1:',
        'v2',
        TTL.SHORT
      )

      cacheService.set(
        'rendas:lista:u1:',
        'v3',
        TTL.SHORT
      )

      cacheService.invalidatePrefix('dashboard')

      expect(
        cacheService.get('dashboard:resumo:u1:')
      ).toBeNull()

      expect(
        cacheService.get('dashboard:relatorio:u1:')
      ).toBeNull()

      expect(
        cacheService.get('rendas:lista:u1:')
      ).toBe('v3')
    })

    it('deve invalidar apenas chaves do usuario quando userId informado', () => {
      cacheService.set(
        'dashboard:resumo:u1:',
        'v1',
        TTL.SHORT
      )

      cacheService.set(
        'dashboard:resumo:u2:',
        'v2',
        TTL.SHORT
      )

      cacheService.invalidatePrefix('dashboard', 'u1')

      expect(
        cacheService.get('dashboard:resumo:u1:')
      ).toBeNull()

      expect(
        cacheService.get('dashboard:resumo:u2:')
      ).toBe('v2')
    })
  })

  describe('clear', () => {
    it('deve limpar todo o cache', () => {
      cacheService.set('k1', 'v1', TTL.SHORT)
      cacheService.set('k2', 'v2', TTL.SHORT)

      cacheService.clear()

      expect(cacheService.get('k1')).toBeNull()
      expect(cacheService.get('k2')).toBeNull()
    })
  })

  describe('getOrSet', () => {
    it('deve executar fn e cachear resultado quando chave nao existe', async () => {
      const fn = jest.fn().mockResolvedValue('resultado')

      const result = await cacheService.getOrSet(
        'key1',
        fn,
        TTL.SHORT
      )

      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toBe('resultado')
      expect(cacheService.get('key1')).toBe('resultado')
    })

    it('deve retornar valor cacheado sem chamar fn', async () => {
      cacheService.set(
        'key1',
        'valor-cacheado',
        TTL.SHORT
      )

      const fn = jest.fn().mockResolvedValue('novo-valor')

      const result = await cacheService.getOrSet(
        'key1',
        fn,
        TTL.SHORT
      )

      expect(fn).not.toHaveBeenCalled()
      expect(result).toBe('valor-cacheado')
    })
  })

  describe('stats', () => {
    it('deve retornar estatisticas corretas do cache', () => {
      cacheService.set('k1', 'v1', TTL.SHORT)
      cacheService.set('k2', 'v2', TTL.SHORT)
      cacheService.set('k3', 'v3', -1000)

      const stats = cacheService.stats()

      expect(stats.total).toBe(3)
      expect(stats.valid).toBe(2)
      expect(stats.expired).toBe(1)
    })
  })

  describe('cleanup', () => {
    it('deve remover entradas expiradas', () => {
      cacheService.set('valida', 'v1', TTL.SHORT)
      cacheService.set('expirada', 'v2', -1000)

      cacheService.cleanup()

      expect(cacheService.get('valida')).toBe('v1')
      expect(cacheService.get('expirada')).toBeNull()
    })
  })

  describe('TTL e CACHE_KEYS', () => {
    it('deve exportar TTL com valores corretos', () => {
      expect(TTL.SHORT).toBe(2 * 60 * 1000)
      expect(TTL.MEDIUM).toBe(10 * 60 * 1000)
      expect(TTL.LONG).toBe(30 * 60 * 1000)
      expect(TTL.HOUR).toBe(60 * 60 * 1000)
    })

    it('deve exportar CACHE_KEYS com prefixos corretos', () => {
      expect(CACHE_KEYS.DASHBOARD_RESUMO).toBe(
        'dashboard:resumo'
      )

      expect(CACHE_KEYS.RENDAS_LISTA).toBe(
        'rendas:lista'
      )

      expect(CACHE_KEYS.DESPESAS_LISTA).toBe(
        'despesas:lista'
      )
    })
  })
})
