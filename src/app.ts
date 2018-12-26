
const main = document.getElementById('main') as HTMLDivElement;

interface DataObj {
  Data: number[][];
  Title: string;
  Key: string;
}

const DataArr: DataObj[] = [
  { Data: [], Title: 'FT基准数量', Key: 'TotalBaselineFT' },
  { Data: [], Title: '总折合BTC', Key: 'RevenuesEquivalentBTC' },
  { Data: [], Title: '百万FT分红BTC', Key: 'Per100wFTBTC' },
  { Data: [], Title: '时间抽', Key: 'DateTime' },
];

const BaseKeys = DataArr.map(item => item.Key);
// const DataX = [] as number[];
const DataY: { [index: string]: DataObj; } = {};
DataArr.forEach(item => DataY[item.Key] = item);

window.FCoinHistoryData.forEach(item => {
  // DataX.push(item.DateTime);
  DataY.TotalBaselineFT.Data.push([item.DateTime, item.TotalBaselineFT]);
  DataY.RevenuesEquivalentBTC.Data.push([item.DateTime, item.RevenuesEquivalentBTC]);
  DataY.Per100wFTBTC.Data.push([item.DateTime, item.Per100wFTBTC]);
  DataY.DateTime.Data.push([item.DateTime, item.DateTime]);
  for (const key in item) {
    if (BaseKeys.indexOf(key) > -1) continue; // 上面已经赋值
    DataY[key] = DataY[key] || { Data: [], Key: key, Title: `${key}分红` };
    DataY[key].Data.push([item.DateTime, item[key]]);
  }
});

const query: { [index: string]: string } = {};
location.search.replace('?', '').split('&').map(item => item.split('=')).forEach(item => query[item[0]] = item[1]);
console.log('query', query);
const DateTimeRange = {
  Begin: query.Begin || '',
  End: query.End || '',
};

DataY.DateTime.Data.reverse();
const selectStart = document.createElement('select');
const selectEnd = document.createElement('select');

// 设置初始值
if (!DateTimeRange.Begin && !DateTimeRange.End) {
  const Day = 24 * 60 * 60 * 1000;
  const End = new Date(Date.now() - Day);
  const Now = new Date(Date.now() - 30 * Day);
  const NowStr = `${Now.getFullYear().toString().substr(2)}${(Now.getMonth() + 1) < 10 ? '0' + (Now.getMonth() + 1) : (Now.getMonth() + 1)}${Now.getDate() < 10 ? '0' + Now.getDate() : Now.getDate()}`;
  const EndStr = `${End.getFullYear().toString().substr(2)}${(End.getMonth() + 1) < 10 ? '0' + (End.getMonth() + 1) : (End.getMonth() + 1)}${End.getDate() < 10 ? '0' + End.getDate() : End.getDate()}`;
  DateTimeRange.Begin = NowStr;
  DateTimeRange.End = EndStr;
}
console.log('DateTimeRange', DateTimeRange);

DataY.DateTime.Data.forEach(item => {
  const val = item[0].toString();
  const optionStart = document.createElement('option');
  const optionEnd = document.createElement('option');
  optionStart.value = val;
  optionEnd.value = val;
  optionStart.innerText = val;
  optionEnd.innerText = val;
  if (val === DateTimeRange.Begin) optionStart.selected = true;
  if (val === DateTimeRange.End) optionEnd.selected = true;
  selectStart.appendChild(optionStart);
  selectEnd.appendChild(optionEnd);
});
function DataRangeChange () {
  location.href = location.origin + location.pathname + `?Begin=${selectStart.value}&End=${selectEnd.value}`;
}
selectStart.addEventListener('change', DataRangeChange);
selectEnd.addEventListener('change', DataRangeChange);
document.body.appendChild(selectStart);
document.body.appendChild(selectEnd);

(async () => {
  const min = parseInt(DateTimeRange.Begin);
  const max = parseInt(DateTimeRange.End);
  for (const key in DataY) {
    if (key === 'DateTime') continue;
    const el = document.createElement('div');
    const data = DataY[key];
    el.style.height = '400px';
    const h2 = document.createElement('h2');
    h2.innerHTML = data.Title;
    h2.style.width = '100%';
    const hr = document.createElement('hr');
    hr.style.width = '100%';

    data.Data.reverse();
    const DataData = data.Data.filter(item => {
      return item[0] >= min && item[0] <= max;
    });
    if (DataData.length === 0) return;
    el.style.width = DataData.length * 100 + 'px';

    document.body.appendChild(h2);
    document.body.appendChild(el);
    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(hr);
    const myChart = echarts.init(el);
    myChart.setOption({
      legend: { data: [data.Title] },
      // toolbox: { feature: { saveAsImage: {} } },
      xAxis: [{
        type: 'category',
        data: DataData.map(item => item[0]),
        // axisLabel: { interval: 0, rotate: -90 },
      }],
      yAxis: [{ type: 'value' }],
      series: [{
        name: data.Title,
        type: 'line',
        stack: data.Key,
        itemStyle: { color: '#409eff' },
        label: { normal: { show: true, rotate: 60 } },
        data: DataData.map(item => item[1]),
      }],
    } as any);
    // await new Promise(resolve => setTimeout(resolve, 10));
  }
})();

// const myChart = echarts.init(main);
// myChart.setOption(option as any);
// console.log(DataY, window.FCoinHistoryData);