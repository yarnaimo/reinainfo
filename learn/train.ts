import { loadCsv, tf, IData, store, getSigmoid } from '.'
import lazy from 'lazy.js'
import { writeFileSync } from 'fs'

type R0 = tf.Tensor<tf.Rank.R0>
type R1 = tf.Tensor<tf.Rank.R1>
type R2 = tf.Tensor<tf.Rank.R2>

const data = loadCsv()

const [train_indexes, test_indexes] = (lazy(data.indexes)
    .shuffle()
    .chunk(data.xs.shape[0] / 2)
    .toArray() as any) as number[][]

const extractData = (data: IData, indexes: IData['indexes']) => {
    return {
        xs: tf.gather(data.xs, indexes),
        ys: tf.gather(data.ys, indexes),
        indexes,
    }
}
const trainData = extractData(data, train_indexes)
const testData = extractData(data, test_indexes)

const v = tf.variable(tf.zeros([data.xs.shape[1]])) as R1
const w = tf.variable(tf.zeros([data.xs.shape[1], 1])) as R2
const b = tf.variable(tf.zeros([1])) as R1

const f = (xs: R2) => {
    return tf.tidy(() => {
        return getSigmoid(xs, v, w, b)
    })
}

const clip = (t: R1) => t.clipByValue(1e-10, 1.0)

const loss = (preds: R1, labels: R1) => {
    const losses = tf.add(
        labels.mul(clip(preds).log()),
        tf.sub(1, labels).mul(clip(tf.sub(1, preds)).log())
    )

    return losses.sum().neg() as R0
}

const getAccuracy = ({ xs, ys, indexes }: IData) => {
    const threshold = tf.scalar(0.5)

    const x = f(xs).greater(threshold)
    const y = ys.greater(threshold)

    const correct_prediction = tf.equal(x, y).cast('float32')

    const zeroToOne = [] as number[]
    const oneToZero = [] as number[]
    ;(correct_prediction.dataSync() as Float32Array).forEach((v, i) => {
        if (v === 0) {
            ;(y.dataSync()[i] === 0 ? zeroToOne : oneToZero).push(indexes[i])
        }
    })

    return {
        accuracy: correct_prediction
            .mean()
            .dataSync()[0]
            .toFixed(4),
        zeroToOne: zeroToOne.join(),
        oneToZero: oneToZero.join(),
    }
}

const train = (trainData: IData, testData: IData) => {
    const results = [] as any[]
    const numIterations = 10000
    const optimizer = tf.train.adam(0.0001)

    lazy.range(1, numIterations + 1).each(i => {
        let loss_float: number = 0

        optimizer.minimize(() => {
            const loss_val = loss(f(trainData.xs), trainData.ys) as R0
            loss_float = loss_val.dataSync()[0]
            return loss_val
        })

        if (i % 500 === 0) {
            results.push({
                step: i,
                loss: loss_float.toFixed(4),
                ...getAccuracy(testData),
            })
        }
    })

    console.log(`w: ${w.dataSync()}`)
    console.log(`v: ${v.dataSync()}`)
    console.log(`b: ${b.dataSync()}`)
    console.table(results)
}

train(data, data)

const r = { v: [...v.dataSync()], w: [...w.dataSync()], b: b.dataSync()[0] }
writeFileSync(store, JSON.stringify(r, undefined, 4))

process.exit()
