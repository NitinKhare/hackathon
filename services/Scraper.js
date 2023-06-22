const puppeteer = require("puppeteer");
const cheerio = require('cheerio');

module.exports.getPageContent = async (url) => {
    try {
        const browser = await puppeteer.launch({headless: "new"});
        const page = await browser.newPage();
        await page.goto(url)
        let pageContent = await page.content({"waitUntil": "domcontentloaded"});
        await browser.close();
        const $ = cheerio.load(pageContent);
        $('iframe').remove()
        $('script').remove();
        $('style').remove();
        return {success: true, data: finalCleanup($('body').text().trim())}
    } catch (error) {
        console.error(error)
        return {
            success: false,
            error: error
        }
    }
}

function finalCleanup(html){
    const iFrameregex = /<iframe\b[^>]*>.*?<\/iframe>|<img\b[^>]*>/gi;
    return html.replace(iFrameregex, '').trim();
}
