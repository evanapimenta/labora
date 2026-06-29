INSERT INTO users(id, email, cpf, "password", "name", phone_number, created_at)
VALUES('50a676f1-dfa7-4b8e-8121-1f327099ee50', 'felipe@email.com', '45594721819', '$2a$12$hQG0pa9.3rZsHhQJ1ZzCw.Oz49vp29QK.YQVKzJFqpMD6uwAyAJW6', 'Carlos', '1194772471', '2025-05-15 23:48:53.312');

INSERT INTO patients
(id, birth_date, gender, weight, insured, insurance_name, emergency_contact_name, emergency_contact_number, created_at, address_street, address_neighborhood, address_city, address_state, address_postal_code, address_number, address_complement, address_country)
VALUES('50a676f1-dfa7-4b8e-8121-1f327099ee50', '2013-04-30', 'MALE', 60.50, false, NULL, 'Mãe', '11954757563', '2025-05-27 23:26:54.774', 'Rua 2', 'Bairro', 'Osasco', 'São Paulo', '06124130', '123', 'Casa 1', 'Brasil');

INSERT INTO users
(id, email, cpf, "password", "name", phone_number, created_at)
VALUES('5c6a697b-f32b-43e2-b480-d51b5d4bd098', 'fernanda@email.com', '06133343885', '$2a$10$Kwru/gZmmtcypStKtqr03uB9u5CJIWzKjFzj4WIDahtMd03SWNcmu', 'Carlos', '1194772471', '2025-05-27 17:08:09.035');

INSERT INTO patients
(id, birth_date, gender, weight, insured, insurance_name, emergency_contact_name, emergency_contact_number, created_at, address_street, address_neighborhood, address_city, address_state, address_postal_code, address_number, address_complement, address_country)
VALUES('5c6a697b-f32b-43e2-b480-d51b5d4bd098', '2013-04-30', 'MALE', 60.50, false, NULL, 'Mãe', '11954757563', '2025-05-27 23:26:54.774', 'Rua 2', 'Bairro', 'Osasco', 'São Paulo', '06124130', '123', 'Casa 1', 'Brasil');

INSERT INTO users
(id, email, cpf, "password", "name", phone_number, created_at)
VALUES('73fc7257-4856-4f09-92a8-33fbbe7a497b', 'kevin@email.com', '13298888800', '$2a$10$sgcbD50uE.AtX4qEw96wS.ygzgS7SxpNM6Kuas0GwoN5zXGTDGIUK', 'Kevin', '1194772471', '2025-05-27 23:13:21.092');
