'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ChatBotProps {
  onReservationRequest?: (details: any) => void;
}

export default function ChatBot({ onReservationRequest }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! Welcome to Mutiara Hotel. I'm here to help you make a reservation. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reservationState, setReservationState] = useState({
    step: 0,
    data: {},
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const roomTypes = [
    { name: 'Superior', price: 250 },
    { name: 'Deluxe ', price: 360 },
    { name: 'Executive', price: 725 },
  ];

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const botResponse = async (userMessage: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = '';
    const lowerMessage = userMessage.toLowerCase();

    // Simple reservation flow
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('room')) {
      if (reservationState.step === 0) {
        response = "Great! I'd be happy to help you book a room. What type of room are you looking for?\n\n" +
                  roomTypes.map(room => `• ${room.name} - $${room.price}/night`).join('\n');
        setReservationState(prev => ({ ...prev, step: 1 }));
      }
    } else if (reservationState.step === 1) {
      const selectedRoom = roomTypes.find(room => 
        lowerMessage.includes(room.name.toLowerCase()) || 
        lowerMessage.includes(room.name.split(' ')[0].toLowerCase())
      );
      
      if (selectedRoom) {
        setReservationState(prev => ({ 
          ...prev, 
          step: 2, 
          data: { ...prev.data, roomType: selectedRoom.name, price: selectedRoom.price }
        }));
        response = `Perfect! You've selected the ${selectedRoom.name} at $${selectedRoom.price}/night. When would you like to check in? (Please provide a date in MM/DD/YYYY format)`;
      } else {
        response = "I didn't recognize that room type. Please choose from:\n" +
                  roomTypes.map(room => `• ${room.name} - $${room.price}/night`).join('\n');
      }
    } else if (reservationState.step === 2) {
      // Simple date validation
      if (lowerMessage.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
        setReservationState(prev => ({ 
          ...prev, 
          step: 3, 
          data: { ...prev.data, checkIn: userMessage }
        }));
        response = "Great! When would you like to check out? (Please provide a date in MM/DD/YYYY format)";
      } else {
        response = "Please provide a valid check-in date in MM/DD/YYYY format.";
      }
    } else if (reservationState.step === 3) {
      if (lowerMessage.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
        setReservationState(prev => ({ 
          ...prev, 
          step: 4, 
          data: { ...prev.data, checkOut: userMessage }
        }));
        response = "How many guests will be staying?";
      } else {
        response = "Please provide a valid check-out date in MM/DD/YYYY format.";
      }
    } else if (reservationState.step === 4) {
      const guests = parseInt(lowerMessage);
      if (guests && guests > 0) {
        const reservationData = { 
          ...reservationState.data, 
          guests,
          totalAmount: (reservationState.data as any).price * 3 // Simplified calculation
        };
        
        setReservationState({ step: 0, data: {} });
        response = `Perfect! Here's your reservation summary:
        
Room: ${(reservationData as any).roomType}
Check-in: ${(reservationData as any).checkIn}
Check-out: ${(reservationData as any).checkOut}
Guests: ${guests}
Total: $${(reservationData as any).totalAmount}

To complete your booking, please sign in or create an account. Would you like me to redirect you to the booking page?`;

        if (onReservationRequest) {
          onReservationRequest(reservationData);
        }
      } else {
        response = "Please provide a valid number of guests.";
      }
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = "Hello! Welcome to LuxuryStay Hotel. I can help you book a room, check our amenities, or answer any questions you might have. What would you like to know?";
    } else if (lowerMessage.includes('amenities') || lowerMessage.includes('facilities')) {
      response = "Our hotel offers amazing amenities including:\n• Free Wi-Fi\n• Swimming Pool\n• Fitness Center\n• Spa & Wellness Center\n• 24/7 Room Service\n• Restaurant & Bar\n• Business Center\n• Concierge Service";
    } else if (lowerMessage.includes('price') || lowerMessage.includes('rate')) {
      response = "Here are our room rates:\n" + roomTypes.map(room => `• ${room.name}: $${room.price}/night`).join('\n') + "\n\nWould you like to make a reservation?";
    } else {
      response = "I'm here to help with room bookings and hotel information. You can ask me about:\n• Making a reservation\n• Room types and prices\n• Hotel amenities\n• Check-in/check-out times\n\nWhat would you like to know?";
    }

    setIsTyping(false);
    addMessage(response, 'bot');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    addMessage(inputValue, 'user');
    const userMessage = inputValue;
    setInputValue('');
    
    await botResponse(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-yellow-600 hover:bg-yellow-700 shadow-lg ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-80 h-96 shadow-2xl border-yellow-200">
          <CardHeader className="bg-yellow-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Mutiara Assistant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-yellow-700 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%]`}>
                    {message.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-yellow-600" />
                      </div>
                    )}
                    <div
                      className={`p-2 rounded-lg text-sm whitespace-pre-line ${
                        message.sender === 'user'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.text}
                    </div>
                    {message.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-sm">
                      Typing...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t p-3">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-yellow-200 focus:border-yellow-400"
                />
                <Button 
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}