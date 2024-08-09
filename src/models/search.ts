import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export default class Search extends Model {
  declare public userId: number;
  declare public assetId: number;
  declare public lastSearched: Date;
}

Search.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'user_id',
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'asset_id',
    },
    lastSearched: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(),
      field: 'last_searched',
    },
  },
  {
    sequelize,
    tableName: 'user_searches',
    timestamps: false,
  },
);
