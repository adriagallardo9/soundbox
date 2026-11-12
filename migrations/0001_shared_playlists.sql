CREATE TABLE IF NOT EXISTS shared_playlists (
  id TEXT PRIMARY KEY,
  owner_google_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  description TEXT NOT NULL DEFAULT '',
  tracks_json TEXT NOT NULL DEFAULT '[]',
  albums_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS shared_playlists_created_at_idx
  ON shared_playlists(created_at DESC);

CREATE TABLE IF NOT EXISTS playlist_ratings (
  playlist_id TEXT NOT NULL REFERENCES shared_playlists(id) ON DELETE CASCADE,
  google_user_id TEXT NOT NULL,
  rating REAL NOT NULL CHECK (rating >= 0.1 AND rating <= 5),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (playlist_id, google_user_id)
);

CREATE TABLE IF NOT EXISTS playlist_views (
  playlist_id TEXT NOT NULL REFERENCES shared_playlists(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  viewed_on TEXT NOT NULL,
  PRIMARY KEY (playlist_id, visitor_hash, viewed_on)
);

INSERT OR IGNORE INTO shared_playlists
  (id, owner_google_id, author_name, title, description, tracks_json, albums_json, created_at)
VALUES
  (
    '1', 'soundbox-demo-user-1', 'Adrià Melòman',
    'Millors discos essencials de la història',
    'Una selecció d’àlbums fonamentals que tothom hauria d’escoltar almenys un cop a la vida.',
    '[]',
    '[{"id":"4aawyAB9vmq31L23","title":"Abbey Road","artist":"The Beatles"},{"id":"7i2DJ8oZ0vH3Y8G1sM2h3v","title":"The Dark Side of the Moon","artist":"Pink Floyd"},{"id":"285O1L3A8A2g5L2p3d1","title":"Thriller","artist":"Michael Jackson"},{"id":"6kVUvzRmBG2KiFHU987641","title":"OK Computer","artist":"Radiohead"},{"id":"0vE6mttURJF7VHM1gDMoT9","title":"Rumours","artist":"Fleetwood Mac"}]',
    '2026-02-01T12:00:00Z'
  ),
  (
    '2', 'soundbox-demo-user-2', 'Clara Valls',
    'Sons per a viatjar de nit',
    'Discos d’atmosferes nocturnes, sintetitzadors càlids i calma.',
    '[]',
    '[{"id":"4m2880jivSbbyEGAKfITCa","title":"Random Access Memories","artist":"Daft Punk"},{"id":"3RQQmkQEvNCY4prGKE6oc5","title":"Currents","artist":"Tame Impala"},{"id":"4LH4d3cOWNNXdAC4eeG3x2","title":"In Rainbows","artist":"Radiohead"}]',
    '2026-02-15T21:00:00Z'
  ),
  (
    '3', 'soundbox-demo-user-3', 'Oriol Rovira',
    'Talent Musical Català',
    'Àlbums emblemàtics de l’escena pop, indie i urbana de Catalunya i les Balears.',
    '[]',
    '[{"id":"2WT1pbYjLJp2vjT5N8F3zE","title":"Alegria","artist":"Antònia Font"},{"id":"70cAlGgL0sY2xT9H96uH87","title":"10 milles per veure una bona armadura","artist":"Manel"},{"id":"17u1V10oH5m1r7Y8S8nK4m","title":"Èpic Solete","artist":"The Tyets"},{"id":"5v9G61N6yv7P8X894178aB","title":"El Mal Querer","artist":"Rosalía"},{"id":"1ptj8O06Vv1e3Wq17Zz17K","title":"MOTOMAMI","artist":"Rosalía"}]',
    '2026-02-25T15:30:00Z'
  );
