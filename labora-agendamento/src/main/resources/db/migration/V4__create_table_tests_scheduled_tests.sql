CREATE TYPE category_enum AS ENUM ('genetico', 'fertilidade');
CREATE TYPE status_enum AS ENUM ('agendado', 'concluido', 'realizado', 'cancelado', 'ausente', 'aguardando_resultado');

CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category category_enum NOT NULL,
    sex_specific BOOLEAN DEFAULT FALSE,
    sample_type VARCHAR(255),
    estimated_result_time VARCHAR(255),
    preparation_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scheduled_tests (
    id VARCHAR(36) PRIMARY KEY,
    test_id INT NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_for TIMESTAMP,
    status status_enum NOT NULL DEFAULT 'agendado',
    branch_id VARCHAR(36) NOT NULL,
    result_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    result_ready_at TIMESTAMP,

    CONSTRAINT fk_test_id FOREIGN KEY (test_id) REFERENCES tests(id),
    CONSTRAINT fk_patient_id FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_branch_id FOREIGN KEY (branch_id) REFERENCES branches(id)
);