//Define lambda values globally
let lambdaA = [100, 200, 400, 600];
let lambdaC = [50, 100, 200, 300];
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
    let simTimeSec = document.getElementById("simTime").value;

    

    //Convert everything to be in terms of slots
    let difsToSlots = difsDuration / slotDuration;
    let sifsToSlots = Math.ceil(sifsDuration / slotDuration);
    let transmRateToSlots = Math.ceil(((frameSize * 8) / (transmRate * 1000000)) * (1 / slotDuration));
    let ackToSlots = Math.ceil(((ackRtsCtsSize * 8) / (transmRate * 1000000)) * (1 / slotDuration));
    let simTimeToSlots = simTimeSec / slotDuration;

    //Initialize uA, uC, xA, xC
    let uA = [];
    let uC = [];
    let xA = [];
    let xC = [];
    //Generate timings for uA
    for (let i = 0; i < lambdaA[itterationNum] * simTimeSec; i++) {
        let randomNum = Math.random();
        if (uA.includes(randomNum)) {
            i--;
        } else {
            uA[i] = randomNum;
        }
    }
    uA.sort(sortTimings);

    //Generate timings for uC
    for (let i = 0; i < lambdaC[itterationNum] * simTimeSec; i++) {
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
        xA[timing] = (((-1 / lambdaA[itterationNum]) * Math.log(1 - uA[timing])));
    }
    for(timing in xA){
        xA[timing] = Math.ceil(xA[timing] / slotDuration);
    }

    for (timing in uC) {
        xC[timing] = Math.ceil(((-1 / lambdaC[itterationNum]) * Math.log(1 - uC[timing])) / slotDuration);
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
    //Call functions to actually generate the simulation.  Uncomment out the problem you want solved, and comment out the other. (if you want to solve 1A, uncomment it, and comment out problem 1B)
    calculateProblem1A(xA, xC, parseInt(difsToSlots), parseInt(cw0), parseInt(cwMax), parseInt(transmRateToSlots), parseInt(sifsToSlots), parseInt(ackToSlots), parseInt(simTimeToSlots), parseInt(frameSize), parseInt(simTimeSec));
    //calculateProblem1B(xA, xC, parseInt(difsToSlots), parseInt(cw0), parseInt(cwMax), parseInt(transmRateToSlots), parseInt(sifsToSlots), parseInt(ackToSlots), parseInt(simTimeToSlots), parseInt(frameSize), parseInt(simTimeSec));
}

function calculateProblem1A(xAIn, xCIn, difs, cw0, cwMax, transSlots, sifs, ackSlots, simTime, frameSizeIn, simTimeSecIn) {
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
    let occupiedByA = 0;
    let occupiedByC = 0;
    //check to see if we have not gone past the simulation time limit, and make sure that there are still packets that need to be sent
    while ((currentSlot < simTime) && ((aSlots.length + cSlots.length) > 0)) {
        let aBackoff = 0;
        let cBackoff = 0;
        let sendingA = false;
        let sendingC = false;
        //If there are no more packets to send in A, don't generate a backoff because it's already done (same for C if C is completely done sending)
        if(aDone != true){
            aBackoff = randomBackoff(aBackoffMax);
        }
        if(cDone != true){
            cBackoff = randomBackoff(cBackoffMax);
        }
        //Check if the next packet in A and C are both less than or equal to the current slot. Don't enter if either C or A is completely done sending their packets
        if ((aSlots[0] <= currentSlot && cSlots[0] <= currentSlot) && (cDone == false) && (aDone == false)) {
            //While both are wanting to send packets, and they keep generating the same backoff values, increase contention window, and try again
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
                currentSlot += (difs + sifs);
                numCollisions++;
                aCollisions++;
                cCollisions++;
                aBackoffMax *= 2;
                cBackoffMax *= 2;
                aBackoff = randomBackoff(aBackoffMax);
                cBackoff = randomBackoff(cBackoffMax);
            }
            //If A or C is completely done sending, you don't have to worry anymore about collisions.
            if (aDone == true) {
                sendingC = true;
                cBackoffMax = cw0;
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                cSlots.shift();
                if (cSlots.length == 0) {
                    cDone = true;
                }
            } else if (cDone == true) {
                sendingA = true;
                aBackoffMax = cw0;
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                aSlots.shift();
                if (aSlots.length == 0) {
                    aDone = true;
                }
            //If A has a lower backoff, it will send first, and C will wait and A will reset it's contention window to the default value. Update current slot time to include all time taken by A being sent and vice versa if C is sent below
            } else if ((aBackoff) < (cBackoff)) {
                sendingA = true;
                cTotCollisions++;
                aBackoffMax = cw0;
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                aSlots.shift();
                if (aSlots.length == 0) {
                    aDone = true;
                }
            } else {
                sendingC = true;
                aTotCollisions++;
                cBackoffMax = cw0;
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                cSlots.shift();
                if (cSlots.length == 0) {
                    cDone = true;
                }
            }
        //If A packet and C packet aren't both less than or equal to the current slot, then we have the one that is go through difs and backoff, and then check again to see if the other is less than or equal, and if it is, then we wait for them to 
        //complete their difs and backoff, and check now to see who will send first.
        } else if ((aSlots[0] <= currentSlot) || (cSlots[0] <= currentSlot)) {
            if (aDone == true) {
                sendingC = true;
                cBackoffMax = cw0;
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                cSlots.shift();
                if (cSlots.length == 0) {
                    cDone = true;
                }
            } else if (cDone == true) {
                sendingA = true;
                aBackoffMax = cw0;
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                aSlots.shift();
                if (aSlots.length == 0) {
                    aDone = true;
                }
            } else if ((parseInt(aSlots[0]) + parseInt(aBackoff)) < (parseInt(cSlots[0]) + parseInt(cBackoff))) {
                sendingA = true;
                aBackoffMax = cw0;
                currentSlot += Math.ceil((difs + aBackoff + transSlots + sifs + ackSlots));
                if ((cSlots[0] + cBackoff) < currentSlot) {
                    cTotCollisions++;
                }
                aSlots.shift();
                if (aSlots.length == 0) {
                    aDone = true;
                }
            } else if ((parseInt(aSlots[0]) + parseInt(aBackoff)) > (parseInt(cSlots[0]) + parseInt(cBackoff))) {
                sendingC = true;
                cBackoffMax = cw0;
                currentSlot += Math.ceil((difs + cBackoff + transSlots + sifs + ackSlots));
                if ((aSlots[0] + aBackoff) < currentSlot) {
                    aTotCollisions++;
                }
                cSlots.shift();
                if (cSlots.length == 0) {
                    cDone = true;
                }
            //If after all checks, it turns out that the slot of A + its backoff and the slot of C + its backoff are the same, then there's a collision, nothing happens, and the function goes back to the top
            } else {
                if ((parseInt(aSlots[0]) + parseInt(aBackoff)) == (parseInt(cSlots[0]) + parseInt(cBackoff))) {
                    numCollisions++;
                }
            }
        }
        //Check if A is sending or if C is sending. If it's A, we incremenet the A success counter, the time that B is occupied by A, and check C's contention window to determine if we need to reset and drop the packet 
        if (sendingA == true) {
            aSuccess++;
            occupiedByA += transSlots + sifs + ackSlots;
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
        } else if (sendingC == true) {
            cSuccess++;
            occupiedByC += transSlots + sifs + ackSlots;
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
        } else {
            currentSlot++;
        }
    }
    //calculate fairness index
    let fairnessIndexA = (occupiedByA / simTime) / (occupiedByC / simTime);
    let fairnessIndexC = (occupiedByC / simTime) / (occupiedByA / simTime);
    /* Debugging outputs
    console.log("total num collisions : " + numCollisions);
    console.log(aSlots.length);
    console.log(cSlots.length);
    console.log("current slot = " + currentSlot + " max slots = " + simTime);
    console.log("Failed A Transfers : " + aFailed + " Failed C Transfers : " + cFailed);
    console.log("Successful A Transfers : " + (aSuccess) + " Sucessful C Transfers : " + (cSuccess));
    console.log("A bandwidth : " + ((aSuccess * frameSizeIn * 8 / simTimeSecIn)) + "bps   C bandwidth : " + ((cSuccess * frameSizeIn * 8) / simTimeSecIn) + "bps");
    console.log("A Collisions : " + aTotCollisions + "    C Collisions : " + cTotCollisions);
    */
   //Create graph values.  These values MUST be changed for whatever graphs you are trying to graph.
   //createGraphValues1A(((aSuccess * frameSizeIn * 8 / simTimeSecIn)), ((cSuccess * frameSizeIn * 8) / simTimeSecIn));
   createGraphValues1A(fairnessIndexA, fairnessIndexC);
}

function calculateProblem1B(xAIn, xCIn, difs, cw0, cwMax, transSlots, sifs, ackSlots, simTime, frameSizeIn, simTimeSecIn){
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
    let allSuccess = 0;
    let occupiedByA = 0;
    let occupiedByC = 0;
    //While current slot is not above the sim time, and A and C still have packets to send, keep trying to send packets
    while ((currentSlot < simTime) && ((aSlots.length + cSlots.length) > 0)) {
        let aBackoff = 0;
        let cBackoff = 0;
        let sendingA = false;
        let sendingC = false;
        if(aDone != true){
            aBackoff = randomBackoff(aBackoffMax);
        }
        if(cDone != true){
            cBackoff = randomBackoff(cBackoffMax);
        }
        //If either A or C have a packet that is less than or equal to the current slot, prepare to send, but first check to see if the other node sending will interfere
        if((aSlots[0] || cSlots[0]) <= currentSlot){
            if((aSlots[0] + difs + aBackoff) > (currentSlot + difs + cBackoff + transSlots + sifs + ackSlots)){
                sendingC = true;
            }
            else if((cSlots[0] + difs + cBackoff) > (currentSlot + difs + aBackoff + transSlots + sifs + ackSlots)){
                sendingA = true;
            }else{
                while((sendingA == false && sendingC == false) && (currentSlot < simTime)){
                    currentSlot += (difs + sifs);
                    numCollisions++;
                    aBackoffMax *= 2;
                    cBackoffMax *= 2;
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
                    aBackoff = randomBackoff(aBackoffMax);
                    cBackoff = randomBackoff(cBackoffMax);
                    if((aSlots[0] <= currentSlot) && (cSlots[0] <= currentSlot)){
                        if((currentSlot + difs + aBackoff) > (currentSlot + difs + cBackoff + transSlots + sifs + ackSlots)){
                            sendingC = true;
                        }
                        else if((currentSlot + difs + cBackoff) > (currentSlot + difs + aBackoff + transSlots + sifs + ackSlots)){
                            sendingA = true;
                        }
                    }
                    else if((aSlots[0] + difs + aBackoff) > (currentSlot + difs + cBackoff + transSlots + sifs + ackSlots)){
                        sendingC = true;
                    }
                    else if((cSlots[0] + difs + cBackoff) > (currentSlot + difs + aBackoff + transSlots + sifs + ackSlots)){
                        sendingA = true;
                    }
                }
            } 
        }
        //Check to see which is sending now that all checks have passed.  If A is sending, reset backoff max, increment time occupied  by A, increase current slot
        if(sendingA == true){
            currentSlot += difs + aBackoff + transSlots + sifs + ackSlots;
            occupiedByA += transSlots + sifs + ackSlots;
            aSuccess++;
            aBackoffMax = cw0;
            aSlots.shift();
            allSuccess++;
        }else if(sendingC == true){
            currentSlot += difs + cBackoff + transSlots + sifs + ackSlots;
            occupiedByC += transSlots + sifs + ackSlots;
            cSuccess++;
            cBackoffMax = cw0;
            cSlots.shift();
            allSuccess++;
        }else{
            currentSlot++;
        }
    }
    let fairnessIndexA = (occupiedByA / simTime) / (occupiedByC / simTime);
    let fairnessIndexC = (occupiedByC / simTime) / (occupiedByA / simTime);
    /*
    console.log("all success = " + allSuccess);
    console.log("total num collisions : " + numCollisions);
    console.log(aSlots.length);
    console.log(cSlots.length);
    console.log("current slot = " + currentSlot + " max slots = " + simTime);
    console.log("Failed A Transfers : " + aFailed + " Failed C Transfers : " + cFailed);
    console.log("Successful A Transfers : " + (aSuccess) + " Sucessful C Transfers : " + (cSuccess));
    console.log("A bandwidth : " + ((aSuccess * frameSizeIn * 8 / simTimeSecIn)) + "bps   C bandwidth : " + ((cSuccess * frameSizeIn * 8) / simTimeSecIn) + "bps");
    console.log("A Collisions : " + aTotCollisions + "    C Collisions : " + cTotCollisions);
    //createGraphValues1B(((aSuccess * frameSizeIn * 8 / simTimeSecIn)), ((cSuccess * frameSizeIn * 8) / simTimeSecIn));
    */
    //Generate graphs (just as in problem 1A above, you must change these values to whatever graph you are trying to see)
    //createGraphValues1B(numCollisions, numCollisions);
    createGraphValues1B(fairnessIndexA, fairnessIndexC);
}


let currentItteration = 0;

let aThroughput1A = [];
let cThroughput1A = [];
let aThroughput1B = [];
let cThroughput1B = [];
let aXVal1A = [];
let cXVal1A = [];
let aXVal1B = [];
let cXVal1B = [];


function createGraphValues1A(aThru, cThru){
    //Generate the X and Y values for the graph
    aThroughput1A.push(aThru);
    cThroughput1A.push(cThru);
    aXVal1A.push(lambdaA[currentItteration]);
    cXVal1A.push(lambdaC[currentItteration]);
    createGraph(aThroughput1A, cThroughput1A);
}

function createGraphValues1B(aThru, cThru){
    //Generate the X and Y values for the graph
    aThroughput1B.push(aThru);
    cThroughput1B.push(cThru);
    aXVal1B.push(lambdaA[currentItteration]);
    cXVal1B.push(lambdaC[currentItteration]);
    createGraph(aThroughput1B, cThroughput1B);
}

function sortTimings(a, b) {
    //simple sort to sort the uA values from least to greatest.
    return a - b;
}

function randomBackoff(max) {
    //Generate random backoff amount based on input max (cwMax)
    return Math.floor(Math.random() * (max + 1));
    //return parseInt(prompt("Enter value"));
}

//Graph generation
function createGraph(aVals, cVals) {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            //"400", "500", "600", "700", "800", "900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700"
            labels: ["\u03BBA = 100 \u03BBC = 50", "\u03BBA = 200 \u03BBC = 100", "\u03BBA = 400 \u03BBC = 200", "\u03BBA = 600 \u03BBC = 300"],
            //labels: [50, 100, 200, 300],
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
                text: 'Fairness Index of \u03BB  Scenario 1B -  \u03BB A = 2\u03BB C'
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
                        labelString: 'Value of \u03BB (frames / sec) where \u03BBA = 2\u03BBC'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Fairness Index'
                    }
                }]
            }
        }
    });
    if(currentItteration < document.getElementById("numOfItterations").value - 1){
        currentItteration++;
        generateTimings(currentItteration);
    }else{

    }
}