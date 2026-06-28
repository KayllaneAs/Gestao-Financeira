export function validarSenha(senha) {
  const regras = {
    comprimento: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  }

  regras.valida = Object.values(regras).every(Boolean)

  return regras
}