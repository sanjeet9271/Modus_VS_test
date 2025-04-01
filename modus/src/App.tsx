// App.tsx
import  { useEffect, useState } from 'react';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Message from './components/Message';

interface MessageData {
  text: string;
  isBot: boolean;
}



const App = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [accessToken, setAccessToken] = useState<string | null |undefined>(null);

  useEffect(() => {
      const token = document.getElementById('root')?.getAttribute('accessToken');
      setAccessToken(token);
      console.log("token is",token);
  }, []);
  

  const handleSendMessage = (newMessage: MessageData) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="main__container">
      {messages.length === 0 ? (
        <Banner />
      ) : (
        <div className="message__chatbox">
          {messages.map((msg, index) => (
            <Message key={index} message={msg.text} isBot={msg.isBot} />
          ))}
        </div>
      )}
      <Footer onSendMessage={handleSendMessage} access_token={accessToken || ""} />
    </div>
  );
};

export default App;
