-- ==========================================================
-- SOUNDBOXD - BASE DE DADES RELACIONAL (SQLite)
-- Memòria d'anàlisi, disseny i planificació
-- Autor: Adrià Gallardo
-- ==========================================================

PRAGMA foreign_keys = ON;

-- 1. Taula d'Usuaris (USERS)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Taula d'Àlbums (ALBUMS - Memòria cau de metadades de Spotify)
CREATE TABLE IF NOT EXISTS albums (
    id TEXT PRIMARY KEY, -- ID propi de Spotify (ex: '285O1L3A8A2g5L2p3d1')
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    cover_url TEXT,
    release_year INTEGER
);

-- 3. Taula de Ressenyes i Valoracions (REVIEWS)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    album_id TEXT NOT NULL,
    rating REAL NOT NULL, -- Valor d'1.0 a 5.0
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- 4. Taula de Llistes Temàtiques / Col·leccions (PLAYLISTS)
CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 1, -- 1 per TRUE, 0 per FALSE
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Taula intermèdia Playlist - Àlbums (PLAYLIST_ALBUMS - Relació N:M)
CREATE TABLE IF NOT EXISTS playlist_albums (
    playlist_id INTEGER NOT NULL,
    album_id TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, album_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- 6. Taula "Escoltar més tard" (LISTENLIST - Relació N:M)
CREATE TABLE IF NOT EXISTS listenlist (
    user_id INTEGER NOT NULL,
    album_id TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, album_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Dades inicials d'exemple (Seed Data)
INSERT OR IGNORE INTO users (id, username, email, password_hash, role) VALUES
(1, 'meloman_cat', 'meloman@soundbox.cat', '$2b$10$w...demo_hash', 'user'),
(2, 'adria_admin', 'admin@soundbox.cat', '$2b$10$w...admin_hash', 'admin'),
(3, 'clara_valls', 'clara@soundbox.cat', '$2b$10$w...clara_hash', 'user');

INSERT OR IGNORE INTO albums (id, title, artist, cover_url, release_year) VALUES
('4aawyAB9vmq31L23', 'Abbey Road', 'The Beatles', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 1969),
('285O1L3A8A2g5L2p3d1', 'Thriller', 'Michael Jackson', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80', 1982),
('7i2DJ8oZ0vH3Y8G1sM2h3v', 'The Dark Side of the Moon', 'Pink Floyd', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', 1973),
('1ptj8O06Vv1e3Wq17Zz17K', 'MOTOMAMI', 'Rosalía', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 2022),
('6kVUvzRmBG2KiFHU987641', 'OK Computer', 'Radiohead', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80', 1997),
('4m2880jivSbbyEGAKfITCa', 'Random Access Memories', 'Daft Punk', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', 2013);

INSERT OR IGNORE INTO reviews (id, user_id, album_id, rating, review_text) VALUES
(1, 1, '4aawyAB9vmq31L23', 5.0, 'Una de les obres mestres absolutes de la història de la música contemporània. La cara B és sublim.'),
(2, 1, '285O1L3A8A2g5L2p3d1', 4.5, 'Producció impecable de Quincy Jones. Cançons com Billie Jean o Beat It van canviar la indústria del pop per sempre.'),
(3, 2, '7i2DJ8oZ0vH3Y8G1sM2h3v', 5.0, 'El so envoltant i els temes filosòfics el converteixen en un disc imprescindible.'),
(4, 3, '1ptj8O06Vv1e3Wq17Zz17K', 4.5, 'Trencador, polèmic i vibrant. Rosalía mescla arrels flamenques amb sons urbans.');

INSERT OR IGNORE INTO playlists (id, user_id, title, description, is_public) VALUES
(1, 1, 'Millors discos essencials', 'Una selecció d àlbums fonamentals que tothom hauria d escoltar.', 1),
(2, 3, 'Sons per a viatjar de nit', 'Discos d atmosferes nocturnes i calma.', 1);

INSERT OR IGNORE INTO playlist_albums (playlist_id, album_id) VALUES
(1, '4aawyAB9vmq31L23'),
(1, '7i2DJ8oZ0vH3Y8G1sM2h3v'),
(1, '6kVUvzRmBG2KiFHU987641'),
(2, '4m2880jivSbbyEGAKfITCa'),
(2, '1ptj8O06Vv1e3Wq17Zz17K');

INSERT OR IGNORE INTO listenlist (user_id, album_id) VALUES
(1, '7i2DJ8oZ0vH3Y8G1sM2h3v'),
(1, '4m2880jivSbbyEGAKfITCa');
