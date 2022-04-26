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
        res.json({ "message": "Cannot register with notion" })
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
            res.json({ "message": "User already exits" })
            return
        }

        const dbID:string = await noto.getCloneDatabaseId(accessToken)
        const userId = await db.addWebUser(dbID, username, email, 'notion', accessToken, state)
        logger.info(`New notion user is registered with id ${userId}`)
        res.json({ "message": "Successfully registered"})
        bot.sendSuccessResponse()
        return
    } catch (err: any) {
        logger.error(`message - ${err.message}, stack trace - ${err.stack}`);
        res.status(409)
        res.json({ "error": err.message })
    }
}

export default {
    redirectCallback
}