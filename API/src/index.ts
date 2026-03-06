import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import type { Locale } from './types';
import { getWord } from './service';
import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config();
}

const app = express();
const port = Number(process.env.PORT) || 3333;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const locale: Locale = req.body.locale;
  res.send(getWord(locale));
});

app.listen(port, () => {
  console.log(`HangmanAPI up and running on port ${port}`);
  console.log(`Currently in ${process.env.NODE_ENV} mode`);
});
