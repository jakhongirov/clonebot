const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.BOT_TOKEN, {
   polling: {
      interval: 1000,
      autoStart: true,
      allowedUpdates: ['chat_member'] // Explicitly allow chat_member updates
   }
});

const createOneTimeLink = async () => {
   try {
      const link = await bot.createChatInviteLink(process.env.CHANNEL_ID, {
         expire_date: Math.floor(Date.now() / 1000) + (60 * 60), // Link expires in 1 hour (adjust as needed)
         creates_join_request: true // Enables the "Request to Join" feature
      });
      console.log('Request Join Link:', link.invite_link);
      return link.invite_link;
   } catch (error) {
      console.error('Error creating request join link:', error);
   }
};

async function removeUserFromChannel(userId) {
   try {
      await bot.kickChatMember(process.env.CHANNEL_ID, userId);
      console.log(`User with ID ${userId} has been removed from the channel.`);
   } catch (error) {
      console.error('Error removing user:', error);
   }
}

module.exports = {
   bot,
   createOneTimeLink,
   removeUserFromChannel
}