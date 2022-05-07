import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import ncfg from '../configs/notion.config';
import bot from '../services/bot.service';
import db from '../services/database.service';
import noto from '../services/notion.service';
import logger from '../utils/logger';


async function redirectCallback(req: Request, res: Response, next: NextFunction) {
    const err: any = req.query.error
    if (err) {
        logger.error(`Notion oauth redirect returned with error state ${err}`)
        res.render('message', { titileMsg: 'Failed', success: false, message: 'Cannot register with notion' });
        return
    }

    const code: any = req.query.code
    const state: any = req.query.state?.toString().split('-')[1]

    const body = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': ncfg.redirect_url
    };

    const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(ncfg.client_id + ':' + ncfg.client_secret).toString('base64'),
        }
    });
    const data = await response.json();

    const accessToken: string = data.access_token;
    const username: string = data.owner.user.name;
    const email: string = data.owner.user.person.email;

    try {
        const result = await db.getUserByEmail(email)
        if (result.length > 0) {
            logger.info(`User is already registered with email ${email}`)
            res.render('message', { titileMsg: 'Failed', success: false, message: 'User already exits' });
            return
        }

        logger.info("Access token is " + accessToken)
        const dbID: string = await noto.getCloneDatabaseId(accessToken)
        if (dbID === "") {
            throw new Error("Cannot find the required page, Did you dublicate the required notion paged?");
        }

        const userId = await db.addWebUser(dbID, username, email, 'notion', accessToken, state)
        logger.info(`New notion user is registered with id ${userId}`)

        res.render('message', { titileMsg: 'Success', success: true, message: 'You can now start sending links to telegram bot' });
        bot.sendSuccessResponse(state)
        return
    } catch (err: any) {
        logger.error(`message - ${err.message}, stack trace - ${err.stack}`);
        res.status(409)
        res.render('message', { titileMsg: 'Failed', success: false, message: err.message });
    }
}

export default {
    redirectCallback
}