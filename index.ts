import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import oauthRoute from './src/routes/oauth.route';
import startBot from './src/services/bot.service';
import logger from './src/utils/logger';
import morganMiddleware from './src/middlewares/morgan';

const app = express();
const port:number = 3000;

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
  res.json({'message': 'ok'});
})

app.use('/oauth', oauthRoute);


/* Error handler middleware */
app.use((err: any, req:Request, res:Response, next:NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
});

app.listen(port, '0.0.0.0', () => {
  logger.info(`Server listening at http://localhost:${port}`)
  startBot.startBot()
});
