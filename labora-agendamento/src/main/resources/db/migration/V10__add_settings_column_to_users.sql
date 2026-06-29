ALTER TABLE users ADD COLUMN settings JSONB DEFAULT '{"theme": "light", "sidebarCollapsed": false}'::jsonb;
