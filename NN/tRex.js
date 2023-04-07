const chartData = {
    labels: [],
    datasets: [
        {
            name: 'Max',
            values: []
        },
        {
            name: 'Average',
            values: []
        },
        {
            name: 'Min',
            values: []
        }
    ]
}

const chart = new frappe.Chart('#chart', {
    title: 'generation score history',
    type: 'line',
    height: 200,
    data: chartData
})
// let m1=-10000, m2=-10000, m3=-10000, m4=-10000, m5=-10000


const TREX_COUNT = 25
let generation = 0
let newMaxi = 0
let c = 0;
let highestScore = 0;

function setup() { }

function getMaxValue(a, b, c) {
    return Math.max(a, b, c);
}

// Function to normalize a value to a range between 0 and 1 using p5.js map
function normalizeValue(value, min, max) {
    return map(value, min, max, 0, 1);
}

function maximum(a, b){
    if(parseFloat(a)>parseFloat(b)) return a;
    return b
}

class TREX_FAMILY {
    constructor() {
        this.TREX_FAM = [];
        for (var i = 0; i < TREX_COUNT; i++) {
            document.getElementById("t").insertAdjacentHTML("afterend",
                `<div id="main-frame-error" class="division interstitial-wrapper-${i}"><div id="main-content"><div class="icon icon-offline-${i}" alt=""></div></div><div id="offline-resources"><img id="offline-resources-1x-${i}" src="assets/default_100_percent/100-offline-sprite.png"><img id="offline-resources-2x-${i}" src="assets/default_200_percent/200-offline-sprite.png"></div></div>`);
            this.TREX_FAM.push({ "trex_world": new Runner(`.interstitial-wrapper-${i}`, `offline-resources-2x-${i}`, `offline-resources-1x-${i}`, `icon-offline-${i}`, `aa-${i}`) });
            this.TREX_FAM[i]['trex_brain'] = new NeuralNetwork(6, 10, 3);
            this.TREX_FAM[i].survivalTime = 0;
            this.TREX_FAM[i].jumps = 0;
            this.TREX_FAM[i].obstacles = 0;
            this.TREX_FAM[i].previousGeneration = 0;
        }
    }

    think() {


        for (var i = 0; i < TREX_COUNT; i++) {

            let obstacles = this.TREX_FAM[i].trex_world.horizon.obstacles

            if (obstacles.length > 0) {
                let distanceToSecondObstacle = 0;

                const tRexPos = this.TREX_FAM[i].trex_world.tRex.xPos;

                if(obstacles[1]){
                    distanceToSecondObstacle = obstacles[1].xPos - tRexPos;
                }
                // console.log(distanceToSecondObstacle)
                // m5 = maximum(distanceToSecondObstacle, m5)

                let tRexVel = this.TREX_FAM[i].trex_world.currentSpeed;
                // m1 = maximum(m1, tRexVel)
                // tRexVel = normalizeValue(tRexVel, 0, 7)

                // Get the position and velocity of the next obstacle
                let nextObstaclePos = obstacles[0].xPos;
                // m2 = maximum(m2, nextObstaclePos)

                let distanceToObstacle = nextObstaclePos - tRexPos;

                if(0 < nextObstaclePos &&  nextObstaclePos < tRexPos){
                    this.TREX_FAM[i].obstacles++;
                }   

                // m4 = maximum(m4, distanceToObstacle)

                let nextObstacleSize = obstacles[0].typeConfig.width * obstacles[0].typeConfig.height;


                nextObstaclePos = normalizeValue(nextObstaclePos, 0, 500)
                // const nextObstacleVel = obstacles[0].speed;
                // console.log(obstacles[0])

                // Get the size of the next obstacle
                // m3 = maximum(m3, nextObstacleSize)
                nextObstacleSize = normalizeValue(nextObstacleSize, 0, 2000)

                // Calculate the distance to the next obstacle


                distanceToObstacle = normalizeValue(distanceToObstacle, -30, 500)

                distanceToSecondObstacle = normalizeValue(distanceToSecondObstacle, -30, 500)

                // Determine whether the T-Rex is jumping or not
                const isJumping = this.TREX_FAM[i].trex_world.tRex.jumping? 1: 0;
                // console.log([ m1, m2, m3, m4, m5])
                const params = [distanceToObstacle, distanceToSecondObstacle,
                    tRexVel, nextObstaclePos,
                    nextObstacleSize, isJumping];

                let output = this.TREX_FAM[i].trex_brain.predict([...params])


                if (output[0] === getMaxValue(output[0], output[1], output[2]) && isJumping !== 1) {
                    this.TREX_FAM[i].trex_world.tRex.startJump(tRexVel);
                    this.TREX_FAM[i].jumps++;
                } else if (output[1] === getMaxValue(output[0], output[1], output[2]) && isJumping !== 1) {
                    this.TREX_FAM[i].trex_world.tRex.setDuck(true);
                } else if(output[1] === getMaxValue(output[0], output[1], output[2]) && isJumping===1){
                    this.TREX_FAM[i].trex_world.tRex.setSpeedDrop();
                } else {
                    //DO NOTHING
                }
            }
        }
    }


    evaluate() {
        let sum = 0;
        let maximum = 0;
        let minimum = 100000
        let avg = 0;

        for (let i = 0; i < TREX_COUNT; i++) {
            this.TREX_FAM[i].survivalTime = this.TREX_FAM[i].trex_world.distanceRan;
            sum += this.TREX_FAM[i].survivalTime;
            if (this.TREX_FAM[i].survivalTime > maximum) {
                maximum = this.TREX_FAM[i].survivalTime;
            }

            if(minimum> this.TREX_FAM[i].survivalTime){
                minimum = this.TREX_FAM[i].survivalTime
            }
        }

        maximum = Math.floor(maximum / 100)
        minimum = Math.floor(minimum / 100)

        avg = Math.floor(sum / (100 * TREX_COUNT))

        chartData.labels.push(generation.toString())
        chartData.datasets[0].values.push(maximum)
        chartData.datasets[1].values.push(avg)
        chartData.datasets[2].values.push(minimum)



        if (chartData.labels.length > 15) {
            chartData.labels.shift()
            chartData.datasets.forEach(d => d.values.shift())
        }

        chart.update(chartData)
        if (maximum > highestScore) {
            highestScore = maximum
        }

        document.getElementById("highest-score").innerHTML = highestScore;

        for (let i = 0; i < TREX_COUNT; i++) {
            this.TREX_FAM[i].survivalTime =  Math.floor(this.TREX_FAM[i].survivalTime / 100)
            // console.log(this.TREX_FAM[i].survivalTime)
        }

        // this.matingPool = [];
        // for (let i = 0; i < TREX_COUNT; i++) {
        //     let n = this.TREX_FAM[i].survivalTime;
        //     if(maximum >= n > maximum-30 && n>30){
        //         for (var j = 0; j < Math.pow(2, 4+(n/sum)*100); j++) {
        //             this.matingPool.push(this.TREX_FAM[i]);
        //         }
        //     } else {
        //         for (var j = 0; j < (n); j++) {
        //             this.matingPool.push(this.TREX_FAM[i]);
        //         }
        //     }

        // }

        // console.log(this.matingPool)

    }

    selectParentByRouletteWheel() {
        const totalFitness = this.TREX_FAM.reduce((acc, trex) => acc + trex.survivalTime, 0);
        let value = Math.random() * totalFitness;
        for (let i = 0; i < this.TREX_FAM.length; i++) {
            value -= this.TREX_FAM[i].survivalTime;
            if (value <= 0) {
                return this.TREX_FAM[i];
            }
        }
    }

    selection(){
        let newTrexs = []

        this.TREX_FAM.sort((a, b) => {
            return b.survivalTime - a.survivalTime
        })

        const eliteCount = Math.floor((25 / 100) * TREX_COUNT)

        for (let i=0; i < eliteCount; i++) {
            newTrexs[i] = this.TREX_FAM[i];
        }

        for (let i=eliteCount; i < this.TREX_FAM.length; i++) {
            const parent1 = this.selectParentByRouletteWheel();
            const parent2 = this.selectParentByRouletteWheel();
            let offspring = this.TREX_FAM[i].trex_brain.crossover(parent1.trex_brain.model, parent2.trex_brain.model);
            offspring.mutate(0.3)
            let offspring_ = this.TREX_FAM[i]
            offspring_.trex_brain = offspring 
            newTrexs[i] = offspring_;
        }

        this.TREX_FAM = newTrexs;
    }

    // selection() {





    //     for (let i = up; i < this.TREX_FAM.length; i++) {
    //         var child = this.pickOne(this.TREX_FAM[i])
    //         newTrexs[i] = child;
    //     }

    //     return 0;
    // }

    pickOne(ele) {
        let r1 = Math.random() * this.matingPool.length;
        let child = ele;
        let clone = this.matingPool[Math.floor(r1)];
        child.trex_brain = clone.trex_brain;
        if(child.survivalTime< 20){
            child.trex_brain.mutate(0.4)
        } else{ 
            child.trex_brain.mutate(0.2)
        }
        return child;
    }

    reStart() {
        for (var i = 0; i < this.TREX_FAM.length; i++) {

            if (this.TREX_FAM[i].trex_world.crashed === false) {
                return 0;
            }
        }
        this.evaluate()
        this.selection();

        generation++;
        for (var i = 0; i < this.TREX_FAM.length; i++) {
            this.TREX_FAM[i].trex_world.restart()
        }
    }
}


var TRX_ENV = new TREX_FAMILY();

setInterval(() => {
    document.getElementById('generation').innerHTML = generation
    TRX_ENV.think()
    TRX_ENV.reStart()
}, 100)

