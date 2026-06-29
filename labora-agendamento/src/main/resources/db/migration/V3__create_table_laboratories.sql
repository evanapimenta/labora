CREATE TABLE IF NOT EXISTS laboratories(
	id VARCHAR(36) PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	phone_number VARCHAR(20),
	email VARCHAR(255),
	active BOOLEAN DEFAULT true,
	cnpj VARCHAR(20),
	super_admin_id VARCHAR(36) NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	address_street VARCHAR(255),
    address_neighborhood VARCHAR(255),
    address_city VARCHAR(255),
    address_state VARCHAR(255),
    address_postal_code VARCHAR(20),
    address_number VARCHAR(20),
    address_complement VARCHAR(255),
    address_country VARCHAR(255),

    CONSTRAINT fk_lab_super_admin FOREIGN KEY (super_admin_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS branches(
	id VARCHAR(36) PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	laboratory_id VARCHAR(36) NOT NULL,
	phone_number VARCHAR(20),
	email VARCHAR(255),
	admin_id VARCHAR(36) NULL,
	opening_hours VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	active BOOLEAN NOT NULL DEFAULT TRUE,

	address_street VARCHAR(255),
	address_neighborhood VARCHAR(255),
	address_city VARCHAR(255),
	address_state VARCHAR(255),
	address_postal_code VARCHAR(20),
	address_number VARCHAR(20),
	address_complement VARCHAR(255),
	address_country VARCHAR(255),

	CONSTRAINT fk_branch_lab FOREIGN KEY (laboratory_id) REFERENCES laboratories(id),
	CONSTRAINT fk_branch_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);