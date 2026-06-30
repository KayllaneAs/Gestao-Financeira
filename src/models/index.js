import sequelize from '../config/database.js'
import defineUsuario from './usuario.js'
import defineContaCartao from './ContaCartao.js'
import defineRenda from './renda.js'
import defineParcelamentoAgrupador from './ParcelamentoAgrupador.js'
import defineDespesa from './Despesa.js'

const Usuario = defineUsuario(sequelize)
const ContaCartao = defineContaCartao(sequelize)
const Renda = defineRenda(sequelize)
const ParcelamentoAgrupador = defineParcelamentoAgrupador(sequelize)
const Despesa = defineDespesa(sequelize)

const db = { sequelize, Usuario, ContaCartao, Renda, ParcelamentoAgrupador, Despesa }

Object.values(db).forEach((model) => {
  if (model?.associate) model.associate(db)
})

export default db
export { sequelize, Usuario, ContaCartao, Renda, ParcelamentoAgrupador, Despesa }