import sequelize from '../config/database.js'
import defineUsuario from './usuario.js'

const Usuario = defineUsuario(sequelize)

const db = { sequelize, Usuario }

Object.values(db).forEach((model) => {
  if (model?.associate) model.associate(db)
})

export default db
export { sequelize, Usuario }
