const Crawler = require("crawler");
const fs = require("fs");
const cheerio = require("cheerio");
const TurndownService = require("turndown");
const turndownService = new TurndownService();
const args = process.argv.slice(2);

const date1 = +new Date(2010, 0, 1);
const date2 = +new Date(2016, 01, 03);
const updateReadme = require("./readme").update;

const today = new Date().setHours(23, 59, 59);
console.log("Today is", formatDate(today));
const oneDay = 24 * 60 * 60 * 1000;

const options = {
  jQuery: {
    name: "cheerio",
    options: {
      decodeEntities: false,
      normalizeWhitespace: true,
      xmlMode: true,
    },
  },
  maxConnections: 8,
};
function isDate(date) {
  return Object.prototype.toString.call(date) == "[object Date]";
}

function parseDate(date) {
  if (!isDate(date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = ("" + (date.getMonth() + 1)).padStart(2, "0");
  const day = ("" + date.getDate()).padStart(2, "0");
  const hours = ("" + date.getHours()).padStart(2, "0");
  const minutes = ("" + date.getMinutes()).padStart(2, "0");
  const seconds = ("" + date.getSeconds()).padStart(2, "0");

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
  };
}

function formatDate(date) {
  const { year, month, day } = parseDate(date);
  return `${year}-${month}-${day}`;
}

function formatDate2(date) {
  const { year, month, day } = parseDate(date);
  return `${year}${month}${day}`;
}

function formatDate3(date) {
  const { year, month, day, hours, minutes, seconds } = parseDate(date);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getUrl(date) {
  if (!isDate(date)) {
    date = new Date(date);
  }
  if (+date < date1) {
    console.log(formatDate(date), "< date1", formatDate(date1));
    return "";
  }
  if (+date > today) {
    console.log(formatDate(date), "> today", formatDate(today));
    return "";
  }

  const str = formatDate2(date);

  if (+date < date2) {
    // 暂时不解析
    console.log(formatDate(date), "< date2", formatDate(date2));

    return "";
    return `http://news.cctv.com/program/xwlb/${str}.shtml`;
  }

  return `https://tv.cctv.com/lm/xwlb/day/${str}.shtml`;
}

function getNewsDetailQueues(date) {
  const urls = [];
  const url = getUrl(date);
  if (!url) {
    return urls;
  }
  return new Promise((resolve) => {
    const c = new Crawler({
      ...options,
      callback: (error, res, done) => {
        const uri = res.request.uri;
        const href = uri.href;
        console.log(formatDate(date), href);
        if (error) {
          console.error(error);
          done();
          return;
        }

        const $ = res.$;

        $("a").each((i, ele) => {
          if (i > 0) {
            urls.push($(ele).attr("href").replace("http://news.cntv.cn/", "http://tv.cctv.com/"));
          }
        });

        done();
      },
    });

    c.queue(url);
    c.on("drain", () => {
      resolve(urls);
    });
  });
}

function getNewsDetail(date, queues) {
  const result = [];
  return new Promise((resolve) => {
    const c = new Crawler({
      ...options,
      callback: (error, res, done) => {
        const uri = res.request.uri;
        const href = uri.href;
        if (error) {
          console.log(formatDate(date), href);
          console.error(error);
          done();
          return;
        }

        const $ = res.$;

        const title = $(".cnt_nav h3").text().trim().replace("[视频]", "");
        //   const content = $(".cnt_bd").text();
        const html = $(".cnt_bd").html();
        const markdown = turndownService.turndown(html);

        //   console.log(title);
        //   console.log(html);
        //   console.log(markdown);

        const index = queues.indexOf(href);
        result[index] = {
          href,
          title,
          html,
          markdown,
        };

        done();
      },
    });

    c.queue(queues);
    c.on("drain", () => {
      resolve(result);
    });
  });
}

function toFile(date, result, cb) {
  const main = result
    .map((r) => {
      return `## ${r.title}\n\n${r.markdown}\n
*[原文](${r.href})*
`;
    })
    .join("\n");

  //   const { year, month, day } = parseDate(date);
  const dateStr = formatDate(date);
  const content = `# 新闻联播 ${dateStr}\n\n${main}\n
更新于 ${formatDate3(new Date())}
  `;

  return new Promise((resolve) => {
    fs.writeFile(`./news/${dateStr}.md`, content, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`news/${dateStr}.md done`);
      }
      resolve(err);
    });
  });
}

async function main(startDate, endDate) {
  if (!endDate) {
    endDate = startDate;
  }
  days = (+endDate - +startDate) / oneDay;

  const dates = new Array(days + 1).fill(0).map((v, i) => {
    return new Date(+startDate + i * oneDay);
  });
  console.log(
    "dates",
    dates.map((d) => {
      return formatDate(d);
    })
  );
  const ps = dates.map((nowDate) => {
    const p = (async (date) => {
      const queues = await getNewsDetailQueues(date);

      console.log(queues);
      if (!queues.length) {
        console.log(`${formatDate(nowDate)} 暂无新闻联播`);
        return;
      }

      const result = await getNewsDetail(date, queues);
      await toFile(date, result);
    })(nowDate);

    return p;
  });

  await Promise.all(ps);

  updateReadme();
  console.log("done");

  //   return;
}

if (args.length) {
  const date1 = new Date(args[0]);
  const date2 = args[1] ? new Date(args[1]) : date1;
  main(date1, date2);
} else {
  let date1 = new Date();
  const date2 = new Date(+date1);
  main(date1, date2);
}
