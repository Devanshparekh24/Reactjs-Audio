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
  MessageSquare,
  Camera,
  CameraOff,
} from "lucide-react";
// import Metered from "@metered/video-sdk";

const Meeting = () => {
  const [meeting, setMeeting] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLeft, setIsLeft] = useState(false);

  // Timer
  useEffect(() => {
    let timer;
    if (isMeetingActive) {
      timer = setInterval(() => {
        setMeetingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMeetingActive]);

  useEffect(() => {
    if (!meeting) return;

    const handleParticipantJoined = (participantInfo) => {
      setParticipants((prev) => [...prev, participantInfo]);
    };

    const handleParticipantLeft = (participantInfo) => {
      setParticipants((prev) =>
        prev.filter((p) => p.id !== participantInfo.id)
      );
    };

    meeting.on("participantJoined", handleParticipantJoined);
    meeting.on("participantLeft", handleParticipantLeft);

    return () => {
      meeting.off("participantJoined", handleParticipantJoined);
      meeting.off("participantLeft", handleParticipantLeft);
    };
  }, [meeting]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const joinMeeting = async () => {
    try {
      const newMeeting = new Metered.Meeting();
      await newMeeting.join({
        roomURL: "videosdk.metered.live/f6ydjtvg96",
        name: "Devansh",
      });

      await newMeeting.startAudio();
      setMeeting(newMeeting);
      setIsMeetingActive(true);
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };

  const handleToggleAudio = async() => {
    if (!meeting) return;
    try {
      if (isAudioMuted) {
        console.log("the Speaker or Audio off");
        
        await meeting.startAudio()

        
      } else {
        console.log("The speaker or audio on");
        
        await meeting.stopAudio()

      }
      setIsAudioMuted(!isAudioMuted);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const handleToggleMic = async () => {
    if (!meeting) return;
    try {
      if (isMicMuted) {
        console.log("mic on");
        await meeting.unmuteLocalAudio(); // Unmute the microphone
      } else {
        await meeting.muteLocalAudio(); // Mute the microphone
        console.log("mic off");
      }
      setIsMicMuted(!isMicMuted); // Update the state
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  };

  // Leave meeting function
  const leaveMeeting = async () => {
    try {
      if (meeting) {
        console.log("they left the meeting");
        setIsLeft(true);
        setIsMeetingActive(false);
        await meeting.leaveMeeting();
      }
    } catch (error) {
      console.error("Error leaving the meeting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Clock className="text-gray-600" />
                <span className="text-gray-600">
                  {formatDuration(meetingDuration)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="text-gray-600" />
                <span className="text-gray-600">{participants.length + 1}</span>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    <p className="text-center text-gray-700">
                      {participant.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border-t p-4">
              <div className="flex justify-center space-x-4">
                {/* mic-icon */}
                <button
                  onClick={handleToggleMic}
                  className={`p-3 rounded-full ${
                    isMicMuted
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  } hover:bg-gray-200`}
                >
                  {isMicMuted ? <MicOff /> : <Mic />}
                </button>
                {/* volume-icon */}
                <button
                  onClick={handleToggleAudio}
                  className={`p-3 rounded-full ${
                    isAudioMuted
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  } hover:bg-gray-200`}
                >
                  {isAudioMuted ? <VolumeX /> : <Volume2 />}
                </button>

                {/* Leave-icon */}
                {!isLeft ? (
                  <button
                    onClick={leaveMeeting}
                    className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <PhoneOff />
                  </button>
                ) : (
                  ""
                  // <h2>Thank you</h2>
                )}
              </div>
            </div>
          </div>
          {chatOpen && (
            <div className="w-80 bg-white border-l">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Meeting Chat</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto">
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
