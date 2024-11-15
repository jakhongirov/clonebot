const { fetch } = require('../postgres')

const addToken = (token, expired) => {
   const QUERY = `
      INSERT INTO 
         atmos_token (
            token,
            expires
         ) VALUES (
            $1,
            $2
         ) RETURNING *;
   `;

   return fetch(QUERY, token, expired)
}
const editToken = (oldToken, token, expired) => {
   const QUERY = `
      UPDATE
         atmos_token
      SET
         token = $2,
         expires = $3
      WHERE
         token = $1
      RETURNING *;
   `;

   return fetch(QUERY, oldToken, token, expired)
}

module.exports = {
   addToken,
   editToken
}