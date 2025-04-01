// Authentication.tsx
import { useEffect } from 'react';
import axios from 'axios';
import { SHA256, enc } from 'crypto-js';
import * as randomstring from 'randomstring';

const CODE_VERIFIER_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,-_~";

const Authentication = ({ onAccessTokenReceived }: { onAccessTokenReceived: (token: string) => void }) => {
  useEffect(() => {
    const fetchAuthUrl = async () => {
      const verifier = generateCodeVerifier();
      const challenge = generateCodeChallenge(verifier);

      localStorage.setItem('codeVerifier', verifier);

      const authUrl = `https://id.trimble.com/oauth/authorize?client_id=d9d21ed0-14e7-4887-ba4b-d12ac2f2f466&response_type=code&scope=openid TDAAS&redirect_uri=http://localhost:4200/authenticated&code_challenge=${challenge}&code_challenge_method=S256`;
      window.open(authUrl,'_blank');
    };

    fetchAuthUrl();
  }, []);

  useEffect(() => {
    const handleAuthResponse = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      if (authCode) {
        const token = await getAccessToken(authCode);
        onAccessTokenReceived(token);
      }
    };

    handleAuthResponse();
  }, []);

  const generateCodeVerifier = (): string => {
    return randomstring.generate({
      length: getLength(),
      charset: CODE_VERIFIER_CHARSET,
    });
  };

  const generateCodeChallenge = (verifier: string): string => {
    const hash = SHA256(verifier);
    return enc.Base64.stringify(hash)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const getLength = (): number => {
    return Math.floor(Math.random() * (128 - 43)) + 43;
  };

  const getAccessToken = async (authCode: string): Promise<string> => {
    const tokenUrl = 'https://id.trimble.com/oauth/token';
    const clientId = 'd9d21ed0-14e7-4887-ba4b-d12ac2f2f466';
    const redirectUri = 'http://localhost:4200/authenticated';
    const codeVerifier = localStorage.getItem('codeVerifier') || '';

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', authCode);
    params.append('redirect_uri', redirectUri);
    params.append('client_id', clientId);
    params.append('code_verifier', codeVerifier);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  };

  return null; 
};

export default Authentication;
