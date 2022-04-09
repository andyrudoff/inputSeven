"use strict";

function inputSeven(id, letters, onWord) {
    const $inputSeven = document.getElementById(id);
    $inputSeven.innerHTML = `
<div id="input-seven-word"></div><br>
<canvas id="input-seven-layer0" width="400" height="400"></canvas>
<canvas id="input-seven-layer1" width="400" height="400"></canvas>
`;
    const $word = document.getElementById('input-seven-word');
    const $layer0 = document.getElementById('input-seven-layer0');
    const $layer1 = document.getElementById('input-seven-layer1');
    const ctx0 = $layer0.getContext('2d');
    const ctx1 = $layer1.getContext('2d');
    let radius = $layer0.height / 2;
    let down = false;
    let used = [ false, false, false, false, false, false, false ];
    let wordSoFar = '';

    ctx0.translate(radius, radius);
    radius = radius * 0.90

    drawLetters(ctx0, radius, letters);

    const loc = [
        { x: 200, y: 54 },   // letter 0
        { x: 312, y: 108 },  // letter 1
        { x: 342, y: 228 },  // letter 2
        { x: 262, y: 326 },  // letter 3
        { x: 139, y: 326 },  // letter 4
        { x: 60, y: 228 },   // letter 5
        { x: 88, y: 108 },   // letter 6
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

    const addLetter = function(idx) {
        if (used[idx]) {
            return;
        }
        used[idx] = true;
        console.log(`letter ${letters[idx]}`);
        const xy = loc[idx];
        ctx1.beginPath();
        ctx1.arc(xy.x, xy.y, 25, 0, 2*Math.PI);
        ctx1.fillStyle = 'rgba(200, 128, 255, 0.3)';
        ctx1.fill();
        wordSoFar += letters[idx];
        console.log(`addLetter, now word is: ${wordSoFar}`);
        $word.innerHTML = wordSoFar;
    };

    const addXY = function(x, y) {
        for (var i = 0; i < 7; i++) {
            const xy = loc[i];
            if (x > xy.x - 26 && x < xy.x + 26 &&
                y > xy.y - 26 && y < xy.y + 26) {
                addLetter(i);
                return;
            }
        }
    };

    const endWord = function() {
        onWord(wordSoFar);
        down = false;
        used = [ false, false, false, false, false, false, false ];
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
