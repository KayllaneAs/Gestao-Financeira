import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Reserva = sequelize.define('Reserva', {
    Id_Reserva: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id_reserva'
    },
    Id_Usuario: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_usuario',
      references: {
        model: 'usuario',
        key: 'id_usuario'
      }
    },
    Nome_Objetivo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nome_objetivo'
    },
    Valor_Alvo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'valor_alvo',
      validate: {
        min: 0
      }
    },
    Valor_Atual: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'valor_atual',
      validate: {
        min: 0
      }
    },
    Data_Limite: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'data_limite'
    }
  }, {
    tableName: 'reserva',
    timestamps: false,
    underscored: true
  })

  Reserva.associate = (models) => {
    Reserva.belongsTo(models.Usuario, {
      foreignKey: 'Id_Usuario',
      as: 'usuario',
      onDelete: 'CASCADE'
    })
  }

  return Reserva
}
