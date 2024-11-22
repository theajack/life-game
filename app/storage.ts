/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-14 20:37:49
 * @Description: Coding something
 */
import { SinglePoint } from 'life-game-shape';
import { createStorage } from 'tc-store';

export const storage = createStorage({
    interval: 200,
    shape: SinglePoint,
    mapSize: 100,
});