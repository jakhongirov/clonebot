require('dotenv').config()
const model = require('./model')
const axios = require('axios');

const getToken = async () => {
   const encodedStr = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString('base64'); // Encoding for Node.js
   const timestampInSeconds = Math.floor(Date.now() / 1000);

   const data = new URLSearchParams({
      grant_type: 'client_credentials'
   });

   const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${encodedStr}`
   };

   try {
      const response = await axios.post('https://partner.atmos.uz/token', data.toString(), {
         headers
      });

      let token = response.data.access_token;
      let expired = timestampInSeconds + response.data.expires_in;
      await model.addToken(token, expired)

      return token;
   } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
   }
};

const refreshToken = async (oldToken) => {
   const encodedStr = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString('base64'); // Encoding for Node.js
   const timestampInSeconds = Math.floor(Date.now() / 1000);

   const data = new URLSearchParams({
      grant_type: 'client_credentials',
      refresh_token: oldToken
   });

   const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${encodedStr}`
   };

   try {
      const response = await axios.post('https://partner.atmos.uz/token', data.toString(), {
         headers
      });

      let token = response.data.access_token;
      let expired = timestampInSeconds + response.data.expires_in;
      await model.editToken(oldToken, token, expired)

      return token;
   } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
   }
}

const bindInit = async (card_number, expiry, token, expired) => {
   const timestampInSeconds = Math.floor(Date.now() / 1000);

   if (timestampInSeconds >= expired) {
      const newToken = await refreshToken(token)
      token = newToken
   }

   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
   };

   const data = {
      card_number: card_number,
      expiry: expiry
   }

   try {
      const response = await axios.post("https://partner.atmos.uz/partner/bind-card/init", data, {
         headers
      })

      console.log(response.data)
      return response.data
   } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
   }
}

const bindConfirm = async (code, trans_id, token, expired) => {
   const timestampInSeconds = Math.floor(Date.now() / 1000);

   if (timestampInSeconds >= expired) {
      const newToken = await refreshToken(token)
      token = newToken
   }

   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
   };

   const data = {
      transaction_id: trans_id,
      otp: code
   }

   try {
      const response = await axios.post("https://partner.atmos.uz/partner/bind-card/confirm", data, {
         headers
      })

      console.log(response.data)
      return response.data
   } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
   }
}

const createPay = async (amount, account, token, expired) => {
   const timestampInSeconds = Math.floor(Date.now() / 1000);

   if (timestampInSeconds >= expired) {
      const newToken = await refreshToken(token)
      token = newToken
   }

   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
   };

   const data = {
      amount: Number(amount),
      account: account,
      terminal_id: null,
      store_id: process.env.STORE_ID,
      lang: "ru"
   }

   try {
      const response = await axios.post("https://partner.atmos.uz/merchant/pay/create", data, {
         headers
      })

      return response.data
   } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
   }
}

const preApply = async (card_token, transaction_id, token, expired) => {
   const timestampInSeconds = Math.floor(Date.now() / 1000);

   if (timestampInSeconds >= expired) {
      const newToken = await refreshToken(token)
      token = newToken
   }

   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
   };

   const data = {
      card_token: card_token,
      store_id: process.env.STORE_ID,
      transaction_id: transaction_id
   }

   try {
      const response = await axios.post("https://partner.atmos.uz/merchant/pay/pre-apply", data, {
         headers
      })

      return response.data
   } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
   }
}

const apply = async (transaction_id, token, expired) => {
   const timestampInSeconds = Math.floor(Date.now() / 1000);

   if (timestampInSeconds >= expired) {
      const newToken = await refreshToken(token)
      token = newToken
   }

   const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
   };

   const data = {
      otp: 111111,
      store_id: process.env.STORE_ID,
      transaction_id: transaction_id
   }

   const response = await axios.post("https://partner.atmos.uz/merchant/pay/apply-ofd", data, {
      headers
   })
   console.log(response.data)
   return response.data
}

const removeCard = async (card_id, card_token, token, expired) => {
   try {
      const timestampInSeconds = Math.floor(Date.now() / 1000);

      if (timestampInSeconds >= expired) {
         const newToken = await refreshToken(token)
         token = newToken
      }

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
      };

      const data = {
         token: card_token,
         id: card_id,
      }

      const response = await axios.post("https://partner.atmos.uz/partner/remove-card", data, {
         headers
      })

      return response.data
   } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
   }
}

module.exports = {
   getToken,
   refreshToken,
   bindInit,
   bindConfirm,
   createPay,
   preApply,
   apply,
   removeCard
}