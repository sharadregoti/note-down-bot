# Deployments Steps
# 1) Push the image on GCR using script
# 2) Manually the deploy the new version GCP console
# 3) If url is changed used the below command to set new webhook url in telegram

# Set webhook url from cli
# FULL_URL_TO_FUNCTION is an env variable containing https://domain/telegraf/webhook
npm run set-webhook -- -t $BOT_TOKEN -D '{ "url": "'"$FULL_URL_TO_FUNCTION"'" }'
