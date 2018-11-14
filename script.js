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
    createGraph(numTransit, numEnterprise, numContent);

    function createGraph(transit, enterprise, content) {
        var ctx = document.getElementById("myChart").getContext('2d');
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
}

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
    console.log("done putting list in p2p and p2c lists");
    graph2_p2c();
    graph2_p2p();
}

function graph2_p2p() {
    console.log("in graph p2p");
    console.log("still in p2p");
    for (let i = 0; i < p2p.length; i++) {
        let startIndex = 0;
        let compVals = [];
        let endIndex = p2p[i].indexOf('|', p2p[i].indexOf('|') + 1);
        let reverse = p2p[i].substring(p2p[i].indexOf('|') + 1, p2p[i].indexOf('|', p2p[i].indexOf('|') + 1)) + '|' + p2p[i].substring(0, p2p[i].indexOf('|'));
        for(let j = 0; j < p2p.length; j++){
            compVals.push(parseInt((p2p[j].substring(0, p2p[j].indexOf('|', p2p[j].indexOf('|') + 1))).replace('|', '')));
        }
        compVals.sort(function(a,b){return a - b});
        //now that it's sorted, we will remove bar from p2p forward val, to compare with comp vals and reversed
        //vals.  do fast search to find appropriate value to search for, instead of 
        //linear search.  example, half way through list, see if less than or greater, then halve and h alve
        //etc etc
        if (p2pForward.indexOf(p2p[i].substring(0, endIndex)) > -1) {
            //string already exists
        } else {
            if (p2pForward.indexOf(reverse) > -1) {
                //reverse p2p exists
            } else {
                p2pForward.push(p2p[i].substring(0, endIndex));
            }
        }
        //p2pReverse.push(p2p[i].substring(p2p[i].indexOf('|') + 1, p2p[i].indexOf('|', p2p[i].indexOf('|') + 1)) + '|' + p2p[i].substring(0, p2p[i].indexOf('|')));
    }
    console.log("here 1");
    for (let i = 0; i < p2pForward.length; i++) {
        allp2pNodes.push(p2pForward[i].substring(0, p2pForward[i].indexOf('|')));
        allp2pNodes.push(p2pForward[i].substring(p2pForward[i].indexOf('|') + 1, p2pForward[i].length));
    }
    console.log("here 2");
    for (let j = 0; j < allp2pNodes.length; j++) {
        allp2pNodes[j] = parseInt(allp2pNodes[j]);
        if (allp2pNodes[j] == 1) {
            bin1++;
        }
        if (allp2pNodes[j] >= 2 && allp2pNodes[j] < 5) {
            bin2_5++;
        }
        if (allp2pNodes[j] >= 5 && allp2pNodes[j] < 100) {
            bin5_100++;
        }
        if (allp2pNodes[j] >= 100 && allp2pNodes[j] < 200) {
            bin100_200++;
        }
        if (allp2pNodes[j] >= 200 && allp2pNodes[j] < 1000) {
            bin200_1000++;
        }
        if (allp2pNodes[j] >= 1000) {
            bin1000_++;
        }

    }
    console.log("done p2p");
    p2pDone = true;
}

function graph2_p2c() {
    console.log("in p2c graph function");
    let currentNodes = [];
    for (let i = 0; i < p2c.length; i++) {
        currentNodes.push(parseInt(p2c[i].substring(0, p2c[i].indexOf('|'))));
        currentNodes.push(parseInt(p2c[i].substring((p2c[i].indexOf('|') + 1), p2c[i].indexOf('|', p2c[i].indexOf('|') + 1))));
    }
    console.log("done p2c parsing int");

    for (let j = 0; j < currentNodes.length; j++) {
        if (currentNodes[j] == 1) {
            bin1++;
        }
        if (currentNodes[j] >= 2 && currentNodes[j] < 5) {
            bin2_5++;
        }
        if (currentNodes[j] >= 5 && currentNodes[j] < 100) {
            bin5_100++;
        }
        if (currentNodes[j] >= 100 && currentNodes[j] < 200) {
            bin100_200++;
        }
        if (currentNodes[j] >= 200 && currentNodes[j] < 1000) {
            bin200_1000++;
        }
        if (currentNodes[j] >= 1000) {
            bin1000_++;
        }
    }
    console.log("done p2c");
    p2cDone = true;

    function waitFunc() {
        if (p2pDone == false) {
            setTimeout(waitFunc, 500);
        } else {
            graph2_print();
        }
    }
    waitFunc();
}

function graph2_print() {
    let endTime = performance.now();
    console.log("total time taken = " + ((endTime - beginTime)/1000) + " seconds.");
    console.log("bin 1 = " + bin1);
    console.log("bin 2 - 5 = " + bin2_5);
    console.log("bin 5 - 100 = " + bin5_100);
    console.log("bin 100 - 200 = " + bin100_200);
    console.log("bin 200 - 1000 = " + bin200_1000);
    console.log("bin 1000+ = " + bin1000_);
}