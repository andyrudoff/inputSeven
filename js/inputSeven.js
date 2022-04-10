"use strict";

function inputSeven(id, letters, onWord) {
    const $inputSeven = document.getElementById(id);
    $inputSeven.innerHTML = `
<div id="input-seven-word"></div><br>
<canvas id="input-seven-layer0" width="200" height="200"></canvas>
<canvas id="input-seven-layer1" width="200" height="200"></canvas>
`;
    const $word = document.getElementById('input-seven-word');
    const $layer0 = document.getElementById('input-seven-layer0');
    const $layer1 = document.getElementById('input-seven-layer1');
    const ctx0 = $layer0.getContext('2d');
    const ctx1 = $layer1.getContext('2d');
    let radius = $layer0.height / 2;
    let down = false;
    let used = [ false, false, false, false, false, false, false ];
    let opsLayer1 = [];
    let wordSoFar = '';
    let lastX;
    let lastY;

    ctx0.translate(radius, radius);
    radius = radius * 0.90

    drawLetters(ctx0, radius, letters);

    const loc = [
        { x: 101, y: 27 },   // letter 0
        { x: 157, y: 54 },   // letter 1
        { x: 171, y: 114 },  // letter 2
        { x: 131, y: 163 },  // letter 3
        { x: 70, y: 164 },   // letter 4
        { x: 31, y: 115 },   // letter 5
        { x: 45, y: 54 },    // letter 6
    ];

    const mouseXY = function(e) {
        const r = $layer0.getBoundingClientRect();
        const scaleX = $layer0.width / r.width;
        const scaleY = $layer0.height / r.height;
        return {
            x: Math.round((e.clientX - r.left) * scaleX),
            y: Math.round((e.clientY - r.top) * scaleY)
        }
    };

    const execute = function(op) {
		switch(op.what) {
		case 'circle':
            ctx1.beginPath();
            ctx1.arc(op.x, op.y, 15, 0, 2 * Math.PI);
            ctx1.fillStyle = 'rgba(200, 128, 255, 0.3)';
            ctx1.fill();
            break;
        case 'line':
            ctx1.beginPath();
            ctx1.strokeStyle = 'rgba(200, 128, 255, 0.3)';
            ctx1.lineWidth = '15';
            ctx1.moveTo(op.fromX, op.fromY);
            ctx1.lineTo(op.toX, op.toY);
            ctx1.stroke();
            break;
        }

    };

    const logAndExecute = function(op) {
        opsLayer1.push(op);
        execute(op);
    };

    const redraw = function() {
        ctx1.clearRect(0, 0, $layer1.width, $layer1.height);
        for (const op of opsLayer1) {
            execute(op);
        }
    };

    const addLetter = function(idx) {
        used[idx] = true;
        console.log(`letter ${letters[idx]}`);
        const xy = loc[idx];
        logAndExecute({ what: 'circle', x: xy.x, y: xy.y });
        wordSoFar += letters[idx];
        console.log(`addLetter, now word is: ${wordSoFar}`);
        $word.innerHTML = wordSoFar;
    };

    const addXY = function(x, y) {
        for (var i = 0; i < 7; i++) {
            if (used[i]) {
                continue;
            }
            const xy = loc[i];
            if (x > xy.x - 18 && x < xy.x + 18 &&
                y > xy.y - 18 && y < xy.y + 18) {
                if (wordSoFar) {
                    // stroke from middle of last letter to middle of this one
                    redraw();
                    logAndExecute({ what: 'line', fromX: lastX, fromY: lastY,
                        toX: xy.x, toY: xy.y });
                }
                addLetter(i);
                lastX = xy.x;
                lastY = xy.y;
                return;
            }
        }
        // not in a letter, if draging pointer away from a letter,
        // draw a line from that letter to the current position
        if (wordSoFar) {
            redraw();
            execute({ what: 'line', fromX: lastX, fromY: lastY,
                toX: x, toY: y });
        }
    };

    const endWord = function() {
        onWord(wordSoFar);
        down = false;
        used = [ false, false, false, false, false, false, false ];
        opsLayer1 = [];
        wordSoFar = '';
        ctx1.clearRect(0, 0, $layer1.width, $layer1.height);
    };

    // listen for mouse up
    $layer1.addEventListener('pointerup', function(event) {
        const xy = mouseXY(event);
        console.log(`up ${xy.x} ${xy.y} word is "${wordSoFar}"`);
        endWord();
    });

    // listen for mouse out
    $layer1.addEventListener('pointerout', function(event) {
        const xy = mouseXY(event);
        console.log(`out ${xy.x} ${xy.y}`);
        endWord();
    });

    // listen for mouse moves
    $layer1.addEventListener('pointermove', function(event) {
        if (down) {
            const xy = mouseXY(event);
            console.log(`move ${xy.x} ${xy.y}`);
            addXY(xy.x, xy.y);
        }
    });

    // listen for mouse down
    $layer1.addEventListener('pointerdown', function(event) {
        $word.innerHTML = '';
        const xy = mouseXY(event);
        console.log(`down ${xy.x} ${xy.y}`);
        down = true;
        addXY(xy.x, xy.y);
    });
}

function drawLetters(ctx, radius, letters) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    let grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius * 0.1;
    ctx.stroke();
    ctx.fillStyle = 'black';

    ctx.font = radius*0.25 + "px arial";
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    for (let n = 0; n < 7; n++){
        const angle = n * Math.PI / 3.5;
        ctx.rotate(angle);
        ctx.translate(0, -radius*0.80);
        ctx.rotate(-angle);
        ctx.fillText(letters[n].toUpperCase(), 0, 0);
        ctx.rotate(angle);
        ctx.translate(0, radius*0.80);
        ctx.rotate(-angle);
    }
}
