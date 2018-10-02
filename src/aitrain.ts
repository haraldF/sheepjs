import * as fs from 'fs';
import * as tf from '@tensorflow/tfjs';

const data = JSON.parse(fs.readFileSync("data.json", { encoding: 'utf8' })) as Array<Array<number>>;
const BATCH_SIZE = 256;
const BATCHES = 256;


function nextBatch(at: number) {
    const idx = at * BATCH_SIZE;
    const xArr = new Array<number>();
    const yArr = new Array<number>();

    for (let i = idx; i < BATCH_SIZE; ++i) {
        xArr.push(...data[i].slice(32));
        yArr.push(data[i][32]);
    }

    return {
        x: tf.tensor2d(xArr, [ BATCH_SIZE, 32 ]),
        y: tf.tensor2d(yArr, [ 1, 32 ])
    }
}

async function main() {

    const model = tf.sequential();

    model.add(tf.layers.dense({
        inputShape: [ 32 ],
        units: 32,
        kernelInitializer: 'VarianceScaling',
        activation: 'softmax'
    }));

    model.add(tf.layers.dense({
        units: 8,
        kernelInitializer: 'VarianceScaling',
        activation: 'softmax'
    }));

    model.add(tf.layers.dense({
        units: 1,
        kernelInitializer: 'VarianceScaling',
        activation: 'softmax'
    }))

    const LEARNING_RATE = 0.15;
    const optimizer = tf.train.adam(LEARNING_RATE);

    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });


    for (let i = 0; i < BATCHES; ++i) {
        const { x, y } = nextBatch(i);
        model.fit(x, y, {
            batchSize: BATCH_SIZE,
            epochs: 1
        });
    }

}

main().catch(err => console.error(err));