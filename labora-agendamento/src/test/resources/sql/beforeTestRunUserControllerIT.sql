TRUNCATE TABLE users CASCADE;

INSERT INTO users
(id, email, "password", "name", created_at, last_login_at, "role", active, verified, "token", token_expires_in)
VALUES('d290f1ee-6c54-4b01-90e6-d701748f0851', 'system@agendaexame.com', '$2a$10$/Qty5OWzuADtQ5wZ7OQLAuMku55nDb5.zi8UaH9o6PjEUbmr6fao2', 'SYSTEM', '2025-08-14 18:55:47.344', '2025-08-14 20:14:13.652', 'SYSTEM', true, true, NULL, NULL);

INSERT INTO users
(id, email, "password", "name", created_at, last_login_at, "role", active, verified, "token", token_expires_in)
VALUES('e13dce78-e2bc-4fbb-bd5b-15ab5585e2a7', 'email@email.com', '$2a$10$8VbOSM6J51FO/gHzrsFoT.GfPNOi4b57sve6esLdrexwypQjZJDNO', 'Fulano', '2025-08-14 18:56:29.120', '2025-08-14 20:51:58.315', 'PATIENT', true, true, NULL, NULL);

INSERT INTO users
(id, email, "password", "name", created_at, last_login_at, "role", active, verified, "token", token_expires_in)
VALUES('5165dada-fca0-45eb-be19-cde2853f7e81', 'outroemail@email.com', '$2a$10$q2B4634qh0CKu3.7ZfIcLuP6ooD/ZJm0WB36OX15WeHNlIEcK8rUG', 'Fulano', '2025-08-14 21:00:05.683', NULL, 'PATIENT', true, true, NULL, NULL);