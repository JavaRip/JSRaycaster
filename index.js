// global variables
const tdvCanv = document.querySelector('#tdv'); // top down view
const tdv = tdvCanv.getContext('2d');
const GS = {}; // GameState

// functions

function clearCanvas() {
  tdv.fillStyle = 'black';
  tdv.fillRect(0, 0, tdvCanv.height, tdvCanv.width);
}

function drawVectArr(arr, color, thickness) {
  for (const vect of arr) {
    drawVect(vect, color, thickness);
  }
}

function drawVect(v, color, thickness) {
  tdv.strokeStyle = color;
  tdv.lineWidth = thickness;
  tdv.beginPath();
  tdv.moveTo(v.x1, v.y1);
  tdv.lineTo(v.x2, v.y2);
  tdv.stroke();
}

function genRandWall() {
  const maxX = tdvCanv.width;
  const maxY = tdvCanv.height;
  const x1 = Math.floor(Math.random() * maxX);
  const y1 = Math.floor(Math.random() * maxY);
  const x2 = Math.floor(Math.random() * maxX);
  const y2 = Math.floor(Math.random() * maxY);
  return { x1: x1, y1: y1, x2: x2, y2: y2 };
}

function genMap() {
  const maxX = tdvCanv.width;
  const maxY = tdvCanv.height;
  const ux = tdvCanv.width / 100; // unit x
  const uy = tdvCanv.width / 100; // unit y
  const wallArr = [];

  // draw box around map
  wallArr.push({ x1: 0, y1: 0, x2: maxX, y2: 0 }); // top
  wallArr.push({ x1: maxX, y1: 0, x2: maxX, y2: maxY }); // right
  wallArr.push({ x1: 0, y1: maxY, x2: maxX, y2: maxY }); // bottom
  wallArr.push({ x1: 0, y1: 0, x2: 0, y2: maxY }); // left

  // draw box
  wallArr.push({ x1: 10 * ux, y1: 10 * uy, x2: 20 * ux, y2: 10 * uy }); // top
  wallArr.push({ x1: 20 * ux, y1: 10 * uy, x2: 20 * ux, y2: 20 * uy }); // right
  wallArr.push({ x1: 10 * ux, y1: 20 * uy, x2: 20 * ux, y2: 20 * uy }); // bottom
  wallArr.push({ x1: 10 * ux, y1: 10 * uy, x2: 10 * ux, y2: 20 * uy }); // left

  // draw box
  wallArr.push({ x1: 10 * ux, y1: 25 * uy, x2: 20 * ux, y2: 25 * uy }); // top
  wallArr.push({ x1: 20 * ux, y1: 25 * uy, x2: 20 * ux, y2: 35 * uy }); // right
  wallArr.push({ x1: 10 * ux, y1: 35 * uy, x2: 20 * ux, y2: 35 * uy }); // bottom
  wallArr.push({ x1: 10 * ux, y1: 25 * uy, x2: 10 * ux, y2: 35 * uy }); // left

  // draw box
  wallArr.push({ x1: 10 * ux, y1: 40 * uy, x2: 20 * ux, y2: 40 * uy }); // top
  wallArr.push({ x1: 20 * ux, y1: 40 * uy, x2: 20 * ux, y2: 50 * uy }); // right
  wallArr.push({ x1: 10 * ux, y1: 50 * uy, x2: 20 * ux, y2: 50 * uy }); // bottom
  wallArr.push({ x1: 10 * ux, y1: 40 * uy, x2: 10 * ux, y2: 50 * uy }); // left

  // draw box
  wallArr.push({ x1: 60 * ux, y1: 50 * uy, x2: 70 * ux, y2: 50 * uy }); // top
  wallArr.push({ x1: 70 * ux, y1: 50 * uy, x2: 70 * ux, y2: 60 * uy }); // right
  wallArr.push({ x1: 60 * ux, y1: 60 * uy, x2: 70 * ux, y2: 60 * uy }); // bottom
  wallArr.push({ x1: 60 * ux, y1: 50 * uy, x2: 60 * ux, y2: 60 * uy }); // left

  // return wall array
  return wallArr;
}

function genRays(pp, numRays, fov, lookDir) {
  const rayArray = [];
  const tau = Math.PI * 2;
  const radUnit = tau / numRays * (fov / 360); // fov converted to % of degrees
  for (let i = 0; i < numRays; i += 1) {
    const dirx = pp.x + (Math.cos(radUnit * i + lookDir));
    const diry = pp.y + (Math.sin(radUnit * i + lookDir));
    const ray = { x1: pp.x, y1: pp.y, x2: dirx, y2: diry };
    rayArray.push(ray);
  }
  return rayArray;
}

function drawPlayer(pp) {
  tdv.fillStyle = 'white';
  tdv.beginPath();
  tdv.arc(pp.x, pp.y, 5, 0, 2 * Math.PI);
  tdv.fill();
}

function dtctIntrscts(rays, map) {
  const intrsctArr = [];
  for (const ray of rays) {
    let closestIntrsctDist = Infinity;
    let closestIntrsct;
    for (const wall of map) {
      const newIntrsct = getIntrsct(ray, wall);
      if (newIntrsct !== undefined) {
        const newIntrsctDist = Math.hypot(newIntrsct.x1 - newIntrsct.x2, newIntrsct.y1 - newIntrsct.y2);
        if (newIntrsctDist < closestIntrsctDist) {
          closestIntrsctDist = newIntrsctDist;
          closestIntrsct = newIntrsct;
        }
      }
    }
    if (closestIntrsct !== undefined) {
      intrsctArr.push(closestIntrsct);
    }
  }
  return intrsctArr;
}

function getIntrsct(ray, wall) {
  const x1 = wall.x1;
  const y1 = wall.y1;
  const x2 = wall.x2;
  const y2 = wall.y2;
  const x3 = ray.x1;
  const y3 = ray.y1;
  const x4 = ray.x2;
  const y4 = ray.y2;

  const den = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (den === 0) {
    return;
  }
  const t = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / den;
  const u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;
  if (t > 0 && t < 1 && u > 0) {
    return { x1: ray.x1, y1: ray.y1, x2: x1 + t * (x2 - x1), y2: y1 + t * (y2 - y1) };
  }
}

function movePlayer(event, start) {
  if (event) {
    switch (event.keyCode) {
      case 87: // w
        GS.moving.forward = start;
        break;
      case 83: // s
        GS.moving.back = start;
        break;
      case 65: // a
        GS.moving.left = start;
        break;
      case 68: // d
        GS.moving.right = start;
        break;
      case 37: // left arrow
        GS.turning.left = start;
        break;
      case 39: // right arrow
        GS.turning.right = start;
        break;
    }
  }
}

function reCalcRays() {
  GS.rays = genRays(GS.playerPos, GS.numRays, GS.fov, GS.lookDir);
  GS.intrscts = dtctIntrscts(GS.rays, GS.map);
}

function initGameState() {
  GS.moving = {};
  GS.turning = {};
  GS.moving.forward = false;
  GS.moving.back = false;
  GS.moving.left = false;
  GS.moving.right = false;
  GS.turning.right = false;
  GS.turning.left = false;
  GS.playerPos = { x: tdvCanv.width / 2, y: tdvCanv.height / 2 };
  GS.numRays = 10;
  GS.fov = 100; // degrees
  GS.lookDir = 180;
  GS.map = genMap(GS.numWalls);
  GS.rays = genRays(GS.playerPos, GS.numRays, GS.fov, GS.lookDir);
  GS.intrscts = dtctIntrscts(GS.rays, GS.map);
}

function drawGameState() {
  drawVectArr(GS.map, 'white', 3);
  drawVectArr(GS.intrscts, 'lime', 2);
  drawPlayer(GS.playerPos, 'white');
}

function addELs() {
  document.addEventListener('keydown', (event) => {
    movePlayer(event, true);
  });

  document.addEventListener('keyup', (event) => {
    movePlayer(event, false);
  });
}

function init() {
  addELs();
  clearCanvas();
  initGameState();
  drawGameState();
  setInterval(() => {
    if (GS.moving.forward === true) {
      GS.playerPos.y -= 5;
    }
    if (GS.moving.back === true) {
      GS.playerPos.y += 5;
    }
    if (GS.moving.left === true) {
      GS.playerPos.x -= 5;
    }
    if (GS.moving.right === true) {
      GS.playerPos.x += 5;
    }
    if (GS.turning.right === true) {
      GS.lookDir += 0.05;
    }
    if (GS.turning.left === true) {
      GS.lookDir -= 0.05;
    }
    clearCanvas();
    reCalcRays();
    drawGameState();
  }, 10);
}

window.addEventListener('load', init);
