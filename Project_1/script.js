function generateTimings() {
    let uA = [];
    let uC = [];
    let xA = [];
    let xC = [];
    let slotDuration = 0.000002;
    let lamdaA = 50;
    let lamdaC = 50;
    //Generate timings for uA
    for (let i = 0; i < lamdaA; i++) {
        let randomNum = Math.random();
        if (uA.includes(randomNum)) {
            i--;
        } else {
            uA[i] = randomNum;
        }
    }
    uA.sort(sortTimings);

    //Generate timings for uC
    for (let i = 0; i < lamdaC; i++) {
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
        xA[timing] = ((-1 / lamdaA) * Math.log(1 - uA[timing])) / slotDuration;
    }

    for (timing in uC) {
        xC[timing] = ((-1 / lamdaC) * Math.log(1 - uC[timing])) / slotDuration;
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