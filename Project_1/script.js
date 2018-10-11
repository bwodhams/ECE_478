function generateTimings() {
    //Get user defined values
    let frameSize = document.getElementById("dataFrameSize").value;
    let ackRtsCtsSize = document.getElementById("ackRtsCtsSize").value;
    let slotDuration = document.getElementById("slotDuration").value * 0.000001;
    let difsDuration = document.getElementById("difsDuration").value * 0.000001;
    let sifsDuration = document.getElementById("sifsDuration").value * 0.000001;
    let transmRate = document.getElementById("transmRate").value;
    let cw0 = document.getElementById("cw0").value;
    let cwMax = document.getElementById("cwMax").value;
    let lambdaAC = document.getElementById("lambdaAC").value;
    let simTime = document.getElementById("simTime").value;
    
    //Convert everything to be in terms of slots
    let difsToSlots = difsDuration / slotDuration;
    let sifsToSlots = sifsDuration / slotDuration;
    let transmRateToSlots = Math.ceil(((frameSize * 8) / (transmRate * 1000000)) * (1 / slotDuration));
    let ackToSlots = Math.ceil(((ackRtsCtsSize * 8) / (transmRate * 1000000)) * (1 / slotDuration));
    let simTimeToSlots = simTime / slotDuration;

    //Initialize uA, uC, xA, xC
    let uA = [];
    let uC = [];
    let xA = [];
    let xC = [];
    //Generate timings for uA
    for (let i = 0; i < lambdaAC; i++) {
        let randomNum = Math.random();
        if (uA.includes(randomNum)) {
            i--;
        } else {
            uA[i] = randomNum;
        }
    }
    uA.sort(sortTimings);

    //Generate timings for uC
    for (let i = 0; i < lambdaAC; i++) {
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
        xA[timing] = Math.floor(((-1 / lambdaAC) * Math.log(1 - uA[timing])) / slotDuration);
    }

    for (timing in uC) {
        xC[timing] = Math.floor(((-1 / lambdaAC) * Math.log(1 - uC[timing])) / slotDuration);
    }

    //Convert difference in timings to actual slot times
    for(timing in xA){
        if(timing == 0){

        }else{
            xA[timing] = xA[timing] + xA[timing - 1];
        }  
    }

    for(timing in xC){
        if(timing == 0){

        }else{
            xC[timing] = xC[timing] + xC[timing - 1];
        }
    }

    //Output to table on page
    let output = '<table><tr><th>Slot Number</th><th>X<sub>A</sub> Slot</th><th>X<sub>C</sub> Slot</th></tr>';
    for(timing in xA){
        output += '<tr><td>' + (timing * 1 + 1) + '</td><td>' + xA[timing] + '</td><td>' + xC[timing] + '</td></tr>';
    }
    document.getElementById("output").innerHTML = output;
    calculate(xA, xC, difsToSlots, cw0, cwMax, transmRateToSlots, sifsToSlots, ackToSlots, simTimeToSlots);
}

function sortTimings(a, b) {
    return a - b;
}

function randomBackoff(max){
    return Math.floor(Math.random() * (max + 1));
}

function calculate(xA, xC, difs, cw0, cwMax, transSlots, sifs, ackSlots, simTime){
    let currentSlot = 0;
    let aSlots = xA;
    let cSlots = xC;
    let aBackoffMax = cw0;
    let cBackoffMax =cw0;
    let numCollisions = 0;
    let aCollisions = 0;
    let cCollisions = 0;
    while(currentSlot < simTime){
        let aBackoff = 0;
        let cBackoff = 0;
        let sendingA = false;
        let sendingC = false;
        if(aBackoffMax > cwMax){
            aBackoffMax = cw0;
            aSlots.shift();
        }
        if(cBackoffMax > cwMax){
            cBackoffMax = cw0;
            cSlots.shift();
        }
        if(aSlots[0] <= currentSlot && cSlots[0] <= currentSlot){
            aBackoff = randomBackoff(aBackoffMax);
            cBackoff = randomBackoff(cBackoffMax);
            console.log("a = " + (aSlots[0] + aBackoff) + " c = " + (cSlots[0] + cBackoff));
            while((aSlots[0] + aBackoff) == (cSlots[0] + cBackoff)){
                if(aBackoffMax > cwMax){
                    aBackoffMax = cw0;
                    aSlots.shift();
                    
                }
                if(cBackoffMax > cwMax){
                    cBackoffMax = cw0;
                    cSlots.shift();
                }
                numCollisions++;
                aCollisions++;
                cCollisions++;
                aBackoffMax = (Math.pow(2, aCollisions) * aBackoffMax) - 1;
                cBackoffMax = (Math.pow(2, cCollisions) * cBackoffMax) - 1;
                aBackoff = randomBackoff(aBackoffMax);
                cBackoff = randomBackoff(cBackoffMax);
            }   
        }
        if((aSlots[0] + aBackoff) < (cSlots[0] + cBackoff)){
            sendingA = true;
            aBackoffMax = cw0;
            console.log("sending A of slot : " + aSlots[0] + " at current slot of : " + currentSlot);
            currentSlot += (difs + aBackoff + transSlots + sifs + ackSlots);
            aSlots.shift();
            cBackoffMax = (Math.pow(2, cCollisions) * cBackoffMax) - 1;
        }else{
            sendingC = true;
            cBackoffMax = cw0;
            console.log("sending C of slot : " + cSlots[0] + " at current slot of : " + currentSlot);
            currentSlot += (difs + cBackoff + transSlots + sifs + ackSlots);
            cSlots.shift();
            aBackoffMax = (Math.pow(2, aCollisions) * aBackoffMax) - 1;
        }
        if(sendingA == true || sendingC == true){

        }else{
            currentSlot++;
        }
    }
    console.log(aSlots);
}

function testing(){
    calculate([0, 1, 2, 3], [4, 5, 6, 7], 1, 2, 3, 4, 5, 6);
}