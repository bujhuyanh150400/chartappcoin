start: pm2 start npm --name "chartappcoin" -- run dev
delete: pm2 delete chartappcoin
logs: pm2 logs chartappcoin 
stop: pm2 stop chartappcoin
restart: pm2 restart chartappcoin
status: pm2 status chartappcoin
