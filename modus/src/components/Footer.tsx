import React, { useLayoutEffect, useState, useRef } from 'react';
import at2 from "../assets/at_2.svg";
import attachment from "../assets/attachment.svg";
import arrow from "../assets/arrow.svg";
import send from "../assets/send.svg";
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
  agentService.accessToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2lkLnRyaW1ibGUuY29tIiwiZXhwIjoxNzQzMDcyNDQ2LCJuYmYiOjE3NDMwNjg4NDYsImlhdCI6MTc0MzA2ODg0NiwianRpIjoiNjgxNDJmMWZkNzFjNGI1MzhmZGM3ZGJjMzllOWM4N2IiLCJqd3RfdmVyIjoyLCJzdWIiOiJmZTE5MWIxNy0zNWZlLTQwZTItYmYyNy05NTkwYjE0ZjZmZjMiLCJpZGVudGl0eV90eXBlIjoidXNlciIsImFtciI6WyJmZWRlcmF0ZWQiLCJva3RhX3RyaW1ibGUiLCJtZmEiXSwiYXV0aF90aW1lIjoxNzQzMDU2MDEwLCJhenAiOiJkOWQyMWVkMC0xNGU3LTQ4ODctYmE0Yi1kMTJhYzJmMmY0NjYiLCJhY2NvdW50X2lkIjoidHJpbWJsZS1wbGFjZWhvbGRlci1vZi1lbXBsb3llZXMiLCJhdWQiOlsiZDlkMjFlZDAtMTRlNy00ODg3LWJhNGItZDEyYWMyZjJmNDY2Il0sInNjb3BlIjoiVERBQVMiLCJkYXRhX3JlZ2lvbiI6InVzIn0.R_sc58oCqL1SMfyLm2gsIg3P-frVcVAnFLQTbJhbhPpzcWoEoCOOYzhifKzWQsf3mKDvkE4ub27vtOt-22_uMglTq3VPX97BzuEHfySpoyYScus-B5sT7lnBXMszPmJgw9QWlozdYAWCk_oNnghKfmgf6kiH893SCUjD9StA1V1vfeMAsOYmCQuN9A9S06muziAL7EJMKx75AgX4FP0R3AuoY9Ke7Yftwl47rdYpeygKm-08Duid5O_9ZTkyDR5WeVXScWIgYs5ih6y4cgVJoRh4wTmuT97KhePoR-Em1rLvGqvLNsSbkmb2IcIt4Vh-AhU97r9xjZ1vq74bL_Cxlw';
  // const agentName = 'best-modus-react';
  // const sessionId = 'd309e573-693a-4209-a325-430f9542d789';

  const reactUri = document.getElementById('root')?.getAttribute('data-image-uri') || undefined;


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
        // const botResponse = await agentService.getGeneralAssistantResponse(
        //   agentName,
        //   inputValue,
        //   sessionId
        // );

        const botResponse = `\`\`\`tsx
function foor(bar){
  return bar;
}
import React, { useEffect, useRef } from 'react';
import { ModusNavbar } from '@trimble-oss/modus-react-components';

const MyComponent: React.FC = () => {
  const navbarRef = useRef<any>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarRef.current.apps = [
        {
          description: 'Library Management App',
          logoUrl: 'https://modus.trimble.com/favicon.svg',
          name: 'Library Management',
          url: 'https://library-management.com/',
        },
      ];
      navbarRef.current.logoOptions = {
        primary: {
          url: 'https://modus.trimble.com/img/trimble-logo.svg',
          height: 24,
        },
        secondary: {
          url: 'https://modus.trimble.com/favicon.svg',
          height: 24,
        },
      };
      navbarRef.current.profileMenuOptions = {
        avatarUrl: 'https://avatar.example.com/broken-image-link.png',
        email: 'library_user@trimble.com',
        initials: 'LU',
        signOutText: 'Sign out',
        username: 'Library User',
      };
    }
  }, []);

  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <ModusNavbar id="navbar1" showAppsMenu showHelp showMainMenu showNotifications variant="blue" ref={navbarRef}>
        <div slot="main" style={{ height: '300px' }}>Render your own main menu.</div>
        <div slot="notifications">Render your own notifications.</div>
      </ModusNavbar>
    </div>
  );
};

export default MyComponent;\`\`\``

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