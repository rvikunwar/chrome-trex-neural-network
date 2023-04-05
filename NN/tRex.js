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
    ]
}

const chart = new frappe.Chart('#chart', {
    title: 'generation score history',
    type: 'line',
    height: 200,
    data: chartData
})


const TREX_COUNT = 50
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

class TREX_FAMILY {
    constructor() {
        this.TREX_FAM = [];
        for (var i = 0; i < TREX_COUNT; i++) {
            document.getElementById("t").insertAdjacentHTML("afterend",
                `<div id="main-frame-error" class="division interstitial-wrapper-${i}"><div id="main-content"><div class="icon icon-offline-${i}" alt=""></div></div><div id="offline-resources"><img id="offline-resources-1x-${i}" src="assets/default_100_percent/100-offline-sprite.png"><img id="offline-resources-2x-${i}" src="assets/default_200_percent/200-offline-sprite.png"></div></div>`);
            this.TREX_FAM.push({ "trex_world": new Runner(`.interstitial-wrapper-${i}`, `offline-resources-2x-${i}`, `offline-resources-1x-${i}`, `icon-offline-${i}`, `aa-${i}`) });
            this.TREX_FAM[i]['trex_brain'] = new NeuralNetwork(5, 12, 3);
            this.TREX_FAM[i].survivalTime = 0;
            this.TREX_FAM[i].jumps = 0;
            this.TREX_FAM[i].previousGeneration = 0;
        }
    }

    think() {
        for (var i = 0; i < TREX_COUNT; i++) {

            let obstacles = this.TREX_FAM[i].trex_world.horizon.obstacles

            if (obstacles.length > 0) {

                const tRexPos = this.TREX_FAM[i].trex_world.tRex.xPos;
                let tRexVel = this.TREX_FAM[i].trex_world.currentSpeed;
                tRexVel = normalizeValue(tRexVel, 0, 7)

                // Get the position and velocity of the next obstacle
                let nextObstaclePos = obstacles[0].xPos;
                nextObstaclePos = normalizeValue(nextObstaclePos, 0, 500)
                // const nextObstacleVel = obstacles[0].speed;
                // console.log(obstacles[0])

                // Get the size of the next obstacle
                let nextObstacleSize = obstacles[0].typeConfig.width * obstacles[0].typeConfig.height;
                nextObstacleSize = normalizeValue(nextObstacleSize, 0, 1500)

                // Calculate the distance to the next obstacle
                let distanceToObstacle = nextObstaclePos - tRexPos;
                distanceToObstacle = normalizeValue(distanceToObstacle, -20, 200)

                // Determine whether the T-Rex is jumping or not
                const isJumping = this.TREX_FAM[i].trex_world.tRex.jumping? 1: 0;

                const params = [distanceToObstacle, tRexVel, nextObstaclePos,
                    nextObstacleSize, isJumping];

                let output = this.TREX_FAM[i].trex_brain.predict([...params])


                if (output[0] === getMaxValue(output[0], output[1], output[2])) {
                    this.TREX_FAM[i].trex_world.tRex.startJump(tRexVel);
                } else if (output[1] === getMaxValue(output[0], output[1], output[2] && !isJumping)) {
                    this.TREX_FAM[i].trex_world.tRex.setDuck(true);
                } else {
                    //DO NOTHING
                }
            }
        }
    }


    evaluate() {
        let sum = 0;
        let maximum = 0;
        let avg = 0;

        for (let i = 0; i < TREX_COUNT; i++) {
            this.TREX_FAM[i].survivalTime = this.TREX_FAM[i].trex_world.distanceRan;
            sum += this.TREX_FAM[i].survivalTime;
            if (this.TREX_FAM[i].survivalTime > maximum) {
                maximum = this.TREX_FAM[i].survivalTime;
            }
        }

        maximum = Math.floor(maximum / 100)
        avg = Math.floor(sum / (100 * TREX_COUNT))

        chartData.labels.push(generation.toString())
        chartData.datasets[0].values.push(maximum)
        chartData.datasets[1].values.push(avg)


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
            this.TREX_FAM[i].survivalTime = this.TREX_FAM[i].survivalTime / sum;
        }

        this.matingPool = [];
        for (let i = 0; i < TREX_COUNT; i++) {
            let n = this.TREX_FAM[i].survivalTime * 100;
            for (var j = 0; j < Math.pow(2, n); j++) {
                this.matingPool.push(this.TREX_FAM[i]);
            }
        }

    }

    selection() {
        var newTrexs = []
        this.TREX_FAM.sort((a, b) => {
            return b.survivalTime - a.survivalTime
        })


        const up = Math.floor((20 / 100) * TREX_COUNT)

        for (let i = 0; i < up; i++) {
            newTrexs[i] = this.TREX_FAM[i];
        }


        for (let i = up; i < this.TREX_FAM.length; i++) {
            var child = this.pickOne(this.TREX_FAM[i])
            newTrexs[i] = child;
        }

        this.TREX_FAM = newTrexs;
        return 0;
    }

    pickOne(ele) {
        let r1 = Math.random() * this.matingPool.length;
        let child = ele;
        let clone = this.matingPool[Math.floor(r1)];
        child.trex_brain = clone.trex_brain;
        child.trex_brain.mutate(0.5)
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

