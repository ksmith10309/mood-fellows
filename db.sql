DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    date VARCHAR(255),
    score FLOAT,
    magnitude FLOAT,
    avatar VARCHAR(255),
    content TEXT,
    password VARCHAR(255)
);

INSERT INTO posts (date, score, magnitude, avatar, content, password) VALUES
('June 11, 1991', 1, 1, 'neutral', 'Hello World!', '12345678');