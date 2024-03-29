import { Pool, PoolConfig, QueryConfig, QueryResult } from "pg";

const cfg: PoolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
}

const pool: Pool = new Pool(cfg);

const removeUser = async (telegramId: number | undefined) => {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        const deleteUsers = `delete from bot.telegram_users where telegram_id = $1`
        const res = await client.query(deleteUsers, [telegramId])
        const deleteWebsites = 'delete from bot.telegram_users where telegram_id = $1'
        await client.query(deleteWebsites, [telegramId])
        await client.query('COMMIT')
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
}

const getTelegramUser = async (telegramId: number | undefined) => {
    const client = await pool.connect()

    try {
        const qc: QueryConfig = {
            text: 'select * from bot.telegram_users where telegram_id = $1',
            values: [telegramId]
        }

        const res = await client.query(qc)
        return res.rows
    } catch (e) {
        throw e
    } finally {
        client.release()
    }
}

const incrementUserMsg = async (telegramId: number | undefined) => {
    const client = await pool.connect()

    try {
        const qc: QueryConfig = {
            text: 'update bot.websites set messages_stored = messages_stored + 1 where telegram_id = $1 RETURNING id',
            values: [telegramId]
        }

        const res = await client.query(qc)
        return res.rows
    } catch (e) {
        throw e
    } finally {
        client.release()
    }
}


const addTelegramUser = async (telegramId: number | undefined, name: string | undefined) => {
    const client = await pool.connect()

    try {
        const qc: QueryConfig = {
            text: 'insert into bot.telegram_users(telegram_id, name) VALUES($1, $2) RETURNING id',
            values: [telegramId, name]
        }

        const res = await client.query(qc)
        return res.rows
    } catch (e) {
        throw e
    } finally {
        client.release()
    }
}

const getAccessToken = async (telegramId: number) => {
    const client = await pool.connect()

    try {
        const qc: QueryConfig = {
            text: 'select * from bot.websites where telegram_id = $1',
            values: [telegramId]
        }

        const res = await client.query(qc)
        return res.rows
    } catch (e) {
        throw e
    } finally {
        client.release()
    }
}


const getUserByEmail = async (email: string) => {
    const client = await pool.connect()

    try {
        const qc: QueryConfig = {
            text: 'select * from bot.websites where email_id = $1',
            values: [email]
        }

        const res = await client.query(qc)
        return res.rows
    } catch (e) {
        throw e
    } finally {
        client.release()
    }

}

const addWebUser = async (dbID: string, name: string, emailId: string, webName: string, accessToken: string, telegramId: number) => {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')
        const queryText = 'insert into bot.websites(web_name, user_name, email_id, access_token, telegram_id, meta) VALUES ($1, $2, $3, $4, $5, $6)'
        const res = await client.query(queryText, [webName, name, emailId, accessToken, telegramId, JSON.stringify({ "databaseId": dbID })])
        const insertPhotoText = 'update bot.telegram_users set is_registration_complete = $1 where telegram_id = $2'
        await client.query(insertPhotoText, [true, telegramId])
        await client.query('COMMIT')
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
}

export default {
    incrementUserMsg,
    addTelegramUser,
    getTelegramUser,
    getAccessToken,
    addWebUser,
    getUserByEmail,
    removeUser
}