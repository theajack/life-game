/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-04 10:53:59
 * @Description: Coding something
 */

import { IPos } from '../common/types/types';


export class LifeMap {
    // @ts-ignore
    ctx: OffscreenCanvasRenderingContext2D;
    width: number = 0;
    height: number = 0;

    xSize = 0;
    ySize = 0;
    tileSize = 0;

    aliveCells: IPos[] = [];

    constructor (private onAliveCountChange: (count: number)=>void) {
        this.onAliveCountChange(0);
    }

    get count () {
        return this.xSize * this.ySize;
    }

    toPos (x: number, y: number): Uint8Array {
        const gap = this.tileSize + 1;
        return new Uint8Array([
            Math.floor(x / gap),
            Math.floor(y / gap),
        ]);
    }

    init (canvas: OffscreenCanvas, {
        width, height, xSize, ySize, tileSize,
    }: {
        width: number, height: number,
        xSize: number, ySize: number,
        tileSize: number,
    }) {
        // console.log('init', canvas);
        this.ctx = canvas.getContext('2d')!;
        this.width = width;
        this.height = height;
        this.xSize = xSize;
        this.ySize = ySize;
        // 去掉边框的尺寸
        this.tileSize = tileSize;
        this.drawLines();
    }

    drawLines () {
        const { ctx, tileSize, width, height } = this;
        const gap = tileSize + 1;
        ctx.strokeStyle = '#aaa';
        // console.log('drawLines');
        ctx.beginPath();
        for (let y = 0; y <= this.ySize; y++) {
            const dy = y * gap;
            for (let x = 0; x <= this.xSize; x++) {
                const dx = x * gap;
                this.ctx.moveTo(dx, 0);
                this.ctx.lineTo(dx, height);
            }
            this.ctx.moveTo(0, dy);
            this.ctx.lineTo(width, dy);
        }
        ctx.stroke();
    }

    randomCells (n = Math.round(this.count / 5)) {
        const set = new Set(this.aliveCells.map(pos => `${pos.x}-${pos.y}`));
        const changes: number[] = [];
        this._randomCells(n, pos => {
            if (!set.has(`${pos.x}-${pos.y}`)) {
                changes.push(pos.x, pos.y, 1);
            }
        });
        return new Uint8Array(changes);
    }

    randomInitCells (n = Math.round(this.count / 3)) {
        this.clear();
        this._randomCells(n, pos => this.aliveCells.push(pos));
        this.onAliveCountChange(this.aliveCells.length);
    }

    private _randomCells (n: number, onCell: (pos: IPos)=>void) {
        const set = new Set<number>();
        const max = this.count - 1;
        if (n >= max) {
            throw new Error(`to many random cells: ${n}/${max}`);
        }
        while (set.size < n) {

            const index = random(0, max);
            if (set.has(index)) {
                continue;
            } else {
                set.add(index);
                const pos = {
                    y: Math.floor(index / this.xSize),
                    x: index % this.xSize,
                };
                onCell(pos);
            }
        }
    }

    initCells (cells: IPos[]) {
        this.clear();
        this.aliveCells = cells;
        this.onAliveCountChange(cells.length);
    }

    drawCells (cells: IPos[] = this.aliveCells) {
        this.ctx.fillStyle = '#000';
        const gap = this.tileSize + 1;
        for (const cell of cells) {
            this.ctx.fillRect(
                cell.x * gap,
                cell.y * gap,
                this.tileSize,
                this.tileSize
            );
        }
    }

    aliveCellsPosBuf () {
        const buf = new Uint8Array(this.aliveCells.length * 2);
        let i = 0;
        for (const cell of this.aliveCells) {
            buf[i] = cell.x;
            buf[i + 1] = cell.y;
            i += 2;
        }
        return buf;
    }

    receiveChanges (data: Uint8Array) {
        const n = data.byteLength;
        const gap = this.tileSize + 1;
        for (let i = 0; i < n; i += 3) {
            const x = data[i];
            const y = data[i + 1];
            const alive = data[i + 2] === 1;
            this.ctx.fillStyle = alive ? '#000' : '#fff';

            this.ctx.fillRect(
                x * gap,
                y * gap,
                this.tileSize,
                this.tileSize
            );

            if (alive) {
                this.aliveCells.push({ x, y });
            } else {
                const index = this.aliveCells.findIndex(c => c.x === x && c.y === y);
                this.aliveCells.splice(index, 1);
            }
            // console.log(`x=${x}, y=${y}, alive=${alive}`);
        }
        this.onAliveCountChange(this.aliveCells.length);
    }

    clear () {
        this.aliveCells = [];
        this.clearCanvas();
        this.drawLines();
        this.onAliveCountChange(0);
    }

    clearCanvas () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

}
function random (a: number, b: number) {
    return (a + Math.round(Math.random() * (b - a)));
};