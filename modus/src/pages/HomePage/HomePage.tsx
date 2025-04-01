import { useAuth } from "@trimble-oss/trimble-id-react";
import Banner from "../../components/Banner";
import Message from "../../components/Message";
import Footer from "../../components/Footer";
import { useState, useEffect } from "react";

interface MessageData {
  text: string;
  isBot: boolean;
}

const HomePage = () => {
  const [messages, setMessages] = useState<MessageData[]>([]); // Array of messages
  const [accessToken, setAccessToken] = useState<string | null>(null); // State to store access token

  const { user, getAccessTokenSilently, logout } = useAuth(); // Added logout

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        setAccessToken(token);
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };

    fetchAccessToken();
  }, [getAccessTokenSilently]); // Dependency array ensures this runs once

  const handleSendMessage = (newMessage: MessageData) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]); // Add new message to the array
  };

  const handleLogout = async () => {
    try {
      await logout(); // Logs the user out
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  console.log("User:", user?.name);

  return (
    <div className="main__container">
      <div className="header">
        <h1>Welcome, {user?.name || "User"}</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      {messages.length === 0 ? (
        <Banner />
      ) : (
        <div className="message__chatbox">
          {messages.map((msg, index) => (
            <Message key={index} message={msg.text} isBot={msg.isBot} /> // Pass isBot prop
          ))}
        </div>
      )}
      <Footer onSendMessage={handleSendMessage} access_token={accessToken || ""} />
    </div>
  );
};

export default HomePage;