/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-02 07:35:00
 * @Description: Coding something
 */
import { RenderProxy } from './render/render-proxy';
import { LifeCanvas } from './render/canvas';
import { ControlType, WorkerMessageType } from './common/types/enum';
import { withResolve } from './common/utils';

export class LifeGame {
    renderProxy: RenderProxy;
    lifeGame!: LifeCanvas;
    ready: Promise<void>;
    constructor ({
        size = 30,
        historyMax = 40,
        canvas,
        onHistoryEnd,
        onAliveCountChange,
        onStepCountChange,
        onHistorySizeChange,
    }: {
        size?: number,
        historyMax?: number,
        canvas?: HTMLCanvasElement,
        onHistoryEnd?: (isHead: boolean)=>void,
        onAliveCountChange?: (v: number)=>void,
        onStepCountChange?: (v: number)=>void,
        onHistorySizeChange?: (v: number)=>void,
    } = {}) {
        this.history.max = historyMax;
        this.renderProxy = new RenderProxy();
        this.lifeGame = new LifeCanvas({
            canvas,
            messenger: this.renderProxy.messenger,
            size,
        });
        const { ready, resolve } = withResolve();
        this.renderProxy.messenger.onMessage(({ type, data }) => {
            if (type === WorkerMessageType.Control) {
                if (data.type === ControlType.ForwardEnd) {
                    this.history.size = data;
                    console.log('后面没有记录了');
                    onHistoryEnd?.(false);
                } else if (data.type === ControlType.BackEnd) {
                    console.log('前面没有记录了');
                    onHistoryEnd?.(true);
                }
            } else if (type === WorkerMessageType.WorkerReady) {
                this.lifeGame.initMap(historyMax);
                resolve();
            } else if (type === WorkerMessageType.AliveCountChange) {
                this.cellCount = data;
                onAliveCountChange?.(data);
            } else if (type === WorkerMessageType.StepCountChange) {
                this.stepCount = data;
                onStepCountChange?.(data);
            } else if (type === WorkerMessageType.HistorySizeChange) {
                this.history.size = data;
                console.log('HistorySizeChange', data);
                if (data === 0 || data === this.history.max) {
                    this.history.end = true;
                    this.history.isHead = data === 0;
                } else {
                    this.history.end = false;
                }
                onHistorySizeChange?.(data);
            }
        });
        this.ready = ready;
    }
    get canvas () {
        return this.lifeGame.canvas;
    }
    get tileCount () {
        return this.lifeGame.xSize * this.lifeGame.ySize;
    }
    cellCount = 0;
    history = {
        max: 0,
        end: true,
        isHead: true,
        size: 0,
    };
    stepCount = 0;

    randomInitCells (count = Math.round(this.tileCount / 4)) {
        this.lifeGame.randomInitCells(count);
    }
    randomCells (count = Math.round(this.tileCount / 5)) {
        this.lifeGame.randomCells(count);
    }
    setStepInterval (value: number) {
        this.control(ControlType.SetInterval, value);
    }
    start () {
        this.control(ControlType.Start);
    }
    pause () {
        this.control(ControlType.Pause);
    }
    step () {
        this.control(ControlType.Step);
    }
    forward () {
        this.control(ControlType.Forward);
    }
    back () {
        this.control(ControlType.Back);
    }
    clear () {
        this.control(ControlType.Clear);
    }
    private control (controlType: ControlType, value?: any) {
        this.renderProxy.sendMessage({
            type: WorkerMessageType.Control,
            data: { controlType, value }
        });
    }
}
