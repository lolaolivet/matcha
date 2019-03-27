CREATE TABLE user_auth (
  user_id SERIAL PRIMARY KEY,
  user_email VARCHAR(50),
  new_email VARCHAR(50),
  user_login VARCHAR(50),
  user_password VARCHAR(100),
  token_mail VARCHAR(100),
  token_pwd VARCHAR(100),
  confirmed BOOLEAN DEFAULT FALSE
);

CREATE TYPE gender AS ENUM ('male', 'female', 'other');

CREATE TABLE user_info (
  user_id INTEGER PRIMARY KEY REFERENCES user_auth (user_id),
  firstname VARCHAR(50),
  lastname VARCHAR(50),
  dob BIGINT,
  gender gender,
  bio TEXT,
  score FLOAT,
  last_in BIGINT,
  last_out BIGINT,
  created BIGINT,
  modified BIGINT
);

CREATE TABLE login_log (
  session_id SERIAL PRIMARY KEY,
  user_id INTEGER,
  created BIGINT,
  ip VARCHAR(50)
);

CREATE TABLE logout_log (
  user_id INTEGER REFERENCES user_auth (user_id),
  created BIGINT,
  ip VARCHAR(50)
);

CREATE TABLE match_log (
  user_1 INTEGER REFERENCES user_auth (user_id), -- Ideally, user_1 should be the first to have liked
  user_2 INTEGER REFERENCES user_auth (user_id),
  created BIGINT,
  modified BIGINT,
  unmatched BOOLEAN,
  latest BOOLEAN
);

CREATE TABLE like_log (
  sender_id INTEGER REFERENCES user_auth (user_id),
  receiver_id INTEGER REFERENCES user_auth (user_id),
  created BIGINT,
  modified BIGINT,
  unliked BOOLEAN,
  latest BOOLEAN
);

CREATE TABLE block_log (
  user_id INTEGER REFERENCES user_auth (user_id),
  blocked_id INTEGER REFERENCES user_auth (user_id),
  created BIGINT,
  last_modified BIGINT,
  unblocked BOOLEAN,
  latest BOOLEAN
);

CREATE TABLE report_log (
  user_id INTEGER REFERENCES user_auth (user_id),
  reported_id INTEGER REFERENCES user_auth (user_id),
  created BIGINT,
  latest BOOLEAN
);

CREATE TABLE display_log (
  user_id INTEGER REFERENCES user_auth (user_id),
  viewed_id INTEGER REFERENCES user_auth (user_id),
  created BIGINT,
  modified BIGINT,
  fullProfile BOOLEAN,
  latest BOOLEAN
);

CREATE TABLE location_log (
  user_id INTEGER REFERENCES user_auth (user_id),
  coordinates JSON,
  created BIGINT,
  infos JSON,
  latest BOOLEAN
);

CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES user_auth (user_id),
  looking_for_male BOOLEAN DEFAULT TRUE,
  looking_for_female BOOLEAN DEFAULT TRUE,
  looking_for_other BOOLEAN DEFAULT TRUE,
  age_max INTEGER,
  age_min INTEGER,
  score_max INTEGER,
  score_min INTEGER,
  distance_max INTEGER
);

CREATE TABLE images (
  image_id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES user_auth (user_id),
  image_name VARCHAR(255),
  image_path VARCHAR(255),
  created BIGINT,
  image_encoding VARCHAR(30),
  mimetype VARCHAR(30),
  size INTEGER,
  main_pic BOOLEAN
);

CREATE TABLE places (
  place_id SERIAL PRIMARY KEY,
  place_light VARCHAR(50),
  place_dark VARCHAR(50),
  active BOOLEAN
);

CREATE TABLE weapons (
  weapon_id SERIAL PRIMARY KEY,
  weapon_light VARCHAR(50),
  weapon_dark VARCHAR(50),
  active BOOLEAN
);

CREATE TABLE attitudes (
  attitude_id SERIAL PRIMARY KEY,
  attitude_light VARCHAR(50),
  attitude_dark VARCHAR(50),
  active BOOLEAN
);

CREATE TABLE place_log (
  user_id INTEGER REFERENCES user_auth (user_id) NOT NULL,
  place_id INTEGER REFERENCES places (place_id) NOT NULL,
  created BIGINT,
  latest BOOLEAN
);

CREATE TABLE weapon_log (
  user_id INTEGER REFERENCES user_auth (user_id) NOT NULL,
  weapon_id INTEGER REFERENCES weapons (weapon_id) NOT NULL,
  created BIGINT,
  latest BOOLEAN
);

CREATE TABLE attitude_log (
  user_id INTEGER REFERENCES user_auth (user_id) NOT NULL,
  attitude_id INTEGER REFERENCES attitudes (attitude_id) NOT NULL,
  created BIGINT,
  latest BOOLEAN
);

CREATE TABLE tag_questions (
  places_question VARCHAR(255),
  attitudes_question VARCHAR(255),
  weapons_question VARCHAR(255)
);

CREATE TABLE messages (
  msg_id SERIAL PRIMARY KEY,
  msg_ts BIGINT,
  msg_from INTEGER REFERENCES user_auth(user_id),
  msg_to INTEGER REFERENCES user_auth(user_id),
  seen BOOLEAN DEFAULT FALSE,
  seen_ts BIGINT,
  msg_txt TEXT
);

CREATE TYPE notif AS ENUM ('like', 'match', 'message', 'view', 'unlike');

CREATE TABLE notifications (
  receiver INTEGER REFERENCES user_auth(user_id),
  notif notif,
  sender INTEGER,
  created BIGINT,
  modified BIGINT,
  seen BOOLEAN
);