function generateTimings() {
    //Get user defined values
    let frameSize = document.getElementById("dataFrameSize").value;
    let ackRtsCtsSize = document.getElementById("ackRtsCtsSize").value;
    let slotDuration = document.getElementById("slotDuration").value * 0.0000001;
    let difsDuration = document.getElementById("difsDuration").value;
    let sifsDuration = document.getElementById("sifsDuration").value;
    let transmRate = document.getElementById("transmRate").value;
    let cw0 = document.getElementById("cw0").value;
    let cwMax = document.getElementById("cwMax").value;
    let lambdaAC = document.getElementById("lambdaAC").value;
    let simTime = document.getElementById("simTime").value;

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
        xA[timing] = ((-1 / lambdaAC) * Math.log(1 - uA[timing])) / slotDuration;
    }

    for (timing in uC) {
        xC[timing] = ((-1 / lambdaAC) * Math.log(1 - uC[timing])) / slotDuration;
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

    //Console log output for testing
    for(timing in xA){
        console.log(xA[timing]);
    }
    console.log("------------------------");
    for(timing in xC){
        console.log(xC[timing]);
    }
}

function sortTimings(a, b) {
    return a - b;
}