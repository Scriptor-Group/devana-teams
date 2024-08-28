# Devana Teams Bot

## How to Create an API Key
1. Go to Settings -> API -> Create API Key.
2. Copy the API key and paste it in the `devanaApiKey` field in the `config.ts` file.

## How to Select Your Agent
1. Go to My AI Agents -> Select the agent you want to use -> Copy the agent ID from the URL.
2. Paste the agent ID in the `devanaBotId` field in the `config.ts` file.

## Deploying the Bot

### Environment Variables
Add all required environment variables in the `.env` file. Alternatively, you can use the [VSCode extension for Microsoft Teams](https://marketplace.visualstudio.com/items?itemName=TeamsDevApp.ms-teams-vscode-extension) to set them up directly from VSCode.

## Extending the Basic Bot Template
The following documentation will help you extend the Basic Bot template:
- [Add or manage the environment](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-multi-env)
- [Create a multi-capability app](https://learn.microsoft.com/microsoftteams/platform/toolkit/add-capability)
- [Add single sign-on to your app](https://learn.microsoft.com/microsoftteams/platform/toolkit/add-single-sign-on)
- [Access data in Microsoft Graph](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-sdk#microsoft-graph-scenarios)
- [Use an existing Microsoft Entra application](https://learn.microsoft.com/microsoftteams/platform/toolkit/use-existing-aad-app)
- [Customize the Teams app manifest](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-preview-and-customize-app-manifest)
- Host your app in Azure by [provisioning cloud resources](https://learn.microsoft.com/microsoftteams/platform/toolkit/provision) and [deploying the code to the cloud](https://learn.microsoft.com/microsoftteams/platform/toolkit/deploy)
- [Collaborate on app development](https://learn.microsoft.com/microsoftteams/platform/toolkit/teamsfx-collaboration)
- [Set up the CI/CD pipeline](https://learn.microsoft.com/microsoftteams/platform/toolkit/use-cicd-template)
- [Publish the app to your organization or the Microsoft Teams app store](https://learn.microsoft.com/microsoftteams/platform/toolkit/publish)
- [Develop with Teams Toolkit CLI](https://aka.ms/teams-toolkit-cli/debug)
- [Preview the app on mobile clients](https://github.com/OfficeDev/TeamsFx/wiki/Run-and-debug-your-Teams-application-on-iOS-or-Android-client)
