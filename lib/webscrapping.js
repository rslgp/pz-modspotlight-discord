const axios = require('axios');
const cheerio = require('cheerio');
// const fs = require('fs');
// const path = require('path');

// Helper function to append data to a CSV file
// const appendDataToCSV = (data) => {
//   const filePath = path.join(__dirname, 'data.csv');
//   const csvLine = `${data.full_url};${data.modId};${data.modName};${data.creatorsWorkshopUrl};${data.creators};${data.collections_count};${data.visitor_count};${data.subscriber_count};${data.favorites_count};${data.ratings};${data.posted_date};${data.change_notes_count};${data.tags}\n`;
//   fs.appendFileSync(filePath, csvLine, 'utf8');
// };

function toNum(text) {
    const pattern = /\d+/;
    const match = text.replaceAll(",", "").match(pattern);
    if (match) {
        return parseInt(match[0], 10);
    } else {
        return "NA";
    }
}
const getModData = async (modId) => {

  const steamWorkshop = 'https://steamcommunity.com/sharedfiles/filedetails/?id=';
  let fullUrl = steamWorkshop + modId;
  try {
    const itemResponse = await axios.get(fullUrl);
      if (itemResponse.status === 200) {
        const itemSoup = cheerio.load(itemResponse.data);
        let modName = itemSoup('div.workshopItemTitle').text().trim();
        const ratings = itemSoup('div.numRatings').text().trim();
        const reviewAwardCounts = itemSoup('span.review_award_count').toArray().map(elem => parseInt(itemSoup(elem).text().trim(), 10));
        let awardsCount = reviewAwardCounts.reduce((acc, val) => acc + val, 0);
  
        const commentElem = itemSoup("div.commentthread_count > span > span");
        let commentsCount = commentElem ? commentElem.text().trim() : "0";
  
        // Similar extraction logic for other fields
  
        const creatorsWorkshopUrl = itemSoup("#ig_bottom .breadcrumbs a:nth-child(5)").attr('href') || "NA";
        const creatorsData = itemSoup('.creatorsBlock .friendBlock').toArray().map(block => {
        const $block = itemSoup(block);
        const name = $block.find('.friendBlockContent').text().trim().split('\n')[0];
        const url = $block.find('a.friendBlockLinkOverlay').attr('href') || "NA";
        return { name, url };
        });
        const creatorsStr = creatorsData.map(creator => creator.name).join(", ");

        const tagsElement = itemSoup("#mainContents .workshopItemPreviewArea .col_right .workshopTags a");
        const tags = tagsElement.toArray().map(elem => itemSoup(elem).text().trim()).join(", ");

        const changeNotesCount = itemSoup("div.detailsStatNumChangeNotes").text().trim().replace(/\D/g, '') || "NA";

        const collectionsCount = itemSoup('div.parentCollectionsNumOthers a').text().trim() || "NA";

        const statsTableRows = itemSoup('.stats_table tr').toArray();
        const visitorCount = statsTableRows.length > 0 ? toNum(itemSoup(statsTableRows[0]).find('td').text()) : "NA";
        const subscriberCount = statsTableRows.length > 1 ? toNum(itemSoup(statsTableRows[1]).find('td').text()) : "NA";
        const favoritesCount = statsTableRows.length > 2 ? toNum(itemSoup(statsTableRows[2]).find('td').text()) : "NA";

        commentsCount = toNum(itemSoup("div.commentthread_count > span > span").text().trim()) || "NA";
        awardsCount = itemSoup('span.review_award_count').toArray().reduce((acc, elem) => acc + parseInt(itemSoup(elem).text().trim(), 10), 0) || "NA";

        // Now we combine everything into the data object
        const data = {
        full_url: fullUrl.replace("&searchtext=", ""),
        modId,
        modName,
        creatorsWorkshopUrl,
        creators: creatorsStr,
        collections_count: toNum(collectionsCount),
        visitor_count: visitorCount,
        subscriber_count: subscriberCount,
        favorites_count: favoritesCount,
        ratings: toNum(ratings),
        // posted_date: postedDate,
        // updated_date: updatedDate,
        change_notes_count: Number(changeNotesCount),
        awards_count: awardsCount,
        comments_count: commentsCount,
        tags
        };

        // This data object is now filled with all the fields extracted and processed as per the Python code's logic.

        console.log(data)
        //appendDataToCSV(data);
        return data;
        console.log("Processed:", modName);
      } else {
      console.error('Request failed with status:', response.status_code);
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

// Replace 'your_full_url_here' with the actual URL you want to fetch
const modId = 2875848298
getModData(modId);

module.exports = {getModData}
