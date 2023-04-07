tf.setBackend('cpu')

class NeuralNetwork {
    constructor(a, b, c, d) {
        if (a instanceof tf.Sequential) {
            this.model = a;
            this.input_nodes = b;
            this.hidden_nodes = c;
            this.output_nodes = d;
        } else {
            this.input_nodes = a;
            this.hidden_nodes = b;
            this.output_nodes = c;
            this.model = this.createModel();
        }
    }



    copy() {
        let modelCopy = this.createModel();
        const weights = this.model.getWeights();
        modelCopy.setWeights(weights);
        return new NeuralNetwork(
            modelCopy,
            this.input_nodes,
            this.hidden_nodes,
            this.output_nodes)
    }

    crossover(parent1, parent2) {
        console.log(parent1,)
        const offspring = tf.sequential();
        const parent2Genes = new Set(parent2.layers.concat(parent2.layers).map((layer) => layer.name));
        parent1.layers.forEach((layer) => {
            if (parent2Genes.has(layer.name)) {
                // Take the matching layer from parent 2 with a probability of 50%
                if (Math.random() < 0.5) {
                    const matchingLayer = parent2.getLayer(layer.name);
                    offspring.add(matchingLayer);
                } else {
                    const layerCopy = layer;
                    offspring.add(layerCopy);
                }
            } else {
                const layerCopy = layer;
                offspring.add(layerCopy);
            }
        });
        return new  NeuralNetwork(offspring, 6, 10, 2);
    }

mutate(rate) {
    const weights = this.model.getWeights();
    const mutatedWeights = [];
    for (var i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
            if (Math.random() < rate) {
                let w = values[j];
                values[j] = w + randomGaussian() * 0.5; //random gaussian
            }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor
    }
    this.model.setWeights(mutatedWeights);
}

createModel() {
    return tf.tidy(() => {
        const model = tf.sequential();
        const hidden = tf.layers.dense({
            units: this.hidden_nodes,
            inputShape: [this.input_nodes],
            activation: 'sigmoid'
        })
        model.add(hidden);

        const output = tf.layers.dense({
            units: this.output_nodes,
            inputShape: [this.hidden_nodes],
            activation: 'softmax'
        })

        model.add(output);
        return model;
    })
}

predict(inp) {
    return tf.tidy(() => {
        inp = tf.tensor2d([inp])
        var output = this.model.predict(inp)
        output = output.dataSync();
        return output;
    })

}
}

