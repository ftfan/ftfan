"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var main = document.getElementById('main');
var DataArr = [
    { Data: [], Title: 'FT基准数量', Key: 'TotalBaselineFT' },
    { Data: [], Title: '总折合BTC', Key: 'RevenuesEquivalentBTC' },
    { Data: [], Title: '百万FT分红BTC', Key: 'Per100wFTBTC' },
    { Data: [], Title: '时间抽', Key: 'DateTime' },
];
var BaseKeys = DataArr.map(function (item) { return item.Key; });
// const DataX = [] as number[];
var DataY = {};
DataArr.forEach(function (item) { return DataY[item.Key] = item; });
window.FCoinHistoryData.forEach(function (item) {
    // DataX.push(item.DateTime);
    DataY.TotalBaselineFT.Data.push([item.DateTime, item.TotalBaselineFT]);
    DataY.RevenuesEquivalentBTC.Data.push([item.DateTime, item.RevenuesEquivalentBTC]);
    DataY.Per100wFTBTC.Data.push([item.DateTime, item.Per100wFTBTC]);
    DataY.DateTime.Data.push([item.DateTime, item.DateTime]);
    for (var key in item) {
        if (BaseKeys.indexOf(key) > -1)
            continue; // 上面已经赋值
        DataY[key] = DataY[key] || { Data: [], Key: key, Title: key + "\u5206\u7EA2" };
        DataY[key].Data.push([item.DateTime, item[key]]);
    }
});
var query = {};
location.search.replace('?', '').split('&').map(function (item) { return item.split('='); }).forEach(function (item) { return query[item[0]] = item[1]; });
console.log('query', query);
var DateTimeRange = {
    Begin: query.Begin || '',
    End: query.End || '',
};
DataY.DateTime.Data.reverse();
var selectStart = document.createElement('select');
var selectEnd = document.createElement('select');
// 设置初始值
if (!DateTimeRange.Begin && !DateTimeRange.End) {
    var Day = 24 * 60 * 60 * 1000;
    var End = new Date(Date.now() - Day);
    var Now = new Date(Date.now() - 30 * Day);
    var NowStr = "" + Now.getFullYear().toString().substr(2) + ((Now.getMonth() + 1) < 10 ? '0' + (Now.getMonth() + 1) : (Now.getMonth() + 1)) + (Now.getDate() < 10 ? '0' + Now.getDate() : Now.getDate());
    var EndStr = "" + End.getFullYear().toString().substr(2) + ((End.getMonth() + 1) < 10 ? '0' + (End.getMonth() + 1) : (End.getMonth() + 1)) + (End.getDate() < 10 ? '0' + End.getDate() : End.getDate());
    DateTimeRange.Begin = NowStr;
    DateTimeRange.End = EndStr;
}
console.log('DateTimeRange', DateTimeRange);
DataY.DateTime.Data.forEach(function (item) {
    var val = item[0].toString();
    var optionStart = document.createElement('option');
    var optionEnd = document.createElement('option');
    optionStart.value = val;
    optionEnd.value = val;
    optionStart.innerText = val;
    optionEnd.innerText = val;
    if (val === DateTimeRange.Begin)
        optionStart.selected = true;
    if (val === DateTimeRange.End)
        optionEnd.selected = true;
    selectStart.appendChild(optionStart);
    selectEnd.appendChild(optionEnd);
});
function DataRangeChange() {
    location.href = location.origin + location.pathname + ("?Begin=" + selectStart.value + "&End=" + selectEnd.value);
}
selectStart.addEventListener('change', DataRangeChange);
selectEnd.addEventListener('change', DataRangeChange);
document.body.appendChild(selectStart);
document.body.appendChild(selectEnd);
(function () { return __awaiter(_this, void 0, void 0, function () {
    var min, max, key, el, data, h2, hr, DataData, myChart;
    return __generator(this, function (_a) {
        min = parseInt(DateTimeRange.Begin);
        max = parseInt(DateTimeRange.End);
        for (key in DataY) {
            if (key === 'DateTime')
                continue;
            el = document.createElement('div');
            data = DataY[key];
            el.style.height = '400px';
            h2 = document.createElement('h2');
            h2.innerHTML = data.Title;
            h2.style.width = '100%';
            hr = document.createElement('hr');
            hr.style.width = '100%';
            data.Data.reverse();
            DataData = data.Data.filter(function (item) {
                return item[0] >= min && item[0] <= max;
            });
            if (DataData.length === 0)
                return [2 /*return*/];
            el.style.width = DataData.length * 100 + 'px';
            document.body.appendChild(h2);
            document.body.appendChild(el);
            document.body.appendChild(document.createElement('br'));
            document.body.appendChild(hr);
            myChart = echarts.init(el);
            myChart.setOption({
                legend: { data: [data.Title] },
                // toolbox: { feature: { saveAsImage: {} } },
                xAxis: [{
                        type: 'category',
                        data: DataData.map(function (item) { return item[0]; }),
                    }],
                yAxis: [{ type: 'value' }],
                series: [{
                        name: data.Title,
                        type: 'line',
                        stack: data.Key,
                        itemStyle: { color: '#409eff' },
                        label: { normal: { show: true, rotate: 60 } },
                        data: DataData.map(function (item) { return item[1]; }),
                    }],
            });
            // await new Promise(resolve => setTimeout(resolve, 10));
        }
        return [2 /*return*/];
    });
}); })();
// const myChart = echarts.init(main);
// myChart.setOption(option as any);
// console.log(DataY, window.FCoinHistoryData);
//# sourceMappingURL=app.js.map