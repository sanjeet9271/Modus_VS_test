import React, { useLayoutEffect, useState, useRef } from 'react';
import at2 from "../assets/at_2.svg";
import attachment from "../assets/attachment.svg";
import arrow from "../assets/arrow.svg";
import send from "../assets/send.svg";
import "./Footer.css";
import { AgentService } from './AgentService';
import react_1 from "../assets/react_1.svg"

interface FooterProps {
  onSendMessage: (message: { text: string; isBot: boolean }) => void;
  access_token:string;
}

const Footer: React.FC<FooterProps> = ({ onSendMessage,access_token }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const agentService = new AgentService();
  agentService.accessToken = access_token;
  const agentName = 'best-modus-react';
  const sessionId = 'd309e573-693a-4209-a325-430f9542d789';

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
        const footerHeight = container.offsetHeight + 20; 
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

//         const botResponse = `\`\`\`tsx
// function foor(bar){
//   return bar;
// }
// import React, { useEffect, useRef } from 'react';
// import { ModusNavbar } from '@trimble-oss/modus-react-components';

// const MyComponent: React.FC = () => {
//   const navbarRef = useRef<any>(null);

//   useEffect(() => {
//     if (navbarRef.current) {
//       navbarRef.current.apps = [
//         {
//           description: 'Library Management App',
//           logoUrl: 'https://modus.trimble.com/favicon.svg',
//           name: 'Library Management',
//           url: 'https://library-management.com/',
//         },
//       ];
//       navbarRef.current.logoOptions = {
//         primary: {
//           url: 'https://modus.trimble.com/img/trimble-logo.svg',
//           height: 24,
//         },
//         secondary: {
//           url: 'https://modus.trimble.com/favicon.svg',
//           height: 24,
//         },
//       };
//       navbarRef.current.profileMenuOptions = {
//         avatarUrl: 'https://avatar.example.com/broken-image-link.png',
//         email: 'library_user@trimble.com',
//         initials: 'LU',
//         signOutText: 'Sign out',
//         username: 'Library User',
//       };
//     }
//   }, []);

//   return (
//     <div style={{ height: '100vh', overflow: 'auto' }}>
//       <ModusNavbar id="navbar1" showAppsMenu showHelp showMainMenu showNotifications variant="blue" ref={navbarRef}>
//         <div slot="main" style={{ height: '300px' }}>Render your own main menu.</div>
//         <div slot="notifications">Render your own notifications.</div>
//       </ModusNavbar>
//     </div>
//   );
// };

// export default MyComponent;\`\`\``

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

  const handleAttachmentClick = async () => {
    console.log("Attachment button clicked");
  
    // // Open file picker dialog
    // const files = await vscode.window.showOpenDialog({
    //   canSelectFiles: true, // Allow only files
    //   canSelectFolders: false, // Disallow folder selection
    //   canSelectMany: false, // Allow only one file at a time
    //   filters: {
    //     'All Files': ['*'], // Allow all file types
    //   },
    // });
  
    // if (files && files.length > 0) {
    //   const selectedFile = files[0];
    //   console.log(`Selected file: ${selectedFile.fsPath}`);
    //   // Perform any action with the selected file
    // } else {
    //   console.log("No file selected");
    // }
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