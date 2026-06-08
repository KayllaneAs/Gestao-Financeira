import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    Id_Usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id_usuario'
    },
    Nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nome'
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'email',
      validate: { isEmail: true }
    },
    Senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'senha'
    },
    Cargo: {
      type: DataTypes.ENUM('usuario', 'admin'),
      allowNull: false,
      defaultValue: 'usuario',
      field: 'cargo'
    },
    Codigo_Verificacao: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: 'codigo_verificacao'
    },
    Codigo_Expiracao: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'codigo_expiracao'
    },
    Email_Verificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_verificado'
    },
    Data_Criacao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'data_criacao'
    }
  }, {
    tableName: 'usuario',
    timestamps: false
  })

  // Associations serão adicionadas nas próximas sprints
  Usuario.associate = (models) => {}

  return Usuario
}
