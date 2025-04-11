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
  const [buttonText, setButtonText] = useState<string[]>(['Copy', 'Copy']);
  const [isFocused, setIsFocused] = useState(false);
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

  const handleCopy = (index: number) => {
    const contentToCopy = codeContents[index];
    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => {
        const newButtonText = [...buttonText];
        newButtonText[index] = 'Copied';
        setButtonText(newButtonText);
        setTimeout(() => {
          newButtonText[index] = 'Copy';
          setButtonText(newButtonText);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const getInitialsFromEmail = (email: string): string => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    const nameParts = namePart.split('_');
    const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    const secondNameInitial = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() : '';
    return secondNameInitial ? `${firstNameInitial}${secondNameInitial}` : firstNameInitial;
  };

  const isDefaultProfile = userinfo?.picture.includes('default_profile.png');
  const initials = userinfo ? getInitialsFromEmail(userinfo.email) : 'U';
  const username = userinfo?.email.split('@')[0] || 'User';


  return (
    <div
      ref={containerRef}
      className={`message__container ${
        isBot ? 'message__container--bot' : 'message__container--user'
      } ${isFocused ? 'focused' : ''}`} 
      onClick={() => setIsFocused(true)} 
    >
      <div className="message__avatar">
        {isBot ? (
          <img
            src={moduslogourl || 'https://avatars.githubusercontent.com/u/194470184?v=4&size=64'}
            alt="Bot Avatar"
          />
        ) : isDefaultProfile ? (
          <span className="initials-avatar">{initials}</span>
        ) : (
          <img
            src={userinfo?.picture || 'https://avatars.githubusercontent.com/u/194460184?v=4&size=64'}
            alt="User Avatar"
          />
        )}
        <div className="username">{isBot? "Modus Coder" : username}</div>
      </div>
      <div className="message__body">
        {isCode ? (
          <div>
            {codeContents.map((content, index) => {
              const language = agent === 'React' ? 'tsx' : index === 0 ? 'html' : 'typescript';
              return (
                <div key={index} className='code__container'>
                  <div className="code__header">
                    <div className="language-label">{language.toUpperCase()}</div>
                    <button
                      onClick={() => handleCopy(index)}
                      className="copy-icon"
                      data-tooltip-id="tooltip"
                      data-tooltip-content="Copy"
                      data-tooltip-place="top"
                    >
                      <i className="codicon codicon-copy"></i>
                    </button>
                  </div>
                  <pre>
                    <code
                      ref={(el) => {
                        codeRefs.current[index] = el;
                      }}
                      className={language}
                    >
                      {content}
                    </code>
                  </pre>
                </div>
              );
            })}
          </div>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
