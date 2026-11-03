-- ==========================================================
-- SOUNDBOXD - BASE DE DADES RELACIONAL (PostgreSQL / MySQL)
-- Memòria d'anàlisi, disseny i planificació
-- Autor: Adrià Gallardo
-- Fitxer ubicat a docs/bd/schema.sql
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
    album_id VARCHAR(100),
    rating DECIMAL(3,2), -- Valor de 0.25 a 5.00 per a les ressenyes d'àlbum o cançó
    review_type VARCHAR(10) NOT NULL DEFAULT 'album',
    track_id VARCHAR(100),
    track_title VARCHAR(150),
    track_artist VARCHAR(150),
    track_album VARCHAR(150),
    track_cover_url VARCHAR(500),
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