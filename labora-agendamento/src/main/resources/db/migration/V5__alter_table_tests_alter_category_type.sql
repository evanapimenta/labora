ALTER TABLE tests
ALTER COLUMN category TYPE VARCHAR USING category::text;

ALTER TABLE scheduled_tests
ALTER COLUMN status TYPE VARCHAR USING status::text;

ALTER TABLE patients
ALTER COLUMN gender TYPE VARCHAR USING gender::text;
