CREATE TABLE IF NOT EXISTS soundbox_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_salt TEXT,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar TEXT,
  bio TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_started INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);

INSERT OR IGNORE INTO soundbox_accounts
  (id, username, name, email, password_salt, password_hash, role, created_at)
VALUES
  (1, 'meloman_cat', 'Adrià Melòman', 'meloman@soundbox.cat', '8fdb7ba11acbbc73324049b30f9b7d63', '7e33e53c75418949b0a6804ba9df59168cd26b3cc3db268c90a28f4a48f50353', 'user', '2026-01-10T10:00:00Z'),
  (2, 'adria_admin', 'Adrià Gallardo', 'admin@soundbox.cat', '3cb464c637a9b26fe228df58a35f87c5', '05f84e07c3028496ba3fdab22929165edc6cf7d2ce24a246aff3dac923ae71c5', 'admin', '2026-01-01T08:00:00Z'),
  (3, 'clara_valls', 'Clara Valls', 'clara@soundbox.cat', '268c95092c9fa5c735c9f12beadaa928', 'b1d9e6259531288a8482066b9950270f24ca5deb7755c6aad4bf7c4125da1ed0', 'user', '2026-01-15T14:30:00Z'),
  (4, 'pau_rocker', 'Pau Soler', 'pau@soundbox.cat', 'ba648cae84abf5777ee20e1510c13f07', 'f84a43d9f1e2cf39a15d528949f40d99dd20e569d8a112ab20cfddf6b0870f3e', 'user', '2026-01-20T18:15:00Z'),
  (5, 'laura_indie', 'Laura Mas', 'laura@soundbox.cat', 'cc847fcb9ac47fd9cfe8a82734d0508a', '0026cf39fbc011575052cff3d06b1665503f9be1cf6a2958d3981153c109df27', 'user', '2026-01-25T11:20:00Z'),
  (6, 'marc_electronic', 'Marc Riera', 'marc@soundbox.cat', '8146a1d030bd1bbc4967be46fe86e926', '41803a541b05c564cb7df70d7495f7fd501ce0fd0a382cce9e104e7582f82f15', 'user', '2026-02-01T16:45:00Z'),
  (7, 'nuria_hiphop', 'Núria Torres', 'nuria@soundbox.cat', 'bf13b940ad5daa41296b934cb4f2f361', '53c6ee897a491544d13d826a2aeb9002088f119a2d2e188cf4c92ebb62505209', 'user', '2026-02-05T09:10:00Z'),
  (8, 'joan_jazz', 'Joan Bosch', 'joan@soundbox.cat', 'f3f3c0fbcb42af29b74f3225d2cc0684', '3b685f22b00d3d4844c3c3efa872ff5ba2b38cea71c54561c0daa318b983689b', 'user', '2026-02-10T20:00:00Z'),
  (9, 'berta_pop', 'Berta Puig', 'berta@soundbox.cat', '86a308c24c69903001886e70558aad99', '15a3c91a689a9dd87eeaaa51d1b09cba4448e89a112b34dc22a928919a1a0aae', 'user', '2026-02-14T12:30:00Z'),
  (10, 'oriol_catfolk', 'Oriol Rovira', 'oriol@soundbox.cat', '9ca878c5ef937a32108ddf023a5965a0', 'f472c7a307dc9ef5c4daf584dd59a9aef1812f5f7348ad0448f3644037395d3a', 'user', '2026-02-18T19:40:00Z');

UPDATE shared_playlists SET owner_google_id = 'account:1' WHERE id = '1';
UPDATE shared_playlists SET owner_google_id = 'account:3' WHERE id = '2';
UPDATE shared_playlists SET owner_google_id = 'account:10' WHERE id = '3';
