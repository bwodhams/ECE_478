function generateTimings(){
    let uA = [];
    for(let i = 0; i < 10; i++){
        let randomNum = Math.random().toFixed(2);
        if(uA.includes(randomNum)){
            i--;
        }else{
            uA[i] = randomNum;
        }
    }
    for(timing in uA){
        console.log(timing + " = " + uA[timing]);
    }
}