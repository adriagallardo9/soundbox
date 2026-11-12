ALTER TABLE shared_playlists ADD COLUMN owner_user_id INTEGER;

UPDATE shared_playlists SET owner_user_id = 1 WHERE id = '1';
UPDATE shared_playlists SET owner_user_id = 3 WHERE id = '2';
UPDATE shared_playlists SET owner_user_id = 10 WHERE id = '3';
