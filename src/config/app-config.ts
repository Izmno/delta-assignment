import dotenv from 'dotenv';

export default class AppConfig {
  public dbHost: string;
  public dbPort: number;
  public dbUser: string;
  public dbPassword: string;
  public dbName: string;
  public port: number;
  public refreshInterval: number;

  constructor() {
    dotenv.config();

    this.dbHost = process.env.DB_HOST || 'localhost';
    this.dbPort = parseInt(process.env.DB_PORT || '3306');
    this.dbUser = process.env.DB_USER || 'root';
    this.dbPassword = process.env.DB_PASSWORD || 'password';
    this.dbName = process.env.DB_NAME || 'search_db';
    this.port = parseInt(process.env.PORT || '3000');
    this.refreshInterval = parseInt(process.env.REFRESH_INTERVAL || '10000');
  }
}

export const appConfig = new AppConfig();
