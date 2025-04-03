import React, { useLayoutEffect, useState, useRef} from 'react';
import at2 from "../assets/at_2.svg";
import attachment from "../assets/attachment.svg";
import arrow from "../assets/arrow.svg";
import send from "../assets/send.svg";
import "./Footer.css";
import { AgentService } from './AgentService';
import react_1 from "../assets/react_1.svg";
import angularLogo from "../assets/Angular_Logo.png";
import { v4 as uuidv4 } from 'uuid';

interface FooterProps {
  onSendMessage: (message: { text: string; isBot: boolean ;agent: string }) => void;
  access_token:string;
}

const Footer: React.FC<FooterProps> = ({ onSendMessage,access_token }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('React');

  const agentService = new AgentService();
  agentService.accessToken = access_token || "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lkLnRyaW1ibGUuY29tIiwiZXhwIjoxNzQzNjc1Njg4LCJuYmYiOjE3NDM2NzIwODgsImlhdCI6MTc0MzY3MjA4OCwianRpIjoiMWZiY2Q2ZmU4NjE4NGEzMGJmYjM4MGNkOGExODA5MGYiLCJqd3RfdmVyIjoyLCJzdWIiOiJmZTE5MWIxNy0zNWZlLTQwZTItYmYyNy05NTkwYjE0ZjZmZjMiLCJpZGVudGl0eV90eXBlIjoidXNlciIsImFtciI6WyJmZWRlcmF0ZWQiLCJva3RhX3RyaW1ibGUiLCJtZmEiXSwiYXV0aF90aW1lIjoxNzQzNjY1MTE0LCJhenAiOiJkOWQyMWVkMC0xNGU3LTQ4ODctYmE0Yi1kMTJhYzJmMmY0NjYiLCJhY2NvdW50X2lkIjoidHJpbWJsZS1wbGFjZWhvbGRlci1vZi1lbXBsb3llZXMiLCJhdWQiOlsiZDlkMjFlZDAtMTRlNy00ODg3LWJhNGItZDEyYWMyZjJmNDY2Il0sInNjb3BlIjoiVERBQVMiLCJkYXRhX3JlZ2lvbiI6InVzIn0.LVbUYAuIKVE5sEyc1JC-TphNURRvcETO5cxSSUPVKHNBvI8cYOTS91k-NyoT_EkCh9jYRok9xvxvfmY6XIsNbdBl1J87kQlZNiGROW00QKGJIO1eZ0f5LGVUH2yVJ16stP14dUdp-4TsRrT4isL7pnYEvVQwQ2pQN2jnmk8v9x_Jlycfjf7IZHIUJIOKtoNhUf9weWpOm22BpXAqqVQclRHWCf74t-LJe6wehnf7QWXELINUbVCu2Yq8pApdIxjHmI-kUsBoMfEOAEIVkDAB4HerKh4bBYiYoZ3JBG7OlHRjzzA6aheSCaNzN1EaFPqX0-SfcvsGSBsPivFXzxJGjg";
  const agentName = selectedModel =='React'?'best-modus-react':'angularp2c';
  const react_sessionId = uuidv4();
  const angular_sessionId = uuidv4();
  const sessionId = selectedModel =='React'? react_sessionId : angular_sessionId;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInputValue, setFileInputValue] = useState<File | null>(null);

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
        const footerHeight = container.offsetHeight + 20; // Include the extra 20px
        chatbox.style.height = `calc(100vh - ${footerHeight}px)`; 
        chatbox.style.overflowY = 'auto';
      }
    };

    if (textareaRef.current) {
      autoExpand(textareaRef.current);
    }
  }, [inputValue,fileInputValue]); 

  const handleSendClick = async () => {
    if (inputValue.trim()) {
      onSendMessage({ text: inputValue, isBot: false ,agent: selectedModel });
      setInputValue('');

      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        setIsOverflowing(false);
      }

      try {
        const botResponse = await agentService.getGeneralAssistantResponse(
          agentName,
          inputValue,
          sessionId
        );

        if (botResponse) {
          onSendMessage({ text: botResponse, isBot: true ,agent: selectedModel });
        } else {
          console.error('Bot response is undefined');
        }
      } catch (error) {
        console.error('Error fetching bot response:', error);
      }
    }
  };

  const handleAtClick = () => {
    console.log("At button clicked");
  };

  const handleAttachmentClick = () => {
    console.log("Attachment button clicked");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileInputValue(file);
      onSendMessage({ text: "Image Succesfully Uploaded", isBot: false, agent: selectedModel });
      const reader = new FileReader();
      reader.onload= async () => {
        const base64String = reader.result?.toString() // Get the base64 part
        if (base64String) {
          try {
            const modusCode = await agentService.processImageToModus(base64String, selectedModel);
//             const modusCode = `\`\`\`tsx
// import React from 'react';
// import { ModusButton } from '@trimble-oss/modus-react-components';

// const MyComponent: React.FC = () => {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflow: 'auto' }}>
//       <ModusButton color="primary">Button 1</ModusButton>
//       <ModusButton color="secondary">Button 2</ModusButton>
//     </div>
//   );
// };

// export default MyComponent;
// import React from 'react';
// import { ModusButton } from '@trimble-oss/modus-react-components';

// const MyComponent: React.FC = () => {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflow: 'auto' }}>
//       <ModusButton color="primary">Button 1</ModusButton>
//       <ModusButton color="secondary">Button 2</ModusButton>
//     </div>
//   );
// };

// export default MyComponent;\`\`\``
            if (modusCode) {
              onSendMessage({ text: modusCode, isBot: true, agent: selectedModel });
            } else {
              console.error("Failed to process image to MODUS code.");
            }
          } catch (error) {
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
      <div className="footer__container">
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
            placeholder="Enter your Query"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></textarea>
          <div className="toolbar">
            <div className="input-actions">
              <button onClick={handleAtClick}>
                <img src={at2} alt="At" />
              </button>
              <button onClick={handleAttachmentClick}>
                <img src={attachment} alt="Attach" />
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
            <div className="model_selection" onClick={toggleDropdown}>
                <button>
                  <span>{selectedModel}</span>
                  <img src={arrow} alt="Arrow" />
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div onClick={() => selectModel('React')}>React</div>
                    <div onClick={() => selectModel('Angular')}>Angular</div>
                  </div>
                )}
              </div>
              <button onClick={handleSendClick}>
                <img src={send} alt="Send" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;