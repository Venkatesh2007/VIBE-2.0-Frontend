// import { generateUUID } from "three/src/math/MathUtils.js";
// import { Lipsync } from "wawa-lipsync";
// import { create } from "zustand";

// const useChatbot = create((set, get) => ({
//   loaded: false,
//   setAppLoaded: () => set({ loaded: true }),
//   audioPlayer: null,
//   lipsyncManager: null,
//   setupAudioPlayer: () => {
//     if (typeof Audio === "undefined") {
//       return; // Audio API is not supported in this environment (SSR)
//     }
//     const audioPlayer = new Audio();
//     audioPlayer.crossOrigin = "anonymous"; // Ensure CORS is handled
//     audioPlayer.preload = "auto"; // Preload audio for better performance

//     const lipsyncManager = new Lipsync({});
//     let lipsyncManagerInitialized = false;

//     audioPlayer.onerror = (error) => {
//       console.error("Audio playback error:", error);
//     };

//     audioPlayer.onplaying = () => {
//       if (!lipsyncManagerInitialized) {
//         lipsyncManager.connectAudio(audioPlayer);
//         lipsyncManagerInitialized = true;
//       }
//       set({ status: "playing" });
//     };
//     audioPlayer.onended = () => {
//       set({ status: "Idle" });
//     };
//     set({ audioPlayer, lipsyncManager });
//   },

//   playAudio: (url) => {
//     const audioPlayer = get().audioPlayer;
//     if (!audioPlayer) {
//       console.warn("Audio player is not set up yet.");
//       return;
//     }
//     audioPlayer.src = url;
//     audioPlayer.play();
//   },

//   status: "Idle",
//   messages: [],
//   sessionId: generateUUID(),

//   sendMessage: async (message) => {
//     set((state) => ({
//       messages: [...state.messages, { text: message, sender: "user" }],
//       status: "loading",
//     }));

//     try {
//       const data = await fetch(
//         `http://localhost:3000/chat?message=${encodeURIComponent(message)}&sessionId=${encodeURIComponent(get().sessionId)}`
//       );

//       const result = await data.json();

//       // 1. Parse the stringified "output" field
//       const parsedOutput = JSON.parse(result.output);
//       const botMessages = parsedOutput.messages; // This is the array of {text, facialExpression, animation}

//       // 2. Process each message segment
//       for (const msg of botMessages) {
//         // Add message to chat UI
//         set((state) => ({
//           messages: [...state.messages, {
//             text: msg.text,
//             sender: "bot",
//             facialExpression: msg.facialExpression,
//             animation: msg.animation
//           }],
//         }));

//         // 3. Play audio and wait for it to finish before moving to the next segment
//         // (Optional: If you want them to speak one after another)
//         await new Promise((resolve) => {
//           const audioUrl = `http://localhost:3000/tts?message=${encodeURIComponent(msg.text)}`;
//           const player = get().audioPlayer;

//           player.src = audioUrl;
//           player.onended = resolve; // Move to next message when this audio finishes
//           player.play();
//         });
//       }

//       set({ status: "Idle" });
//       const player = get().audioPlayer;
//       if (player) {
//         player.onended = () => {
//           set({ status: "Idle" });
//         };
//       }

//     } catch (error) {
//       console.error("Error processing message:", error);
//       set({ status: "Idle" });
//     }
//   },
// }));

// useChatbot.getState().setupAudioPlayer();

// export default useChatbot;


import { generateUUID } from "three/src/math/MathUtils.js";
import { Lipsync } from "wawa-lipsync";
import { create } from "zustand";

// --- Command Actions from your previous code ---
const commandActions = {
  openYouTube: (params) => window.open(params?.query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(params.query)}` : "https://www.youtube.com", "_blank"),
  playmusic: (params) => window.open(params?.query ? `https://open.spotify.com/search/${encodeURIComponent(params.query)}` : "https://open.spotify.com", "_blank"),
  openGoogle: (params) => window.open(params?.query ? `https://www.google.com/search?q=${encodeURIComponent(params.query)}` : "https://www.google.com", "_blank"),
  openai: (params) => {
    const platform = params?.platform || "chatgpt";
    const urls = { chatgpt: "https://chat.openai.com", gemini: "https://gemini.google.com" };
    window.open(urls[platform] || "https://chat.openai.com", "_blank");
  },
  sendmail: (params) => window.open(`mailto:${params?.recipient || ''}?subject=${encodeURIComponent(params?.subject || '')}`, "_blank"),
  openinsta: () => window.open("https://www.instagram.com", "_blank"),
  openWhatsApp: () => window.open("https://web.whatsapp.com", "_blank"),
  opentwitter: () => window.open("https://x.com/", "_blank")
};

const useChatbot = create((set, get) => ({
  loaded: false,
  setAppLoaded: () => set({ loaded: true }),
  audioPlayer: null,
  lipsyncManager: null,
  
  // Camera & VIP states (to support your UI)
  isVIP: false,
  cameraZoomed: false,
  toggleVIPMode: () => set((state) => ({ isVIP: !state.isVIP })),
  setCameraZoomed: (val) => set({ cameraZoomed: val }),

  setupAudioPlayer: () => {
    if (typeof Audio === "undefined") return;
    const audioPlayer = new Audio();
    audioPlayer.crossOrigin = "anonymous";
    audioPlayer.preload = "auto";

    const lipsyncManager = new Lipsync({});
    let lipsyncManagerInitialized = false;

    audioPlayer.onerror = (error) => console.error("Audio playback error:", error);
    audioPlayer.onplaying = () => {
      if (!lipsyncManagerInitialized) {
        lipsyncManager.connectAudio(audioPlayer);
        lipsyncManagerInitialized = true;
      }
      set({ status: "playing" });
    };
    audioPlayer.onended = () => set({ status: "Idle" });
    set({ audioPlayer, lipsyncManager });
  },

  playAudio: (url) => {
    const audioPlayer = get().audioPlayer;
    if (!audioPlayer) return;
    audioPlayer.src = url;
    audioPlayer.play();
  },

  status: "Idle",
  messages: [],
  sessionId: generateUUID(),

  sendMessage: async (message) => {
    // Determine the prompt based on VIP mode
    const vipPrompt = "Note: You are addressing a highly esteemed and distinguished guest... ";
    const normalPrompt = "respond in a fun, caring, and engaging way... ";
    const activePrompt = get().isVIP ? vipPrompt : normalPrompt;
    
    // Construct the enriched message
    const fullMessage = `${activePrompt} ${message} NOTE:*Always reply in JSON objects with 3 messages.*`;

    set((state) => ({
      messages: [...state.messages, { text: message, sender: "user" }],
      status: "loading",
    }));

    try {
      const data = await fetch(
        `http://localhost:3000/chat?message=${encodeURIComponent(fullMessage)}&sessionId=${encodeURIComponent(get().sessionId)}`
      );

      const result = await data.json();
      const parsedOutput = JSON.parse(result.output);
      
      // --- NEW: Command Execution Logic ---
      if (parsedOutput.isCommand && parsedOutput.command && commandActions[parsedOutput.command]) {
        // Execute the command (e.g., open YouTube) using params from the JSON
        commandActions[parsedOutput.command](parsedOutput.params);
      }
      // -------------------------------------

      const botMessages = parsedOutput.messages;

      for (const msg of botMessages) {
        set((state) => ({
          messages: [...state.messages, {
            text: msg.text,
            sender: "bot",
            facialExpression: msg.facialExpression,
            animation: msg.animation
          }],
        }));

        await new Promise((resolve) => {
          const audioUrl = `http://localhost:3000/tts?message=${encodeURIComponent(msg.text)}`;
          const player = get().audioPlayer;
          player.src = audioUrl;
          player.onended = resolve;
          player.play();
        });
      }

      set({ status: "Idle" });
    } catch (error) {
      console.error("Error processing message:", error);
      set({ status: "Idle" });
    }
  },
}));

useChatbot.getState().setupAudioPlayer();
export default useChatbot;