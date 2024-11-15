const {
   fetch
} = require('./src/lib/postgres')

const foundUser = (chat_id) => {
   const QUERY = `
      SELECT 
         *
      FROM
         users
      WHERE
         chat_id = $1;
   `;

   return fetch(QUERY, chat_id)
}
const foundCards = (chat_id) => {
   const QUERY = `
      SELECT 
         count(id)
      FROM
         cards
      WHERE
         user_id = $1;
   `;

   return fetch(QUERY, chat_id)
}
const editStep = (chatId, step) => {
   const QUERY = `
      UPDATE
         users
      SET
         step = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, step)
}
const createUser = (
   chatId,
   step,
   source
) => {
   const QUERY = `
      INSERT INTO
         users (
            chat_id,
            step
         ) VALUES (
            $1, 
            $2
         ) RETURNING *;
   `;

   return fetch(QUERY, chatId, step)
}
const editLang = (chatId, lang) => {
   const QUERY = `
      UPDATE
         users
      SET
         lang = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, lang)
}
const editName = (chatId, text) => {
   const QUERY = `
      UPDATE
         users
      SET
         name = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, text)
}
const addCardNumber = (chatId, text) => {
   const QUERY = `
      INSERT INTO
         cards (
            user_id,
            card_number
         ) VALUES (
            $1, 
            $2 
         ) RETURNING *;
   `;

   return fetch(QUERY, chatId, text)
}
const addCardExpiry = (chatId, text) => {
   const QUERY = `
      UPDATE
         cards
      SET
         expiry = $2
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, text)
}
const addCardTransId = (chatId, transaction_id) => {
   const QUERY = `
      UPDATE
         cards
      SET
         transaction_id = $2
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, transaction_id)
}
const foundCard = (chat_id) => {
   const QUERY = `
      SELECT 
         *
      FROM
         cards
      WHERE
         user_id = $1;
   `;

   return fetch(QUERY, chat_id)
}
const addCardData = (
   chatId,
   card_id,
   pen,
   expiry,
   card_holder,
   balance,
   phone,
   card_token
) => {
   const QUERY = `
      UPDATE
         cards
      SET
         card_id = $2,
         card_number_hash = $3,
         expiry = $4,
         card_holder = $5,
         balance = $6,
         phone_number = $7,
         card_token = $8
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(
      QUERY,
      chatId,
      card_id,
      pen,
      expiry,
      card_holder,
      balance,
      phone,
      card_token
   )
}
const addPhoneUser = (chatId, phoneNumber) => {
   const QUERY = `
      UPDATE
         users
      SET
         phone_number = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, phoneNumber)
};
const atmosToken = () => {
   const QUERY = `
      SELECT
         *
      FROM
         atmos_token
   `;

   return fetch(QUERY)
}

module.exports = {
   foundUser,
   foundCards,
   editStep,
   createUser,
   editLang,
   editName,
   addCardNumber,
   addCardExpiry,
   addCardTransId,
   foundCard,
   addCardData,
   addPhoneUser,
   atmosToken
}