import { v4 as uuidv4 } from 'uuid';

export class AgentService {
  public accessToken: string = "";
  private sessionID: string | undefined;
  readonly IMAGE_VALIDATOR_AGENT = "image-to-code-image-validator";
  readonly GENERIC_CODE_CONVERTER_AGENT = "image-to-generic-code-2";
  readonly CODE_COMMENTOR_AGENT = "code-component-commentor";
  readonly CODE_VALIDATOR_AGENT = "image-to-code-gencode-validator";
  readonly MODUS_ANGULAR_CONVERTER_AGENT = "generic-to-modus-convertor";
  readonly MODUS_REACT_CONVERTER_AGENT = "reacti2c";

  public imageValidated = true;
  public nonFormComponentDetected = false;
  public workflowInitialization = true;


  public createSessionId(): string {
    this.sessionID = uuidv4();
    return this.sessionID;
  }

  private async retryRequest<T>(requestFn: () => Promise<T>, retries: number = 3): Promise<T | undefined> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await requestFn();
        if (result !== undefined) {
          return result;
        }
      } catch (error) {
        if (attempt === retries - 1) {
          console.error('Failed after 3 retries', error);
        }
      }
    }
    return undefined;
  }

  public async getGeneralAssistantResponse(agentName: string, message: string, sessionId: string): Promise<string | undefined> {
    const requestFn = async (): Promise<string | undefined> => {
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

      const responseData: { message: string } = await response.json();
      return responseData.message;
    };

    return await this.retryRequest(requestFn);
  }

  private async makeRequest(url: string, method: string, body?: unknown, contentType: string = 'application/json'): Promise<unknown> {
    const accessToken = this.accessToken;
    const headers = new Headers({
      'Authorization': 'Bearer ' + accessToken,
    });

    if (contentType === 'application/json') {
      headers.append('Content-Type', contentType);
    }

    const response = await fetch(url, {
      headers,
      method,
      body: contentType === 'application/json' ? JSON.stringify(body) : body as BodyInit,
    });

    if (response.status !== 200) {
      return undefined;
    }

    return await response.json();
  }

  public base64ToBlob(base64: string, contentType: string): Blob {
    try {
  
      // Check if the base64 string needs padding
      const paddingNeeded = base64.length % 4;
      if (paddingNeeded) {
        base64 += '='.repeat(4 - paddingNeeded);
      }
  
      // Validate base64 string
      const isValidBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(base64);
      if (!isValidBase64) {
        throw new Error("Invalid base64 string");
      }
  
      // Decode the base64 string
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: contentType });
    } catch (error) {
      console.error("Failed to decode base64 string:", error);
      throw new Error("Invalid base64 string");
    }
  }
  
  
  

  public async UploadImageToAssistant(agent_name: string, base64_string: string, session_id: string): Promise<string | undefined> {
    const requestFn = async (): Promise<string | undefined> => {
      const trimbleAssistantImageURL = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${agent_name}/sessions/${session_id}/images`;
      const byte_data = this.base64ToBlob(base64_string, 'image/png');

      const formBody = new FormData();
      formBody.append('image_file', byte_data, 'image.png');

      const responseData = await this.makeRequest(trimbleAssistantImageURL, 'POST', formBody, 'multipart/form-data');
      return responseData as string | undefined;
    };
    return await this.retryRequest(requestFn);
  }

  public async GetAssistantResponseForMessageWithImage(agent_name: string, blob_storage_path: string | undefined, session_id: string, message: string): Promise<string | undefined> {
    const requestFn = async (): Promise<string | undefined> => {
      const trimbleAssistantMessageURL = `https://agw.construction-integration.trimble.cloud/trimbledeveloperprogram/assistants/v1/agents/${agent_name}/messages`;
      const body = {
        message,
        stream: false,
        model_id: 'gpt-4o',
        session_id,
        blob_url: blob_storage_path,
      };

      const responseData = await this.makeRequest(trimbleAssistantMessageURL, 'POST', body);
      return (responseData as { message: string }).message;
    };
    return await this.retryRequest(requestFn);
  }

  private async chatWithImageAgent(agent_name: string, base64_string: string, session_id: string, message: string){
    base64_string = base64_string.split(',')[1];
    const image_upload = await this.UploadImageToAssistant(agent_name, base64_string, session_id);
    const agent_response = await this.GetAssistantResponseForMessageWithImage(agent_name, image_upload, session_id, message);
    return agent_response;
  }

  private async validateImage(base64_string:string): Promise<boolean> {
    const imageValidationResult = await this.chatWithImageAgent(this.IMAGE_VALIDATOR_AGENT, base64_string as string, this.createSessionId(), "Determine if the uploaded image is a UI screenshot or not.");
  
    if (imageValidationResult === "No") {
      this.imageValidated = false;
      setTimeout(() => this.imageValidated = true, 5000);
      return false;
    }
    console.log("Image validated!",this.imageValidated);
    return true;
  }

  private async convertImageToGenericCode(imageSrc:string): Promise<string | undefined> {
    const genericCode = await this.chatWithImageAgent(this.GENERIC_CODE_CONVERTER_AGENT, imageSrc as string, this.createSessionId(), "Generate code and script.");
    if (!genericCode) {
      console.error("Failed to generate generic code.");
    }
    console.log("Code Converted to generic");
    return genericCode;
  }

  private async commentCode(genericCode: string): Promise<string | undefined> {
    const commentedCode = await this.getGeneralAssistantResponse(this.CODE_COMMENTOR_AGENT, `${genericCode}\n Add comments to the above code.`,this.createSessionId());
    if (!commentedCode) {
      console.error("Failed to comment code.");
    }
    console.log("Code Commented");
    return commentedCode;
  }

  private async validateComponent(commentedCode: string): Promise<boolean> {
    const validationResult = await this.getGeneralAssistantResponse(this.CODE_VALIDATOR_AGENT, `${commentedCode}\n Check the validity.`,this.createSessionId());
    if (validationResult === "Invalid") {
      this.nonFormComponentDetected = true;
      setTimeout(() => this.nonFormComponentDetected = false, 5000);
      return false;
    }
    console.log("Component Validated!");
    return true;
  }

  private async convertToModus(commentedCode: string,selectedModel: string): Promise<string | undefined> {
    const modusCode = await this.getGeneralAssistantResponse(selectedModel==='React'?this.MODUS_REACT_CONVERTER_AGENT:this.MODUS_ANGULAR_CONVERTER_AGENT, `${commentedCode}\n Generate the MODUS equivalent code.`,this.createSessionId());
    if (!modusCode) {
      console.error("Failed to generate MODUS code.");
    }
    console.log("Code Converted to Modus");
    return modusCode;
  }

  public async processImageToModus(imageSrc: string, selectedModel: string,updateProgress:(value: number) => void): Promise<string | undefined> {
    try {
      // Step 1: Validate the image
      const isImageValid = await this.validateImage(imageSrc);
      if (!isImageValid) {
        console.error("Image validation failed.");
        return undefined;
      }
      updateProgress(20);
  
      // Step 2: Convert image to generic code
      const genericCode = await this.convertImageToGenericCode(imageSrc);
      if (!genericCode) {
        console.error("Failed to convert image to generic code.");
        return undefined;
      }
      updateProgress(40);
  
      // Step 3: Comment the code
      const commentedCode = await this.commentCode(genericCode);
      if (!commentedCode) {
        console.error("Failed to comment the code.");
        return undefined;
      }
      updateProgress(60);
  
      // Step 4: Validate the components
      const isComponentValid = await this.validateComponent(commentedCode);
      if (!isComponentValid) {
        console.error("Component validation failed.");
        return undefined;
      }
      updateProgress(80);
  
      // Step 5: Convert to MODUS code
      const modusCode = await this.convertToModus(commentedCode, selectedModel);
      if (!modusCode) {
        console.error("Failed to convert to MODUS code.");
        return undefined;
      }
      updateProgress(95);
  
      return modusCode;
    } catch (error) {
      console.error("Error processing image to MODUS:", error);
      return undefined;
    }
  }

}
