import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const ContaCartao = sequelize.define('ContaCartao', {
    Id_Conta: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id_conta'
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
    Nome_Conta: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'nome_conta'
    },
    Tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'tipo',
      validate: {
        isIn: [['Corrente', 'Crédito', 'Dinheiro']]
      }
    },
    Titular: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'titular'
    },
    Ultimos_Digitos: {
      type: DataTypes.CHAR(4),
      allowNull: true,
      field: 'ultimos_digitos'
    },
    Cor_Hex: {
      type: DataTypes.CHAR(7),
      allowNull: false,
      field: 'cor_hex',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    }
  }, {
    tableName: 'conta_cartao',
    timestamps: false,
    underscored: true,
    indexes: [
      // Performance index for common queries
      { name: 'idx_conta_usuario', fields: ['id_usuario'] }
    ]
  })

  ContaCartao.associate = (models) => {
    ContaCartao.belongsTo(models.Usuario, {
      foreignKey: 'Id_Usuario',
      as: 'usuario',
      onDelete: 'CASCADE'
    })
    if (models.Despesa) {
      ContaCartao.hasMany(models.Despesa, {
        foreignKey: 'Id_Conta',
        as: 'despesas'
      })
    }
  }

  return ContaCartao
}
