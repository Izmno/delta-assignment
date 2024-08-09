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
