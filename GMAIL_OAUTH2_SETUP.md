# Gmail OAuth2 Setup Guide

## Step 1: Enable Gmail API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to **APIs & Services** > **Library**
   - Search for "Gmail API"
   - Click **Enable**

## Step 2: Create OAuth2 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **Healthcare Management System**
   - User support email: **nafeeskhan7627@gmail.com**
   - Developer contact: **nafeeskhan7627@gmail.com**
   - Add scopes: `https://mail.google.com/`
   - Add test users: **nafeeskhan7627@gmail.com**
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: **Healthcare Email Service**
   - Authorized redirect URIs: `https://developers.google.com/oauthplayground`
5. Copy the **Client ID** and **Client Secret**

## Step 3: Get Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check **Use your own OAuth credentials**
4. Enter your **Client ID** and **Client Secret**
5. In the left panel, find **Gmail API v1**
6. Select `https://mail.google.com/`
7. Click **Authorize APIs**
8. Sign in with **nafeeskhan7627@gmail.com**
9. Click **Allow**
10. Click **Exchange authorization code for tokens**
11. Copy the **Refresh token**

## Step 4: Update .env File

Update your `backend/.env` file with the credentials:

```env
EMAIL_USER=nafeeskhan7627@gmail.com
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_REFRESH_TOKEN=your_actual_refresh_token_here
```

## Step 5: Restart Backend Server

```bash
cd backend
npm start
```

## Testing

Send a test emergency alert from the user dashboard to verify email delivery.

## Troubleshooting

### Error: "Invalid grant"
- Refresh token may have expired
- Go back to OAuth Playground and generate a new refresh token

### Error: "Access denied"
- Make sure Gmail API is enabled
- Verify the email address in test users list
- Check that all OAuth scopes are properly configured

### Error: "Unauthorized"
- Double-check Client ID and Client Secret
- Ensure redirect URI matches exactly

## Security Notes

- Never commit `.env` file to version control
- Keep OAuth credentials secure
- Refresh tokens don't expire unless revoked
- Monitor your Google Cloud Console for unusual activity

## Alternative: App Password (Simpler but Less Secure)

If OAuth2 setup is complex, you can use Gmail App Password:

1. Enable 2-Step Verification on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Select app: **Mail**
4. Select device: **Other (Custom name)** → "Healthcare App"
5. Copy the 16-character password
6. Update `.env`:
   ```env
   EMAIL_USER=nafeeskhan7627@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```
7. Update `emergencyAlertController.js` to use simple auth instead of OAuth2

## Current Configuration

✅ Email configured: **nafeeskhan7627@gmail.com**
✅ OAuth2 authentication enabled
⏳ Waiting for OAuth credentials to be added

Once you add the credentials to `.env` and restart the server, all email features will work automatically!
