import parser, { Metadata } from 'html-metadata-parser';
import { Context, Telegraf } from 'telegraf';
import ncfg from '../configs/notion.config';
import tcfg from '../configs/telegram.config';
import db from '../services/database.service';
import logger from '../utils/logger';
import noto from './notion.service';

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}
const bot = new Telegraf<Context>(tcfg.security_code)

const sendSuccessResponse = async (telegramID: number) => {
  bot.telegram.sendMessage(telegramID, 'Connected Successfully 🥳')
}

function startBot() {
  logger.info("Starting telegram bot...")

  bot.command('start', (ctx: Context) => {
    ctx.replyWithMarkdownV2('Use the */register* command to start the registration process')
  })

  bot.command('register', (ctx: Context) => {

    let replyMsg: string = ""
    if (ctx.message === undefined) {
      replyMsg = "Cannot identify the user"
      ctx.reply(replyMsg)
      logger.info(`Context info is empty, message: ${replyMsg}`)
      return
    }

    const myURL = new URL(ncfg.authorize_url);
    myURL.searchParams.append('client_id', ncfg.client_id)
    myURL.searchParams.append('redirect_uri', ncfg.redirect_url)
    myURL.searchParams.append('response_type', 'code')
    myURL.searchParams.append('owner', 'user')
    myURL.searchParams.append('state', "message-" + ctx.message.from.id.toString())

    // TODO: use website table
    db.getTelegramUser(ctx.message.from.id).then(val => {
      if (val.length > 0 && val[0].is_registration_complete) {
        replyMsg = "Already registered with us"
        ctx.reply(replyMsg)
        logger.info(`Telegram user with id ${ctx.message?.from.id}, message: ${replyMsg}`)
        return
      }

      db.addTelegramUser(ctx.message?.from.id, ctx.message?.from.first_name)
        .then(() => {
          logger.info(`Registered first time telegram user with id ${ctx.message?.from.id}`)
        })
        .catch((e) => {
          ctx.reply("Cannot initiate registration")
          return
        })

      ctx.replyWithMarkdownV2('*👇 Follow this link to connect your notion account*')
      ctx.reply(myURL.toString());
    })
  })

  bot.on('text', (ctx) => {

    let replyMsg: string = ""
    if (ctx.message === undefined) {
      replyMsg = "Cannot identify the user"
      ctx.reply(replyMsg)
      logger.info(`Context info is empty, message: ${replyMsg}`)
      return
    }

    if (ctx.message.text.toLowerCase() === "hi") {
      ctx.replyWithMarkdownV2('Use the */register* command to start the registration process')
      return
    }

    if (ctx.message.text.toLowerCase() === "start") {
      return
    }

    const httpIndex: number = ctx.message.text.indexOf('http')
    let linkMsg: string = ctx.message.text;
    if (httpIndex) {
      linkMsg = ctx.message.text.substr(httpIndex)
    }
    logger.info(`Message from ${ctx.message.from.id} is ${linkMsg}`)

    var parsedText: URL
    try {
      parsedText = new URL(linkMsg)
    } catch (err: any) {
      ctx.reply("Invalid URL was passed, cannot save the link")
      logger.error(`message - ${err.message}, stack trace - ${err.stack}`);
      return
    }

    parser(linkMsg)
      .then((result: Metadata) => {

        let siteName: string = toTitleCase(parsedText.host);
        if (result.og.site_name !== undefined) {
          siteName = result.og.site_name;
        }

        const title: string = (result.og.title === undefined) ? siteName : result.og.title
        const typeOfDoc: string = (result.og.type === undefined) ? "NA" : result.og.type

        noto.getLastId(ctx.message.from.id)
          .then((num: number) => {
            noto.addItem(num + 1, title, linkMsg, typeOfDoc, ctx.message.from.id)
              .then(() => {
                ctx.reply("Saved Succesfully")
              })
              .catch((err: any) => {
                logger.error(`message - ${err.message}, stack trace - ${err.stack}`);
                ctx.reply("Failed to save")
              })
          })
          .catch((err: any) => {
            logger.error(`message - ${err.message}, stack trace - ${err.stack}`);
            ctx.reply("Failed to save")
          })
      })
  })

  bot.launch()
  logger.info("Telegram bot started")
}

export default {
  startBot,
  sendSuccessResponse
}


// TODO: Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))