import { Sequelize } from 'sequelize'
import env from './env.js'
import pg from 'pg'

const sequelize = new Sequelize(env.db.url, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: (...msg) => console.log('[sequelize]', ...msg),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
})

sequelize
  .authenticate()
  .then(() => console.log('Sequelize: conexão autenticada com sucesso'))
  .catch((err) => console.error('Sequelize erro de autenticação:', err))

export default sequelize
