import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export default class Trend extends Model {
  declare public assetId: number;
  declare public count: number;
  declare public lastSearched: Date;
}

Trend.init(
  {
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'asset_id',
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'search_count',
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
    tableName: 'asset_trends',
    timestamps: false,
  },
);
