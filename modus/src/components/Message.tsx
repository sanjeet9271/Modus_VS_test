import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-jsx';
import "./Message.css"

interface MessageProps {
  message: string;
  isBot: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isBot }) => {
  const isCode = isBot && message.startsWith('```') && message.endsWith('```');
  const codeContent = isCode ? message.slice(3, -3) : message;

  useEffect(() => {
    if (isCode) {
      Prism.highlightAll();
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
            <code className="language-tsx">{codeContent}</code>
          </pre>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
