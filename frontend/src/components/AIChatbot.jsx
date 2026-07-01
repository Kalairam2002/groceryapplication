import { useState, useRef, useEffect } from "react";
import axios from "axios";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I am your grocery assistant. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text) => {
    if (!isHttps) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (!isHttps) {
      alert("Voice input requires HTTPS. Please use the deployed version.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Sorry! Your browser does not support voice input. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ai/chat`,
        { query }
      );

      const aiMessage = { role: "ai", text: data.answer };
      setMessages((prev) => [...prev, aiMessage]);
      speakText(data.answer);

    } catch (error) {
      const errorMsg = "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "ai", text: errorMsg }]);
      speakText(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>

      {isOpen && (
        <div style={styles.chatBox}>

          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <span style={styles.headerIcon}>🤖</span>
              <div>
                <div style={styles.headerTitle}>Grocery AI Assistant</div>
                <div style={styles.headerStatus}>
                  {isSpeaking ? "🔊 Speaking..." : isListening ? "🎤 Listening..." : "● Online"}
                </div>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => {
              setIsOpen(false);
              stopSpeaking();
            }}>✕</button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, index) => (
              <div key={index} style={styles.msgWrapper(msg.role)}>
                <div style={styles.msg(msg.role)}>
                  {msg.text}
                </div>
                {isHttps && (
                  <button
                    style={styles.speakBtn}
                    onClick={() => speakText(msg.text)}
                    title="Click to hear this message"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={styles.msgWrapper("ai")}>
                <div style={styles.msg("ai")}>
                  <span style={styles.typing}>●●●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
            />

            {isHttps && (
              <button
                style={styles.micBtn(isListening)}
                onClick={isListening ? stopListening : startListening}
                title={isListening ? "Stop listening" : "Click to speak"}
              >
                🎤
              </button>
            )}

            <button style={styles.sendBtn} onClick={handleSend}>
              Send
            </button>
          </div>

          {isSpeaking && (
            <div style={styles.stopBar}>
              <button style={styles.stopBtn} onClick={stopSpeaking}>
                ⏹ Stop Speaking
              </button>
            </div>
          )}

        </div>
      )}

      <button
        style={styles.floatBtn}
        onClick={() => {
          setIsOpen(!isOpen);
          stopSpeaking();
        }}
      >
        {isOpen ? "✕" : "🤖"}
      </button>

    </div>
  );
};

const styles = {
  wrapper: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  },
  floatBtn: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#4CAF50",
    color: "#fff",
    fontSize: "26px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatBox: {
    width: "350px",
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#4CAF50",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerIcon: {
    fontSize: "24px",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "500",
    fontSize: "14px",
    fontFamily: "sans-serif",
  },
  headerStatus: {
    color: "#e8f5e9",
    fontSize: "11px",
    fontFamily: "sans-serif",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  messages: {
    padding: "14px",
    height: "320px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#f9f9f9",
  },
  msgWrapper: (role) => ({
    display: "flex",
    alignItems: "flex-end",
    gap: "4px",
    justifyContent: role === "user" ? "flex-end" : "flex-start",
  }),
  msg: (role) => ({
    maxWidth: "75%",
    padding: "9px 13px",
    borderRadius: "12px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    lineHeight: "1.5",
    background: role === "user" ? "#4CAF50" : "#fff",
    color: role === "user" ? "#fff" : "#333",
    border: role === "user" ? "none" : "1px solid #eee",
    borderBottomRightRadius: role === "user" ? "4px" : "12px",
    borderBottomLeftRadius: role === "ai" ? "4px" : "12px",
  }),
  speakBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px",
    opacity: "0.6",
  },
  typing: {
    fontSize: "18px",
    letterSpacing: "3px",
    color: "#999",
  },
  inputRow: {
    display: "flex",
    padding: "10px",
    gap: "6px",
    borderTop: "1px solid #eee",
    background: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "13px",
    outline: "none",
    fontFamily: "sans-serif",
  },
  micBtn: (isListening) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: isListening ? "#f44336" : "#e8f5e9",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  sendBtn: {
    padding: "8px 14px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "sans-serif",
  },
  stopBar: {
    padding: "6px 10px",
    background: "#fff3e0",
    borderTop: "1px solid #ffe0b2",
    display: "flex",
    justifyContent: "center",
  },
  stopBtn: {
    background: "#ff9800",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "4px 12px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "sans-serif",
  },
};

export default AIChatbot;