import { withResolve } from '../src/common/utils';

/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-20 20:05:01
 * @Description: Coding something
 */
interface IAsyncResult<T> {
    start: number,
    elapse: number,
    result: T,
}


function test () {
    const { ready, resolve } = withResolve();
    const time = Math.round(Math.random() * 100);
    console.log('time=', time);
    setTimeout(() => {
        resolve(time);
    }, time);
    return ready;
}

export async function runAsyncTasks<T = any> (
    tasks: (()=>Promise<T>)[],
    max = 2,
): Promise<IAsyncResult<T>[]> {
    const length = tasks.length;
    if (length === 0) return Promise.resolve([]);

    const { ready, resolve } = withResolve();
    const results: IAsyncResult<T>[] = [];

    let runIndex = 0;
    let finishCount = 0;

    const runNextTask = async () => {
        const task = tasks[runIndex];
        const index = runIndex;
        runIndex ++;
        const start = Date.now();
        const result = await task();
        const elapse = Date.now() - start;
        results[index] = { start, result, elapse };
        finishCount ++;
        if (finishCount === length) {
            resolve(results);
            return;
        }
        if (runIndex >= length) {
            return;
        }
        runNextTask();
    };

    for (let i = 0; i < max; i++) {
        runNextTask();
    }

    return ready;
}

interface IResult<T> extends IAsyncResult<T> {
    round: number,
}

export function runTasks<T = any> (tasks: (()=>T)[]): Promise<IResult<T>[]> {
    const length = tasks.length;
    if (length === 0) return Promise.resolve([]);

    const { ready, resolve } = withResolve();
    const results: IResult<T>[] = [];
    let round = 0;
    let runIndex = 0;
    const runTask = (time = 0) => {
        let prev = Date.now();
        while (time > 0) {
            const result = tasks[runIndex]();
            runIndex ++;
            const now = Date.now();
            const elapse = now - prev;
            results.push({ result, elapse, start: prev, round });
            if (runIndex >= length) {
                resolve(results);
                return;
            }
            prev = now;
            time -= elapse;
        }
        requestIdleCallback((data) => {
            runTask(data.timeRemaining());
        });
        round ++;
    };
    runTask();
    return ready;
}
function  fib (n) {
    if (n <= 1) {
        return n;
    } else {
        return fib(n - 1) + fib(n - 2);
    }
}
window.runTasks = runTasks;
window.fib = fib;
window.runAsyncTasks = runAsyncTasks;
window.test = test;

// console.time('done');
// runTasks([
//     () => fib(19),
//     () => fib(17),
//     () => fib(30),
//     () => fib(30),
//     () => fib(30),
//     () => fib(22),
//     () => fib(13),
//     () => fib(30),
//     () => fib(14),
//     () => fib(30),
//     () => fib(30),
//     () => fib(30),
//     () => fib(22),
//     () => fib(13),
//     () => fib(30),
//     () => fib(14),
//     () => fib(20),
//     () => fib(30),
//     () => fib(15),
// ]).then((d) => {
//     console.log(d);
//     console.timeEnd('done');
// });