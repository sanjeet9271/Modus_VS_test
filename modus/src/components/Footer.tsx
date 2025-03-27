import React, { useLayoutEffect, useState, useRef } from 'react';
import at2 from "../assets/at_2.svg";
import attachment from "../assets/attachment.svg";
import arrow from "../assets/arrow.svg";
import send from "../assets/send.svg";
import react from "../assets/react.svg";
import "./Footer.css";
import { AgentService } from './AgentService';

interface FooterProps {
  onSendMessage: (message: { text: string; isBot: boolean }) => void;
}

const Footer: React.FC<FooterProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const agentService = new AgentService();
  agentService.accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lkLnRyaW1ibGUuY29tIiwiZXhwIjoxNzQzMDY4MzQwLCJuYmYiOjE3NDMwNjQ3NDAsImlhdCI6MTc0MzA2NDc0MCwianRpIjoiYjFjOWVhZGQyZjM2NDEzNmEwMjMyZmU3ZGE2OThmMGMiLCJqd3RfdmVyIjoyLCJzdWIiOiJmZTE5MWIxNy0zNWZlLTQwZTItYmYyNy05NTkwYjE0ZjZmZjMiLCJpZGVudGl0eV90eXBlIjoidXNlciIsImFtciI6WyJmZWRlcmF0ZWQiLCJva3RhX3RyaW1ibGUiLCJtZmEiXSwiYXV0aF90aW1lIjoxNzQzMDU2MDEwLCJhenAiOiJkOWQyMWVkMC0xNGU3LTQ4ODctYmE0Yi1kMTJhYzJmMmY0NjYiLCJhY2NvdW50X2lkIjoidHJpbWJsZS1wbGFjZWhvbGRlci1vZi1lbXBsb3llZXMiLCJhdWQiOlsiZDlkMjFlZDAtMTRlNy00ODg3LWJhNGItZDEyYWMyZjJmNDY2Il0sInNjb3BlIjoiVERBQVMiLCJkYXRhX3JlZ2lvbiI6InVzIn0.SurK59XvPGItlHkL0qfoSTMFK9w0ZP574Wn3eGpZGT_NsSkF19kJwG4bVuqRH_BbOT6eiGv-qmUbInXrhCuh2hETvCoqkDAt1XfMF1y7DjjMDBu7g5O_YS84qwcx6G-2QbHjX_HnBo1D-GRnUbtKVynRtBqfrMDnyRMbcUansG5PL49PVgtASUYgqgxRHDjaN04I6qUZuygSotc7x0LiLCpsUUuBq1mDN36uIsdOM-___EHmUeG9oO2V4BeqVz99Apjm6I36IpX-gTj0xkPmxAlI2O-u5F9s6Bv99a8wDA_My-nVsnUtW1u3yMs0aoTqkAJ4egBIaE1LeYc-J7paww';
  const agentName = 'best-modus-react';
  const sessionId = 'd309e573-693a-4209-a325-430f9542d789';

  useLayoutEffect(() => {
    const autoExpand = (field: HTMLTextAreaElement) => {
      const maxHeight = 200; // Set the maximum height for the textarea
      field.style.height = 'inherit'; // Reset height to calculate new height
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
        chatbox.style.height = `calc(100vh - ${footerHeight}px)`; // Adjust chatbox height
        chatbox.style.overflowY = 'auto';
      }
    };

    if (textareaRef.current) {
      autoExpand(textareaRef.current);
    }
  }, [inputValue]); 

  const handleSendClick = async () => {
    if (inputValue.trim()) {
      onSendMessage({ text: inputValue, isBot: false });
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
          onSendMessage({ text: botResponse, isBot: true });
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

  return (
    <div className="footer__wrapper">
      <div className="footer__container">
        <div className={`input-container ${isOverflowing ? 'overflowing' : ''}`}>
          <div className={`file__container ${isOverflowing ? 'shadow' : ''}`}>
            <div className="file__reference">
              <img src={react} alt="File Reference" />
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
              <div className="model_selection">
                <button>
                  <span>React</span>
                  <img src={arrow} alt="Arrow" />
                </button>
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