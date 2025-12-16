import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export default function VisioRoom() {
  const { roomName } = useParams();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      alert("Jitsi API non chargée !");
      return;
    }

    const domain = "meet.jit.si";
    const options = {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: 600,
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
      configOverwrite: { disableDeepLinking: true },
      userInfo: { displayName: localStorage.getItem("userName") || "Invité" },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    return () => api.dispose();
  }, [roomName]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-3">🎥 Session Visio : {roomName}</h2>
      <div ref={containerRef} className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg"></div>
    </div>
  );
}
