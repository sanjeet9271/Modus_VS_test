import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // You can choose any style you prefer
import './Message.css';

interface MessageProps {
  message: string;
  isBot: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isBot }) => {
  const codeRef = useRef<HTMLElement>(null);
  const isCode = isBot && message.trim().startsWith('```tsx') && message.trim().endsWith('```');
  const codeContent = isCode ? message.trim().slice(6, -3).trim() : message;

  useEffect(() => {
    if (isCode && codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [isCode]);

  return (
    <div
      className={`message__container ${
        isBot ? 'message__container--bot' : 'message__container--user'
      }`}
    >
      <div className="message__avatar">
        <img
          src={
            isBot
              ? 'https://avatars.githubusercontent.com/u/194470184?v=4&size=64'
              : 'https://avatars.githubusercontent.com/u/194460184?v=4&size=64'
          }
          alt={isBot ? 'Bot Avatar' : 'User Avatar'}
        />
        <div className="username">Sanjeet9271</div>
      </div>
      <div className="message__body">
        {isCode ? (
          <pre>
            <code ref={codeRef} className="tsx">{codeContent}</code>
          </pre>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
