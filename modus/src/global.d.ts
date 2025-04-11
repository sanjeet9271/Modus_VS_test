interface Window {
    vscode: {
      postMessage: (message: { command: string; message: string }) => void;
    };
    messages: MessageData[];
    accessToken: string;
    checkTokenValidity?: () => Promise<boolean>;
  }
  
interface MessageData {
    text: string;
    isBot: boolean;
    agent: string;
}