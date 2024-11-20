/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-19 08:19:43
 * @Description: Coding something
 */
import { dom } from 'link-dom';
import { getShapeNameList } from 'life-game-shape';

export function initPreset (mapSize: number, val: string) {
    const list = getShapeNameList(mapSize);
    return dom.select.value(val).append(
        dom.option.text(val),
        ...list.map(name => dom.option.text(name))
    );
}