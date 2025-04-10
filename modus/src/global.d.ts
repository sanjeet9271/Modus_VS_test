interface Window {
    vscode: {
      postMessage: (message: { command: string; message: string }) => void;
    };
    messages: MessageData[];
  }
  
interface MessageData {
    text: string;
    isBot: boolean;
    agent: string;
}