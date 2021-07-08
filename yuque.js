const SDK = require("@yuque/sdk");
const fs = require("fs");
const { isDate, parseDate, formatDate, formatDate2, formatDate3 } = require("./util");
const namespace = "xiaoyu2er/xwlb";
const args = process.argv.slice(2);
const token = args[0];

const client = new SDK({
  token,
  // other options
});

function getDocUrl(doc) {
  if (doc) {
    return `https://www.yuque.com/xiaoyu2er/xwlb/${doc.slug}`;
  }
  return "";
}

async function getDocs() {
  try {
    const result = await client.docs.list({ namespace });
    return [null, result];
  } catch (e) {
    return [e];
  }
}

async function getDoc(date) {
  const id = formatDate(date);
  try {
    const result = await client.docs.get({ namespace, slug: id, data: { raw: 1 } });
    return [null, result];
  } catch (e) {
    return [e];
  }
}

async function createDoc(date) {
  const [err, doc] = await getDoc(date);
  if (doc) {
    return [err, doc];
  }

  if (err) {
    if (err.status !== 404) {
      return [err, doc];
    }
  }

  var id = formatDate(date);
  var text = fs.readFileSync(`./news/${id}.md`).toString().replace(/^.+\n/, "");

  try {
    const result = await client.docs.create({
      namespace,
      data: {
        title: `新闻联播 ${id}`,
        slug: `${id}`,
        public: 1,
        format: "markdown",
        body: text,
      },
    });

    return [null, result];
  } catch (e) {
    return [e];
  }

  //   result = await client.docs.delete({ namespace: "xiaoyu2er/ehuk28", id: 48568695 });
  //   console.log(result);
}

async function main() {
  var files = fs.readdirSync("./news").map((f) => f.replace(".md", ""));

  for (const file of files) {
    const [err, result] = await createDoc(file);
    console.log(file, err, getDocUrl(result));
  }
}

if (!module.parent) {
  // this is the main module
  //   getDocs().then(([err, result]) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log(result.map((doc) => getDocUrl(doc)).join("\n"));
  //     }
  //   });
  //   getDoc("2021-07-07").then(([err, doc]) => {
  //     if (err) {
  //       console.log(err.status);
  //     } else {
  //       console.log(getDocUrl(doc));
  //     }
  //   });

  let date = args[1] ? new Date(args[1]) : new Date();

  createDoc(date).then(([err, result]) => {
    if (err) {
      console.log(err);
    } else {
      console.log(date, getDocUrl(result));
    }
  });
} else {
  // we were require()d from somewhere else
}
