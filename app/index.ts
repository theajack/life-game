/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-02 07:35:00
 * @Description: Coding something
 */
import { LifeGame } from '../src';
import './style.css';

import { createStore, dom, mount, react, style } from 'link-dom';

style({
    '.lg-panel': {
        position: 'fixed',
        right: '10px',
        top: '10px',
        '.lg-line': {
            display: 'flex',
            gap: '5px',
            marginBottom: '10px',
            alignItems: 'center',
            'button': {
                backgroundColor: '#eee',
                padding: '5px 10px',
                outline: 'none',
                border: '1px solid #555',
                cursor: 'pointer',
            },
            'input': {
                outline: 'none',
                border: '1px solid #555',
                cursor: 'pointer',
                height: '27px',
                width: '60px',
            }
        }
    }
});

function initUI () {

    let lifeGame: LifeGame;
    const store = createStore({
        interval: 500,
        mapSize: 100,

        initDisplay: 'flex',
        panelDisplay: 'none',

        randomInitCount: 0,
        randomCount: 0,

        aliveCellCount: 0,
        stepCount: 0,
    });

    const initMap = async () => {
        if (store.mapSize > 250) {
            alert('Max size is 250');
            return;
        }
        const tiles = store.mapSize ** 2;
        store.randomInitCount = Math.round(tiles / 4);
        store.randomCount = Math.round(tiles / 5);
        lifeGame = new LifeGame({
            size: store.mapSize,
            historyMax: 10,
            onHistoryEnd: (isHead) => {
                alert(`There is no record ${isHead ? 'before' : 'after'}`);
            },
            onAliveCountChange: (v) => {
                store.aliveCellCount = v;
            },
            onStepCountChange: (v) => {
                store.stepCount = v;
            },
            onHistorySizeChange: (v) => {
                console.log(`History size changed: ${v}`);
            }
        });
        document.body.appendChild(lifeGame.canvas);
        await lifeGame.ready;
        lifeGame.randomInitCells(store.randomInitCount);
        store.initDisplay = 'none';
        store.panelDisplay = 'block';
    };

    return dom.div.class('lg-panel').append(
        dom.div.class('lg-line').style({
            display: react`${store.initDisplay}`,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'fit-content',
        }).append(
            dom.span.text('Map Size:'),
            dom.input.bind(store.mapSize),
            dom.button.text('Init').click(initMap),
        ),
        dom.div.style({
            display: react`${store.panelDisplay}`,
            padding: '8px',
            border: '1px solid #555',
            backgroundColor: '#fffd',
        }).append(
            dom.div.class('lg-line').style({ fontWeight: 'bold', justifyContent: 'center' }).append(
                dom.span.text(react`Steps: ${store.stepCount}; `),
                dom.span.text(react`Cells: ${store.aliveCellCount}`),
            ),
            dom.div.class('lg-line').append(
                dom.button.text('Start').click(() => lifeGame.start()),
                dom.button.text('Pause').click(() => lifeGame.pause()),
                dom.button.text('Single Step').click(() => lifeGame.step()),
            ),
            dom.div.class('lg-line').append(
                dom.button.text('Back').click(() => lifeGame.back()),
                dom.button.text('Forward').click(() => lifeGame.forward()),
                dom.button.text('Clear Cells').style({ color: '#f44' }).click(() => lifeGame.clear()),
            ),
            dom.div.class('lg-line').append(
                dom.span.html('Cell Count&nbsp;&nbsp;&nbsp;:'),
                dom.input.bind(store.randomInitCount),
                dom.button.text('ReInit').click(() => lifeGame.randomInitCells(store.randomInitCount)),
            ),
            dom.div.class('lg-line').append(
                dom.span.html('Cell Count&nbsp;&nbsp;&nbsp;:'),
                dom.input.bind(store.randomCount),
                dom.button.text('Add Cells').click(() => lifeGame.randomCells(store.randomCount)),
            ),
            dom.div.class('lg-line').append(
                dom.span.text('Step interval:'),
                dom.input.bind(store.interval),
                dom.span.text('ms'),
                dom.button.text('Set').click(() => lifeGame.setStepInterval(store.interval)),
            ),
            dom.div.class('lg-line').style({ color: '#888' }).text(
                'Tip:click cell can change status'
            )
        )
    );
}

mount(initUI(), 'body');
