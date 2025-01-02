import React, { useState, useEffect } from "react";
import {
  Users,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Clock,
  Share,
  MessageSquare
} from "lucide-react";

const Meeting = () => {
  const [meeting, setMeeting] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (isMeetingActive) {
      timer = setInterval(() => {
        setMeetingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMeetingActive]);

  useEffect(() => {
    if (!meeting) return;

    const handleParticipantJoined = (participantInfo) => {
      setParticipants(prev => [...prev, participantInfo]);
    };

    const handleParticipantLeft = (participantInfo) => {
      setParticipants(prev =>
        prev.filter(p => p.id !== participantInfo.id)
      );
    };

    const handleRemoteTrackStarted = (remoteTrackItem) => {
      try {
        const remoteTrack = remoteTrackItem.track;
        const remoteStream = new MediaStream([remoteTrack]);
        const remoteAudio = document.getElementById("remoteAudio");
        if (remoteAudio) {
          remoteAudio.srcObject = remoteStream;
          remoteAudio.play().catch(error => {
            console.error("Error playing audio:", error);
          });
        }
      } catch (error) {
        console.error("Error handling remote track:", error);
      }
    };

    meeting.on("participantJoined", handleParticipantJoined);
    meeting.on("participantLeft", handleParticipantLeft);
    meeting.on("remoteTrackStarted", handleRemoteTrackStarted);

    return () => {
      meeting.off("participantJoined", handleParticipantJoined);
      meeting.off("participantLeft", handleParticipantLeft);
      meeting.off("remoteTrackStarted", handleRemoteTrackStarted);
    };
  }, [meeting]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const joinMeeting = async () => {
    try {
      const newMeeting = new Metered.Meeting();
      await newMeeting.join({
        roomURL: "videosdk.metered.live/f6ydjtvg96",
        name: "Devansh"
      });

      await newMeeting.startAudio();
      setMeeting(newMeeting);
      setIsMeetingActive(true);
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };

  const handleToggleAudio = () => {
    if (!meeting) return;
    try {
      if (isAudioMuted) {
        meeting.unmuteAudioOutput();
      } else {
        meeting.muteAudioOutput();
      }
      setIsAudioMuted(!isAudioMuted);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const handleToggleMic = () => {
    if (!meeting) return;
    try {
      if (isMicMuted) {
        meeting.unmuteMicrophone();
      } else {
        meeting.muteMicrophone();
      }
      setIsMicMuted(!isMicMuted);
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  };

  const leaveMeeting = () => {
    if (meeting) {
      meeting.leave();
    }
    setIsMeetingActive(false);
    setMeeting(null);
    setParticipants([]);
    setMeetingDuration(0);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <audio id="remoteAudio" autoPlay />

      {!isMeetingActive ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Meeting Room</h1>
            <p className="text-gray-600">Room ID: f6ydjtvg96</p>
            <button
              onClick={joinMeeting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Join Meeting
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-screen">
          {/* Main meeting area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Clock className="text-gray-600" />
                <span className="text-gray-600">{formatDuration(meetingDuration)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="text-gray-600" />
                <span className="text-gray-600">{participants.length + 1}</span>
              </div>
            </div>

            {/* Meeting content */}
            <div className="flex-1 p-4 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Participant cards */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="w-full aspect-video bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl text-gray-600">You</span>
                  </div>
                  <p className="text-center text-gray-700">You (Host)</p>
                </div>
                {participants.map((participant, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <div className="w-full aspect-video bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-2xl text-gray-600">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-center text-gray-700">{participant.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white border-t p-4">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleToggleMic}
                  className={`p-3 rounded-full ${isMicMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200`}
                >
                  {isMicMuted ? <MicOff /> : <Mic />}
                </button>
                <button
                  onClick={handleToggleAudio}
                  className={`p-3 rounded-full ${isAudioMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200`}
                >
                  {isAudioMuted ? <VolumeX /> : <Volume2 />}
                </button>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <MessageSquare />
                </button>
                <button
                  className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Share />
                </button>
                <button
                  onClick={leaveMeeting}
                  className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <PhoneOff />
                </button>
              </div>
            </div>
          </div>

          {/* Chat sidebar */}
          {chatOpen && (
            <div className="w-80 bg-white border-l">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Meeting Chat</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Chat messages would go here */}
                  <p className="text-gray-500 text-center">No messages yet</p>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Meeting;