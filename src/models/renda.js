import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Renda = sequelize.define('Renda', {
    Id_Renda: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id_renda'
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
    Descricao_Renda: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'descricao_renda'
    },
    Valor_Renda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'valor_renda',
      validate: {
        min: 0
      }
    },
    Data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'data'
    },
    Fixa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'fixa'
    },
    Dia_Vencimento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'dia_vencimento'
    }
  }, {
    tableName: 'renda',
    timestamps: false,
    underscored: true,
    indexes: [
      // Performance indexes for common queries
      { name: 'idx_renda_usuario_data', fields: ['id_usuario', 'data'] },
      { name: 'idx_renda_usuario_fixa', fields: ['id_usuario', 'fixa'] }
    ]
  })

  Renda.associate = (models) => {
    Renda.belongsTo(models.Usuario, {
      foreignKey: 'Id_Usuario',
      as: 'usuario',
      onDelete: 'CASCADE'
    })
  }

  return Renda
}
