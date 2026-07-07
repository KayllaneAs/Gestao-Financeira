import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const ParcelamentoAgrupador = sequelize.define('ParcelamentoAgrupador', {
    Id_Parcelamento: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id_parcelamento'
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
    Descricao_Parcela: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'descricao_parcela'
    },
    Valor_Total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'valor_total',
      validate: {
        min: 0
      }
    },
    Qtd_Parcelas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'qtd_parcelas',
      validate: {
        min: 1
      }
    },
    Data_Inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'data_inicio'
    }
  }, {
    tableName: 'parcelamento_agrupador',
    timestamps: false,
    underscored: true
  })

  ParcelamentoAgrupador.associate = (models) => {
    ParcelamentoAgrupador.belongsTo(models.Usuario, {
      foreignKey: 'Id_Usuario',
      as: 'usuario',
      onDelete: 'CASCADE'
    })
    ParcelamentoAgrupador.hasMany(models.Despesa, {
      foreignKey: 'Id_Parcelamento',
      as: 'despesas',
      onDelete: 'CASCADE'
    })
  }

  return ParcelamentoAgrupador
}
