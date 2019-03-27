const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.use('/static', express.static('/home/landing/static'));
app.use('/app/static', express.static('/home/main-app/static'));
app.use('/app', (req, res) => res.sendFile('/home/main-app/index.html'));
app.use('/', (req, res) => res.sendFile('/home/landing/index.html'));

app.listen(process.env.MAIN_PORT, () => {
  console.log('serve-client listening on port ' + process.env.MAIN_PORT);
});
