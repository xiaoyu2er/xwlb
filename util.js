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

module.exports = {
  isDate,
  parseDate,
  formatDate,
  formatDate2,
  formatDate3,
};
