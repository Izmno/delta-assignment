import { Request, Response } from 'express';
import Search from '../models/search';

export default class SearchController {
  async logSearch(req: Request, res: Response) {
    const { user, asset } = req.body;
    if (!user || !asset) {
      return res.status(400).send("User and asset are required");
    }

    try {
      await Search.upsert({
        userId: user,
        assetId: asset,
        lastSearched: new Date(),
      });
    } catch (error) {
      console.log("Error executing search: ", error);

      res.status(500).send("Error executing search");
    }

    res.status(201).send();
  }

  async getRecentSearches(req: Request, res: Response) {
    const { user } = req.query;
    if (!user) {
      return res.status(400).send("User is required");
    }

    try {
      const searches = await Search.findAll({
        where: {
          userId: user,
        },
        order: [['lastSearched', 'DESC']],
        limit: 100,
      });

      res.json(searches.map((search) => search.assetId));
    } catch (error) {
      res.status(500).send("Error fetching user searches");
    }
  }
}
