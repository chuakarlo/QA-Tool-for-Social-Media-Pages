require('events').EventEmitter.defaultMaxListeners = 15;

let throng = require('throng');
let Queue = require("bull");

let REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379/0";
// let REDIS_URL = process.env.REDIS_URL || "user:AxFrUWTjCgU3RqgkaNxfeiwYsNb3E8TP@SG-qatoolserver-32041.servers.mongodirector.com:6379";
// let REDIS_URL = process.env.REDIS_URL || "redis-19222.c80.us-east-1-2.ec2.cloud.redislabs.com:19222";
let workers = process.env.WEB_CONCURRENCY || 2;
let maxJobsPerWorker = 50;
let workQueue = new Queue('work', REDIS_URL);

function start() {
  console.log(" [200] " + "Worker Status - running at port 6379");
  workQueue.process(maxJobsPerWorker, async (job) => {
    cleanQueue();
    console.log("I am a worker :)");
    let reviews = null;

    switch(job.data.type) {
      case 'tp':
        reviews = await main_tp(job.data.url);
        break;
      case 'fb':
        reviews = await main_fb(job.data.url);
        break;
      case 'gr':
        reviews = await main_gr(job.data.url);
        break;
    }

    job.data.reviews = reviews;
    job.progress(100);

    return {reviews: reviews};
  });
}

function cleanQueue() {
  console.log('cleaning worker...');
  workQueue.clean(0, 'delayed');
  workQueue.clean(0, 'completed');
  workQueue.clean(0, 'failed');
}

throng({ workers, start });

const puppeteer = require('puppeteer');
const tr = require('timeago-reverse');

async function main_tp(url) {
  console.log("Fetching: " + url)
  var data = [];
  try {
      const browser = await puppeteer.launch({
        headless : true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
          ],
        });
      const page = await browser.newPage();
      page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36');
      await page.goto(url,{ waitUntil: 'networkidle0',timeout: 3000000 });

      while (true) {
        await page.waitForSelector('.review-list');
        const sections = await page.$$('.review-card');
        for(i = 0; i < sections.length; i++){
          //get date
          const d = await page.$$('.review-content-header__dates script');
          const d_text = await (await d[i].getProperty('innerText')).jsonValue();
          const d_array = JSON.parse(d_text);

          //get account name
          const a = await page.$$('.consumer-information__name');
          const a_text = await (await a[i].getProperty('innerText')).jsonValue();

          //get url
          const selector = '.review__consumer-information a'
          await page.waitForSelector(selector);
          const u_text = await page.$$eval(selector, am => am.filter(e => e.href).map(e => e.href))
    
          //get article text
          const body = await page.$$('.review-content__body');

          const p = await body[i].$('.review-content__text');

          var p_text = "";

          if (p) {
            p_text = await (await p.getProperty('innerText')).jsonValue();
          } else {
            const h2 = await body[i].$('.review-content__title a');
            p_text = await (await h2.getProperty('innerText')).jsonValue();
          }

          //get replies
          const s_reviews = ('.review__company-reply');
          try {
            var r = await sections[i].$$(s_reviews);

            if (r.length != 0) {
              const content = await sections[i].$$('.brand-company-reply__content');

              var r_text = (await (await content[0].getProperty('textContent')).jsonValue()).toString();
            } else {
              var r_text = "";
            }
          }
          catch (e)
          {
            console.log(e);
            var r_text = "";
          }

          //push all data to data array
          data.push({
            date : d_array.publishedDate,
            account_name : a_text,
            url : u_text[i],
            article : p_text,
            replies : r_text
          });


        }

        const nextPage = await page.$$('a.button.button--primary.next-page');

        if (nextPage.length != 0) {
          await nextPage[0].click();
        } else {
          break;
        }
      }
      return data;
      await browser.close();      
  }
  catch (e){
    console.log('error ', e);
  }
}

async function main_gr(url) {
  console.log("Fetching: " + url)
  var data = [];  
  try {
    const browser = await puppeteer.launch({
        headless : true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
          ],
        });
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 })
    //needs to click on the see all reviews
    await page.goto(url,{ waitUntil: 'networkidle0',timeout: 3000000 });

    await page.waitForSelector('.jqnFjrOWMVU__right');

    await page.click('.jqnFjrOWMVU__button');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    for(i=0; i < 5; i++){
      await page.evaluate(GRScroll);
      await page.waitFor(2000)
    }
        
    //checks for 'See more' button and clicks
    for(i=0; i < 1; i++){
      const cssSelector = '.section-expand-review.blue-link';
      const isElementVisible = async (page, cssSelector) => {
        let visible = true;
        await page
          .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
          .catch(() => {
            visible = false;
          });
        return visible;
      };
      
      let loadMoreVisible = await isElementVisible(page, cssSelector);
      while (loadMoreVisible) {
        await page.click(cssSelector, {delay: 1000})
        await page.waitFor(2000)
          .catch(() => {});
        loadMoreVisible = await isElementVisible(page, cssSelector);
      }
    }
    //end of 'See more' button
    
    await page.waitForSelector('.section-layout');
    const sections = await page.$$('.section-review');
    const share_button = await page.$x("//button[contains(.,'Share')]");
    var repeat = true;

    for(i = 0; i < sections.length; i++){
      //get date
      const d = await page.$$('.section-review-publish-date');
      var d_ = await (await d[i].getProperty('innerText')).jsonValue();
      const d_text = tr.parse(d_.toString());
      //get account name
      const a = await page.$$('.section-review-titles a .section-review-title');
      const a_text = await (await a[i].getProperty('innerText')).jsonValue();

      if (repeat) {
        // //get url
        await share_button[i].click();
        try {
          await page.waitForSelector('input.section-copy-link-input');

          const link = await page.$$('input.section-copy-link-input');
          const close_button = await page.$$('button.close-button.close-button-white-circle');
          const link_input = await (await link[0].getProperty('value')).jsonValue();
          var u_text = link_input.toString();

          await close_button[0].click();
        } catch(e) {
          console.log(e);
          repeat = false;
        }
      }
      
      //get article text
      const p = await page.$$('.section-review-review-content');    
      const p_text = await (await p[i].getProperty('innerText')).jsonValue();

      //push all data to data array
      data.push({
        date : d_text,
        account_name : a_text,
        url : u_text,
        article : p_text
      });     
    }
    return data;
    await browser.close();      
  }
  catch (e){
    console.log('error ', e);
  }
}

async function main_fb(url) {
  console.log("Fetching: " + url)
  var data = [];
  try {
    const browser = await puppeteer.launch({
        headless : true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
          ],
        });
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36');
    //needs to click on the see all reviews
    await page.goto(url,{ waitUntil: 'networkidle0',timeout: 3000000 });
    await autoScroll(page);
    await page.waitForSelector('#recommendations_tab_main_feed');
    const sections = await page.$$('.userContentWrapper');

    //removing all ellipsis identified by QAS-Jarvin

    const rem = ".text_exposed_hide";
    await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      for(var i=0; i< elements.length; i++){
        elements[i].parentNode.removeChild(elements[i]);
      }
    }, rem);

    const rem1 = "see_more_link_inner";
    await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      for(var i=0; i< elements.length; i++){
        elements[i].parentNode.removeChild(elements[i]);
      }
    }, rem1);   



    for(i = 0; i < sections.length; i++){
      // get date
      const d = await page.$$eval(".fsm > ._5pcq > abbr", el => el.map(x => x.getAttribute("data-utime")));
      const d_text = parseInt(d[i] * 1000);

      //get account name
      const a = await page.$$('.fwb');
      const a_text = await (await a[i].getProperty('textContent')).jsonValue();

      //get url
      const selector = '.fsm > a'
      await page.waitForSelector(selector);
      const u_text = await page.$$eval(selector, am => am.filter(e => e.href).map(e => e.href))

      //get article text
      const p = await page.$$('.userContent');
      const p_text = await (await p[i].getProperty('textContent')).jsonValue();

      //get replies
      const s_reviews = ('._3l3x');
      try {
        var r = await sections[i].$$(s_reviews);

        if (await sections[i].$('._7a8-') === null) {
          if (await sections[i].$('a._3hg-._42ft') !== null) {
            await sections[i].$eval('a._3hg-._42ft', el => el.click());
            await page.waitFor(3000);
            r = await sections[i].$$(s_reviews);
          }
        }

        if (r.length != 0) {
          if (await r[0].$('a._5v47.fss') !== null) {
            await r[0].$eval('a._5v47.fss', el => el.click());
          }

          var r_text = (await (await r[0].getProperty('textContent')).jsonValue()).toString();  
        } else {
          var r_text = "";
        }
      }
      catch (e)
      {
        console.log(e);
        var r_text = "";
      }

      //push all data to data array
      data.push({
        date : d_text,
        account_name : a_text,
        url : u_text[i],
        article : p_text,
        replies: r_text
        
      });     
    }
    return data;
    await browser.close();        
  }
  catch (e){
    console.log('error ', e);
  }
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

async function GRScroll() { //scroll function for GR scroll menu 
  await new Promise(resolve => {
    const distance = 100; // should be less than or equal to window.innerHeight
    const delay = 100;
    const timer = setInterval(() => {
      document.querySelector('.section-layout.section-scrollbox.scrollable-y').scrollBy(0, distance);
      if (document.querySelector('.section-layout.section-scrollbox.scrollable-y').scrollTop + window.innerHeight >= document.querySelector('.section-layout.section-scrollbox.scrollable-y').scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}