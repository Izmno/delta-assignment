import { Sequelize } from 'sequelize';
import { appConfig } from './app-config';

export const sequelize = new Sequelize(
  appConfig.dbName,
  appConfig.dbUser,
  appConfig.dbPassword,
  {
    host: appConfig.dbHost,
    port: appConfig.dbPort,
    dialect: 'mysql',
    logging: false,
  },
);
