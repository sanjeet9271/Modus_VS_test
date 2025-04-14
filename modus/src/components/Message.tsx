import React, { useEffect, useRef, useState, useMemo } from 'react';
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

const DEFAULT_BOT_AVATAR = 'https://avatars.githubusercontent.com/u/194470184?v=4&size=64';

const Message: React.FC<MessageProps> = ({ message, isBot, agent, userinfo }) => {
  const codeRefs = useRef<(HTMLElement | null)[]>([]);
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

  // Use useMemo to memoize codeContents
  const codeContents = useMemo(() => {
    if (isBot) {
      return extractCodeBlocks(message, agent === 'React' ? ['tsx'] : ['html', 'typescript']);
    }
    return [];
  }, [message, isBot, agent]);

  const isCode = useMemo(() => codeContents.some((content) => content !== ''), [codeContents]);

  useEffect(() => {
    codeRefs.current.forEach((ref) => {
      if (ref) {
        hljs.highlightElement(ref);
      }
    });
  }, [codeContents]);

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
    const buttonElement = document.querySelectorAll('.copy-icon')[index];

    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => {
        if (buttonElement) {
          buttonElement.setAttribute('data-tooltip-content', 'Copied');
          setTimeout(() => {
            buttonElement.setAttribute('data-tooltip-content', 'Copy');
          }, 2000); // Reset to "Copy" after 2 seconds
        }
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please try again.');
      });
  };

  const getInitialsFromEmail = (email: string): string => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    const nameParts = namePart.split('_');
    const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    const secondNameInitial = nameParts[1]?.charAt(0).toUpperCase() || '';
    return `${firstNameInitial}${secondNameInitial}`.trim();
  };

  const initials = userinfo ? getInitialsFromEmail(userinfo.email) : 'U';
  const username = userinfo?.email.split('@')[0] || 'User';

  return (
    <div
      ref={containerRef}
      className={`message__container ${isBot ? 'message__container--bot' : 'message__container--user'} ${isFocused ? 'focused' : ''}`}
      onClick={() => setIsFocused(true)}
      role="region"
      aria-label={isBot ? 'Bot message' : 'User message'}
    >
      <div className="message__avatar">
        {isBot ? (
          <img src={moduslogourl || DEFAULT_BOT_AVATAR} alt="Bot Avatar" />
        ) : (
          <span className="initials-avatar">{initials}</span>
        )}
        <div className="username">{isBot ? 'Modus Coder' : username}</div>
      </div>
      <div className="message__body">
        {isCode ? (
          codeContents.map((content, index) => (
            <div key={index} className="code__container">
              <div className="code__header">
                <div className="language-label">{(agent === 'React' ? 'tsx' : index === 0 ? 'html' : 'typescript').toUpperCase()}</div>
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
                  className={agent === 'React' ? 'tsx' : index === 0 ? 'html' : 'typescript'}
                >
                  {content}
                </code>
              </pre>
            </div>
          ))
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Message;