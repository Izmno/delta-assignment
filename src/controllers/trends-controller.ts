import { Request, Response } from 'express';
import Trend from '../models/trend';

export default class TrendsController {
  async getTrendingSearches(_req: Request, res: Response) {
    try {
      const trends = await Trend.findAll({
        order: [['count', 'DESC']],
        limit: 100,
      });

      res.json(trends.map((trend) => trend.assetId));
    } catch (error) {
      res.status(500).send("Error fetching user searches");
    }
  }
}
