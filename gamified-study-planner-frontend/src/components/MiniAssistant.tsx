import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const MiniAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I’m your Study Buddy. Need help with anything?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Oops! Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-80 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
              <p className="font-semibold">🎓 Study Buddy</p>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-80 text-sm">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.sender === "bot" ? "bg-gray-100 text-left" : "bg-indigo-100 ml-auto text-right"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && <div className="text-gray-400">Typing...</div>}
            </div>
            <div className="p-3 border-t flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button onClick={sendMessage} size="sm" disabled={loading}>
                Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MiniAssistant;