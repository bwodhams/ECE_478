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
    for(let j = 0; j < p2p.length; j++){
        allValues.push(parseInt(p2p[j].substring(0, p2p[j].indexOf('|'))));
        allValues.push(parseInt(p2p[j].substring(p2p[j].indexOf('|') + 1, p2p[j].indexOf('|', p2p[j].indexOf('|') + 1))));
    }
    for(let j = 0; j < p2c.length; j++){
        allValues.push(parseInt(p2c[j].substring(0, p2c[j].indexOf('|'))));
        allValues.push(parseInt(p2c[j].substring(p2c[j].indexOf('|') + 1, p2c[j].indexOf('|', p2c[j].indexOf('|') + 1))));
    }
    allValues.sort(function(a,b){return a - b});
    largestNum = allValues[allValues.length - 1];
    for(let k = 0; k < largestNum; k++){
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
    console.log("Number of unique p2p nodes : " + (allp2pNodes.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[])).length);
    for (let j = 0; j < allp2pNodes.length; j++) {
        allBins[allp2pNodes[j]] += 1;
    }
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
    console.log("Number of unique p2c nodes : " + (currentNodes.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[])).length);
    for(let i = 0; i < currentNodes.length; i++){
        allBins[currentNodes[i]] += 1;
    }
    p2cDone = true;

    graph2_p2p();
}

function graph2_print() {
    for (let j = 0; j < allBins.length; j++) {
        if(allBins[j] == 0){
            bin0++;
        }
        else if (allBins[j] == 1) {
            bin1++;
        }
        else if (allBins[j] >= 2 && allBins[j] < 5) {
            bin2_5++;
        }
        else if (allBins[j] >= 5 && allBins[j] < 100) {
            bin5_100++;
        }
        else if (allBins[j] >= 100 && allBins[j] < 200) {
            bin100_200++;
        }
        else if (allBins[j] >= 200 && allBins[j] < 1000) {
            bin200_1000++;
        }
        else if (allBins[j] >= 1000) {
            bin1000_++;
        }
    }
    let endTime = performance.now();
    console.log("total time taken = " + ((endTime - beginTime)/1000) + " seconds.");
    console.log("bin 1 = " + bin1);
    console.log("bin 2 - 5 = " + bin2_5);
    console.log("bin 5 - 100 = " + bin5_100);
    console.log("bin 100 - 200 = " + bin100_200);
    console.log("bin 200 - 1000 = " + bin200_1000);
    console.log("bin 1000+ = " + bin1000_);
    createGraph_2(bin1, bin2_5, bin5_100, bin100_200, bin200_1000, bin1000_);
}

function createGraph_2(bin1, bin2_5, bin5_100, bin100_200, bin200_1000, bin1000_) {
    var ctx = document.getElementById("graph2").getContext('2d');
    Chart.defaults.global.plugins.datalabels.font.size = 30;
    var data = [{
        data: [bin1, bin2_5, bin5_100, bin100_200, bin200_1000, bin1000_],
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
        scales:{
            yAxes: [{
                ticks: {
                    min: 0,
                    max: 8602,
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