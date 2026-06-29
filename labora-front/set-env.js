const fs = require('fs');
const path = require('path');

// Target path for the environment file
const targetPath = path.join(__dirname, 'environment.ts');

// Load .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split(/\r?\n/).forEach(line => {
        // Skip comments and empty lines
        if (!line || line.trim().startsWith('#')) return;
        const index = line.indexOf('=');
        if (index > 0) {
            const key = line.substring(0, index).trim();
            let value = line.substring(index + 1).trim();
            // Remove optional quotes (single or double)
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (process.env[key] !== undefined) {
                // Sobrescreve para garantir que o .env tem precedência
                process.env[key] = value;
            } else {
                process.env[key] = value;
            }
        }
    });
}

// Generate the configuration file content
const envConfigFile = `export const environment = {
    api: '${process.env.API_URL || 'http://localhost:4200/api'}',
    iconRef: 'labify',
    logo: 'assets/images/logo.png'
};
`;

// Write the file
fs.writeFileSync(targetPath, envConfigFile, 'utf8');
console.log(`[set-env] Configuração de ambiente gerada em ${targetPath} com api: ${process.env.API_URL || 'http://localhost:4200/api'}`);
