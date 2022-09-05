const notion = {
    authorize_url: 'https://api.notion.com/v1/oauth/authorize',
    client_id: process.env.NOTION_CLIENT_ID || "",
    client_secret: process.env.NOTION_CLIENT_SECRET || "",
    redirect_url: process.env.NOTION_REDIRECT_URL || ""
}

export default notion;