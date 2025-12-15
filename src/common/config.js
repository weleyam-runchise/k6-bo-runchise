
// Helper to parse .env content
function parseEnv(content) {
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        if (key.trim() === 'BASE_URL') {
            return valueParts.join('=').trim();
        }
    }
    return null;
}

// Try to load from .env file explicitly
let envBaseUrl = null;
try {
    // Relative path from this file (src/common) to root
    const envContent = open('../../.env');
    envBaseUrl = parseEnv(envContent);
} catch (e) {
    // .env might not exist, ignore
}

// Priority: 
// 1. CLI flag (-e BASE_URL=...)
// 2. .env file value
// 3. Default fallback
export const BASE_URL = __ENV.BASE_URL || envBaseUrl || 'https://master-server.runchise.com/api';
