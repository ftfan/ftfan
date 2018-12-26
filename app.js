
const Template = `
interface Window {
  FCoinHistoryData: {
    [index: string]: number;
    DateTime: number; // 期数
    TotalBaselineFT: number; // 基数
    RevenuesEquivalentBTC: number; // 折合BTC
    Per100wFTBTC: number;
  }[];
}
window.FCoinHistoryData = __FCoinHistoryData__;
`;

const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
    DateTime: parseFloat(FilterText(check.text().replace('收入分配-', '').replace('期', ''))),
    TotalBaselineFT: parseFloat(FilterText(bodydata.find('.p1 strong').eq(0).text())),
    RevenuesEquivalentBTC: parseFloat(FilterText(bodydata.find('p').eq(1).find('strong').eq(0).text())),
  };
  if (!data.TotalBaselineFT || !data.RevenuesEquivalentBTC) {
    data.TotalBaselineFT = parseFloat(FilterText(bodydata.find('strong').eq(0).text().replace(/[a-zA-Z]*/igm, '')));
    data.RevenuesEquivalentBTC = parseFloat(FilterText(bodydata.find('strong').eq(1).text().replace(/[a-zA-Z]*/igm, '')));
    if (!data.RevenuesEquivalentBTC) data.RevenuesEquivalentBTC = parseFloat(FilterText(bodydata.find('.s1').text().replace(/[a-zA-Z]*/igm, '')));
    if (!data.RevenuesEquivalentBTC) data.RevenuesEquivalentBTC = parseFloat(FilterText(bodydata.find('strong').eq(2).text().replace(/[a-zA-Z]*/igm, '')));
    if (!data.RevenuesEquivalentBTC) debugger;
    if (!data.TotalBaselineFT) debugger;
  }

  data.Per100wFTBTC = 1000000 * data.RevenuesEquivalentBTC / data.TotalBaselineFT;
  const trs = bodydata.find('tr');
  trs.each((index, tr) => {
    const tds = $(tr).find('td');
    data[FilterText(tds.eq(0).text()).trim()] = parseFloat(FilterText(tds.eq(1).text()));
  });
  return data;
}

function FilterText (text) {
  return text.replace(/ /igm, '').replace(/\n/igm, '');
}
