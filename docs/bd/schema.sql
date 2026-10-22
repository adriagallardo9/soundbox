-- ==========================================================
-- SOUNDBOXD - BASE DE DADES RELACIONAL (PostgreSQL / MySQL)
-- Memòria d'anàlisi, disseny i planificació
-- Autor: Adrià Gallardo
-- ==========================================================

-- 1. Taula d'Usuaris (USERS)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin', 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Taula d'Àlbums (ALBUMS - Memòria cau de metadades de Spotify)
CREATE TABLE IF NOT EXISTS albums (
    id VARCHAR(100) PRIMARY KEY, -- ID propi de Spotify (ex: '285O1L3A8A2g5L2p3d1')
    title VARCHAR(150) NOT NULL,
    artist VARCHAR(100) NOT NULL,
    cover_url VARCHAR(255),
    release_year INT
);

-- 3. Taula de Ressenyes i Valoracions (REVIEWS)
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    album_id VARCHAR(100) NOT NULL,
    rating DECIMAL(2,1) NOT NULL, -- Valor d'1.0 a 5.0
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- 4. Taula de Llistes Temàtiques / Col·leccions (PLAYLISTS)
CREATE TABLE IF NOT EXISTS playlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Taula intermèdia Playlist - Àlbums (PLAYLIST_ALBUMS - Relació N:M)
CREATE TABLE IF NOT EXISTS playlist_albums (
    playlist_id BIGINT NOT NULL,
    album_id VARCHAR(100) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, album_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- 6. Taula "Escoltar més tard" (LISTENLIST - Relació N:M)
CREATE TABLE IF NOT EXISTS listenlist (
    user_id BIGINT NOT NULL,
    album_id VARCHAR(100) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, album_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Insercions d'exemple inicials (Seed Data)
INSERT INTO users (id, username, email, password_hash, role) VALUES
(1, 'meloman_cat', 'meloman@soundbox.cat', '$2b$10$w...demo_hash', 'user'),
(2, 'adria_admin', 'admin@soundbox.cat', '$2b$10$w...admin_hash', 'admin');

INSERT INTO albums (id, title, artist, cover_url, release_year) VALUES
('4aawyAB9vmq31L23', 'Abbey Road', 'The Beatles', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 1969),
('285O1L3A8A2g5L2p3d1', 'Thriller', 'Michael Jackson', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80', 1982),
('7i2DJ8oZ0vH3Y8G1sM2h3v', 'The Dark Side of the Moon', 'Pink Floyd', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', 1973),
('1ptj8O06Vv1e3Wq17Zz17K', 'MOTOMAMI', 'Rosalía', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 2022);

INSERT INTO reviews (user_id, album_id, rating, review_text) VALUES
(1, '4aawyAB9vmq31L23', 5.0, 'Una de les obres mestres absolutes de la història de la música contemporània. La cara B és sublim.'),
(1, '285O1L3A8A2g5L2p3d1', 4.5, 'Producció impecable de Quincy Jones. Cançons que van canviar la indústria del pop.');

INSERT INTO listenlist (user_id, album_id) VALUES
(1, '7i2DJ8oZ0vH3Y8G1sM2h3v');
