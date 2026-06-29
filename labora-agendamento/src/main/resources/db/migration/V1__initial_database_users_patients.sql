CREATE TABLE IF NOT EXISTS users (
	id VARCHAR(36) PRIMARY KEY,
	email VARCHAR(255) UNIQUE,
	password VARCHAR(255) NOT NULL,
	name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    role VARCHAR(50),
    active BOOLEAN,
    verified BOOLEAN DEFAULT FALSE,
    token VARCHAR(36),
    token_expires_in TIMESTAMP
);

CREATE TYPE gender_enum AS ENUM ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer');

CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE,
    birth_date DATE NOT NULL,
    gender gender_enum NOT NULL DEFAULT 'prefiro_nao_dizer',
    weight DECIMAL(5, 2),
    phone_number VARCHAR(20),
    insured BOOLEAN NOT NULL,
    insurance_name VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    address_street VARCHAR(255),
    address_neighborhood VARCHAR(255),
    address_city VARCHAR(255),
    address_state VARCHAR(255),
    address_postal_code VARCHAR(20),
    address_number VARCHAR(20),
    address_complement VARCHAR(255),
    address_country VARCHAR(255),

    CONSTRAINT fk_patient_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);