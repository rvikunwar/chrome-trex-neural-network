let interval;
class Runnerv1 {

    constructor({ neat, games, score, onEndGeneration }) {
        this.neat = neat
        this.games = []
        this.gamesFinished = 0
        this.onEndGeneration = onEndGeneration

        for (let i=0; i<games; i++) {
            document.getElementById("trex-container").insertAdjacentHTML("afterend",
                `<div id="main-frame-error" class="division interstitial-wrapper-${i}"><div id="main-content"><div class="icon icon-offline-${i}" alt=""></div></div><div id="offline-resources"><img id="offline-resources-1x-${i}" src="assets/default_100_percent/100-offline-sprite.png"><img id="offline-resources-2x-${i}" src="assets/default_200_percent/200-offline-sprite.png"></div></div>`);
            this.games.push({"crashed": false, "trex_world": new Runner(`.interstitial-wrapper-${i}`, `offline-resources-2x-${i}`, `offline-resources-1x-${i}`, `icon-offline-${i}`, `aa-${i}`) });
        }
    }

    startGeneration() {
        this.gamesFinished = 0
        const startGame = () => {
            for (let i=0; i<this.games.length; i++) {
                this.games[i].trex_brain = this.neat.population[i]
                this.games[i].trex_brain.score = 0

                
                this.games[i].trex_world.playing = true;
                this.games[i].trex_world.update();
                if (window.errorPageController) {
                    errorPageController.trackEasterEgg();
                }

                this.games[i].trex_world.tRex.startJump(this.games[i].trex_world.currentSpeed);
            }
        }
        setTimeout(startGame, 2000)


        interval = setInterval(()=>{
            this.think()
        }, 100)
    }

    think() {

        for (var i = 0; i <this.games.length; i++) {
            if(!this.games[i].trex_world.horizon) continue;
            let obstacles = this.games[i].trex_world.horizon.obstacles

            if (obstacles.length > 0) {
                let distanceToSecondObstacle = 0;

                const tRexPos = this.games[i].trex_world.tRex.xPos;

                if(obstacles[1]){
                    distanceToSecondObstacle = obstacles[1].xPos - tRexPos;
                }
                // console.log(distanceToSecondObstacle)
                // m5 = maximum(distanceToSecondObstacle, m5)

                let tRexVel = this.games[i].trex_world.currentSpeed;
                // m1 = maximum(m1, tRexVel)
                // tRexVel = normalizeValue(tRexVel, 0, 7)

                // Get the position and velocity of the next obstacle
                let nextObstaclePos = obstacles[0].xPos;
                let nextObstaclePosY = obstacles[0].yPos;
                nextObstaclePosY = normalizeValue(nextObstaclePosY, 40, 120)

                // console.log(nextObstaclePosY, obstacles[0])

                // m2 = maximum(m2, nextObstaclePos)

                let distanceToObstacle = nextObstaclePos - tRexPos;

                // if(0 < nextObstaclePos &&  nextObstaclePos < tRexPos){
                //     this.games[i].obstacles++;
                // }   

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
                const isJumping = this.games[i].trex_world.tRex.jumping? 1: 0;
                // console.log([ m1, m2, m3, m4, m5])
                const params = [distanceToObstacle, distanceToSecondObstacle,
                    tRexVel, nextObstaclePos,
                    nextObstacleSize, isJumping, nextObstaclePosY];
                
                    // console.log(this.games[i].trex_world.crashed, i)
                if(this.games[i].trex_world.crashed && !this.games[i].crashed ){
                    this.games[i].crashed = true;
                    this.endGeneration();
                }
                if(this.games[i].crashed) continue;

                const output = this.games[i].trex_brain.activate(params).map(o => Math.round(o))

                const distance = (this.games[i].trex_world.distanceMeter.getActualDistance(this.games[i].trex_world.distanceRan));

                this.games[i].trex_brain.score = Math.floor(distance);
                // let output = this.games[i].trex_brain.predict([...params])

                // if(obstacles[0].xPos<tRexPos){
                //     this.games[i].trex_brain.score+=50 
                // }


                if (output[0] && isJumping !== 1) {
                    this.games[i].trex_world.tRex.startJump(tRexVel);
                } else if (output[1] && isJumping !== 1) {
                    this.games[i].trex_world.tRex.setDuck(true);
                } else if(output[1] && isJumping===1){
                    this.games[i].trex_world.tRex.setSpeedDrop();
                } else {
                    //DO NOTHING
                }
            }
        }
    }

    endGeneration() {
        if (this.gamesFinished + 1 < this.games.length) {
            this.gamesFinished++
            return
        }

        this.neat.sort()

        this.onEndGeneration({
            generation: this.neat.generation,
            max: this.neat.getFittest().score,
            avg: Math.round(this.neat.getAverage()),
            min: this.neat.population[this.neat.popsize - 1].score
        })

        const newGeneration = []

        for (let i = 0; i < this.neat.elitism; i++) {
            newGeneration.push(this.neat.population[i])
        }

        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            newGeneration.push(this.neat.getOffspring())
        }

        this.neat.population = newGeneration
        this.neat.mutate()
        this.neat.generation++
        clearInterval(interval)

        this.startGeneration()
        for (var i = 0; i < this.games.length; i++) {
            this.games[i].trex_world.restart()
            this.games[i].crashed = false
        }

    }

}
