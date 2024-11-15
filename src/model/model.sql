CREATE TABLE users (
   id bigserial,
   chat_id bigint PRIMARY KEY,
   phone_number text,
   name text,
   step text DEFAULT 'start',
   subscribe boolean DEFAULT false,
   expired text,
   source text,
   lang text,
   trial int DEFAULT 1,
   duration boolean DEFAULT false,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE atmos_token (
   id bigserial PRIMARY KEY,
   token text,
   expires int
);

CREATE TABLE cards (
   id bigserial PRIMARY KEY,
   card_number_hash text,
   card_number text,
   card_id int,
   expiry text,
   otp int,
   card_token text,
   phone_number text,
   card_holder text,
   balance int,
   transaction_id int,
   user_id bigint REFERENCES users(chat_id) ON DELETE CASCADE,
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
