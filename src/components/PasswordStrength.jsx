'use client'

export default function PasswordStrength({ senha }) {
  const criterios = {
    comprimento: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  }

  const total = Object.values(criterios).filter(Boolean).length

  let nivel = 'Fraca'
  let cor = '#ef4444'
  let largura = '20%'

  if (total >= 3) {
    nivel = 'Média'
    cor = '#f59e0b'
    largura = '60%'
  }

  if (total === 5) {
    nivel = 'Forte'
    cor = '#22c55e'
    largura = '100%'
  }

  const Item = ({ ok, texto }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '.85rem',
        color: ok ? '#22c55e' : 'var(--color-text-muted)',
        marginBottom: 4,
      }}
    >
      <span
        style={{
          width: 18,
          textAlign: 'center',
          fontWeight: 700,
        }}
      >
        {ok ? '✓' : '✗'}
      </span>

      <span>{texto}</span>
    </div>
  )

  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <strong style={{ fontSize: '.9rem' }}>
          Força da senha
        </strong>

        <span
          style={{
            color: cor,
            fontWeight: 700,
            fontSize: '.9rem',
          }}
        >
          {nivel}
        </span>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: '#e5e7eb',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: largura,
            height: '100%',
            background: cor,
            transition: '.3s',
          }}
        />
      </div>

      <Item
        ok={criterios.comprimento}
        texto="Mínimo de 8 caracteres"
      />

      <Item
        ok={criterios.maiuscula}
        texto="Pelo menos 1 letra maiúscula"
      />

      <Item
        ok={criterios.minuscula}
        texto="Pelo menos 1 letra minúscula"
      />

      <Item
        ok={criterios.numero}
        texto="Pelo menos 1 número"
      />

      <Item
        ok={criterios.especial}
        texto="Pelo menos 1 caractere especial"
      />
    </div>
  )
}