<!--
 * @Author: chenzhongsheng
 * @Date: 2024-11-02 20:15:59
 * @Description: Coding something
-->
# [LifeGame](https://github.com/theajack/life-game)

[Visit](https://theajack.github.io/life-game) | [Demo Code](https://github.com/theajack/life-game/blob/main/app/index.ts)

## Rules of Conway's Game of Life

1. The state of each cell is determined by the previous state of the cell and the eight surrounding cells;
2. If there are 3 cells around a cell that are alive, the cell is alive, that is, if the cell was originally dead, it will be turned into life, and if it was originally alive, it will remain unchanged;
3. If there are 2 cells living around a cell, the life and death state of the cell remains unchanged;
4. In other cases, the cell is dead, i.e. if the cell was alive, it becomes dead, and if it is dead, it remains unchanged

## Extreme performance optimization

1. Use WebWorker And SharedArrayBuffer to Share Buffer
2. Use Rust + WebAssembly to calculate cell states
3. Shared memory between Rust & Javascript
4. Fill the boundaries to avoid excessive if judgments

## Install

```
npm i life-game-js
```

Or use CDN

```html
<script src="https://cdn.jsdelivr.net/npm/life-game">
```

## Usage

```js
import {LifeGame} from 'life-game-js';
const lifeGame = new LifeGame();
```

Optional Config

```js
import {LifeGame} from 'life-game-js';
const lifeGame = new LifeGame({
    size: 100,
    canvas: document.createElement('canvas'), // or Use YOUR Canvas
    onHistoryEnd: (isHead) => {
        console.log(`History End: ${isHead}`)
    },
    onAliveCountChange: (v) => {
        console.log(`onAliveCountChange: ${v}`)
    },
    onStepCountChange: (v) => {
        console.log(`onStepCountChange: ${v}`)
    }
});

lifeGame.canvas; // Render Canvas If not Given
```

## API

```ts
export declare class LifeGame {
	ready: Promise<void>; // Wait Init Finish
	constructor(options?: {
		size?: number; // Map Size
		historyMax?: number; // History Max Size
        canvas?: HTMLCanvasElement,
		onHistoryEnd?: (isHead: boolean) => void;
		onAliveCountChange?: (v: number) => void;
		onStepCountChange?: (v: number) => void;
		onHistorySizeChange?: (v: number) => void;
	});
	get canvas(): HTMLCanvasElement; // Get canvas to render
	get tileCount(): number; // Get tiles count
	cellCount: number; // Cell count
	history: { // History info
		max: number;
		end: boolean;
		isHead: boolean;
		size: number;
	};
	stepCount: number; // Step Count
	randomInitCells(count?: number): void; // Random initialization cells
	randomCells(count?: number): void; // Add Some random cells
	setStepInterval(value: number): void; // Set step interval (ms)
	start(): void; // Start auto run
	pause(): void; // Pause auto run
	step(): void; // Single step
	forward(): void; // History forward
	back(): void; // History back
	clear(): void; // clear map
}
```