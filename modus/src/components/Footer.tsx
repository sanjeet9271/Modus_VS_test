import React, { useLayoutEffect, useState, useRef} from 'react';
import "./Footer.css";
import { AgentService } from './AgentService';
import react_1 from "../assets/react_1.svg";
import angularLogo from "../assets/Angular_Logo.png";
import { v4 as uuidv4 } from 'uuid';

interface FooterProps {
  onSendMessage: (message: { text: string; isBot: boolean ;agent: string },action: 'add' | 'empty') => void;
  access_token:string;
  messages: { text: string; isBot: boolean; agent: string }[];
}

const Footer: React.FC<FooterProps> = ({ onSendMessage,access_token,messages}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('React');

  const agentService = new AgentService();
  agentService.accessToken = access_token;
  const agentName = selectedModel =='React'?'best-modus-react':'angularp2c';
  const react_sessionId = uuidv4();
  const angular_sessionId = uuidv4();
  const sessionId = selectedModel =='React'? react_sessionId : angular_sessionId;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInputValue, setFileInputValue] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [progress, setProgress] = useState(0);

  const reactUri = document.getElementById('root')?.getAttribute('data-image-uri') || react_1 || undefined;
  const angularUri = document.getElementById('root')?.getAttribute('angularLogo') || angularLogo ||undefined;


  useLayoutEffect(() => {
    const autoExpand = (field: HTMLTextAreaElement) => {
      const maxHeight = 200; 
      field.style.height = 'inherit'; 
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

      const wrapper = document.querySelector('.footer__wrapper') as HTMLElement;
      const container = document.querySelector('.footer__container') as HTMLElement;
      const chatbox = document.querySelector('.message__chatbox') as HTMLElement;

      if (wrapper && container) {
        wrapper.style.height = `${container.offsetHeight + 20}px`; 
      }

      if (container && chatbox) {
        const footerHeight = container.offsetHeight + 20; 
        chatbox.style.height = `calc(100vh - ${footerHeight}px)`; 
        chatbox.style.overflowY = 'auto';
      }
    };

    if (textareaRef.current) {
      autoExpand(textareaRef.current);
    }
  }, [inputValue,fileInputValue,messages]); 

  const updateProgress = (value: number) => {
    setProgress(value);
  
    if (value === 100) {
      setTimeout(() => {
        setProgress(0);
      }, 2000); 
    }
  };
  

  const handleSendClick = async () => {
    if (inputValue.trim()) {
      onSendMessage({ text: inputValue, isBot: false, agent: selectedModel },'add');
      setInputValue('');
      updateProgress(10); 
  
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        setIsOverflowing(false);
      }
  
      try {
        updateProgress(30);
        const botResponse = await agentService.getGeneralAssistantResponse(
          agentName,
          inputValue,
          sessionId
        );
  
        if (botResponse) {
          updateProgress(80);
          onSendMessage({ text: botResponse, isBot: true, agent: selectedModel },'add');
          updateProgress(100); 
        } else {
          console.error('Bot response is undefined');
          updateProgress(0); 
        }
      } catch (error) {
        console.error('Error fetching bot response:', error);
        updateProgress(0); 
      }
    }
  };
  

  const handleAtClick = () => {
    if(access_token !== 'NULL') {
      onSendMessage({ text: "empty", isBot: false, agent: selectedModel }, 'empty');
    }
  };

  const handleAttachmentClick = () => {
    console.log("Attachment button clicked");
    if (fileInputRef.current && access_token !== 'NULL') {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileInputValue(file);
      onSendMessage({ text: "Image Succesfully Uploaded !", isBot: false, agent: selectedModel },'add');
      updateProgress(8);
      const reader = new FileReader();
      reader.onload= async () => {
        const base64String = reader.result?.toString() // Get the base64 part
        if (base64String) {
          try {
            const modusCode = await agentService.processImageToModus(base64String, selectedModel,updateProgress);
            if (modusCode) {
              updateProgress(100);
              onSendMessage({ text: modusCode, isBot: true, agent: selectedModel },'add');
            } else {
              updateProgress(0);
              console.error("Failed to process image to MODUS code.");
            }
          } catch (error) {
            updateProgress(0);
            console.error("Error processing image:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectModel = (model: string) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };

  return (
    <div className="footer__wrapper">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      <div className={`footer__container ${isFocused ? 'focused' : ''}`}>
        <div className={`input-container ${isOverflowing ? 'overflowing' : ''}`}>
          <div className={`file__container ${isOverflowing ? 'shadow' : ''}`}>
            {selectedModel === 'React' ? (
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
            placeholder={access_token === "NULL" || !access_token ? "Please login to continue..." : "Enter your query here..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              updateProgress(0); 
            }}
            onBlur={() => setIsFocused(false)}
            disabled={access_token === "NULL" || !access_token} 
          ></textarea>
          <div className="toolbar">
            <div className="input-actions">
              <button onClick={handleAtClick} className={access_token === 'NULL' || !access_token ? 'disabled-icon' : ''}>
                <i className='codicon codicon-refresh'></i>
              </button>
              <button onClick={handleAttachmentClick} className={access_token === 'NULL' || !access_token ? 'disabled-icon' : ''}>
                <i className='codicon codicon-link'></i>
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
              {access_token === 'NULL' || !access_token ? (
                <div className="login-button">
                  <button id="authenticateButton">Login</button>
                </div>
              ) : (
                <>
                <div className="model_selection" onClick={toggleDropdown}>
                  <button>
                    <span>{selectedModel}</span>
                    <i className='codicon codicon-chevron-down'></i>
                  </button>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <div onClick={() => selectModel('React')}>React</div>
                      <div onClick={() => selectModel('Angular')}>Angular</div>
                    </div>
                  )}
                </div>
                <button onClick={handleSendClick}>
                  <i className='codicon codicon-send'></i>
                </button>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );    
};

export default Footer;