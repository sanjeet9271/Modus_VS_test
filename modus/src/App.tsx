import './App.css';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Message from './components/Message';
import { useState } from 'react';

interface MessageData {
  text: string;
  isBot: boolean;
}

function App() {
  const [messages, setMessages] = useState<MessageData[]>([]); // Array of messages

  const handleSendMessage = (newMessage: MessageData) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]); // Add new message to the array
  };

  return (
    <>
      <div className="main__container">
        {messages.length === 0 ? (
          <Banner />
        ) : (
          <div className="message__chatbox">
            {messages.map((msg, index) => (
              <Message key={index} message={msg.text} isBot={msg.isBot} /> // Pass isBot prop
            ))}
          </div>
        )}
        <Footer onSendMessage={handleSendMessage} />
      </div>
    </>
  );
}

export default App;