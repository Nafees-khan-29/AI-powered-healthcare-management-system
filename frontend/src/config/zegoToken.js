// ZegoCloud Token Generation Algorithm
// This is the official token generation code from ZegoCloud

export async function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
  if (!appId || !userId || !secret) {
    console.error('appId, userId and secret must not be empty');
    return '';
  }

  if (effectiveTimeInSeconds <= 0) {
    console.error('effectiveTimeInSeconds must be greater than 0');
    return '';
  }

  // Create a random 16-byte nonce
  const createRandomNonce = () => {
    const nonce = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      nonce[i] = Math.floor(Math.random() * 256);
    }
    return nonce;
  };

  const encoder = new TextEncoder();
  const nonce = createRandomNonce();
  const expire = Math.floor(Date.now() / 1000) + effectiveTimeInSeconds;

  // Create data to be signed
  const body = {
    app_id: appId,
    user_id: userId,
    nonce: btoa(String.fromCharCode.apply(null, nonce)),
    expire_time: expire,
    payload: payload || ''
  };

  const content = JSON.stringify(body);
  
  try {
    // Import crypto for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(content));
    const sig = btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
    
    const token = btoa(JSON.stringify({
      ...body,
      signature: sig
    }));
    
    return '04' + token; // Version 04
  } catch (err) {
    console.error('Error generating token:', err);
    return '';
  }
}
