import sequelize from '../config/database.js'
import defineUsuario from './usuario.js'
import defineContaCartao from './ContaCartao.js'

const Usuario = defineUsuario(sequelize)
const ContaCartao = defineContaCartao(sequelize)

const db = { sequelize, Usuario, ContaCartao }

Object.values(db).forEach((model) => {
  if (model?.associate) model.associate(db)
})

export default db
export { sequelize, Usuario, ContaCartao }
