
const Template = `
interface Window {
  FCoinHistoryData: {
    [index: string]: number;
    '日期': number; // 期数
    'FT基准数量': number; // 基数
    '总分红折合BTC': number; // 折合BTC
    '百万FT分红折合BTC': number;
  }[];
}
window.FCoinHistoryData = __FCoinHistoryData__;
`;

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// const axios = require('axios');
const axios = require('axios-https-proxy-fix');
axios.defaults.proxy = {
  host: '127.0.0.1',
  port: 50002,
};

const AllHref = [];
const AllData = [];

(async () => {
  await FeatchHref(1);
  const step = 20;
  let index = Math.ceil(AllHref.length / step);
  for (let i = 0;i < index;i++) {
    const ress = await Promise.all(AllHref.slice(i * step, (i + 1) * step).map(FeatchData));
    AllData.push(...ress);
    console.log('进度：', AllData.length, ress);
  }
  fs.writeFileSync(path.join(__dirname, './data/history.ts'), Template.replace('__FCoinHistoryData__', JSON.stringify(AllData, null, 2)), { flag: 'w' });
})();

async function FeatchHref (page) {
  const res = await axios.get(`https://support.fcoin.com/hc/zh-cn/sections/360001156334-%E6%94%B6%E5%85%A5%E5%88%86%E9%85%8D?page=${page}#articles`);
  if (res.status !== 200) return;
  const $ = cheerio.load(res.data);
  const as = $('.article-list .article-list-item a');
  if (as.length === 0) return;
  Array.prototype.slice.call(as).forEach(a => {
    AllHref.push(a.attribs.href);
  });
  return FeatchHref(page + 1);
}

async function FeatchData (href) {
  const res = await axios.get(`https://support.fcoin.com${href}`);
  if (res.status !== 200) return;
  const $ = cheerio.load(res.data);
  const check = $('.article-header .article-title');
  if (check.length === 0) return;
  const bodydata = $('.article-content .article-body');
  const data = {
    '日期': parseFloat(FilterText(check.text().replace('收入分配-', '').replace('期', ''))),
    'FT基准数量': parseFloat(FilterText(bodydata.find('.p1 strong').eq(0).text())),
    '总分红折合BTC': parseFloat(FilterText(bodydata.find('p').eq(1).find('strong').eq(0).text())),
  };
  if (!data['FT基准数量'] || !data['总分红折合BTC']) {
    data['FT基准数量'] = parseFloat(FilterText(bodydata.find('strong').eq(0).text().replace(/[a-zA-Z]*/igm, '')));
    data['总分红折合BTC'] = parseFloat(FilterText(bodydata.find('strong').eq(1).text().replace(/[a-zA-Z]*/igm, '')));
    if (!data['总分红折合BTC']) data['总分红折合BTC'] = parseFloat(FilterText(bodydata.find('.s1').text().replace(/[a-zA-Z]*/igm, '')));
    if (!data['总分红折合BTC']) data['总分红折合BTC'] = parseFloat(FilterText(bodydata.find('strong').eq(2).text().replace(/[a-zA-Z]*/igm, '')));
    if (!data['总分红折合BTC']) debugger;
    if (!data['FT基准数量']) debugger;
  }

  data['百万FT分红折合BTC'] = 1000000 * data['总分红折合BTC'] / data['FT基准数量'];
  const trs = bodydata.find('tr');

  let groupName = '';
  trs.each((index, tr) => {
    const tds = $(tr).find('td');
    let name = FilterText(tds.eq(0).text()).trim();
    if (name === 'FCoin') {
      groupName = 'FCoin';
      name = '折合BTC';
    }
    if (name === 'FCoinJP') {
      groupName = 'FCoinJP';
      name = '折合BTC';
    }
    const value = parseFloat(FilterText(tds.eq(1).text()));
    if (isNaN(value)) return;
    const names = ['分红'];
    if (groupName) names.push(groupName);
    names.push(name);
    data[names.join('-')] = value;
  });
  return data;
}

function FilterText (text) {
  return text.replace(/ /igm, '').replace(/\n/igm, '');
}
