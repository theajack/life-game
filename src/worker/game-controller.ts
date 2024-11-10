/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-08 18:59:26
 * @Description: Coding something
 */

import { WorkerMessageType } from '../common/types/enum';
import { History } from './history';
import { WorkerProxy } from './worker-proxy';

export class GameController {

    interval = 500;

    autoStep = false;

    history: History<Uint8Array>;

    private timer: any = null;

    private proxy: WorkerProxy;

    constructor (proxy: WorkerProxy) {
        this.proxy = proxy;
        this.history = new History<Uint8Array>({
            onStepChange: step => {
                this.proxy.sendMessage({
                    type: WorkerMessageType.StepCountChange,
                    data: step,
                });
            },
            onHistorySizeChange: size => {
                this.proxy.sendMessage({
                    type: WorkerMessageType.HistorySizeChange,
                    data: size,
                });
            }
        });
    }

    setInterval (interval: number) {
        this.interval = interval;
    }

    receiveChanges (data: Uint8Array) {
        this.history.forward(data);
    }
    start () {
        if (this.autoStep) return;
        this.autoStep = true;
        this.step();
    }
    pause () {
        this.autoStep = false;
        clearTimeout(this.timer);
    }
    step () {
        this.proxy.step();
        if (this.autoStep) {
            this.timer = setTimeout(() => {
                this.step();
            }, this.interval);
        }
    }
    next () {
        const data = this.history.next();
        if (data) {
            this.proxy.resetChanges(data);
            return true;
        }
        return false;
    }
    prev () {
        const data = this.history.prev();
        // console.log('prev', data, this.history.historyIndex, this.history.list);
        if (data) {
            this.resetChanges(data);
            return true;
        }
        return false;
    }

    private resetChanges (data: Uint8Array) {
        const size = data.byteLength;
        const copy = new Uint8Array(size);
        copy.set(data);
        for (let i = 2; i < size; i += 3) {
            copy[i] = 1 - copy[i];
        }
        this.proxy.resetChanges(copy);
    }

}