import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import VideoCallRoom from '../components/VideoCall/VideoCallRoom';

const VideoCallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [callData, setCallData] = useState(null);

  useEffect(() => {
    // Get roomID from URL query parameter
    const roomID = searchParams.get('roomID');

    if (!roomID) {
      alert('Invalid video call link. Room ID is missing.');
      navigate('/');
      return;
    }

    // Set up call data
    setCallData({
      roomID: roomID,
      userID: user?.id || `guest_${Date.now()}`,
      userName: user?.fullName || `Guest ${Date.now()}`,
    });
  }, [searchParams, user, navigate]);

  const handleCallEnd = () => {
    navigate('/');
  };

  if (!callData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-page">
      <VideoCallRoom
        roomID={callData.roomID}
        userID={callData.userID}
        userName={callData.userName}
        onCallEnd={handleCallEnd}
      />
    </div>
  );
};

export default VideoCallPage;
