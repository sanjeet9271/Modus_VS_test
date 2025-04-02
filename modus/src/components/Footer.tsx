import React, { useLayoutEffect, useState, useRef } from 'react';
import at2 from "../assets/at_2.svg";
import attachment from "../assets/attachment.svg";
import arrow from "../assets/arrow.svg";
import send from "../assets/send.svg";
import "./Footer.css";
import { AgentService } from './AgentService';
import react_1 from "../assets/react_1.svg";
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
  agentService.accessToken = access_token || "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lkLnRyaW1ibGUuY29tIiwiZXhwIjoxNzQzNTkxODMyLCJuYmYiOjE3NDM1ODgyMzIsImlhdCI6MTc0MzU4ODIzMiwianRpIjoiNjJiNzBjYWM4OGZlNGRkN2E2NDg2MzE4YzQ5YmYxZjIiLCJqd3RfdmVyIjoyLCJzdWIiOiJmZTE5MWIxNy0zNWZlLTQwZTItYmYyNy05NTkwYjE0ZjZmZjMiLCJpZGVudGl0eV90eXBlIjoidXNlciIsImFtciI6WyJmZWRlcmF0ZWQiLCJva3RhX3RyaW1ibGUiLCJtZmEiXSwiYXV0aF90aW1lIjoxNzQzNTg4MjMxLCJhenAiOiJkOWQyMWVkMC0xNGU3LTQ4ODctYmE0Yi1kMTJhYzJmMmY0NjYiLCJhY2NvdW50X2lkIjoidHJpbWJsZS1wbGFjZWhvbGRlci1vZi1lbXBsb3llZXMiLCJhdWQiOlsiZDlkMjFlZDAtMTRlNy00ODg3LWJhNGItZDEyYWMyZjJmNDY2Il0sInNjb3BlIjoiVERBQVMiLCJkYXRhX3JlZ2lvbiI6InVzIn0.HbwfIxMp85jggxsUgSl8d79OMByWAeXnqqZhObYlgjx5NBCrGKKBoCnHzIlhyBl7qbL2P6g0zhom9_ApcoaqQTOlzyMXt9X0p2mGYQfd-vqFcos-zXqTPlWhQF59JLwT3nhCHQd51DLBH27u40QAzJoGDOX3JC3s1GRgp7zVmadOBOtIRKvmODGtrc1KzdyN5g1ErtfZK1VO2FHqWcjPsDWTH6wmiD22Feu9h5BbeGyB9fVZeOQXFZXKYoej0UMxrwnTkon1sd4wFaHn7j3bgAQbeRvb7gH6AM9JPA98gZbTPDtFhN3DI0hEYTDqiSzEhJ_dIqRfwcjMbCVwIUMjOQ";
  const agentName = selectedModel =='React'?'best-modus-react':'angularp2c';
  const react_sessionId = uuidv4();
  const angular_sessionId = uuidv4();
  const sessionId = selectedModel =='React'? react_sessionId : angular_sessionId;

  const reactUri = document.getElementById('root')?.getAttribute('data-image-uri') || react_1 || undefined;


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
  }, [inputValue]); 

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
            <div className="file__reference">
              <img src={reactUri} alt="File Reference" />
              <span>Footer.tsx</span>
            </div>
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