import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; 
import './Message.css';

interface UserInfo {
  email: string;
  picture: string;
}

interface MessageProps {
  message: string;
  isBot: boolean;
  agent: string;
  userinfo: UserInfo | null;
}

const Message: React.FC<MessageProps> = ({ message, isBot, agent, userinfo }) => {
  const codeRefs = useRef<(HTMLElement | null)[]>([]);
  const [buttonText, setButtonText] = useState('Copy');
  const [isFocused, setIsFocused] = useState(false); // New state for focus
  const containerRef = useRef<HTMLDivElement | null>(null);

  const moduslogourl = document.getElementById('root')?.getAttribute('moduslogo');

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      ref={containerRef}
      className={`message__container ${
        isBot ? 'message__container--bot' : 'message__container--user'
      } ${isFocused ? 'focused' : ''}`} // Add focused class conditionally
      onClick={() => setIsFocused(true)} // Set focus state on click
    >
      <div className="message__avatar">
        <img
          src={
            isBot
              ? moduslogourl || 'https://avatars.githubusercontent.com/u/194470184?v=4&size=64'
              : userinfo?.picture || 'https://avatars.githubusercontent.com/u/194460184?v=4&size=64'
          }
          alt={isBot ? 'Bot Avatar' : 'User Avatar'}
        />
        <div className="username">
          {isBot ? 'Modus Coder' : userinfo ? userinfo.email : 'Unknown User'}
        </div>
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
