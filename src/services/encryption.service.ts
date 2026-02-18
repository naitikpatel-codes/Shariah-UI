const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12; // bytes
const KEY_LENGTH = 256; // bits

/**
 * Encrypts a PDF ArrayBuffer with AES-256-GCM.
 * Output format: [salt (16 bytes)][iv (12 bytes)][ciphertext]
 */
export async function encryptPDF(pdfBuffer: ArrayBuffer, password: string): Promise<Blob> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_LENGTH },
        false,
        ['encrypt']
    );

    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pdfBuffer);

    // Concatenate: salt + iv + ciphertext
    const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
    result.set(salt, 0);
    result.set(iv, SALT_LENGTH);
    result.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

    return new Blob([result], { type: 'application/octet-stream' });
}

/**
 * Decrypts a .enc Blob back to PDF ArrayBuffer.
 * Used by the Open Encrypted Report screen.
 */
export async function decryptPDF(encBlob: Blob, password: string): Promise<ArrayBuffer> {
    const buffer = await encBlob.arrayBuffer();
    const data = new Uint8Array(buffer);

    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_LENGTH },
        false,
        ['decrypt']
    );

    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
}
