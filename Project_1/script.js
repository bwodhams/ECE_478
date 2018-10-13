//TO DO : change collision -  CW should only double when A and C have the same backoff. 

function generateTimings(itterationNum) {
    //Get user defined values
    let frameSize = document.getElementById("dataFrameSize").value;
    let ackRtsCtsSize = document.getElementById("ackRtsCtsSize").value;
    let slotDuration = document.getElementById("slotDuration").value * 0.000001;
    let difsDuration = document.getElementById("difsDuration").value * 0.000001;
    let sifsDuration = document.getElementById("sifsDuration").value * 0.000001;
    let transmRate = document.getElementById("transmRate").value;
    let cw0 = document.getElementById("cw0").value;
    let cwMax = document.getElementById("cwMax").value;
    //let lambdaAC = document.getElementById("lambdaAC").value;
    let simTimeSec = document.getElementById("simTime").value;

    let initialLambda = [50, 100, 200, 300];
    let lambdaAC = initialLambda[itterationNum];

    //Convert everything to be in terms of slots
    let difsToSlots = difsDuration / slotDuration;
    let sifsToSlots = sifsDuration / slotDuration;
    let transmRateToSlots = Math.ceil(((frameSize * 8) / (transmRate * 1000000)) * (1 / slotDuration));
    let ackToSlots = Math.ceil(((ackRtsCtsSize * 8) / (transmRate * 1000000)) * (1 / slotDuration));
    let simTimeToSlots = simTimeSec / slotDuration;

    //Initialize uA, uC, xA, xC
    let uA = [];
    let uC = [];
    let xA = [];
    let xC = [];
    //Generate timings for uA
    for (let i = 0; i < lambdaAC * simTimeSec; i++) {
        let randomNum = Math.random();
        if (uA.includes(randomNum)) {
            i--;
        } else {
            uA[i] = randomNum;
        }
    }
    uA.sort(sortTimings);

    //Generate timings for uC
    for (let i = 0; i < lambdaAC * simTimeSec; i++) {
        let randomNum = Math.random();
        if (uC.includes(randomNum)) {
            i--;
        } else {
            uC[i] = randomNum;
        }
    }
    uC.sort(sortTimings);

    //Populate xA and xC values into array -> convert packets into slots
    for (timing in uA) {
        xA[timing] = (((-1 / lambdaAC) * Math.log(1 - uA[timing])));
    }
    for(timing in xA){
        xA[timing] = Math.ceil(xA[timing] / slotDuration);
    }

    for (timing in uC) {
        xC[timing] = Math.ceil(((-1 / lambdaAC) * Math.log(1 - uC[timing])) / slotDuration);
    }
    //Convert difference in timings to actual slot times
    for (timing in xA) {
        if (timing == 0) {

        } else {
            xA[timing] = xA[timing] + xA[timing - 1];
        }
    }

    for (timing in xC) {
        if (timing == 0) {

        } else {
            xC[timing] = xC[timing] + xC[timing - 1];
        }
    }

    //Output to table on page
    let output = '<table><tr><th>Slot Number</th><th>X<sub>A</sub> Slot</th><th>X<sub>C</sub> Slot</th></tr>';
    for (timing in xA) {
        output += '<tr><td>' + (timing * 1 + 1) + '</td><td>' + xA[timing] + '</td><td>' + xC[timing] + '</td></tr>';
    }
    document.getElementById("output").innerHTML = output;
    calculate(xA, xC, parseInt(difsToSlots), parseInt(cw0), parseInt(cwMax), parseInt(transmRateToSlots), parseInt(sifsToSlots), parseInt(ackToSlots), parseInt(simTimeToSlots), parseInt(frameSize), parseInt(simTimeSec));
    //calculate([1], [1], parseInt(difsToSlots), parseInt(cw0), parseInt(cwMax), parseInt(transmRateToSlots), parseInt(sifsToSlots), parseInt(ackToSlots), parseInt(simTimeToSlots));
}

function sortTimings(a, b) {
    return a - b;
}

function randomBackoff(max) {
    return Math.floor(Math.random() * (max + 1));
    //return prompt("Enter value");
}

function calculate(xAIn, xCIn, difs, cw0, cwMax, transSlots, sifs, ackSlots, simTime, frameSizeIn, simTimeSecIn) {
    let currentSlot = 0;
    let aSlots = xAIn;
    let cSlots = xCIn;
    let aBackoffMax = cw0;
    let cBackoffMax = cw0;
    let numCollisions = 0;
    let aCollisions = 0;
    let cCollisions = 0;
    let aTotCollisions = 0;
    let cTotCollisions = 0;
    let aFailed = 0;
    let cFailed = 0;
    let aSuccess = 0;
    let cSuccess = 0;
    let aDone = false;
    let cDone = false;
    
    while ((currentSlot < simTime) && ((aSlots.length + cSlots.length) > 0)) {
        let aBackoff = 0;
        let cBackoff = 0;
        let sendingA = false;
        let sendingC = false;
        aBackoff = randomBackoff(aBackoffMax);
        cBackoff = randomBackoff(cBackoffMax);
        if ((aSlots[0] <= currentSlot && cSlots[0] <= currentSlot) && (cDone == false) && (aDone == false)) {
            //console.log("aBack = " + aBackoff + " cBack = " + cBackoff);
            //console.log("aBackMax = " + aBackoffMax + " cBackMax = " + cBackoffMax);
            //console.log("a = " + (aSlots[0] + aBackoff) + " c = " + (cSlots[0] + cBackoff) + " current slot = " + currentSlot);
            //console.log("<------------------------------------------------------->");
            while ((aBackoff) == (cBackoff) && ((aDone == false) && (cDone == false))) {
                if (aBackoffMax > cwMax) {
                    aBackoffMax = cw0;
                    aSlots.shift();
                    aFailed++;
                    if (aSlots.length == 0) {
                        aDone = true;
                    }

                }
                if (cBackoffMax > cwMax) {
                    cBackoffMax = cw0;
                    cSlots.shift();
                    cFailed++;
                    if (cSlots.length == 0) {
                        cDone = true;
                    }
                }
                currentSlot += difs;
                numCollisions++;
                aCollisions++;
                cCollisions++;
                aBackoffMax *= 2;
                cBackoffMax *= 2;
                aBackoff = randomBackoff(aBackoffMax);
                cBackoff = randomBackoff(cBackoffMax);
                console.log("aBack = " + aBackoff + " cBack = " + cBackoff);
                console.log("aBackMax = " + aBackoffMax + " cBackMax = " + cBackoffMax);
                console.log("a = " + (aSlots[0] + aBackoff) + " c = " + (cSlots[0] + cBackoff) + " current slot = " + currentSlot);
            }
            if (aDone == true) {
                sendingC = true;
                cBackoffMax = cw0;
                console.log("sending C of slot : " + cSlots[0] + " at current slot of : " + currentSlot);
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                cSlots.shift();
                if (cSlots.length == 0) {
                    cDone = true;
                }
            } else if (cDone == true) {
                sendingA = true;
                aBackoffMax = cw0;
                console.log("sending A of slot : " + aSlots[0] + " at current slot of : " + currentSlot);
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                aSlots.shift();
                if (aSlots.length == 0) {
                    aDone = true;
                }
            } else if ((aBackoff) < (cBackoff)) {
                sendingA = true;
                cTotCollisions++;
                aBackoffMax = cw0;
                console.log("sending A of slot : " + aSlots[0] + " at current slot of : " + currentSlot);
                console.log("sending A backoff = " + aBackoff);
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                aSlots.shift();
                cBackoffMax *= 2;
                if (aSlots.length == 0) {
                    aDone = true;
                }
            } else {
                sendingC = true;
                aTotCollisions++;
                cBackoffMax = cw0;
                console.log("sending C of slot : " + cSlots[0] + " at current slot of : " + currentSlot);
                console.log("sending C backoff = " + cBackoff);
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                cSlots.shift();
                aBackoffMax *= 2;
                if (cSlots.length == 0) {
                    cDone = true;
                }
            }

        } else if ((aSlots[0] <= currentSlot) || (cSlots[0] <= currentSlot)) {
            if (aDone == true) {
                sendingC = true;
                cBackoffMax = cw0;
                console.log("sending C of slot : " + cSlots[0] + " at current slot of : " + currentSlot);
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                cSlots.shift();
                if (cSlots.length == 0) {
                    cDone = true;
                }
            } else if (cDone == true) {
                sendingA = true;
                aBackoffMax = cw0;
                console.log("sending A of slot : " + aSlots[0] + " at current slot of : " + currentSlot);
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                aSlots.shift();
                if (aSlots.length == 0) {
                    aDone = true;
                }
            } else if ((parseInt(aSlots[0]) + parseInt(aBackoff)) < (parseInt(cSlots[0]) + parseInt(cBackoff))) {
                console.log("aslots + backoff = " + (parseInt(aSlots[0]) + parseInt(aBackoff)) + " cslots + backoff = " + (parseInt(cSlots[0]) + parseInt(cBackoff)));
                sendingA = true;
                aBackoffMax = cw0;
                console.log("sending A of slot : " + aSlots[0] + " at current slot of : " + currentSlot);
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                if ((cSlots[0] + cBackoff) < currentSlot) {
                    cTotCollisions++;
                }
                console.log("sending A backoff = " + aBackoff);
                aSlots.shift();
                cBackoffMax *= 2;
                if (aSlots.length == 0) {
                    aDone = true;
                }
            } else if ((parseInt(aSlots[0]) + parseInt(aBackoff)) > (parseInt(cSlots[0]) + parseInt(cBackoff))) {
                sendingC = true;
                cBackoffMax = cw0;
                console.log("sending C of slot : " + cSlots[0] + " at current slot of : " + currentSlot);
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                if ((aSlots[0] + aBackoff) < currentSlot) {
                    aTotCollisions++;
                }
                console.log("sending C backoff = " + cBackoff);
                cSlots.shift();
                aBackoffMax *= 2;
                if (cSlots.length == 0) {
                    cDone = true;
                }
            } else {
                if ((parseInt(aSlots[0]) + parseInt(aBackoff)) == (parseInt(cSlots[0]) + parseInt(cBackoff))) {
                    numCollisions++;
                }
            }
        }

        if (sendingA == true) {
            aSuccess++;
            if (cBackoffMax > cwMax) {
                cBackoffMax = cw0;
                cCollisions = 0;
                cSlots.shift();
                cFailed++;
                if (cSlots.length == 0) {
                    cDone = true;
                }

            } else {
                cCollisions++;
            }
            aCollisions = 0;
            console.log("-------------------------------------------------------------------------> cBackoffMax =   " + cBackoffMax);
        } else if (sendingC == true) {
            cSuccess++;
            if (aBackoffMax > cwMax) {
                aBackoffMax = cw0;
                aCollisions = 0;
                aSlots.shift();
                aFailed++;
                if (aSlots.length == 0) {
                    aDone = true;
                }

            } else {
                aCollisions++;
            }
            cCollisions = 0;
            console.log("----------------------------------------------------------> aBackoffMax =   " + aBackoffMax);
        } else {
            currentSlot++;
        }
    }
    console.log("total num collisions : " + numCollisions);
    console.log(aSlots.length);
    console.log(cSlots.length);
    console.log("current slot = " + currentSlot + " max slots = " + simTime);
    console.log("Failed A Transfers : " + aFailed + " Failed C Transfers : " + cFailed);
    console.log("Successful A Transfers : " + aSuccess + " Sucessful C Transfers : " + cSuccess);
    console.log("A bandwidth : " + ((aSuccess * frameSizeIn * 8 / simTimeSecIn)) + "bps   C bandwidth : " + ((cSuccess * frameSizeIn * 8) / simTimeSecIn) + "bps");
    console.log("A Collisions : " + aTotCollisions + "    C Collisions : " + cTotCollisions);
    
   createGraphValues(((aSuccess * frameSizeIn * 8 / simTimeSecIn)), ((cSuccess * frameSizeIn * 8) / simTimeSecIn));
}
//Successful transmissions might be only when there isn't a collision
function testing() {
    calculate([0, 1, 2, 3], [4, 5, 6, 7], 1, 2, 3, 4, 5, 6);
}

let currentItteration = 0;

let aThroughput = [];
let cThroughput = [];

function createGraphValues(aThru, cThru){
    aThroughput.push(aThru / 1000);
    cThroughput.push(cThru / 1000);
    createGraph(aThroughput, cThroughput);
}
function createGraph(aVals, cVals) {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["50", "100", "200", "300"],
            datasets: [{
                label: '\u03BB A',
                backgroundColor: "red",
                borderColor: "red",
                data: aVals,
                fill: false,
            },{
                label: '\u03BB C',
                backgroundColor: "blue",
                borderColor: "blue",
                data: cVals,
                fill: false,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Change in throughput with change of \u03BB'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value of \u03BB'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Throughput (Kbps)'
                    }
                }]
            }
        }
    });
    if(currentItteration < 3){
        currentItteration++;
        generateTimings(currentItteration);
    }else{
        console.log("a graph points : " + aThroughput)
        console.log("c graph points : " + cThroughput);
    }
}