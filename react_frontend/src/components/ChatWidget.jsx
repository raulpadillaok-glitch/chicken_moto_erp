import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Zap } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! Soy tu Asistente Inteligente. Toma un atajo o hazme una consulta precisa.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = ["Resumen", "Órdenes Activas", "Stock Bajo"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post('http://localhost:8000/api/v1/chatbot/', 
        { query: userMsg.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const botMsg = { sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Ups, perdí conexión con la base de datos central.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Pequeña función para permitir Markdown Básico (negrita) y Saltos de Línea
  const renderFormattedText = (text) => {
    const lines = text.split('\\n');
    return lines.map((line, idx) => {
      // Reemplaza **texto** con <strong>texto</strong>
      const parts = line.split(/(\\*\\*.*?\\*\\*)/g);
      return (
        <React.Fragment key={idx}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {idx !== lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="chat-fab animate-bounce-soft"
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)',
            border: 'none', cursor: 'pointer', zIndex: 9999, transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Zap size={30} fill="#fff" />
        </button>
      )}

      {/* Ventana de Chat Premium */}
      {isOpen && (
        <div 
          className="glass-card animate-fade-in"
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem',
            width: '380px', height: '550px',
            display: 'flex', flexDirection: 'column',
            zIndex: 9999, overflow: 'hidden', padding: 0,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg, #0ea5e9, #3b82f6)', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <div style={{ background: 'white', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
                <Bot size={22} color="#0ea5e9" />
              </div>
              ERP Copilot
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0.8}>
              <X size={22} />
            </button>
          </div>

          {/* Area de Mensajes */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className="animate-fade-in" style={{
                display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', gap: '0.5rem',
                alignItems: 'flex-end'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.sender === 'user' ? '#10b981' : '#0ea5e9', flexShrink: 0,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {msg.sender === 'user' ? <User size={18} color="#fff" /> : <Bot size={18} color="#fff" />}
                </div>
                <div style={{
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(30, 41, 59, 0.9)',
                  padding: '0.85rem 1rem', borderRadius: '16px',
                  borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                  maxWidth: '75%', fontSize: '0.95rem', color: msg.sender === 'user' ? '#fff' : '#e2e8f0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', lineHeight: '1.4'
                }}>
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} color="#fff" />
                </div>
                <div style={{ padding: '0.85rem 1rem', background: 'rgba(30, 41, 59, 0.9)', borderRadius: '16px', borderBottomLeftRadius: '4px', fontSize: '0.95rem', color: '#94a3b8' }}>
                  Escribiendo<span className="typing-dots">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }} className="hide-scrollbar">
            {quickReplies.map((reply, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSend(reply)}
                disabled={isTyping}
                style={{
                  background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)',
                  padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rrem', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s', opacity: isTyping ? 0.5 : 1
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(14, 165, 233, 0.3)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(14, 165, 233, 0.15)'}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{
            padding: '1rem', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', gap: '0.5rem'
          }}>
            <input 
              type="text" 
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              style={{
                flex: 1, padding: '0.85rem 1rem', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', borderRadius: '24px', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor='#0ea5e9'}
              onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
            />
            <button type="submit" disabled={isTyping || !input.trim()} style={{
              background: input.trim() ? '#0ea5e9' : 'rgba(255,255,255,0.1)', border: 'none', width: '45px', height: '45px', borderRadius: '50%',
              color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
              <Send size={18} style={{ transform: input.trim() ? 'translateX(2px)' : 'none' }} />
            </button>
          </form>
        </div>
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
        .typing-dots { animation: blink 1.4s infinite both; }
      `}</style>
    </>
  );
}
