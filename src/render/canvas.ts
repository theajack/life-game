import { Messenger } from '../common/messenger';
import { WorkerMessageType } from '../common/types/enum';
import { IPos } from '../common/types/types';

/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-06 08:11:38
 * @Description: Coding something
 */
export class LifeCanvas {
    canvas: HTMLCanvasElement;

    width: number;
    height: number;

    xSize = 0;
    ySize = 0;
    tileSize = 0;
    messenger: Messenger;

    constructor ({
        messenger,
        canvas,
        size,
        onTapCell,
    }: {
        messenger: Messenger,
        size: number,
        canvas?: HTMLCanvasElement,
        onTapCell?: (next: ()=>void, pos: IPos)=>void,
    }) {
        if (size > 250) {
            throw new Error('地图长宽不能超过250');
        }
        this.xSize = this.ySize = size;
        this.messenger = messenger;
        this.canvas = canvas || document.createElement('canvas');
        this.canvas.style.backgroundColor = '#fff';
        this.width = this.height = Math.min(window.innerHeight, window.innerWidth);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.tileSize = (this.width - this.xSize - 1) / this.xSize;


        const next = (e: MouseEvent) => {
            const { offsetX, offsetY } = e;
            this.messenger.send({
                type: WorkerMessageType.TurnCell,
                data: { x: offsetX, y: offsetY },
            });
        };

        let handler: any;
        if (onTapCell) {
            const gap = this.tileSize + 1;
            handler = (e: MouseEvent) => {
                const { offsetX, offsetY } = e;
                onTapCell(() => {next(e);}, {
                    x: Math.floor(offsetX / gap),
                    y: Math.floor(offsetY / gap),
                });
            };
        } else {
            handler = next;
        }

        this.canvas.addEventListener('click', handler);
    }

    sizeInfo () {
        const { width, height, tileSize, xSize, ySize } = this;
        return { width, height, tileSize, xSize, ySize };
    }

    randomInitCells (n: number) {
        this.messenger.send({
            type: WorkerMessageType.RandomInitCells,
            data: n,
        });
    }
    randomCells (n: number) {
        this.messenger.send({
            type: WorkerMessageType.RandomCells,
            data: n,
        });
    }

    initCells (cells: IPos[]) {
        this.messenger.send({
            type: WorkerMessageType.InitCells,
            data: cells,
        });
    }

    addCells (cells: IPos[]) {
        this.messenger.send({
            type: WorkerMessageType.AddCells,
            data: cells,
        });
    }

    initMap (historyMax: number) {
        const canvas = this.canvas.transferControlToOffscreen();
        console.log('init map', canvas);
        this.messenger.client.postMessage({
            type: WorkerMessageType.InitMap,
            data: {
                ...this.sizeInfo(),
                historyMax,
            },
            canvas: canvas,
        // @ts-ignore
        }, [ canvas ]);
    }

    step () {
        this.messenger.send({
            type: WorkerMessageType.Step
        });
    }
}