import CryptoJS from 'crypto-js';

/**
 * Decrypt hex color using XOR cipher with a key derived from the token
 * This matches the encryption in the API
 */
export function decryptHex(encrypted: string, token: string): string {
  try {
    // Create MD5 hash of the token (matches Node.js crypto)
    const key = CryptoJS.MD5(token);
    
    // Decode base64
    const encryptedBytes = CryptoJS.enc.Base64.parse(encrypted);
    
    // Convert key to bytes
    const keyBytes = key.toString(CryptoJS.enc.Hex);
    const keyArray = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      keyArray[i] = parseInt(keyBytes.substr(i * 2, 2), 16);
    }
    
    // XOR decrypt
    const words = encryptedBytes.words;
    const decrypted: number[] = [];
    for (let i = 0; i < 3; i++) { // 3 bytes for RGB
      const byte = (words[i >> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      decrypted.push(byte ^ keyArray[i % keyArray.length]);
    }
    
    // Convert to hex
    const hex = '#' + decrypted.map(b => b.toString(16).padStart(2, '0')).join('');
    return hex;
  } catch (error) {
    console.error('Failed to decrypt hex:', error);
    return '#000000'; // Fallback to black
  }
}
