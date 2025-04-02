import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // You can choose any style you prefer
import './Message.css';

interface MessageProps {
  message: string;
  isBot: boolean;
  agent: string;
}

const Message: React.FC<MessageProps> = ({ message, isBot, agent }) => {
  const codeRefs = useRef<(HTMLElement | null)[]>([]);
  const [buttonText, setButtonText] = useState('Copy');

  const extractCodeBlocks = (input: string, languages: string[]): string[] => {
    return languages.map((language) => {
      const startMarker = `\`\`\`${language}`;
      const endMarker = `\`\`\``;
      const markerIndex = input.indexOf(startMarker);
      if (markerIndex === -1) {
        return '';
      }
      const startIndex = markerIndex + startMarker.length;
      const endIndex = input.indexOf(endMarker, startIndex);
      if (endIndex < 0) {
        return '';
      }
      return input.substring(startIndex, endIndex).trim();
    });
  };


  const codeContents = isBot
    ? extractCodeBlocks(message, agent === 'React' ? ['tsx'] : ['html', 'typescript'])
    : [];

  const isCode = codeContents.some((content) => content !== '');

  useEffect(() => {
    if (isCode) {
      codeRefs.current.forEach((ref) => {
        if (ref) {
          hljs.highlightElement(ref);
        }
      });
    }
  }, [isCode]);

  const handleCopy = () => {
    const allCode = codeContents.join('\n\n');
    navigator.clipboard
      .writeText(allCode)
      .then(() => {
        setButtonText('Copied');
        setTimeout(() => setButtonText('Copy'), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

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
          <div>
            {codeContents.map((content, index) => (
              <pre key={index}>
                <code
                  ref={(el) => {
                    codeRefs.current[index] = el;
                  }}
                  className={agent === 'React' ? 'tsx' : index === 0 ? 'html' : 'typescript'}
                >
                  {content}
                </code>
              </pre>
            ))}
            <button onClick={handleCopy} className="copy-button">
              {buttonText}
            </button>
          </div>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
