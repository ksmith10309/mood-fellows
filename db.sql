DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    date VARCHAR(255),
    score FLOAT,
    magnitude FLOAT,
    avatar VARCHAR(255),
    content TEXT
);

INSERT INTO posts (date, score, magnitude, avatar, content) VALUES
('June 11, 1991', 1, 1, 'https://api.adorable.io/avatars/285/hi.png', 'Hello World!');