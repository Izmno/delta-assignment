# Database design 

Three data models are considered for this project. MySQL DDL and queries are
used to illustrate the models. 

The third and preferred model prioritizes response time over data accuracy: 
search trends are refreshed in a background process and do not always reflect 
the exact search count at a given instance. However, in most use cases, such 
a tradeoff is acceptable. The model will scale until the number of active users
times the number of assets is so large that they cannot be iterated over in 
a reasonable amount of time to refresh the search trends. 

## Model I: Complete data

The initial base model to consider stores as much data as possible: every 
search of every user is inserted in the database. While this can lead to 
considerable challenges when querying this data, the strategy is worth at least 
some consideration as it provides a lot of flexibility with regards to new
features. 

```sql
CREATE TABLE user_searches (
    search_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id_timestamp (user_id, timestamp),
    INDEX idx_timestamp (timestamp)
);
```

The first query shows a first downside with this strategy. While a good index
on user_id and timestamp can be used, the entire search history of a user must
be looped until 100 different assets are found. 

It is easy to imagine users performing millions of searches (perhaps because of 
a bug in the app) to only 95 unique assets. The query below would fail quickly. 

```sql
-- Search history of single user
SELECT DISTINCT asset_id
FROM user_searches
WHERE user_id = ?
ORDER BY timestamp DESC
LIMIT 100;
```

The second query is more difficult as no great index can be found. All searches
in the last 24 hours need to be evaluated to find a result: this method will 
not scale. 

```sql
-- Trending asset IDs
SELECT 
    asset_id, 
    COUNT(DISTINCT user_id) AS search_count
FROM user_searches
WHERE timestamp >= NOW() - INTERVAL 24 HOUR
GROUP BY asset_id
ORDER BY search_count DESC
LIMIT 100;
```

## Model II: Grouped data

The first improvement to consider is to only store the last time a user 
searched for an asset. This has the potential of reducing the dataset with 
several orders of magnitude. 

```sql
CREATE TABLE user_searches (
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, asset_id)
    INDEX idx_user_id_last_searched (user_id, last_searched),
    INDEX idx_last_searched (last_searched)
);
```

With proper indexing, returning the search history of a user is siplified to 
iterating an index. 

```sql
-- Search history of single user
SELECT asset_id
FROM user_searches
WHERE user_id = ?
ORDER BY last_searched DESC
LIMIT 100;
```

Querying search trends -- although improved a lot by the reduced dataset -- is 
still problematic. All data of the past 24 hours still needs to be looped. 

```sql
-- Trending asset IDs
SELECT 
    asset_id, 
    COUNT(user_id) AS search_count
FROM user_searches
WHERE last_searched >= NOW() - INTERVAL 24 HOUR
GROUP BY asset_id
ORDER BY search_count DESC
LIMIT 100;
```

## Model III: Separate trends table

To more efficiently query the trends, a separate table with trend data needs
to be introduced. The most basic strategy for storing trend data, is to simply 
store the exact data that the user will need. 

Though not strictly necessary, the last_searched timestamp is added to 
the asset trends table to simplify the refresh queries. 

```sql
CREATE TABLE user_searches (
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, asset_id),
    INDEX idx_user_id_last_searched (user_id, last_searched),
    INDEX idx_last_searched (last_searched)
);

CREATE TABLE asset_trends (
    asset_id INT PRIMARY KEY,
    search_count INT DEFAULT 0,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_search_count (search_count)
);
```

Both queries are now reduced to simple index iterations

```sql
-- Search history of single user
SELECT asset_id
FROM user_searches
WHERE user_id = ?
ORDER BY last_searched DESC
LIMIT 100;
```

```sql
-- Trending asset IDs
SELECT asset_id
FROM asset_trends
ORDER BY search_count DESC
LIMIT 100;
```

Several strategies can be developed to keep the trending assets up to date. The
most simple recreates the entire asset_trends table in the background in scheduled
intervals. 

```sql
-- Update counts of asset searches in the last 24 hours
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

-- Delete assets that have not been searched in the last 24 hours
DELETE asset_trends
FROM asset_trends
WHERE last_searched < NOW() - INTERVAL 24 HOUR;
```

