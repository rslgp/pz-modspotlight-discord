const express = require('express');
const https = require('https');
const fs = require('node:fs');
// const scrape = require("../../lib/webscrapping")
const scrape = require("../git/pz-modspotlight-discord/lib/webscrapping")

const app = express();

const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/blueprints.055190.xyz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/blueprints.055190.xyz/fullchain.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/blueprints.055190.xyz/chain.pem')
};

const MAX_TWITTER = 50;
const messageFile = "update.lua";
const alphabetRegex = /[^a-zA-Z0-9 ,.]/g;
function treat(value) {
  if(!value) return null
  value = value.trim();
  value = value.toLowerCase();
  value = value.replace(alphabetRegex, ""); //only alphabetic
  value = value.replace(/(.)\1{2,}/g, "$1$1"); //trim repeated values
  return value;
}

// Sample route to get a query parameter named "name"
app.get('/zomboid-spotlight/mods', async (req, res) => {
  //console.log("get", req.headers);
  //accept: 'text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2',
  if(req.headers['user-agent'].indexOf("Java") === -1) 
  {res.send('fail\n'); return}
  
  if(req.query.workshopid === null) 
  {res.send('fail no workshopID\n'); return}
  
  if(req.query.steamid === null) 
  {res.send('fail no steamid\n'); return}
  
  if(req.query.desc===null || req.query.desc === "") 
  {res.send('fail no description\n'); return}
  if(req.query.desc && req.query.desc.length > MAX_TWITTER) 
  {res.send(`fail desc too long, max ${MAX_TWITTER}\n`); return}
  
  const workshopid = req.query.workshopid;
  let short_desc = treat(req.query.desc)
  if(!short_desc) {res.send('invalid input\n'); return}
  
  let mod_data = await scrape.getModData(workshopid);
  if(mod_data.subscriber_count > 200000)
  {res.send(`too big in subs ${mod_data.subscriber_count}\n`); return}
  if(mod_data.subscriber_count < 300)
  {res.send(`too small in subs ${mod_data.subscriber_count}\n`); return}
  
  
  if(mod_data.modName){
    let new_item = `${mod_data.modName}=${short_desc} ${mod_data.subscriber_count}`;
    fs.appendFile(messageFile, `${new_item}\n`, (err) => {
        if (err) {
          console.log(err);
          res.send('fail not saved\n');
          return
        }
        let log_text = `${new_item} by https://steamcommunity.com/profiles/${req.query.steamid}\n`
        console.log(log_text);
        res.send('success\n');
        fs.appendFile('log-persistent.txt', log_text, 'utf8', (err) => {
          if (err) throw err;
        });
        return
      });    
  }else{
      res.send('invalid workshop id\n');
      return
    
  }
});

const port = process.env.PORT || 8080;

// Create an HTTPS server using the Express app and https options
const server = https.createServer(httpsOptions, app);

server.listen(port, () => {
  console.log(`Server listening on port ${port} (HTTPS)`);
});
