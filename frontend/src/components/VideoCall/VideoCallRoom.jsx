import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import './VideoCallRoom.css';

function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

const VideoCallRoom = ({ 
  roomID, 
  userID, 
  userName, 
  onCallEnd,
  patientData 
}) => {
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showLinkBanner, setShowLinkBanner] = useState(true);
  
  // Generate the shareable room link
  const roomLink = `${window.location.origin}/video-call?roomID=${roomID}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    const initializeZego = async () => {
      if (!containerRef.current) return;
      try {
        console.log('🎥 Initializing ZegoCloud video call...');
        console.log('Room ID:', roomID);
        console.log('User ID:', userID);
        console.log('User Name:', userName);
        console.log('📎 Room Link:', roomLink);

        // Get credentials from environment variables
        const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!appID || !serverSecret) {
          console.error('❌ ZegoCloud credentials missing!');
          console.log('AppID:', appID);
          console.log('ServerSecret:', serverSecret ? 'Set' : 'Missing');
          throw new Error('ZegoCloud credentials are not configured. Please check your .env file.');
        }

        console.log('✅ Credentials loaded - AppID:', appID);

        // Generate Kit Token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID || randomID(5),
          userID || randomID(5),
          userName || randomID(5)
        );

        console.log('✅ Kit token generated');

        // Create instance object from Kit Token
        const zp = ZegoUIKitPrebuilt.create(kitToken);

        // Join the room
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Share Link',
              url: roomLink,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          showScreenSharingButton: true,
          showPreJoinView: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
          layout: 'Auto',
          showLayoutButton: false,
          onLeaveRoom: () => {
            console.log('👋 User left the room');
            if (onCallEnd) {
              onCallEnd();
            }
          },
          onJoinRoom: () => {
            console.log('✅ Successfully joined the room');
          },
          onUserJoin: (users) => {
            console.log('👥 Users joined:', users);
          },
          onUserLeave: (users) => {
            console.log('👋 Users left:', users);
          },
        });

        console.log('✅ Successfully initialized video call');
      } catch (error) {
        console.error('❌ ZegoCloud initialization error:', error);
        console.error('Error details:', error.message);
      }
    };

    initializeZego();
  }, [roomID, userID, userName, onCallEnd, roomLink]);

  return (
    <div className="relative w-full h-screen">
      {/* Room Link Banner - Shows at the top */}
      {showLinkBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="bg-white/20 rounded-full p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Share this link with your patient:</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white/20 px-3 py-1 rounded text-sm font-mono flex-1 truncate">
                      {roomLink}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-1 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLinkBanner(false)}
                className="ml-4 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Container */}
      <div
        className="video-call-container"
        ref={containerRef}
        style={{ width: '100%', height: '100vh' }}
      >
        {/* ZegoUIKitPrebuilt will render here */}
      </div>
    </div>
  );
};

export default VideoCallRoom;
