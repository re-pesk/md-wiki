// https://gist.github.com/schollz/4dcd045a95196f567ba0abdd0ac70452
const puppeteer = require('puppeteer');
const fs = require('fs');

async function getPageContent(md_file) {
  url = "http://localhost:3000/mdwiki-debug.html#!" + md_file
  console.log(">>> Fetching " + url)

  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    // console.log(`Intercepting: ${request.method} ${request.url}`);
    request.continue();
  });
  await page.goto(url, {waitUntil: 'load'});
  
  // const title = await page.title();
  // console.log(title);
  // await page.screenshot({path:'example.png'});
  const html = await page.content();
  browser.close();

  return html;
}

(async () => {
  // TODO: get from mdwiki/src/assets/*.md
  const pages = ["index", "cheatsheet"];

  for (const page of pages) {
    const content = await getPageContent(page + ".md")
    outfile = "./" + page + ".html"

    try {
      console.log(">>> Writing " + outfile)
      fs.writeFileSync(outfile, content);
      // file written successfully
    } catch (err) {
      console.error(err);
    }  
  }
})();
