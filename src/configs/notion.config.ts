const notion = {
    authorize_url: 'https://api.notion.com/v1/oauth/authorize',
    client_id: 'bdbbabd6-69e8-4b81-bb21-47cd285ee690',
    // Not useful for public notion integration
    client_secret: 'secret_CjGvjEMfmD3JIl4WMFch3i3XGQ3RqERuP97y2zF4ZuH',
    redirect_url: (process.env.NODE_ENV || "development" == 'development') ? 'http://localhost:3000/oauth' : 'https://sharadregoti.com/oauth',
    // This should come from the database
    database_id: '021e663e04824dad833b7f3d68618c15' 
}

export default notion;