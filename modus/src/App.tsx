import { useEffect, useState, useRef } from 'react';
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

interface CustomWindow extends Window {
  messages: MessageData[];
  vscode: {
    postMessage: (message: { command: string; message: string }) => void;
  };
  accessToken: string;
}

declare const window: CustomWindow;

const USER_INFO_URL = process.env.REACT_APP_USER_INFO_URL || 'https://id.trimble.com/oauth/userinfo';

const App = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [accessToken, setAccessToken] = useState<string | null | undefined>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const chatboxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initialMessages = window.messages || [];
    setMessages(initialMessages);

    const token = window.accessToken || 'NULL';
    setAccessToken(token);
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
    if (accessToken && accessToken !== 'NULL') {
      fetchUserInfo(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    window.messages = messages;
    if (window.vscode) {
      window.vscode.postMessage({ command: 'updateMessages', message: JSON.stringify(messages) });
    }
  }, [messages]);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(USER_INFO_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      const emailName = data.email.split('@')[0];
      setUserInfo({ email: emailName, picture: data.picture });
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
    <div id="main" className="main__container" role="main">
      {messages.length === 0 ? (
        <Banner />
      ) : (
        <div className="message__chatbox" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <Message key={index} message={msg.text} isBot={msg.isBot} agent={msg.agent} userinfo={userInfo} />
          ))}
        </div>
      )}
      <Footer onSendMessage={handleSendMessage} messages={messages} />
    </div>
  );
};

export default App;