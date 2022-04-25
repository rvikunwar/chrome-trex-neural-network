tf.setBackend('cpu')

class NeuralNetwork {
    constructor(a, b, c, d){
        if(a instanceof tf.Sequential){
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

    mutate(rate) {
        const weights = this.model.getWeights();
        const mutatedWeights = [];
        for(var i=0; i < weights.length; i++){
            let tensor = weights[i];
            let shape = weights[i].shape;
            let values = tensor.dataSync().slice();
            for(let j=0; j < values.length; j++){
                if(Math.random() < rate){
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
        return tf.tidy(()=>{
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
        return tf.tidy(()=>{
            inp = tf.tensor2d([ inp ])
            var output = this.model.predict(inp)
            output = output.dataSync();
            return output;
        })

    }
}

