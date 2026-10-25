-- ==========================================================
-- SOUNDBOXD - BASE DE DADES RELACIONAL (SQLite)
-- Memòria d'anàlisi, disseny i planificació
-- Autor: Adrià Gallardo
-- Dades fictícies enriquides (Mock Data)
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
    id TEXT PRIMARY KEY, -- ID propi de Spotify (ex: '4aawyAB9vmq31L23')
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

-- ==========================================================
-- DADES FICTÍCIES INICIALS (SEED DATA)
-- ==========================================================

-- Usuaris (12 perfils de diferents gustos i rols)
INSERT OR IGNORE INTO users (id, username, email, password_hash, role, created_at) VALUES
(1, 'meloman_cat', 'meloman@soundbox.cat', '$2b$10$w...demo_hash', 'user', '2026-01-10 10:00:00'),
(2, 'adria_admin', 'admin@soundbox.cat', '$2b$10$w...admin_hash', 'admin', '2026-01-01 08:00:00'),
(3, 'clara_valls', 'clara@soundbox.cat', '$2b$10$w...clara_hash', 'user', '2026-01-15 14:30:00'),
(4, 'pau_rocker', 'pau@soundbox.cat', '$2b$10$w...pau_hash', 'user', '2026-01-20 18:15:00'),
(5, 'laura_indie', 'laura@soundbox.cat', '$2b$10$w...laura_hash', 'user', '2026-01-25 11:20:00'),
(6, 'marc_electronic', 'marc@soundbox.cat', '$2b$10$w...marc_hash', 'user', '2026-02-01 16:45:00'),
(7, 'nuria_hiphop', 'nuria@soundbox.cat', '$2b$10$w...nuria_hash', 'user', '2026-02-05 09:10:00'),
(8, 'joan_jazz', 'joan@soundbox.cat', '$2b$10$w...joan_hash', 'user', '2026-02-10 20:00:00'),
(9, 'berta_pop', 'berta@soundbox.cat', '$2b$10$w...berta_hash', 'user', '2026-02-14 12:30:00'),
(10, 'oriol_catfolk', 'oriol@soundbox.cat', '$2b$10$w...oriol_hash', 'user', '2026-02-18 19:40:00'),
(11, 'pol_metal', 'pol@soundbox.cat', '$2b$10$w...pol_hash', 'user', '2026-02-22 17:05:00'),
(12, 'mireia_ambient', 'mireia@soundbox.cat', '$2b$10$w...mireia_hash', 'user', '2026-03-01 13:25:00');

-- Àlbums (24 discos emblemàtics internacionals i catalans)
INSERT OR IGNORE INTO albums (id, title, artist, cover_url, release_year) VALUES
('4aawyAB9vmq31L23', 'Abbey Road', 'The Beatles', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 1969),
('285O1L3A8A2g5L2p3d1', 'Thriller', 'Michael Jackson', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80', 1982),
('7i2DJ8oZ0vH3Y8G1sM2h3v', 'The Dark Side of the Moon', 'Pink Floyd', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', 1973),
('1ptj8O06Vv1e3Wq17Zz17K', 'MOTOMAMI', 'Rosalía', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 2022),
('6kVUvzRmBG2KiFHU987641', 'OK Computer', 'Radiohead', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80', 1997),
('4m2880jivSbbyEGAKfITCa', 'Random Access Memories', 'Daft Punk', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80', 2013),
('7ycBtnsM2kIeBfWc5qN4c7', 'To Pimp a Butterfly', 'Kendrick Lamar', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', 2015),
('0vE6mttURJF7VHM1gDMoT9', 'Rumours', 'Fleetwood Mac', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80', 1977),
('5v9G61N6yv7P8X894178aB', 'El Mal Querer', 'Rosalía', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80', 2018),
('3RQQmkQEvNCY4prGKE6oc5', 'Currents', 'Tame Impala', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80', 2015),
('6deiaCdMT8geN0Y6ue7gtU', 'AM', 'Arctic Monkeys', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80', 2013),
('2guirTSE4XLCLIMdsP398G', 'Discovery', 'Daft Punk', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop&q=80', 2001),
('2WT1pbYjLJp2vjT5N8F3zE', 'Alegria', 'Antònia Font', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80', 2002),
('70cAlGgL0sY2xT9H96uH87', '10 milles per veure una bona armadura', 'Manel', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80', 2011),
('17u1V10oH5m1r7Y8S8nK4m', 'Èpic Solete', 'The Tyets', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80', 2023),
('4LH4d3cOWNNXdAC4eeG3x2', 'In Rainbows', 'Radiohead', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80', 2007),
('1G1k347L8Q8o5wV1c6m37Y', 'Nevermind', 'Nirvana', 'https://images.unsplash.com/photo-1520523839898-507121c172a7?w=600&auto=format&fit=crop&q=80', 1991),
('6ogI01a7x69xP8z8247P3a', 'The Rise and Fall of Ziggy Stardust', 'David Bowie', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80', 1972),
('0A4K0y9X92L1h4m3aZ5P87', 'Purple Rain', 'Prince', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80', 1984),
('3cW91L00192vH4T8S7r21X', 'Back to Black', 'Amy Winehouse', 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&auto=format&fit=crop&q=80', 2006),
('2fenSS68JI1h4Fo296Jfxy', 'Led Zeppelin IV', 'Led Zeppelin', 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=600&auto=format&fit=crop&q=80', 1971),
('5MS3M5bP8wzU111x98V83m', 'A Tope amb la Vida', 'Oques Grasses', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', 2021),
('4eLPsYPBmXABThSJuc2nvT', 'Renaissance', 'Beyoncé', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 2022),
('5v9Y4H0O7v1P8M2m3m4n5k', 'Mezzanine', 'Massive Attack', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 1998);

-- Ressenyes (30 ressenyes detallades d'usuaris amb diferents criteris)
INSERT OR IGNORE INTO reviews (id, user_id, album_id, rating, review_text, created_at) VALUES
(1, 1, '4aawyAB9vmq31L23', 5.0, 'Una de les obres mestres absolutes de la història de la música contemporània. La cara B és sublim, especialment el medley final.', '2026-01-12 11:30:00'),
(2, 1, '285O1L3A8A2g5L2p3d1', 4.5, 'Producció impecable de Quincy Jones. Cançons com Billie Jean o Beat It van canviar la indústria del pop per sempre.', '2026-01-15 17:40:00'),
(3, 2, '7i2DJ8oZ0vH3Y8G1sM2h3v', 5.0, 'El so envoltant, els temes filosòfics sobre el temps i el solo de Time el converteixen en un disc imprescindible per a qualsevol melòman.', '2026-01-18 09:15:00'),
(4, 3, '1ptj8O06Vv1e3Wq17Zz17K', 4.5, 'Trencador, polèmic i vibrant. Rosalía sap mesclar arrels flamenques amb sintetitzadors distorsionats com ningú altre.', '2026-01-22 20:10:00'),
(5, 3, '4m2880jivSbbyEGAKfITCa', 4.0, 'La calor dels instruments analògics es nota des del primer acord. Giorgio by Moroder és una autèntica lliçó de composició.', '2026-01-25 18:00:00'),
(6, 4, '6kVUvzRmBG2KiFHU987641', 5.0, 'Paranoid Android i Karma Police defineixen una generació sencera. Atmosferes úniques i lletres profètiques.', '2026-01-28 22:15:00'),
(7, 4, '2fenSS68JI1h4Fo296Jfxy', 5.0, 'Stairway to Heaven és només la punta de l iceberg. El so de bateria de John Bonham a When the Levee Breaks és brutal.', '2026-02-02 14:20:00'),
(8, 5, '3RQQmkQEvNCY4prGKE6oc5', 4.5, 'Kevin Parker va crear el disc psicodèlic definitiu dels 2010s. The Less I Know the Better és una joia incontestable.', '2026-02-05 16:30:00'),
(9, 5, '6deiaCdMT8geN0Y6ue7gtU', 4.0, 'Riffs de guitarra greixosos i la veu sensual d Alex Turner. Potser menys cru que els seus inicis, però molt efectiu.', '2026-02-08 19:10:00'),
(10, 6, '2guirTSE4XLCLIMdsP398G', 5.0, 'L àlbum que va definir la música electrònica del canvi de mil·lenni. One More Time i Harder Better Faster Stronger són himnes eterns.', '2026-02-11 12:45:00'),
(11, 6, '5v9Y4H0O7v1P8M2m3m4n5k', 4.5, 'Atmosferes fosques, trip-hop hipnòtic i lletres introspectives. Teardrop és pura poesia sonora.', '2026-02-14 21:50:00'),
(12, 7, '7ycBtnsM2kIeBfWc5qN4c7', 5.0, 'Probablement el millor disc de rap de la dècada passada. La fusió amb jazz i la càrrega social són insuperables.', '2026-02-17 15:35:00'),
(13, 8, '0A4K0y9X92L1h4m3aZ5P87', 5.0, 'El talent multifacètic de Prince en el seu punt més àlgid. Cada cançó traspua energia, virtuosisme i carisma.', '2026-02-20 18:25:00'),
(14, 8, '3cW91L00192vH4T8S7r21X', 4.5, 'L esperit del soul clàssic revisitat amb una honestedat demolidora per Amy Winehouse i la producció de Mark Ronson.', '2026-02-23 11:00:00'),
(15, 9, '4eLPsYPBmXABThSJuc2nvT', 4.0, 'Un homenatge brillant a la cultura ballroom i a la música house negra. Producció que no deixa respirar.', '2026-02-25 17:15:00'),
(16, 10, '2WT1pbYjLJp2vjT5N8F3zE', 5.0, 'Un dels cims del pop mallorquí i català. Cançons com Dins aquest iglú o Clint Eastwood formen part de la memòria col·lectiva.', '2026-02-28 10:20:00'),
(17, 10, '70cAlGgL0sY2xT9H96uH87', 4.5, 'Consolidació definitiva de Manel com a referents indiscutibles. Lletres narratives brillants i arranjaments elegants.', '2026-03-02 13:40:00'),
(18, 10, '5MS3M5bP8wzU111x98V83m', 4.0, 'Lletres vitals i ritmes festius que van acompanyar una època difícil. Petó de coco és impossible de no cantar.', '2026-03-05 19:30:00'),
(19, 10, '17u1V10oH5m1r7Y8S8nK4m', 4.0, 'Fenomen indiscutible. Coti x Coti ha fet ballar sardanes a tothom i la resta de temes són pop lluminós.', '2026-03-08 16:10:00'),
(20, 11, '1G1k347L8Q8o5wV1c6m37Y', 4.5, 'L explosió del grunge que va desplaçar el hair metal. Kurt Cobain expressant l angoixa juvenil com ningú.', '2026-03-10 14:00:00'),
(21, 11, '6ogI01a7x69xP8z8247P3a', 5.0, 'L alter ego més icònic del rock. David Bowie creant mite i música immortal alhora.', '2026-03-12 18:45:00'),
(22, 12, '4LH4d3cOWNNXdAC4eeG3x2', 5.0, 'La calidesa i la intimitat d In Rainbows supera fins i tot OK Computer per a mi. Weird Fishes és sublim.', '2026-03-15 21:10:00'),
(23, 1, '0vE6mttURJF7VHM1gDMoT9', 5.0, 'Un disc marcat per les tensions internes del grup, convertit en una de les peces de pop-rock més polides mai creades.', '2026-03-18 10:50:00'),
(24, 2, '5v9G61N6yv7P8X894178aB', 4.5, 'Obra conceptual basada en la novel·la medieval Flamenca. Pura força vocal i arranjaments innovadors.', '2026-03-20 15:15:00'),
(25, 4, '4aawyAB9vmq31L23', 4.5, 'La química dels Beatles acomiadant-se junts com a banda en el seu millor estat musical.', '2026-03-22 17:30:00'),
(26, 5, '7i2DJ8oZ0vH3Y8G1sM2h3v', 4.5, 'Un clàssic que mai passa de moda. Escoltar-lo amb auriculars d alta fidelitat és una experiència mística.', '2026-03-25 22:00:00'),
(27, 6, '1ptj8O06Vv1e3Wq17Zz17K', 4.0, 'Experimentació sonora audaç. Potser polaritzant, però innegablement influent en la música hispana.', '2026-03-28 11:20:00'),
(28, 7, '6kVUvzRmBG2KiFHU987641', 4.5, 'No Surprises és una de les cançons més commovedores que s han escrit mai.', '2026-03-30 19:00:00'),
(29, 8, '4m2880jivSbbyEGAKfITCa', 5.0, 'Get Lucky va sonar a tot arreu, però Instant Crush amb Julian Casablancas és la verdadera joia amagada.', '2026-04-02 16:40:00'),
(30, 9, '285O1L3A8A2g5L2p3d1', 5.0, 'No hi ha cap pista sobrant a aquest disc. Ballable, enèrgic i revolucionari.', '2026-04-05 14:15:00');

-- Llistes Temàtiques (PLAYLISTS)
INSERT OR IGNORE INTO playlists (id, user_id, title, description, is_public, created_at) VALUES
(1, 1, 'Millors discos essencials de la història', 'Una selecció d àlbums fonamentals que tothom hauria d escoltar almenys un cop a la vida.', 1, '2026-02-01 12:00:00'),
(2, 3, 'Sons per a viatjar de nit', 'Discos d atmosferes nocturnes, sintetitzadors càlids i calma.', 1, '2026-02-15 21:00:00'),
(3, 4, 'Rock Clàssic i Psicodèlic', 'Guitarres icòniques dels anys 60 i 70 que van transformar la música.', 1, '2026-02-20 18:00:00'),
(4, 10, 'Talent Musical Català', 'Àlbums emblemàtics de l escena pop, indie i urbana de Catalunya i les Balears.', 1, '2026-02-25 15:30:00'),
(5, 6, 'Pioneres i Músiques Electròniques', 'Viatges sonors entre el French Touch, el trip-hop i la pista de ball.', 1, '2026-03-01 17:45:00'),
(6, 5, 'Indie & Art Rock dels 90 als 2000', 'Discos introspectius, melancòlics i amb produccions úniques.', 1, '2026-03-05 11:20:00'),
(7, 2, 'Col·lecció Privada de l Administrador', 'Llista de seguiment personal i anàlisis de producció.', 0, '2026-03-10 09:00:00');

-- Àlbums per Llista (PLAYLIST_ALBUMS - Relació N:M)
INSERT OR IGNORE INTO playlist_albums (playlist_id, album_id, added_at) VALUES
-- Llista 1: Essencials
(1, '4aawyAB9vmq31L23', '2026-02-01 12:05:00'),
(1, '7i2DJ8oZ0vH3Y8G1sM2h3v', '2026-02-01 12:10:00'),
(1, '285O1L3A8A2g5L2p3d1', '2026-02-01 12:15:00'),
(1, '6kVUvzRmBG2KiFHU987641', '2026-02-01 12:20:00'),
(1, '0vE6mttURJF7VHM1gDMoT9', '2026-02-01 12:25:00'),
-- Llista 2: Viatjar de nit
(2, '4m2880jivSbbyEGAKfITCa', '2026-02-15 21:05:00'),
(2, '5v9Y4H0O7v1P8M2m3m4n5k', '2026-02-15 21:10:00'),
(2, '3RQQmkQEvNCY4prGKE6oc5', '2026-02-15 21:15:00'),
(2, '4LH4d3cOWNNXdAC4eeG3x2', '2026-02-15 21:20:00'),
-- Llista 3: Rock Clàssic
(3, '4aawyAB9vmq31L23', '2026-02-20 18:05:00'),
(3, '7i2DJ8oZ0vH3Y8G1sM2h3v', '2026-02-20 18:10:00'),
(3, '2fenSS68JI1h4Fo296Jfxy', '2026-02-20 18:15:00'),
(3, '6ogI01a7x69xP8z8247P3a', '2026-02-20 18:20:00'),
-- Llista 4: Talent Català
(4, '2WT1pbYjLJp2vjT5N8F3zE', '2026-02-25 15:35:00'),
(4, '70cAlGgL0sY2xT9H96uH87', '2026-02-25 15:40:00'),
(4, '17u1V10oH5m1r7Y8S8nK4m', '2026-02-25 15:45:00'),
(4, '5MS3M5bP8wzU111x98V83m', '2026-02-25 15:50:00'),
(4, '5v9G61N6yv7P8X894178aB', '2026-02-25 15:55:00'),
(4, '1ptj8O06Vv1e3Wq17Zz17K', '2026-02-25 16:00:00'),
-- Llista 5: Electrònica
(5, '2guirTSE4XLCLIMdsP398G', '2026-03-01 17:50:00'),
(5, '4m2880jivSbbyEGAKfITCa', '2026-03-01 17:55:00'),
(5, '5v9Y4H0O7v1P8M2m3m4n5k', '2026-03-01 18:00:00'),
-- Llista 6: Indie & Art Rock
(6, '6kVUvzRmBG2KiFHU987641', '2026-03-05 11:25:00'),
(6, '4LH4d3cOWNNXdAC4eeG3x2', '2026-03-05 11:30:00'),
(6, '6deiaCdMT8geN0Y6ue7gtU', '2026-03-05 11:35:00'),
(6, '3RQQmkQEvNCY4prGKE6oc5', '2026-03-05 11:40:00'),
(6, '1G1k347L8Q8o5wV1c6m37Y', '2026-03-05 11:45:00'),
-- Llista 7: Privada Admin
(7, '7ycBtnsM2kIeBfWc5qN4c7', '2026-03-10 09:05:00'),
(7, '0A4K0y9X92L1h4m3aZ5P87', '2026-03-10 09:10:00');

-- Escoltar més tard (LISTENLIST - Relació N:M)
INSERT OR IGNORE INTO listenlist (user_id, album_id, added_at) VALUES
(1, '7i2DJ8oZ0vH3Y8G1sM2h3v', '2026-03-02 10:00:00'),
(1, '7ycBtnsM2kIeBfWc5qN4c7', '2026-03-04 15:30:00'),
(1, '4LH4d3cOWNNXdAC4eeG3x2', '2026-03-08 12:15:00'),
(3, '2fenSS68JI1h4Fo296Jfxy', '2026-03-10 18:20:00'),
(3, '6ogI01a7x69xP8z8247P3a', '2026-03-12 21:05:00'),
(4, '1ptj8O06Vv1e3Wq17Zz17K', '2026-03-15 14:40:00'),
(5, '2guirTSE4XLCLIMdsP398G', '2026-03-17 11:50:00'),
(6, '70cAlGgL0sY2xT9H96uH87', '2026-03-19 16:35:00'),
(7, '0vE6mttURJF7VHM1gDMoT9', '2026-03-21 20:00:00'),
(8, '4eLPsYPBmXABThSJuc2nvT', '2026-03-23 13:10:00'),
(9, '2WT1pbYjLJp2vjT5N8F3zE', '2026-03-25 17:25:00'),
(10, '3cW91L00192vH4T8S7r21X', '2026-03-27 19:45:00');
