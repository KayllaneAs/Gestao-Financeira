import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Despesa = sequelize.define('Despesa', {
    Id_Despesa: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id_despesa'
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
    Id_Conta: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_conta',
      references: {
        model: 'conta_cartao',
        key: 'id_conta'
      }
    },
    Id_Parcelamento: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'id_parcelamento',
      references: {
        model: 'parcelamento_agrupador',
        key: 'id_parcelamento'
      }
    },
    Descricao_Despesa: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'descricao_despesa'
    },
    Valor_Parcela: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'valor_parcela',
      validate: {
        min: 0
      }
    },
    Data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'data'
    },
    Categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'categoria'
    },
    Numero_Parcela: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'numero_parcela',
      validate: {
        min: 1
      }
    }
  }, {
    tableName: 'despesa',
    timestamps: false,
    underscored: true,
    indexes: [
      // Performance indexes for common queries
      { name: 'idx_despesa_usuario_data', fields: ['id_usuario', 'data'] },
      { name: 'idx_despesa_usuario_categoria', fields: ['id_usuario', 'categoria'] },
      { name: 'idx_despesa_conta_data', fields: ['id_conta', 'data'] },
      { name: 'idx_despesa_parcelamento', fields: ['id_parcelamento'] }
    ]
  })

  Despesa.associate = (models) => {
    Despesa.belongsTo(models.Usuario, {
      foreignKey: 'Id_Usuario',
      as: 'usuario',
      onDelete: 'CASCADE'
    })
    Despesa.belongsTo(models.ContaCartao, {
      foreignKey: 'Id_Conta',
      as: 'conta'
    })
    Despesa.belongsTo(models.ParcelamentoAgrupador, {
      foreignKey: 'Id_Parcelamento',
      as: 'parcelamento',
      onDelete: 'CASCADE'
    })
  }

  return Despesa
}
