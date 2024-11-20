import { SinglePoint } from 'life-game-shape';
import { createStorage } from 'tc-store';

export const storage = createStorage({
    interval: 200,
    shape: SinglePoint,
    mapSize: 50,
});