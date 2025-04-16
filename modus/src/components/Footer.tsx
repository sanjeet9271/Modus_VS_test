import React, { useLayoutEffect, useState,useEffect,useRef, useMemo} from 'react';
import "./Footer.css";
import { AgentService } from './AgentService';
import react_1 from "../assets/react_1.svg";
import angularLogo from "../assets/Angular_Logo.png";
import { v4 as uuidv4 } from 'uuid';
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";

const MODELS = {
  REACT: 'React',
  ANGULAR: 'Angular',
};

interface FooterProps {
  onSendMessage: (message: { text: string; isBot: boolean; agent: string }, action: 'add' | 'empty') => void;
  messages: { text: string; isBot: boolean; agent: string }[];
}

const Footer: React.FC<FooterProps> = ({ onSendMessage, messages }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS.REACT);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInputValue, setFileInputValue] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [progress, setProgress] = useState(0);

  const agentService = new AgentService();
  const react_sessionId = useMemo(() => uuidv4(), []);
  const angular_sessionId = useMemo(() => uuidv4(), []);
  const sessionId = selectedModel === MODELS.REACT ? react_sessionId : angular_sessionId;
  const isAccessTokenInvalid = !window.accessToken || window.accessToken === 'NULL';
  // const isAccessTokenInvalid = false;

  const reactUri = document.getElementById('root')?.getAttribute('data-image-uri') || react_1 || undefined;
  const angularUri = document.getElementById('root')?.getAttribute('angularLogo') || angularLogo || undefined;


  useLayoutEffect(() => {
    const field = textareaRef.current;
    if (field) {
      const maxHeight = 200;
      field.style.height = 'inherit'; // Reset height to calculate the new height
      const computed = window.getComputedStyle(field);
      const height =
        parseInt(computed.getPropertyValue('border-top-width'), 10) +
        parseInt(computed.getPropertyValue('padding-top'), 10) +
        field.scrollHeight +
        parseInt(computed.getPropertyValue('padding-bottom'), 10) +
        parseInt(computed.getPropertyValue('border-bottom-width'), 10);
  
      field.style.height = Math.min(height, maxHeight) + 'px';
      field.style.overflowY = height > maxHeight ? 'auto' : 'hidden';
  
      setIsOverflowing(height > maxHeight);
  
      const wrapper = wrapperRef.current;
      const container = containerRef.current;
      const chatbox = document.querySelector('.message__chatbox') as HTMLElement;
  
      if (wrapper && container) {
        wrapper.style.height = `${container.offsetHeight + 18}px`;
      }
  
      if (container && chatbox) {
        const footerHeight = container.offsetHeight + 18;
        chatbox.style.height = `calc(100vh - ${footerHeight}px)`;
        chatbox.style.overflowY = 'auto';
      }
    }
  }, [inputValue, fileInputValue, messages]);
  

  const updateProgress = (value: number) => {
    setProgress(value);

    if (value === 100) {
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  };

  const checkTokenAndExecute = async (callback: () => Promise<void>) => {
    if (window.checkTokenValidity) {
      const isValid = await window.checkTokenValidity();
      if (isValid) {
        await callback();
      } else {
        onSendMessage({ text: `Error Access Token has expired!`, isBot: true, agent: selectedModel }, 'add');
        console.error('Token is invalid or expired. Please log in again.');
        alert('Your session has expired. Please log in again.');
      }
    }
  };

  const handleSendClick = async () => {
    onSendMessage({ text: inputValue, isBot: false, agent: selectedModel }, 'add');
    setInputValue('');
    await checkTokenAndExecute(async () => {
      if (inputValue.trim()) {
        updateProgress(10);

        try {
          updateProgress(30);
          agentService.accessToken = window.accessToken;
          const agentName = selectedModel === MODELS.REACT ? 'best-modus-react' : 'angularp2c';
          const botResponse = await agentService.getGeneralAssistantResponse(agentName, inputValue, sessionId);

          if (botResponse) {
            updateProgress(80);
            onSendMessage({ text: botResponse, isBot: true, agent: selectedModel }, 'add');
            updateProgress(100);
          } else {
            console.error('Bot response is undefined!');
            onSendMessage({ text: 'Error Bot response is undefined', isBot: true, agent: selectedModel }, 'add');
            updateProgress(0);
          }
        } catch (error) {
          onSendMessage({ text: `Error fetching bot response!`, isBot: true, agent: selectedModel }, 'add');
          console.error('Error fetching bot response:', error);
          updateProgress(0);
        }
      }
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await checkTokenAndExecute(async () => {
        setFileInputValue(file);
        onSendMessage({ text: 'Image Successfully Uploaded!', isBot: false, agent: selectedModel }, 'add');
        updateProgress(8);

        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = reader.result?.toString();
          if (base64String) {
            try {
              agentService.accessToken = window.accessToken;
              const modusCode = await agentService.processImageToModus(base64String, selectedModel, updateProgress);
              if (modusCode) {
                updateProgress(100);
                onSendMessage({ text: modusCode, isBot: true, agent: selectedModel }, 'add');
              } else {
                updateProgress(0);
                onSendMessage({ text: 'Error to process image to MODUS code!', isBot: true, agent: selectedModel }, 'add');
                console.error('Failed to process image to MODUS code.');
              }
            } catch (error) {
              updateProgress(0);
              onSendMessage({ text: `Error fetching bot response!`, isBot: true, agent: selectedModel }, 'add');
              console.error('Error processing image:', error);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectModel = (model: string) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !containerRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);


  return (
    <div className={`footer__wrapper ${isDropdownOpen ? 'disable-pointer-events' : ''}`} ref={wrapperRef} >
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      <div className={`footer__container ${isFocused ? 'focused' : ''}`} ref={containerRef}>
        <div className={`input-container ${isOverflowing ? 'overflowing' : ''}`}>
          <div className={`file__container ${isOverflowing ? 'shadow' : ''}`}>
            {selectedModel === MODELS.REACT ? (
              <div className="file__reference">
                <img src={reactUri} alt="React File Reference" />
                <span>React.js</span>
              </div>
            ) : (
              <div className="file__reference">
                <img src={angularUri} alt="Angular File Reference" />
                <span>Angular.js</span>
              </div>
            )}
          </div>
          <textarea
            id="autoExpand"
            ref={textareaRef}
            placeholder={isAccessTokenInvalid ? 'Please login to continue...' : 'Enter your query here...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            disabled={isAccessTokenInvalid}
            aria-label="Chat input"
          ></textarea>
          <div className="toolbar">
            <div className="input-actions">
              <button
                onClick={() => onSendMessage({ text: 'empty', isBot: false, agent: selectedModel }, 'empty')}
                disabled={isAccessTokenInvalid || messages.length===0}
                className={isAccessTokenInvalid || messages.length===0 ? 'disabled-icon' : ''}
                data-tooltip-id="tooltip"
                data-tooltip-content={'Clear'}
                data-tooltip-delay-show={300}
                data-tooltip-place="top"
              >
                <i className="codicon codicon-refresh"></i>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={isAccessTokenInvalid ? 'disabled-icon' : ''}
                data-tooltip-id="tooltip"
                data-tooltip-content={'Upload Image'}
                data-tooltip-delay-show={300}
              >
                <i className="codicon codicon-link"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="dropdown">
              {isAccessTokenInvalid ? (
                <div className="login-button" data-tooltip-id="tooltip" data-tooltip-content={'Login to continue'} data-tooltip-delay-show={300}>
                  <button id="authenticateButton">Login</button>
                </div>
              ) : (
                <>
                  <div className="model_selection" onClick={toggleDropdown}>
                    <button data-tooltip-id="tooltip" data-tooltip-content={'Select Framework'} data-tooltip-delay-show={300}>
                      <span>{selectedModel}</span>
                      <i className="codicon codicon-chevron-down"></i>
                    </button>
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        <div onClick={() => selectModel(MODELS.REACT)}>React</div>
                        <div onClick={() => selectModel(MODELS.ANGULAR)}>Angular</div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSendClick}
                    disabled={inputValue.trim().length === 0}
                    className={inputValue.trim().length === 0 ? 'disabled-icon' : ''}
                    data-tooltip-id="tooltip"
                    data-tooltip-content={'Send'}
                    data-tooltip-delay-show={300}
                  >
                    <i className="codicon codicon-send"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Tooltip id="tooltip" />
    </div>
  );
};

export default Footer;