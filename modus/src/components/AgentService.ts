export class AgentService {
    public accessToken: string = "";
  
    private async retryRequest<T>(requestFn: () => Promise<T>, retries: number = 3): Promise<T | undefined> {
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const result = await requestFn();
          if (result !== undefined) {
            return result;
          }
        } catch (error) {
          if (attempt === retries - 1) {
            console.error('Failed after 3 retries',error);
          }
        }
      }
      return undefined;
    }
  
    public async getGeneralAssistantResponse(agentName: string, message: string, sessionId: string): Promise<string | undefined> {
      const requestFn = async () => {
        const trimbleAssistantMessageURL = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${agentName}/messages`;
        const accessToken = this.accessToken;
        const response = await fetch(
          `${trimbleAssistantMessageURL}`,
          {
            headers: new Headers({
              Authorization: 'Bearer ' + accessToken,
              'Content-Type': 'application/json',
            }),
            method: 'POST',
            body: JSON.stringify({
              message: message,
              stream: false,
              model_id: 'gpt-4o',
              session_id: sessionId,
            }),
          }
        );
  
        if (response.status !== 200) {
          return undefined;
        }
  
        const responseData = await response.json();
        return responseData.message;
      };
  
      return await this.retryRequest(requestFn);
    }
}
  