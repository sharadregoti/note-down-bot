import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import oauthRoute from './src/routes/oauth.route';
import startBot from './src/services/bot.service';
import logger from './src/utils/logger';
import morganMiddleware from './src/middlewares/morgan';
import serverlessExpress from '@vendia/serverless-express';
import botService from './src/services/bot.service';

const app = express();
const port: number = 3000;

const TELEPATH = `/telegraf/webhook`
const webhookURL = `${process.env.WEBHOOKDOMAIN}${TELEPATH}`

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(morganMiddleware)
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (req: Request, res: Response) => {
  res.json({ 'message': 'ok' });
})

app.use('/oauth', oauthRoute);

/* Error handler middleware */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ 'message': err.message });

  return;
});

// setup our webhook url route
app.post(TELEPATH, (req, res) => {
  startBot.bot.handleUpdate(req.body)
  res.status(200).send('ok');
})

app.listen(port, '0.0.0.0', () => {
  logger.info(`Server listening at ${port}`)
  startBot.bot.webhookCallback
  try {
    startBot.startBot()
    // startBot.bot.createWebhook({ domain: process.env.WEBHOOKDOMAIN || "", path: TELEPATH })
  } catch (e: any) {
    logger.error(e.message)
  }
});

exports.handler = app