import { sequelize } from '../config/database';

export default class TrendsRefreshService {
  async refreshTrends() {
    const t0 = new Date();

    try {
      await sequelize.query(
        `
          INSERT INTO asset_trends (asset_id, search_count, last_searched)
          SELECT
            asset_id,
            COUNT(user_id) as search_count,
            MAX(last_searched) as last_searched
          FROM user_searches
          WHERE last_searched >= NOW() - INTERVAL 24 HOUR
          GROUP BY asset_id
          ORDER BY search_count DESC
          LIMIT 100
          ON DUPLICATE KEY UPDATE
            search_count = VALUES(search_count),
            last_searched = VALUES(last_searched);
          `
      );

      await sequelize.query(
        `
          DELETE asset_trends
          FROM asset_trends
          WHERE last_searched < NOW() - INTERVAL 24 HOUR;
          `
      );


    } catch (error) {
      console.error("Error refreshing trends: ", error);
    }

    const t1 = new Date();
    console.log("Trends refreshed in ", t1.getTime() - t0.getTime(), "ms");
  }
}
