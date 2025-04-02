import * as randomstring from 'randomstring';
import { SHA256, enc } from 'crypto-js';

const CODE_VERIFIER_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,-_~";

export function generateCodeVerifier(): string {
  let codeVerifier = randomstring.generate({
    length: getLength(),
    charset: CODE_VERIFIER_CHARSET,
  });
  return codeVerifier;
}

export function generateCodeChallenge(verifier: string): string {
  const hash = SHA256(verifier);
  const codeChallenger = enc.Base64.stringify(hash)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return codeChallenger;
}

function getLength(): number {
  return Math.floor(Math.random() * (128 - 43)) + 43;
}
