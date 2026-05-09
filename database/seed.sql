USE store_rating_app;

INSERT INTO users (name, email, password_hash, address, role)
VALUES
  ('Primary System Administrator', 'admin@storerating.test', '$2a$10$bdQdlLN8UfSFK3E1QMi4o.gP7AxbRlnrF2YZ7kUJv21Rl2qP5iLDG', 'Admin office address for store rating platform', 'ADMIN'),
  ('Normal User Demo Account', 'user@storerating.test', '$2a$10$bdQdlLN8UfSFK3E1QMi4o.gP7AxbRlnrF2YZ7kUJv21Rl2qP5iLDG', 'User residential address for demo account', 'USER'),
  ('Registered Store Owner Account', 'owner@storerating.test', '$2a$10$bdQdlLN8UfSFK3E1QMi4o.gP7AxbRlnrF2YZ7kUJv21Rl2qP5iLDG', 'Owner address linked with sample store', 'OWNER')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO stores (name, email, address, owner_id)
SELECT 'Twenty Character Store Name', 'store@storerating.test', 'Central market demo store address', id
FROM users
WHERE email = 'owner@storerating.test'
ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id);
