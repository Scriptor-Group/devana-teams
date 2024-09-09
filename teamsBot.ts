import {
  ConversationState,
  MemoryStorage,
  TeamsActivityHandler,
  TurnContext,
} from "botbuilder";
import { DevanaBot } from "./devana";
import config from "./config";
import fetch from "node-fetch";

// Initialisez un stockage en mémoire pour le développement et les tests.
const memoryStorage = new MemoryStorage();

// Créez le state de conversation qui utilisera le stockage en mémoire.
const conversationState = new ConversationState(memoryStorage);

export class TeamsBot extends TeamsActivityHandler {
  private chatbot: DevanaBot;
  private conversationState: ConversationState;
  private values: any;
  private isProcessing: Map<string, boolean>;
  private readonly API_URL = `https://api.devana.ai/`;

  constructor() {
    super();

    // Liste des conversations en cours de traitement
    this.isProcessing = new Map();

    // Créez une instance de DevanaBot
    this.chatbot = new DevanaBot(config.devanaBotId);

    // Créez une instance de ConversationState avec le stockage en mémoire
    this.conversationState = conversationState;

    // Créez une propriété pour stocker l'identifiant de conversation et le token
    this.values = this.conversationState.createProperty("value");

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");

      let values = await this.values.get(context, {
        chatId: "",
        token: "",
      });

      if (!values?.token) {
        const fetcher = async () => {
          try {
            const route = "/chat/conversation/public/message/token";
            const url = `${this.API_URL}${config.apiVersion}${route}`;
            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.devanaApiKey}`,
              },
            });

            if (!response.ok) {
              throw new Error(
                "I'm sorry, an error occurred while processing your request, please try again later."
              );
            }

            return await response.json();
          } catch (error) {
            console.error(error);
          }
        };
        const data = await fetcher();
        values.token = data?.token;
        await this.values.set(context, {
          token: data?.token,
        });
        await this.conversationState.saveChanges(context);
      }

      // Si un message est déjà en cours de traitement, renvoyez une réponse appropriée
      if (this.isProcessing.get(context.activity.conversation.id)) {
        await context.sendActivity(
          "Un autre message est déjà en cours de traitement. Veuillez patienter."
        );
        return;
      }

      // Marquez la conversation comme en cours de traitement
      this.isProcessing.set(context.activity.conversation.id, true);

      const removedMentionText = TurnContext.removeRecipientMention(
        context.activity
      );
      const txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();

      try {
        await context.sendActivities([
          {
            type: "typing",
          },
        ]);

        const activity = await context.sendActivity("Please wait...");

        console.log(`Sending message to Devana (${values.chatId || ""}):`, txt);

        const payload = await this.chatbot.sendMessage(txt, {
          chatId: values.chatId || "",
          token: values.token || "",
          streaming: true,
          onTool: (toolName) => {
            context.updateActivity({
              id: activity.id,
              type: "message",
              text: `Devana tool is running: ${toolName}...`,
            });
          },
          onToolEnd: () => {
            context.updateActivity({
              id: activity.id,
              type: "message",
              text: "Please wait...",
            });
          },
        });

        await context.updateActivity({
          id: activity.id,
          type: "message",
          text: payload.text,
        });

        if (payload.chatId) {
          values.chatId = payload.chatId;
          await this.values.set(context, {
            token: values.token,
            chatId: payload.chatId,
          });
          await this.conversationState.saveChanges(context);
        }
      } catch (error) {
        console.error("Error:", error);

        // Marquez la conversation comme terminée
        this.isProcessing.set(context.activity.conversation.id, false);

        // Inform the user that an error occurred
        await context.sendActivity(
          "I'm sorry, an error occurred while processing your request, please try again later."
        );
      } finally {
        // Marquez la conversation comme terminée
        this.isProcessing.set(context.activity.conversation.id, false);
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          break;
        }
      }
      await next();
    });
  }
}
