import { useEffect, useState,useRef } from 'react';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Message from './components/Message';
import "./App.css";

interface MessageData {
  text: string;
  isBot: boolean;
  agent: string;
}

interface UserInfo {
  email: string;
  picture: string;
}

const App = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [accessToken, setAccessToken] = useState<string | null | undefined>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const chatboxRef = useRef<HTMLDivElement | null>(null); 

  useEffect(() => {
    const token = document.getElementById('root')?.getAttribute('accessToken');
    // const token =  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lkLnRyaW1ibGUuY29tIiwiZXhwIjoxNzQ0MTA0NDk4LCJuYmYiOjE3NDQxMDA4OTgsImlhdCI6MTc0NDEwMDg5OCwianRpIjoiNDcwMTNjNWM1MGIwNGMwYmEyNDRhNjEwYzk2MjkwYzkiLCJqd3RfdmVyIjoyLCJzdWIiOiJmZTE5MWIxNy0zNWZlLTQwZTItYmYyNy05NTkwYjE0ZjZmZjMiLCJpZGVudGl0eV90eXBlIjoidXNlciIsImFtciI6WyJmZWRlcmF0ZWQiLCJva3RhX3RyaW1ibGUiLCJtZmEiXSwiYXV0aF90aW1lIjoxNzQ0MDkzODQyLCJhenAiOiJkOWQyMWVkMC0xNGU3LTQ4ODctYmE0Yi1kMTJhYzJmMmY0NjYiLCJhY2NvdW50X2lkIjoidHJpbWJsZS1wbGFjZWhvbGRlci1vZi1lbXBsb3llZXMiLCJhdWQiOlsiZDlkMjFlZDAtMTRlNy00ODg3LWJhNGItZDEyYWMyZjJmNDY2Il0sInNjb3BlIjoiVERBQVMiLCJkYXRhX3JlZ2lvbiI6InVzIn0.SiKx8IbQUIpvI6TDDh9wp6Z4V1fUclGIUK24PHAY6fMZZuZ_dzSRg1uAYESrl5jeXOLzKUx9tJHi4XRylu1m9YS6FK254676_qADipY_PX6yTFuo3bScDVtZk-ckserxo2CPgRCVA19_xzOQsnrzxuCdJzTNLTeJ4OLKalcVBdtDlTo24TRNJr24Od1EGv27FgPXTwfWv1PzD1ijJBW4t8-ikQKpllD2gyWAoUhZfY13TL2SxoPsRn33KZKVAzLm5Mkeg85kQd27m3lrJVkAJ7vAcMkEBnLh2uf5ihh6ERCDZhMyVTlhPnEcX8ePJ7ukk2p8h-zsZDD39XFnLK1ilA";
    setAccessToken(token);
    console.log("token is", token);
  }, []);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTo({
        top: chatboxRef.current.scrollHeight,
        behavior: 'smooth', 
      });
    }
  }, [messages]);

  useEffect(() => {
    if (accessToken != 'NULL' && accessToken) {
      fetchUserInfo(accessToken);
    }
  }, [accessToken]);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('https://id.trimble.com/oauth/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      const emailName = data.email.split('@')[0]; 
      setUserInfo({ email: emailName, picture: data.picture });
      console.log("User Info:", data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleSendMessage = (newMessage: MessageData, action: 'add' | 'empty') => {
    if (action === 'add') {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } else if (action === 'empty') {
      setMessages([]);
    }
  };
  

  return (
    <div id='main' className="main__container">
      {messages.length === 0 ? (
        <Banner />
      ) : (
        <div className="message__chatbox" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <Message key={index} message={msg.text} isBot={msg.isBot} agent={msg.agent} userinfo={userInfo}/>
          ))}
        </div>
      )}
      <Footer onSendMessage={handleSendMessage} access_token={accessToken || ""} />
    </div>
  );
};

export default App;
