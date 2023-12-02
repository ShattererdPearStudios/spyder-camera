let city;
let buildingColors = [];
let gapSize = 50;
let splinePoints = [];
let numSplinePoints = 2000;
let camIndex = 0;

function setup() {
  createCanvas(1200, 800, WEBGL);
  initializeScene();
}

function draw() {
  background(0);

  updateCamera();
  calculateSpline();
  drawCity();
  drawSpline();
  drawControlPoints();
  orbitControl();
}

function initializeScene() {
  city = createCity(10, 10);
  generateBuildingColors();
  calculateSpline();
}

function updateCamera() {
  if (splinePoints.length > 0) {
    camIndex = (camIndex + 1) % splinePoints.length;
    let camX = splinePoints[camIndex].x;
    let camY = splinePoints[camIndex].y;
    let camZ = splinePoints[camIndex].z + 200;

    let lookX = splinePoints[(camIndex + 1) % splinePoints.length].x;
    let lookY = splinePoints[(camIndex + 1) % splinePoints.length].y;
    let lookZ = splinePoints[(camIndex + 1) % splinePoints.length].z;

    camera(camX, camY, camZ, lookX, lookY, lookZ, 0, 1, 0);
  }
}

function drawCity() {
  const numRows = city.length;
  const numCols = city[0].length;
  const cellSize = (width - (numCols - 1) * gapSize) / numCols;
  const maxHeight = max(city.flat());

  noStroke();

  push(); // Save the current transformation state

  rotateX(-PI / 2);
  rotateY(-PI);

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const currentColor = buildingColors[i][j];
      fill(currentColor.levels[0], currentColor.levels[1], currentColor.levels[2]);

      translate(
        j * (cellSize + gapSize) - width / 2,
        i * (cellSize + gapSize) - height / 2,
        city[i][j] / 2
      );
      box(cellSize, cellSize, city[i][j]);
      translate(
        -j * (cellSize + gapSize) + width / 2,
        -i * (cellSize + gapSize) + height / 2,
        -city[i][j] / 2
      );
    }
  }

  pop(); 
}

function createCity(rows, cols) {
  let city = [];
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push(random(50, 200));
    }
    city.push(row);
  }
  return city;
}

function generateBuildingColors() {
  for (let i = 0; i < city.length; i++) {
    buildingColors.push([]);
    for (let j = 0; j < city[i].length; j++) {
      buildingColors[i].push(color(random(50, 255), random(50, 255), random(50, 255)));
    }
  }
}

function calculateSpline() {
  let controlPoints = [
    createVector(-width / 2, -height / 2, 0),
    createVector(-width / 4, -height / 4, 200),
    createVector(-width / 8, -height / 2, 0),
    createVector(0, -height / 4, 200),
    createVector(width / 8, -height / 2, 0),
    createVector(width / 4, -height / 4, 200),
    createVector(width / 2, -height / 2, 0),
  ];

  splinePoints = splineInterpolation(controlPoints, numSplinePoints);
}

function drawSpline() {
  noFill();
  stroke(255, 0, 0);
  beginShape();
  for (let i = 0; i < splinePoints.length; i++) {
    vertex(splinePoints[i].x, splinePoints[i].y, splinePoints[i].z);
  }
  endShape();
}

function drawControlPoints() {
  fill(255, 0, 0);
  noStroke();
  for (let i = 0; i < splinePoints.length; i++) {
    sphere(10);
  }
}

function splineInterpolation(controlPoints, numPoints) {
  let splinePoints = [];
  for (let i = 0; i < numPoints; i++) {
    let t = i / (numPoints - 1);
    let p = catmullRomSpline(controlPoints, t);
    splinePoints.push(p);
  }
  return splinePoints;
}

function catmullRomSpline(controlPoints, t) {
  const numPoints = controlPoints.length;
  const p = []; // Temporary array to store intermediate results

  for (let i = 0; i < numPoints; i++) {
    p[i] = controlPoints[i].copy(); // Copy the control points to avoid modifying them
  }

  for (let k = 1; k < numPoints; k++) {
    for (let i = 0; i < numPoints - k; i++) {
      p[i].x = (1 - t) * p[i].x + t * p[i + 1].x;
      p[i].y = (1 - t) * p[i].y + t * p[i + 1].y;
      p[i].z = (1 - t) * p[i].z + t * p[i + 1].z;
    }
  }

  return p[0];
}
