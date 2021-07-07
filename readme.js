const fs = require("fs");
const showdown = require("showdown");
const converter = new showdown.Converter();

function update() {
  var files = fs.readdirSync("./news").reverse();
  var htmlFiles = fs.readdirSync("./html").reverse();
  console.log(files);

  var news = files.map((f) => `+ [${f.replace(".md", "")}](./news/${f})`);
  var newsHtml = htmlFiles.map(
    (f) => `+ [${f.replace(".html", "")}](https://raw.githubusercontent.com/xiaoyu2er/xwlb/master/html/${f})`
  );
  var str = `# 新闻联播

## 如何使用
\`\`\`bash 
node index.js 2021-06-20 2021-06-30
\`\`\`
## 新闻列表
${news.join("\n")}
`;

  const htmlContent = converter.makeHtml(`
${newsHtml.join("\n")}
`);
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>新闻联播</title>
  </head>
  <body>
${htmlContent}
  </body>
</html>
`;

  fs.writeFileSync("./README.md", str);
  fs.writeFileSync("./README.html", html);
}

function rename() {
  var files = fs.readdirSync("./news");
  files.forEach((f) => {
    var dest = f.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
    // console.log(f, dest);
    fs.renameSync(`./news/${f}`, `./news/${dest}`);
  });
}
module.exports = {
  update,
};

if (!module.parent) {
  // this is the main module
  // rename();
  update();
} else {
  // we were require()d from somewhere else
}
