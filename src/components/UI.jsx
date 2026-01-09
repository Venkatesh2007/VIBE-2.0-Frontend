import { motion } from "motion/react";
import { useState, useRef } from "react";
import { ImSpinner8 } from "react-icons/im";
import { IoSend, IoMicOutline, IoMic } from "react-icons/io5";
import { HiMagnifyingGlassPlus, HiMagnifyingGlassMinus } from "react-icons/hi2";
import { RiUserStarFill, RiUserStarLine } from "react-icons/ri";
import useChatbot from "../hooks/useChatbot";

export const UI = () => {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  
  // Zustand Store values
  const sendMessage = useChatbot((state) => state.sendMessage);
  const status = useChatbot((state) => state.status);
  const appLoaded = useChatbot((state) => state.loaded);
  
  // Camera & VIP states (assuming these exist in your useChatbot store 
  // or you can manage them locally if they only affect UI/Component props)
  // const [cameraZoomed, setCameraZoomed] = useState(false);
  // const [isVIP, setIsVIP] = useState(false);

  const { chat, loading, cameraZoomed, setCameraZoomed, message, isVIP, setIsVIP, toggleVIPMode } = useChatbot();

  const handleSend = (text = input) => {
    if (text.trim() && status !== "loading") {
      sendMessage(text.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <>
      {appLoaded && (
        <main className="fixed inset-0 pointer-events-none z-10 flex flex-col bg-radial from-transparent via-black/10 to-black/80">
          
          {/* Top/Side Controls (From Previous UI) */}
          <div className="absolute top-10 right-10 flex flex-col gap-4 pointer-events-auto">
            <button
              onClick={() => setCameraZoomed(!cameraZoomed)}
              className="bg-white/15 backdrop-blur-md border border-white/30 p-4 rounded-2xl text-white hover:bg-white/25 transition-all shadow-lg"
            >
              {cameraZoomed ? <HiMagnifyingGlassMinus size={24} /> : <HiMagnifyingGlassPlus size={24} />}
            </button>
            
            <button
              onClick={() => setIsVIP(!isVIP)}
              className="bg-white/15 backdrop-blur-md border border-white/30 p-4 rounded-2xl text-white hover:bg-white/25 transition-all shadow-lg"
            >
              {isVIP ? <RiUserStarFill size={24} className="text-yellow-400" /> : <RiUserStarLine size={24} />}
            </button>
          </div>

          <div className="w-full py-10">
            {/* Header section remains the same */}
          </div>

          {/* Bottom Controls */}
          <motion.div
            className="mt-auto pb-12 flex flex-col gap-4 items-center pointer-events-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: status === "loading" ? 0 : 1,
              y: status === "loading" ? 50 : 0,
            }}
            transition={{ delay: status === "loading" ? 0 : 0.5 }}
          >
            <div className="flex gap-2 max-w-md w-full px-4">
              <div className="relative flex-1">
                <input
                  autoFocus
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={listening ? "Listening..." : "Type a message..."}
                  className="w-full px-5 py-3 pr-12 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all shadow-lg"
                />
                
                <button
                  onClick={handleSend}
                  disabled={status === "loading"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
                >
                  <IoSend className="w-5 h-5" />
                </button>
              </div>

              {/* Speech Recognition Button */}
              <button
                onClick={startListening}
                disabled={status === "loading"}
                className={`p-4 rounded-2xl backdrop-blur-md border border-white/30 transition-all shadow-lg ${
                  listening ? "bg-red-500/50 text-white animate-pulse" : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {listening ? <IoMic size={24} /> : <IoMicOutline size={24} />}
              </button>
            </div>
          </motion.div>
        </main>
      )}
    </>
  );
};