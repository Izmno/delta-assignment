import express, { Router } from 'express';
import SearchController from './controllers/search-controller.js';
import TrendsController from './controllers/trends-controller.js';
import TrendsRefreshService from './services/trends-refresh-service.js';
import { appConfig } from './config/app-config.js';
import Logger from './middleware/log.js';

const rs = new TrendsRefreshService();
setInterval(rs.refreshTrends, appConfig.refreshInterval);

const sc = new SearchController();
const tc = new TrendsController();

const rtr = Router();
rtr.post('/search', sc.logSearch);
rtr.get('/search', sc.getRecentSearches);
rtr.get('/trends', tc.getTrendingSearches);

const app = express();
app.use(express.json());
app.use(new Logger().handle);
app.use(rtr);

app.listen(appConfig.port, () => {
  console.log(`Server running on port ${appConfig.port}`);
});
