# Telegram Bot Integration Guide

## Overview
This guide explains how to integrate a Telegram bot to monitor submissions and automatically process them with AI judging.

## Bot Setup

### 1. Create Telegram Bot
1. Message @BotFather on Telegram
2. Use `/newbot` to create a new bot
3. Save the bot token

### 2. Add Bot to Groups
1. Add your bot to the Telegram groups where tasks will be performed
2. Grant admin permissions to the bot
3. Get the chat ID using @RawDataBot

### 3. Bot Code Example (Node.js)

```javascript
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(YOUR_BOT_TOKEN, { polling: true });

// Monitor messages for submission tags
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  const userId = msg.from.id;
  const username = msg.from.username;

  // Check if message contains any submission tags
  const submissionTagMatch = messageText.match(/#\\w+/g);
  
  if (submissionTagMatch) {
    for (const tag of submissionTagMatch) {
      try {
        // Send to TaskVault API
        const response = await fetch('YOUR_DOMAIN/api/telegram/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageContent: messageText,
            telegramUserId: userId,
            telegramUsername: username,
            chatId: chatId,
            messageId: msg.message_id,
            submissionTag: tag
          })
        });

        const result = await response.json();
        
        if (result.success) {
          // Optional: React to message or send confirmation
          bot.sendMessage(chatId, 
            \`✅ Submission received! AI is processing your entry...\`, 
            { reply_to_message_id: msg.message_id }
          );
        }
      } catch (error) {
        console.error('Error processing submission:', error);
      }
    }
  }
});
```

## Workflow

1. **Task Creation**: 
   - Anyone creates a task with submission tag (e.g., #TaskVault2024)
   - Set Telegram chat ID and reward timing

2. **User Join**:
   - Users click "Join Task" (simple one-click)
   - No complex settings or verification needed

3. **Submission**:
   - Users post in Telegram group with the specified tag
   - Bot automatically detects and submits to API

4. **AI Judging**:
   - AI automatically evaluates submission against criteria
   - Scores 0-100, approves if ≥70

5. **Reward Distribution**:
   - **Instant**: Rewards sent immediately after AI approval
   - **Post-Event**: Rewards sent after task deadline

## API Endpoints

### Join Task
```
POST /api/tasks/{taskId}/join
Body: { walletAddress: "0x..." }
```

### Process Telegram Submission
```
POST /api/telegram/submit
Body: {
  messageContent: "...",
  telegramUserId: 123,
  telegramUsername: "user",
  chatId: -100123,
  messageId: 456,
  submissionTag: "#TaskVault2024"
}
```

## Database Schema

### Key Tables
- **TaskParticipation**: Simple join tracking
- **Submission**: Telegram content + AI scoring
- **Task**: Enhanced with submission tags and reward timing

### Submission Status Flow
1. **PENDING**: Initial submission received
2. **APPROVED**: AI approved (score ≥70)
3. **REJECTED**: AI rejected (score <70)
4. **REWARDED**: Reward distributed

## Security Considerations

1. **Bot Authentication**: Verify bot token in webhook
2. **Rate Limiting**: Prevent spam submissions
3. **User Verification**: Link Telegram users to wallet addresses
4. **Content Moderation**: Add content filters for inappropriate submissions

## Environment Variables

```
TELEGRAM_BOT_TOKEN=your_bot_token
OPENAI_API_KEY=your_openai_key (for AI judging)
WEBHOOK_SECRET=your_webhook_secret
```

## Production Deployment

1. Use webhooks instead of polling for better performance
2. Implement proper error handling and logging
3. Set up monitoring for bot status
4. Add backup systems for critical submissions