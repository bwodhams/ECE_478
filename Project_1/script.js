function generateTimings() {
    let uA = [];
    let uC = [];
    let lamdaA = 50;
    let lamdaC = 50;
    //Generate timings for uA
    for (let i = 0; i < lamdaA; i++) {
        let randomNum = Math.random().toFixed(5);
        if (uA.includes(randomNum)) {
            i--;
        } else {
            uA[i] = randomNum;
        }
    }
    uA.sort(sortTimings);

    //Generate timings for uC
    for (let i = 0; i < lamdaC; i++) {
        let randomNum = Math.random().toFixed(5);
        if (uC.includes(randomNum)) {
            i--;
        } else {
            uC[i] = randomNum;
        }
    }
    for (timing in uA) {
        console.log(timing + " = " + uA[timing]);
    }

    for (timing in uA) {
        uA[timing] = (-1 / lamdaA) * Math.log(1 - uA[timing]);
    }

    for (timing in uC) {
        uC[timing] = (-1 / lamdaC) * Math.log(1 - uC[timing]);
    }

    for (timing in uA) {
        console.log(timing + " = " + uA[timing]);
    }
}

function sortTimings(a, b) {
    return a - b;
}