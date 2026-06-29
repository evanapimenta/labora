ALTER TABLE patients ADD COLUMN address_latitude double precision;
ALTER TABLE patients ADD COLUMN address_longitude double precision;

ALTER TABLE laboratories ADD COLUMN address_latitude double precision;
ALTER TABLE laboratories ADD COLUMN address_longitude double precision;

ALTER TABLE branches ADD COLUMN address_latitude double precision;
ALTER TABLE branches ADD COLUMN address_longitude double precision;