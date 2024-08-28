import config from "./config";
import fetch from "node-fetch";
import { nodeStreamToReadableStreamReader } from "./stream";

export class DevanaBot {
  private readonly API_URL = `https://api.devana.ai/`;
  private generating: boolean = false;

  constructor(private iaId: string) {}

  public sendMessage(
    message: string,
    options: {
      token: string;
      streaming?: boolean;
      files?: any[];
      chatId?: string;
      advancedCrawling?: boolean;
      searchZone?: any[];
      onTool?: (toolName: string) => void;
      onToolEnd?: () => void;
    }
  ) {
    return new Promise<{
      text: string;
      chatId: string;
    }>(async (resolve, reject) => {
      this.generating = true;

      const url = ` ${this.API_URL}${config.apiVersion}/chat/completions`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options?.token}`,
        },
        body: JSON.stringify({
          model: this.iaId,
          stream: options.streaming,
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      const reader = nodeStreamToReadableStreamReader(response.body);
      const loop = true;
      let fullMessage = "";
      let chatId = "";
      while (loop) {
        try {
          const { done, value } = await reader.read();
          if (done) break;
          const decoded = new TextDecoder().decode(value).trim();
          const decodedFormat = decoded.startsWith("data: ")
            ? decoded.slice(6)
            : decoded;

          let content;

          if (!options.streaming) {
            content = JSON.parse(decodedFormat)?.choices?.[0]?.message?.content;
            chatId = JSON.parse(decodedFormat)?.conversation_id;
            resolve({
              text: content,
              chatId: options.chatId || chatId,
            });
            break;
          } else {
            try {
              content = JSON.parse(decodedFormat)?.choices?.[0]?.delta?.content;
            } catch {
              content = decodedFormat;
            }
          }

          if (content) {
            if (
              content.startsWith("[tool:start") &&
              options.onTool &&
              options.streaming
            ) {
              const toolName = content.match(/\[tool:start:(.*)\]/)?.[1];
              if (toolName) {
                options.onTool(toolName);
              }
            } else if (
              content.startsWith("[tool:end") &&
              options.onToolEnd &&
              options.streaming
            ) {
              const toolName = content.match(/\[tool:end:(.*)\]/)?.[1];
              if (toolName) {
                options.onToolEnd();
              }
            } else {
              if (content.includes("DONE")) {
                resolve({
                  text: fullMessage,
                  chatId: options.chatId || chatId,
                });
                break;
              } else {
                if (!chatId) {
                  chatId = JSON.parse(decodedFormat)?.conversation_id;
                }
              }

              fullMessage += content;
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            break;
          } else if (error instanceof Error) {
            console.error(error);
            reject(error.message);
            break;
          }
          break;
        }
      }
    });
  }

  public isGenerating() {
    return this.generating;
  }
}
