import { useState, useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { FiImage, FiPaperclip, FiMic, FiSend } from 'react-icons/fi';

function AIAssistant() {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "You've overspent this month because you spent $200 on dining out and $150 on groceries. This is 20% higher than last month. You also made an unexpected purchase of $100 on Amazon. You can set a budget for these categories to better manage your spending."
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // TODO: Implement AI response logic
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        text: "I'm analyzing your spending patterns and will provide recommendations shortly..."
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Error processing message');
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="w-[512px] max-w-[512px] py-5">
          <h3 className="text-2xl font-bold text-center pb-2 pt-5">AI Assistant</h3>

          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-end gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${message.sender === 'ai' ? 'https://cdn.usegalileo.ai/sdxl10/557be0f8-e3a6-4b61-bf6e-b9242f1059b7.png' : user?.photoURL || 'https://ui-avatars.com/api/?name=' + user?.email})` }} />
                <div className="flex flex-1 flex-col gap-1 items-start">
                  <p className="text-[13px] text-slate-600">{message.sender === 'ai' ? 'AI Assistant' : 'You'}</p>
                  <p className="text-base rounded-xl px-4 py-3 bg-slate-100">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 h-12">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-l-xl border-none bg-slate-100 px-4 text-base focus:outline-none focus:ring-0"
                />
                <div className="flex items-center gap-2 bg-slate-100 px-4 rounded-r-xl">
                  <button className="p-1.5 text-slate-600 hover:text-slate-800">
                    <FiImage className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 text-slate-600 hover:text-slate-800">
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 text-slate-600 hover:text-slate-800">
                    <FiMic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing}
                    className="ml-2 flex items-center justify-center rounded-full h-8 px-4 bg-primary-600 text-white text-sm font-medium disabled:bg-slate-400"
                  >
                    <span className="hidden sm:block">Send</span>
                    <FiSend className="sm:hidden w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant; 