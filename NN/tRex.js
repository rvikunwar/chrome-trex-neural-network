const TREX_COUNT = 5
let generation = 0
let newMaxi = 0
let c=0;

function setup() { }

class TREX_FAMILY{
    constructor(){
        this.TREX_FAM = [];
        for(var i=0; i < TREX_COUNT; i++){
            document.getElementById("t").insertAdjacentHTML("afterend",
                `<div id="main-frame-error" class="division interstitial-wrapper-${i}"><div id="main-content"><div class="icon icon-offline-${i}" alt=""></div></div><div id="offline-resources"><img id="offline-resources-1x-${i}" src="assets/default_100_percent/100-offline-sprite.png"><img id="offline-resources-2x-${i}" src="assets/default_200_percent/200-offline-sprite.png"></div></div>`);
            this.TREX_FAM.push({ "trex_world": new Runner(`.interstitial-wrapper-${i}`, `offline-resources-2x-${i}`, `offline-resources-1x-${i}`, `icon-offline-${i}`, `aa-${i}`)});
            this.TREX_FAM[i]['trex_brain'] = new NeuralNetwork(4, 9, 2);
            this.TREX_FAM[i].survivalTime = 0;
            this.TREX_FAM[i].jumps = 0;
            this.TREX_FAM[i].previousGeneration = 0;
        }
    }

    think(){
        for(var i=0; i < TREX_COUNT; i++){

            var obstacles = this.TREX_FAM[i].trex_world.horizon.obstacles;
 
            if(obstacles.length>0 && !this.TREX_FAM[i].trex_world.tRex.jumping){
                var obsX = map(obstacles[0]?.xPos, 0, window.innerWidth, 0, 1);
                var obsY = map(obstacles[0]?.yPos, 80, 130, 0, 1);
                var obsW = map(obstacles[0]?.width, 0, 100, 0, 1) ;
                var obsS = map(parseInt(this.TREX_FAM[i].trex_world.currentSpeed), 6, 15, 0, 1)
                let output = this.TREX_FAM[i].trex_brain.predict([obsX, obsW, obsS, obsY])
                let speed = parseInt(this.TREX_FAM[i].trex_world.currentSpeed)

                if(output[0] >= output[1]){  
                    
                    this.TREX_FAM[i].trex_world.tRex.startJump(speed);
                    if(this.TREX_FAM[i].trex_world.tRex.jumping){
                        if( (obstacles[0].xPos + obstacles[0].width) <= ((parseInt(speed - 0.1) - 5) * 34 + 160)){
                            this.TREX_FAM[i].jumps-=4
                        } else {
                            this.TREX_FAM[i].jumps+=15;
                        }
                    } 
                } else {
                    if( (obstacles[0].xPos + obstacles[0].width) >= ((parseInt(speed - 0.1) - 5) * 34 + 160)){
                        this.TREX_FAM[i].jumps-=4
                    }  else {
                        this.TREX_FAM[i].jumps+=15;
                    }
                }
 
            }
        }   
    }

    evaluate(){

        for(let i=0; i<TREX_COUNT; i++){
            
            this.TREX_FAM[i].survivalTime = (this.TREX_FAM[i].trex_world.distanceRan/window.innerWidth*2);
            this.TREX_FAM[i].survivalTime -= (this.TREX_FAM[i].jumps)

            this.TREX_FAM[i].jumps = 0;
        }

        let sum = 0;
        let maxi = 0;
        let ii=0;
        for (let i = 0; i < TREX_COUNT; i++) {
            sum += this.TREX_FAM[i].survivalTime;
            if(this.TREX_FAM[i].survivalTime>maxi){
                maxi = this.TREX_FAM[i].survivalTime;
                ii=i;
            }
        }
        newMaxi = maxi;
        console.log('maximum val - ', maxi, 'index- ', ii, 'sum- ', sum)

        for(let i=0; i<TREX_COUNT; i++){
            this.TREX_FAM[i].survivalTime = this.TREX_FAM[i].survivalTime/sum;
        }

        this.matingPool = [];
        for(let i=0; i<TREX_COUNT; i++){
            let n = this.TREX_FAM[i].survivalTime*100;
            for(var j=0; j < n; j++){
                this.matingPool.push(this.TREX_FAM[i]);
            }
        }

    }

    selection(){
        var newTrexs = []
        for(var i=0; i<this.TREX_FAM.length; i++){
            var child = this.pickOne(this.TREX_FAM[i])
            newTrexs[i] = child;
        }
        this.TREX_FAM = newTrexs;
        return 0;
    }

    pickOne(ele) {
        var index = 0;
        // var r = Math.random()* this.matingPool.length;
        var r = Math.random()
        while(r > 0){
            r = r - this.TREX_FAM[index].survivalTime;
            index++; 
        }

        index--;
        let child = ele;
        // let clone = this.matingPool[Math.floor(r)];
        let clone= this.TREX_FAM[index]
        child.trex_brain = clone.trex_brain;
        child.trex_brain.mutate(0.2)
        return child;
    }

    reStart() {
        for(var i=0; i<this.TREX_FAM.length; i++){
            
            if(this.TREX_FAM[i].trex_world.crashed === false){
                return 0;
            }
            this.TREX_FAM[i].survivalTime-=0.5;
        }
        this.evaluate()
        this.selection();   
        console.log('Generation '+ generation)
        generation++;
        for(var i=0; i<this.TREX_FAM.length; i++){
            this.TREX_FAM[i].trex_world.restart()
        }
    }
}


var TRX_ENV = new TREX_FAMILY();

setInterval(()=>{
    document.querySelector('.value').innerHTML = generation
    TRX_ENV.think()
    TRX_ENV.reStart()
},100)

