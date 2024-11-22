/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-19 08:19:43
 * @Description: Coding something
 */
import { dom, Dom, query, style } from 'link-dom';
import { getShapeNameList, findShapeWithName, parseShape } from 'life-game-shape';
import { runTasks } from 'task-runner-lib';
import { withResolve } from '../src/common/utils';

let ShapePanel: Dom;

style({
    '.shape-box': {
        height: 'fit-content',
        padding: '5px',
        width: '110px',
        cursor: 'pointer',
        '.shape-text': {
            fontSize: '10px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textAlign: 'center',
        },
        '.shape-canvas': {
            width: '100px',
            aspectRatio: '1/1',
            border: '1px solid #eee',
        }
    },
});

const { ready, resolve } = withResolve();

export async function initPreset ({
    mapSize,
    onChoose,
    onClose,
}: {
    mapSize: number,
    onChoose: (v: string)=>void,
    onClose: ()=> void,
}) {
    const list = getShapeNameList(mapSize);
    // return dom.select.value(val).append(
    //     dom.option.text(val),
    //     ...list.map(name => dom.option.text(name))
    // );

    query('body', true).append(
        ShapePanel = dom.div.style({
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundColor: '#fff',
            flexWrap: 'wrap',
            zIndex: 100000,
            alignContent: 'flex-start',
            overflow: 'auto',
            paddingTop: '40px',
        }).append(
            dom.span.text('×').style({
                position: 'fixed',
                zIndex: '100',
                top: '0',
                right: '15px',
                color: '#f44',
                cursor: 'pointer',
                fontSize: '30px',
            }).click(() => {
                onClose();
                ShapePanel.hide();
            })
        ).hide(),
    );

    const tasks = list.map(name => {
        return () => {
            const { map, width, height } = findShapeWithName(name);

            if (width > mapSize || height > mapSize) {
                return;
            }

            const max = Math.max(width, height);

            const len = 4;
            const gap = len + 1;
            const padding = 2;
            const canvas = dom.canvas.class('shape-canvas');
            const canvasEl = canvas.el as HTMLCanvasElement;
            const ctx = canvasEl.getContext('2d');
            canvasEl.width = canvasEl.height = max * gap + padding * 2;

            let ratio = 1;
            if (canvasEl.width < 100) {
                ratio =  100 / canvasEl.width;
                canvasEl.width = canvasEl.height = 100;
            }

            ShapePanel.append(
                dom.div.attr('title', name)
                    .click(() => {
                        onChoose(name);
                        onClose();
                        ShapePanel.hide();
                    })
                    .class('shape-box').append(
                        dom.div.text(name).class('shape-text'),
                        canvas
                    )
            );
            const { cells } = parseShape({ map });

            cells.forEach(({ x, y }) => {
                ctx?.fillRect(
                    (padding + x * gap) * ratio, (padding + y * gap) * ratio,
                    len * ratio, len * ratio,
                );
            });
        };
    });
    console.time('init shape');
    await runTasks(tasks);
    console.timeEnd('init shape');
    resolve();
}

export async function openShapeChoose () {
    await ready;
    ShapePanel.show('flex');
}