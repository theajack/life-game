/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-02 07:35:00
 * @Description: Coding something
 */
import { RenderProxy } from './render/render-proxy';
import { LifeCanvas } from './render/canvas';
import { ControlType, WorkerMessageType } from './common/types/enum';
import { withResolve } from './common/utils';
import { IPos } from './common/types/types';

// export { Presets } from './render/preset';
// todo 边界循环
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
        onTapCell,
    }: {
        size?: number,
        historyMax?: number,
        canvas?: HTMLCanvasElement,
        onHistoryEnd?: (isHead: boolean)=>void,
        onAliveCountChange?: (v: number)=>void,
        onStepCountChange?: (v: number)=>void,
        onHistorySizeChange?: (v: number)=>void,
        onTapCell?: (next: ()=>void, pos: IPos)=>void,
    } = {}) {
        this.history.max = historyMax;
        this.renderProxy = new RenderProxy();
        this.lifeGame = new LifeCanvas({
            canvas,
            messenger: this.renderProxy.messenger,
            size,
            onTapCell,
        });
        const { ready, resolve } = withResolve();
        this.renderProxy.messenger.onMessage(({ type, data }) => {
            switch (type) {
                case  WorkerMessageType.Control: {
                    if (data.type === ControlType.ForwardEnd) {
                        this.history.size = data;
                        console.log('后面没有记录了');
                        onHistoryEnd?.(false);
                    } else if (data.type === ControlType.BackEnd) {
                        console.log('前面没有记录了');
                        onHistoryEnd?.(true);
                    }
                };break;
                case WorkerMessageType.WorkerReady: {
                    this.lifeGame.initMap(historyMax);
                    resolve();
                };break;
                case WorkerMessageType.AliveCountChange: {
                    this.cellCount = data;
                    onAliveCountChange?.(data);
                }; break;
                case WorkerMessageType.StepCountChange: {
                    this.stepCount = data;
                    onStepCountChange?.(data);
                }; break;
                case WorkerMessageType.HistorySizeChange: {
                    this.history.size = data;
                    if (data === 0 || data === this.history.max) {
                        this.history.end = true;
                        this.history.isHead = data === 0;
                    } else {
                        this.history.end = false;
                    }
                    onHistorySizeChange?.(data);
                }; break;
                case WorkerMessageType.Copy: {
                    navigator.clipboard.writeText(data);
                }
                default: break;
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

    paused = true;

    randomInitCells (count = Math.round(this.tileCount / 4)) {
        this.lifeGame.randomInitCells(count);
    }
    randomCells (count = Math.round(this.tileCount / 5)) {
        this.lifeGame.randomCells(count);
    }
    addCells (cells: IPos[]) {
        this.lifeGame.addCells(cells);
    }
    setStepInterval (value: number) {
        this.control(ControlType.SetInterval, value);
    }
    start () {
        this.control(ControlType.Start);
        this.paused = false;
    }
    pause () {
        this.control(ControlType.Pause);
        this.paused = true;
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
    copyCells () {
        this.renderProxy.sendMessage({
            type: WorkerMessageType.CopyCells,
        });
    }
    private control (controlType: ControlType, value?: any) {
        this.renderProxy.sendMessage({
            type: WorkerMessageType.Control,
            data: { controlType, value }
        });
    }
}
