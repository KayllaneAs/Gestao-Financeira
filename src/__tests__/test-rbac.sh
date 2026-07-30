#!/bin/bash
# Teste automatizado de RBAC - rota /api/admin/usuarios
# Valida que requisicoes sem token ou sem cargo admin sao bloqueadas
#
# Como usar:
#   1. Exporte um usuario comum de teste (ou adicione no .env.local):
#        export TEST_USER_EMAIL="seu-email-comum@exemplo.com"
#        export TEST_USER_SENHA="sua-senha"
#   2. Garanta que o servidor esta rodando (npm run dev)
#   3. Rode: ./tests/test-rbac.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0
FAIL=0

if [ -z "$TEST_USER_EMAIL" ] || [ -z "$TEST_USER_SENHA" ]; then
  echo "Erro: defina TEST_USER_EMAIL e TEST_USER_SENHA antes de rodar."
  echo "Exemplo: TEST_USER_EMAIL=usuario@teste.com TEST_USER_SENHA=123456 ./tests/test-rbac.sh"
  exit 1
fi

echo "=== Teste RBAC: /api/admin/usuarios ==="

# Teste 1: sem token deve retornar 401
echo -n "[1] Sem token (esperado 401): "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/usuarios")
if [ "$STATUS" = "401" ]; then
  echo "PASSOU ($STATUS)"
  PASS=$((PASS+1))
else
  echo "FALHOU (recebido $STATUS, esperado 401)"
  FAIL=$((FAIL+1))
fi

# Teste 2: login como usuario comum (definido via variavel de ambiente)
echo -n "[2] Login usuario comum: "
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/usuarios/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_USER_EMAIL\",\"senha\":\"$TEST_USER_SENHA\"}")
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "FALHOU (nao foi possivel obter token - verifique TEST_USER_EMAIL/TEST_USER_SENHA)"
  FAIL=$((FAIL+1))
else
  echo "OK (token obtido)"

  # Teste 3: com token de usuario comum deve retornar 403
  echo -n "[3] Token usuario comum (esperado 403): "
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/usuarios" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$STATUS" = "403" ]; then
    echo "PASSOU ($STATUS)"
    PASS=$((PASS+1))
  else
    echo "FALHOU (recebido $STATUS, esperado 403)"
    FAIL=$((FAIL+1))
  fi
fi

echo ""
echo "=== Resultado: $PASS passaram, $FAIL falharam ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
