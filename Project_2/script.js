function graph1() {
    let numTransit = 0;
    let numEnterprise = 0;
    let numContent = 0;
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "input_2.1.txt", false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    numTransit = (result.match(/Transit/g) || []).length;
    numEnterprise = (result.match(/Enterprise/g) || []).length;
    numEnterprise = (result.match(/Enterpise/g) || []).length;
    numContent = (result.match(/Content/g) || []).length;
    createGraph_1(numTransit, numEnterprise, numContent);
}

function createGraph_1(transit, enterprise, content) {
    var ctx = document.getElementById("graph1").getContext('2d');
    Chart.defaults.global.plugins.datalabels.font.size = 30;
    var data = [{
        data: [transit, enterprise, content],
        backgroundColor: [
            "#4D4D4D",
            "#5DA5DA",
            "#FAA43A"
        ],
        borderColor: 'black',
        label: "AS Classification",
    }];

    var options = {
        responsive: true,
        legend: {
            display: true
        },
        title: {
            display: true,
            text: 'AS Classification'
        },
        plugins: {
            datalabels: {
                formatter: (value, ctx) => {

                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    let percentage = (value * 100 / sum).toFixed(2) + "%";
                    return percentage;


                },
                fontsize: 30,
                color: '#ffffff',

            }
        }
    };


    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            datasets: data,
            labels: ['Transit/Access', 'Enterprise', 'Content']
        },
        options: options
    });
}

let bin0 = 0;
let bin1 = 0;
let bin2_5 = 0;
let bin5_100 = 0;
let bin100_200 = 0;
let bin200_1000 = 0;
let bin1000_ = 0;
let p2p = [];
let p2c = [];
let p2pForward = [];
let p2pReverse = [];
let allp2pNodes = [];
let p2cDone = false;
let p2pDone = false;
let beginTime = 0;
let allValues = [];
let allBins = [];
let largestNum = 0;
let p2pUniqueASes = [];
let p2cUniqueASes = [];
let allUniqueASesFinal = [];
let allUniqueASesComplete = [];

function graph2() {
    beginTime = performance.now();
    let result = null;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "input_2.2.txt", false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText.split('\n');
    }

    for (let i = 0; i < result.length; i++) {
        let startIndex = result[i].indexOf('|', result[i].indexOf('|') + 1) + 1;
        let endIndex = result[i].indexOf('|', startIndex + 1);
        if (result[i].substring(startIndex, endIndex) == "0") {
            p2p.push(result[i]);
        } else {
            p2c.push(result[i]);
        }
    }
    for (let j = 0; j < p2p.length; j++) {
        allValues.push(parseInt(p2p[j].substring(0, p2p[j].indexOf('|'))));
        allValues.push(parseInt(p2p[j].substring(p2p[j].indexOf('|') + 1, p2p[j].indexOf('|', p2p[j].indexOf('|') + 1))));
    }
    for (let j = 0; j < p2c.length; j++) {
        allValues.push(parseInt(p2c[j].substring(0, p2c[j].indexOf('|'))));
        allValues.push(parseInt(p2c[j].substring(p2c[j].indexOf('|') + 1, p2c[j].indexOf('|', p2c[j].indexOf('|') + 1))));
    }
    allValues.sort(function (a, b) {
        return a - b
    });
    largestNum = allValues[allValues.length - 1];
    for (let k = 0; k < largestNum; k++) {
        allBins.push(0);
    }
    console.log("Largest number : " + largestNum);
    console.log("done putting list in p2p and p2c lists");
    graph2_p2c();
}

function graph2_p2p() {
    for (let i = 0; i < p2p.length; i++) {
        let startIndex = 0;
        let endIndex = p2p[i].indexOf('|', p2p[i].indexOf('|') + 1);
        let reverse = p2p[i].substring(p2p[i].indexOf('|') + 1, p2p[i].indexOf('|', p2p[i].indexOf('|') + 1)) + '|' + p2p[i].substring(0, p2p[i].indexOf('|'));

        //now that it's sorted, we will remove bar from p2p forward val, to compare with comp vals and reversed
        //vals.  do fast search to find appropriate value to search for, instead of 
        //linear search.  example, half way through list, see if less than or greater, then halve and h alve
        //etc etc
        p2pForward.push(p2p[i].substring(0, endIndex));
        /*
        if (p2pForward.indexOf(p2p[i].substring(0, endIndex)) > -1) {
            //string already exists
            console.log("normal string exists");
        } else {
            if (p2pForward.indexOf(reverse) > -1) {
                //reverse p2p exists
                console.log("reverse p2p exists");
            } else {
                p2pForward.push(p2p[i].substring(0, endIndex));
            }
        }
        */
        //p2pReverse.push(p2p[i].substring(p2p[i].indexOf('|') + 1, p2p[i].indexOf('|', p2p[i].indexOf('|') + 1)) + '|' + p2p[i].substring(0, p2p[i].indexOf('|')));
    }
    for (let i = 0; i < p2pForward.length; i++) {
        allp2pNodes.push(parseInt(p2pForward[i].substring(0, p2pForward[i].indexOf('|'))));
        allp2pNodes.push(parseInt(p2pForward[i].substring(p2pForward[i].indexOf('|') + 1, p2pForward[i].length)));
    }
    console.log("Number of p2pNodes = " + allp2pNodes.length);
    p2pUniqueASes = (allp2pNodes.reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []));
    for (let j = 0; j < allp2pNodes.length; j++) {
        allBins[allp2pNodes[j]] += 1;
    }
    for (let k = 0; k < p2pUniqueASes.length; k++) {
        allUniqueASesFinal.push(p2pUniqueASes[k]);
    }
    for (let k = 0; k < p2cUniqueASes.length; k++) {
        allUniqueASesFinal.push(p2cUniqueASes[k]);
    }
    console.log("all unique ASes initial = " + allUniqueASesFinal.length);
    allUniqueASesComplete = (allUniqueASesFinal.reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []));
    console.log("all unique ASes final = " + allUniqueASesComplete.length);
    p2pDone = true;
    graph2_print();
}

function graph2_p2c() {
    let currentNodes = [];
    for (let i = 0; i < p2c.length; i++) {
        currentNodes.push(parseInt(p2c[i].substring(0, p2c[i].indexOf('|'))));
        currentNodes.push(parseInt(p2c[i].substring((p2c[i].indexOf('|') + 1), p2c[i].indexOf('|', p2c[i].indexOf('|') + 1))));
    }
    console.log("Number of p2cNodes = " + currentNodes.length);
    p2cUniqueASes = (currentNodes.reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []));
    for (let i = 0; i < currentNodes.length; i++) {
        allBins[currentNodes[i]] += 1;
    }
    p2cDone = true;

    graph2_p2p();
}

function graph2_print() {
    for (let j = 0; j < allBins.length; j++) {
        if (allBins[j] == 0) {
            bin0++;
        } else if (allBins[j] == 1) {
            bin1++;
        } else if (allBins[j] >= 2 && allBins[j] < 5) {
            bin2_5++;
        } else if (allBins[j] >= 5 && allBins[j] < 100) {
            bin5_100++;
        } else if (allBins[j] >= 100 && allBins[j] < 200) {
            bin100_200++;
        } else if (allBins[j] >= 200 && allBins[j] < 1000) {
            bin200_1000++;
        } else if (allBins[j] >= 1000) {
            bin1000_++;
        }
    }
    let endTime = performance.now();
    console.log("total time taken = " + ((endTime - beginTime) / 1000) + " seconds.");
    console.log("bin 1 = " + bin1);
    console.log("bin 2 - 5 = " + bin2_5);
    console.log("bin 5 - 100 = " + bin5_100);
    console.log("bin 100 - 200 = " + bin100_200);
    console.log("bin 200 - 1000 = " + bin200_1000);
    console.log("bin 1000+ = " + bin1000_);
    let totalBinNum = bin1 + bin2_5 + bin5_100 + bin100_200 + bin200_1000 + bin1000_;
    createGraph_2(bin1, bin2_5, bin5_100, bin100_200, bin200_1000, bin1000_, totalBinNum);
}

function createGraph_2(bin1, bin2_5, bin5_100, bin100_200, bin200_1000, bin1000_, totalBinNum) {
    var ctx = document.getElementById("graph2").getContext('2d');
    Chart.defaults.global.plugins.datalabels.font.size = 30;
    var data = [{
        data: [((bin1 / totalBinNum) * 100).toFixed(2), ((bin2_5 / totalBinNum) * 100).toFixed(2), ((bin5_100 / totalBinNum) * 100).toFixed(2), ((bin100_200 / totalBinNum) * 100).toFixed(2), ((bin200_1000 / totalBinNum) * 100).toFixed(2), ((bin1000_ / totalBinNum) * 100).toFixed(2)],
        backgroundColor: [
            "#ffffff",
            "#5DA5DA",
            "#FAA43A",
            "#B3E5FC",
            "#4FC3F7",
            "#03A9F4"

        ],
        borderColor: 'black',
        label: "Bin Distribution",
    }];

    var options = {
        responsive: true,
        legend: {
            display: true
        },
        title: {
            display: true,
            text: 'AS Node Degree Distribution'
        },
        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    max: 50,
                    callback: function (value) {
                        return value + '%'
                    }
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Distribution Percentage (%)',
                }
            }]
        }

    };


    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: data,
            labels: ['Bin 1', 'Bin 2 - 5', 'Bin 5 - 100', 'Bin 100 - 200', 'Bin 200 - 1000', 'Bin > 1000']
        },
        options: options
    });
}


function graph3() {
    graph2();
    let allAs = [];
    let allInfoSets = [];
    let allInfoSetsUnique = [];
    var result = null;
    let alteredResult = [];
    let allIPSpace = [];
    let allInfo = [];
    let leftVar = [];
    let rightVar = [];
    let prefixVar = [];
    let totalNum = 0;
    let bin1 = 0; //2^10
    let bin2 = 0;
    let bin3 = 0;
    let bin4 = 0;
    let bin5 = 0;
    let bin6 = 0;
    let bin7 = 0;
    let bin8 = 0;
    let bin9 = 0;
    let bin10 = 0; //2^20

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "input_2.3.txt", false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText.split('\n');
    }
    for (let i = 0; i < result.length; i++) {
        result[i] = result[i].replace(/\s+/g, '|');
    }
    console.log("in here now 1");
    for (let i = 0; i < result.length; i++) {
        let initialStartIndex = result[i].indexOf('|', result[i].indexOf('|') + 1) + 1;
        let initialStartIndex2 = result[i].indexOf('|', result[i].indexOf('|') + 2) + 1;
        let initialEndIndex = result[i].length;
        let startIndex = initialStartIndex;
        let endIndex = initialEndIndex;
        if (result[i].substring(startIndex, endIndex).indexOf("_") > -1 || result[i].substring(startIndex, endIndex).indexOf(',') > -1) {
            if (result[i].substring(startIndex, endIndex).indexOf(',') > -1) {
                let prefixNum = result[i].substr(result[i].indexOf('|') + 1, 2);
                result[i] = result[i].substring(initialStartIndex2, result[i].length) + '|';
                while (result[i].indexOf(',') > -1 || result[i].indexOf('_') > -1) {
                    if (result[i].charAt(result[i].substring(0).search(/\D/)) == ',') {
                        leftVar.push(parseInt(result[i].substring(0, result[i].indexOf(','))));
                        rightVar.push(parseInt(result[i].substring(result[i].indexOf(',') + 1, result[i].substring(result[i].indexOf(',') + 1).search(/\D/) + result[i].indexOf(',') + 1)));
                        prefixVar.push(prefixNum);
                        result[i] = result[i].substring(result[i].indexOf(',') + 1, result[i].length);
                    } else if (result[i].charAt(result[i].substring(0).search(/\D/)) == '_') {
                        allInfoSets.push(result[i].substring(0, result[i].indexOf('_')) + '.' + prefixNum);
                        allInfoSets.push(result[i].substring(result[i].indexOf('_') + 1, result[i].substring(result[i].indexOf('_') + 1).search(/\D/) + result[i].indexOf('_') + 1) + '.' + prefixNum);
                        result[i] = result[i].substring(result[i].indexOf('_') + 1, result[i].length);
                    }
                }
                allInfoSetsUnique = allInfoSets.reduce(function (a, b) {
                    if (a.indexOf(b) < 0) a.push(b);
                    return a;
                }, []);
                for (let k = 0; k < allInfoSetsUnique.length; k++) {
                    allInfo.push(allInfoSetsUnique[k]);
                }
                allInfoSetsUnique = [];
                allInfoSets = [];

            } else {
                alteredResult[i] = result[i].substring(startIndex, endIndex);
                let numInstances = (alteredResult[i].match(/_/g) || []).length + 1;
                for (let j = 0; j < numInstances; j++) {
                    startIndex = 0;
                    if ((j + 2) > numInstances) {
                        endIndex = alteredResult[i].length;
                    } else {
                        endIndex = alteredResult[i].indexOf('_');
                    }
                    allAs.push(alteredResult[i].substring(startIndex, endIndex));
                    allInfo.push(alteredResult[i].substring(startIndex, endIndex) + "." + result[i].substr(result[i].indexOf('|') + 1, 2));
                    alteredResult[i] = alteredResult[i].substring(endIndex + 1, alteredResult[i].length);
                }
            }

        } else {
            allAs.push(result[i].substring(startIndex, endIndex));
            allInfo.push(result[i].substring(result[i].indexOf('|', result[i].indexOf('|') + 2) + 1, initialEndIndex) + "." + result[i].substr(result[i].indexOf('|') + 1, 2));
        }
    }
    console.log("in here now 2");
    for (let i = 0; i < allInfo.length; i++) {
        if (allInfo[i].indexOf("|") > -1) {
            allInfo[i] = allInfo[i].substring(0, allInfo[i].length - 1);
        }
        allInfo[i] = parseFloat(allInfo[i]);
    }
    console.log("in here now 3");
    allInfo.sort(function (a, b) {
        return a - b
    });
    for (let i = 0; i < allInfo.length; i++) {
        allInfo[i] = allInfo[i].toString();
    }
    for (let i = 0; i < allUniqueASesComplete.length; i++) {
        for (let j = 0; j < allInfo.length; j++) {
            if (parseInt(allUniqueASesComplete[i]) == parseInt(Math.floor(allInfo[j]))) {
                totalNum += Math.pow(2, 32 - parseInt(allInfo[j].substring(allInfo[j].indexOf('.') + 1, allInfo[j].length)));
            } else if (parseInt(allUniqueASesComplete[i]) > parseInt(Math.floor(allInfo[j]))) {
                for (let k = 0; k < leftVar.length; k++) {
                    if (parseInt(allUniqueASesComplete[i]) >= parseInt(leftVar[k]) && parseInt(allUniqueASesComplete[i]) <= parseInt(rightVar[k])) {
                        totalNum += Math.pow(2, 32 - prefixVar[k]);
                    }
                }
                if (parseInt(totalNum) == 0) {

                } else {
                    allIPSpace.push(totalNum);
                    totalNum = 0;
                }
                allInfo.splice(j - 2, 0);
                j = allInfo.length + 100000;
            }
        }
    }
    for (let i = 0; i < allInfo.length; i++) {
        allInfo[i] = allInfo[i].toString();
    }
    console.log("total IP space = " + allIPSpace.length);
    allIPSpace.sort(function (a, b) {
        return a - b
    });
    for (let i = 0; i < allIPSpace.length; i++) {
        if (parseInt(allIPSpace[i]) >= Math.pow(2, 10) && parseInt(allIPSpace[i]) < Math.pow(2, 11)) {
            bin1++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 11) && parseInt(allIPSpace[i]) < Math.pow(2, 12)) {
            bin2++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 12) && parseInt(allIPSpace[i]) < Math.pow(2, 13)) {
            bin3++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 13) && parseInt(allIPSpace[i]) < Math.pow(2, 14)) {
            bin4++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 14) && parseInt(allIPSpace[i]) < Math.pow(2, 15)) {
            bin5++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 15) && parseInt(allIPSpace[i]) < Math.pow(2, 16)) {
            bin6++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 16) && parseInt(allIPSpace[i]) < Math.pow(2, 17)) {
            bin7++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 17) && parseInt(allIPSpace[i]) < Math.pow(2, 18)) {
            bin8++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 18) && parseInt(allIPSpace[i]) < Math.pow(2, 19)) {
            bin9++;
        } else if (parseInt(allIPSpace[i]) >= Math.pow(2, 19) && parseInt(allIPSpace[i]) < Math.pow(2, 20)) {
            bin10++;
        }
    }
    console.log("Bin 1 = " + bin1);
    console.log("Bin 2 = " + bin2);
    console.log("Bin 3 = " + bin3);
    console.log("Bin 4 = " + bin4);
    console.log("Bin 5 = " + bin5);
    console.log("Bin 6 = " + bin6);
    console.log("Bin 7 = " + bin7);
    console.log("Bin 8 = " + bin8);
    console.log("Bin 9 = " + bin9);
    console.log("Bin 10 = " + bin10);
    console.log("largest IP space = " + allIPSpace[allIPSpace.length - 1]);
    console.log("smallest IP space = " + allIPSpace[0]);
    createGraph_3(bin1, bin2, bin3, bin4, bin5, bin6, bin7, bin8, bin9, bin10, allIPSpace.length)
}

function createGraph_3(bin1, bin2, bin3, bin4, bin5, bin6, bin7, bin8, bin9, bin10, totalBinNum) {
    var ctx = document.getElementById("graph3").getContext('2d');
    Chart.defaults.global.plugins.datalabels.font.size = 30;
    Chart.defaults.global.defaultFontSize = 30;
    var data = [{
        data: [((bin1 / totalBinNum) * 100).toFixed(2), ((bin2 / totalBinNum) * 100).toFixed(2), ((bin3 / totalBinNum) * 100).toFixed(2), ((bin8 / totalBinNum) * 100).toFixed(2), ((bin10 / totalBinNum) * 100).toFixed(2)],
        backgroundColor: [
            "#5DA5DA",
            "#FAA43A",
            "#B3E5FC",
            "#4FC3F7",
            "#03A9F4"

        ],
        borderColor: 'black',
        label: "Bin Distribution",
    }];

    var options = {
        responsive: true,
        legend: {
            display: true
        },
        title: {
            display: true,
            text: 'IP Space Distribution Across ASes'
        },
        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    max: 70,
                    callback: function (value) {
                        return value + '%'
                    }
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Percentage of ASes (%)',
                }
            }],
            xAxes: [{
                scaleLabel:{
                    display: true,
                    labelString: 'IP Space',
                }
            }]
        }

    };


    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: data,
            labels: ['2¹⁰ - 2¹¹', '2¹¹ - 2¹²', '2¹² - 2¹³', '2¹⁷ - 2¹⁸', '2¹⁹ - 2²⁰']
        },
        options: options
    });
}