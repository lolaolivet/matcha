const env = {
  NODE_ENV: '"production"',
  MATCHA_SERVER_URL: `"${process.env.MATCHA_SERVER_URL}"`,
  MATCHA_SOCKET_URL: `"${process.env.MATCHA_SOCKET_URL}"`,
  SCOPE: '"/app/"',
};

module.exports = env;
