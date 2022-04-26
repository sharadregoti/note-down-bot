import { Client } from "@notionhq/client"
import { text } from "telegraf/typings/button"
import ncfg from '../configs/notion.config'
import db from '../services/database.service'
import logger from "../utils/logger"

async function getCloneDatabaseId(accessToken: string): Promise<string> {
    try {
        const notion = new Client({ auth: accessToken })
        const response = await notion.search({
            query: "Bookmarks",
            filter: {
                property: "object",
                value: "database"
            }
        })

        for (const obj of response.results) {
            const myres: any = obj
            if (myres.properties.Sr === undefined) {
                continue
            }
            if (myres.properties.Title === undefined) {
                continue
            }
            if (myres.properties.Link === undefined) {
                continue
            }
            if (myres.properties.Tags === undefined) {
                continue
            }
            return obj.id
        }
    } catch (error: any) {
        throw error
    }

    return ""
}

async function getLastId(telegramId: number): Promise<number> {

    try {
        const res = await db.getAccessToken(telegramId)
        const notion = new Client({ auth: res[0].access_token })
        const databaseId: string = res[0].meta.databaseId

        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 1,
        });

        if (response.results.length === 0) {
            logger.info("Length of notion database query returned zero results")
            return 0
        }

        const myres: any = response.results[0]
        return myres.properties.Sr.number
    } catch (error: any) {
        throw error
    }

}

async function addItem(id: number, title: string, url: string, tag: string, telegramId: number) {
    
    try {
        const res = await db.getAccessToken(telegramId)
        const notion = new Client({ auth: res[0].access_token })
        const databaseId: string = res[0].meta.databaseId

        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Sr: {
                    type: "number",
                    number: id
                },
                Title: {
                    type: "title",
                    title: [
                        {
                            text: {
                                content: title,
                            }
                        }
                    ],
                },
                Link: {
                    type: "url",
                    url: url,
                },
                Tags: {
                    type: "multi_select",
                    multi_select: [
                        {
                            name: tag,
                        }
                    ]
                }
            },
        })
    } catch (error: any) {
        throw error
    }
}

export default {
    addItem,
    getLastId,
    getCloneDatabaseId
}
