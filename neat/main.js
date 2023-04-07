const Neat = neataptic.Neat
const Config = neataptic.Config

Config.warnings = false

const neat = new Neat(7, 3, null, {
    popsize: GAMES,
    elitism: ELITISM,
    mutationRate: MUTATION_RATE,
    mutationAmount: MUTATION_AMOUNT
}
)

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

let highestScore = 0


function setup() { }

const runner = new Runnerv1({
    neat,
    games: GAMES,
    score: 0,
    onEndGeneration: ({ generation, max, avg, min }) => {
        chartData.labels.push(generation.toString())
        chartData.datasets[0].values.push(max)
        chartData.datasets[1].values.push(avg)
        chartData.datasets[2].values.push(min)

        if (chartData.labels.length > 15) {
            chartData.labels.shift()
            chartData.datasets.forEach(d => d.values.shift())
        }

        chart.update(chartData)
        if (max > highestScore) {
            highestScore = max
        }

        document.getElementById('generation').innerHTML = generation
        document.getElementById('highest-score').innerHTML = highestScore
    }
})

runner.startGeneration()