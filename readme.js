const fs = require("fs");

function update() {
  var files = fs.readdirSync("./news").reverse();
  console.log(files);

  var news = files.map((f) => `+ [${f.replace(".md", "")}](./news/${f})`);
  var str = `# 新闻联播

## 如何使用
\`\`\`bash 
node index.js 2021-06-20 2021-06-30
\`\`\`
## 新闻列表
${news.join("\n")}
`;
  fs.writeFileSync("./README.md", str);
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
