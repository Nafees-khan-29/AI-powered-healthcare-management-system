import { generateToken04 } from './zegoToken';

export const ZEGO_CONFIG = {
  appID: parseInt(import.meta.env.VITE_ZEGO_APP_ID), // Your AppID from ZegoCloud Console
  serverSecret: import.meta.env.VITE_ZEGO_SERVER_SECRET, // Your ServerSecret
};

// Generate ZegoCloud token for authentication
export const generateZegoToken = async (userID, roomID) => {
  const appID = ZEGO_CONFIG.appID;
  const serverSecret = ZEGO_CONFIG.serverSecret;
  const effectiveTimeInSeconds = 3600 * 24; // Token valid for 24 hours
  const payload = '';

  console.log('Generating token with AppID:', appID);

  if (!appID || !serverSecret) {
    console.error('ZegoCloud credentials not found. Please check your .env file.');
    throw new Error('ZegoCloud credentials missing');
  }

  try {
    // Generate token using the ZegoCloud algorithm
    const token = await generateToken04(
      appID,
      userID,
      serverSecret,
      effectiveTimeInSeconds,
      payload
    );

    return token;
  } catch (error) {
    console.error('Error generating ZegoCloud token:', error);
    throw error;
  }
};
