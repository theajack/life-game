/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-02 09:15:44
 * @Description: Coding something
 */
import { Messenger } from '../common/messenger';
import { ControlType, WasmMsgType, WorkerMessageType } from '../common/types/enum';
import { IWorkerMessage } from '../common/types/types';
import { withResolve } from '../common/utils';
import { GameController } from './game-controller';
import { LifeMap } from './map';
import { IWasmExtra, WasmProxy } from './wasm-ts/wasm-proxy';

export class WorkerProxy {
    messenger: Messenger;
    wasm: WasmProxy;
    map: LifeMap;
    ready: Promise<void>;

    controller: GameController;
    constructor () {
        this.messenger = new Messenger(globalThis);
        this.wasm = new WasmProxy();
        this.map = new LifeMap(count => {
            this.sendMessage({
                type: WorkerMessageType.AliveCountChange,
                data: count
            });
        });

        this.controller = new GameController(this);
        const { ready, resolve } = withResolve();
        this.init(resolve);
        this.ready = ready;
    }

    step () {
        this.wasm.sendData(WasmMsgType.Step);
    }

    resetChanges (data: Uint8Array) {
        // console.log('[resetChange]', data);
        this.map.receiveChanges(data);
        this.wasm.sendData(WasmMsgType.Changes, data);
    }

    private async init (resolve: ()=>void) {
        await this.wasm.init();

        console.log('worker p init');
        this.messenger.onMessage(this.onRenderMessage.bind(this));
        this.wasm.onMessage(this.onWasmMessage.bind(this));

        resolve();
        this.sendMessage({ type: WorkerMessageType.WorkerReady });
    }

    private onWasmMessage (data: Uint8Array, extra: IWasmExtra) {
        // 收到来自wasm的消息
        // console.log('data from wasm', data, extra);
        // this.sendMessage({
        //     type: WorkerMessageType.Test,
        //     data: { data, extra }
        // });
        if (extra.extra1 === WasmMsgType.Step) {
            // console.log('step', data);
            this.controller.receiveChanges(data);
            this.map.receiveChanges(data);
        } else if (extra.extra1 === WasmMsgType.Log) {
            console.log(new TextDecoder().decode(data));
        }
    }
    private addCellsBuf (buf: Uint8Array) {
        this.controller.receiveChanges(buf);
        this.map.receiveChanges(buf);
        this.wasm.sendData(WasmMsgType.Changes, buf);
    }
    // @ts-ignore
    private onRenderMessage ({ type, data, canvas }: IWorkerMessage) {
        // 收到来自主线程的消息
        // console.log('data from render', type, data);
        // test
        // this.wasm.sendData(WasmMsgType.Test, new Uint8Array([ 3, 2, 1 ]));
        // console.log('onRenderMessage', type, data, canvas);
        switch (type) {
            case WorkerMessageType.InitMap: {
                this.map.init(canvas, data);
                this.wasm.sendData(
                    WasmMsgType.InitMap,
                    new Uint8Array([ this.map.xSize, this.map.ySize ])
                );
                this.controller.history.setMax(data.historyMax);
            }; break;
            case WorkerMessageType.RandomInitCells: {
                this.map.randomInitCells(data);
                this.initCells();
                // console.log(this.map.aliveCells);
            }; break;
            case WorkerMessageType.RandomCells: {
                const buf = this.map.randomCells(data);
                this.addCellsBuf(buf);
            }; break;
            case WorkerMessageType.AddCells: {
                const buf = this.map.cellsToBuf(data);
                this.addCellsBuf(buf);
            }; break;
            case WorkerMessageType.InitCells: {
                this.map.initCells(data);
                this.initCells();
            }; break;
            case WorkerMessageType.TurnCell: {
                const u8s = this.map.toPos(data.x, data.y);
                this.wasm.sendData(WasmMsgType.TurnCell, u8s);
            }; break;
            case WorkerMessageType.CopyCells: {
                this.sendMessage({
                    type: WorkerMessageType.Copy,
                    data: this.map.aliveCellsToString()
                });
            }; break;
            case WorkerMessageType.Control: {
                const { controlType, value } = data;

                switch (controlType) {
                    case ControlType.SetInterval: this.controller.setInterval(value); break;
                    case ControlType.Start: this.controller.start(); break;
                    case ControlType.Pause: this.controller.pause(); break;
                    case ControlType.Step: this.step(); break;
                    case ControlType.Forward: if (!this.controller.next()) {
                        this.sendMessage({
                            type: WorkerMessageType.Control,
                            data: { type: ControlType.ForwardEnd }
                        });
                    }; break;
                    case ControlType.Back: if (!this.controller.prev()) {
                        this.sendMessage({
                            type: WorkerMessageType.Control,
                            data: { type: ControlType.BackEnd }
                        });
                    }; break;
                    case ControlType.Clear: {
                        this.map.clear();
                        // this.controller.pause();
                        this.initCells();
                    }
                    default: break;
                }
            }; break;
        }
    }
    private initCells () {
        const cells = this.map.aliveCellsPosBuf();
        this.wasm.sendData(WasmMsgType.InitCells, cells);
        this.map.drawCells();
        this.controller.history.clear();
    }
    sendMessage (data: IWorkerMessage) {
        this.messenger.send(data);
    }
}
