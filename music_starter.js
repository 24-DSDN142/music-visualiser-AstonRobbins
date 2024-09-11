class Rotation{
  rotate;
}

r = new Rotation;
r.rotate = 0;

cWidth = 960;
cHeight = 540;

smallScreenWidth = cWidth/4;
smallScreenHeight = cHeight/5;
bigScreenWidth = cWidth/2.5;
bigScreenHeight = cHeight/3;

lightBoxStates = [];
lightBoxCount = 8;
for (let i = 0; i < lightBoxCount; i++) {
  lightBoxStates.push({ glowIntensity: 10, frameCountdown: 0 });
}

gradientGlowIntensity = 0; //background lighting starting colour intenstity (if the lights start off or on)

function drawGradientBackground() {
  noStroke();
  for (let y = 0; y < cHeight; y++) {
    //make background a turqouise gradient
    inter = map(y, cHeight/8, cHeight - cHeight/40, 0, 1);  //map the gradients positioning for colour
    col = lerpColor(color(64, 224, 208, gradientGlowIntensity), color(0, 0, 0, gradientGlowIntensity), inter); //gradient based on map from turquoise to black
    stroke(col);
    line(0, y, cWidth, y);
  }
  noStroke();
}

//get background colour
function getBackgroundColorAtY(yPosition, counter) {
  let inter = map(yPosition, cHeight / 8, cHeight - cHeight / 40, 0, 1);
  return lerpColor(color(64, 224, 208, gradientGlowIntensity), color(0, 0, 0, gradientGlowIntensity), inter);
}

function updateGradient(lightNum) {
  if (lightNum > 70 && gradientGlowIntensity === 0) {
    gradientGlowIntensity = 255;
  }

  if (gradientGlowIntensity > 0) {
    gradientGlowIntensity -= 12.60;
    if (gradientGlowIntensity < 0){gradientGlowIntensity = 0;}
  }
}

function drawSmallScreenCircles(screenX, screenY, screenWidth, screenHeight, rows, cols, pg) {
  let circleDiameter = screenWidth / cols;
  let xOffset = circleDiameter / 2;
  let yOffset = screenHeight / rows;

  pg.noStroke();
  pg.fill(0);

  //no additional adjustment (CHECK LATER PLEASE)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let xPos = col * circleDiameter + xOffset;
      let yPos = row * yOffset + yOffset / 2;
      pg.ellipse(xPos, yPos, circleDiameter * 0.8);
    }
  }
}

let screenBuffer; //PGraphics for processing speed

function getMappedColor(voice) {
  //map rgb based on voice for smooth transition from blue to purple
  let r = map(voice, 0, 100, 64, 148);
  let g = map(voice, 0, 100, 224, 0); 
  let b = map(voice, 0, 100, 208, 211);

  return color(r, g, b);
}

let circles = [];
let bulbDiameter;
let circleCenterX, circleCenterY;
let thickness = 3;

//circle creation
function createNewCircle() {
  return {
    currentRadius: 0,
    frameCounter: 0,
  };
}

disableTurnOff = false; //when bass > 70
effectStarted = false; //to track if effect has started of final circle turning off
finalCircleComplete = false; //when animation is complete

let linesComplete = false;

function turnOnBulbsInCirclePattern(rows, cols, voice, screenX, bass) {
  mappedColor = getMappedColor(voice); //color of circle should be from mapped voice
  fill(mappedColor);

  bulbDiameter = smallScreenWidth / cols;
  circleCenterX = screenX;
  circleCenterY = cHeight / 2;

  //if lines have happened circles should be indefinite
  if (linesComplete) {
    disableTurnOff = true;
  } else if (bass > 70 && !effectStarted) {
    disableTurnOff = true;
    effectStarted = true;
  }

  //for all circles
  for (i = 0; i < circles.length; i++) {
    let circle = circles[i];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let xPos = circleCenterX - smallScreenWidth / 2 + col * bulbDiameter + bulbDiameter / 2;
        let yPos = circleCenterY - smallScreenHeight / 2 + row * (smallScreenHeight / rows) + (smallScreenHeight / rows) / 2;

        let distance = dist(xPos, yPos, circleCenterX, circleCenterY);

        //draw each circle
        if (distance <= circle.currentRadius * bulbDiameter &&
            distance > (circle.currentRadius - thickness) * bulbDiameter) {
          if (yPos >= cHeight / 2 - smallScreenHeight / 2 && yPos <= cHeight / 2 + smallScreenHeight / 2) {
            ellipse(xPos, yPos, bulbDiameter * 0.8); // Draw the mapped color of vocal
          }
        }
      }
    }

    //increase radius of circle every 5 frames
    circle.frameCounter++;
    if (circle.frameCounter >= 5) {
      circle.currentRadius++;
      circle.frameCounter = 0;
    }
  }

  if (!disableTurnOff || linesComplete) {
    circles = circles.filter(circle => circle.currentRadius * bulbDiameter <= smallScreenWidth + thickness * bulbDiameter);

    //new circle once distance of radius from center is > 10
    if (circles.length === 0 || circles[circles.length - 1].currentRadius >= 10) {
      circles.push(createNewCircle());
    }
  }

  //animation completes once final circle is off screen
  if (circles.length > 0 && circles[circles.length - 1].currentRadius >= cols) {
    finalCircleComplete = true;
  }
}

let diagonalLinesLeft = [];
let diagonalLinesRight = [];
let lineWidth = 3;
let lineStep = smallScreenWidth / 50;
let vocalsBelowThresholdFrames = 0; //check for how many frames vocals are off
let disableNewLines = false;

function createNewDiagonalLine(startX) {
  return {
    startX: startX,
    frameCounter: 0,
  };
}

function drawDiagonalLine(rows, cols, voice, screenX, screenSide) {
  let mappedColor = getMappedColor(voice); //color of line should be from mapped voice
  fill(mappedColor);

  bulbDiameter = smallScreenWidth / cols;
  let lineCenterY = cHeight / 2;

  //use the right array based on screen side
  let diagonalLines = screenSide === 'left' ? diagonalLinesLeft : diagonalLinesRight;

  for (let i = 0; i < diagonalLines.length; i++) {
    let line = diagonalLines[i];

    for (let row = 0; row < rows; row++) {
      for (let j = 0; j < lineWidth; j++) {
        let xPos;
        if (screenSide === 'left') {
          xPos = line.startX + j * lineStep - row * lineStep; //shift right for left side
        } else {
          xPos = line.startX - j * lineStep + row * lineStep; //shift left for right side
        }

        let yPos = lineCenterY - smallScreenHeight / 2 + row * (smallScreenHeight / rows) + (smallScreenHeight / rows) / 2;

        if (xPos >= screenX - smallScreenWidth / 2 && xPos <= screenX + smallScreenWidth / 2) {
          ellipse(xPos, yPos, bulbDiameter * 0.8);
        }
      }
    }

    //move line every 5 frames
    line.frameCounter++;
    if (line.frameCounter >= 5) {
      if (screenSide === 'left') {
        line.startX += lineStep;
      } else {
        line.startX -= lineStep;
      }
      line.frameCounter = 0; // <-- Missing brace fix
    } // <-- This closes the inner if correctly
  }

  //lines remove once off screen
  diagonalLines = diagonalLines.filter(line => {
    if (screenSide === 'left') {
      return line.startX <= screenX + smallScreenWidth;
    } else {
      return line.startX >= screenX - smallScreenWidth;
    }
  });

  //create new lines
  if (!disableNewLines) {
    let lastLineStartX = diagonalLines.length > 0 ? diagonalLines[diagonalLines.length - 1].startX : screenX;
    if (screenSide === 'left' && lastLineStartX >= 10 * lineStep) {
      diagonalLines.push(createNewDiagonalLine(screenX - smallScreenWidth / 2)); // Add new diagonal line for the left screen
    }
    if (screenSide === 'right' && lastLineStartX <= screenX + smallScreenWidth / 2 - 6 * lineStep) {
      diagonalLines.push(createNewDiagonalLine(screenX + smallScreenWidth / 2)); // Add new diagonal line for the right screen
    }
  }

  //save lines to correct array
  if (screenSide === 'left') {
    diagonalLinesLeft = diagonalLines;
  } else {
    diagonalLinesRight = diagonalLines;
  }
}

function handleVocalThreshold(vocal) {
  //count frames when vocal < 50
  if (vocal < 50) {
    vocalsBelowThresholdFrames++;
  } else {
    vocalsBelowThresholdFrames = 0;
  }

  if (vocalsBelowThresholdFrames >= 150) {
    disableNewLines = true;
  }
}

function startDiagonalLineAnimation(rows, cols, vocal, bass) {
  if (finalCircleComplete) {
    handleVocalThreshold(vocal);

    drawDiagonalLine(rows, cols, vocal, cWidth / 7, 'left');
    drawDiagonalLine(rows, cols, vocal, cWidth - cWidth / 7, 'right');

    //check for empty arrays to see if lines are fully complete
    if (diagonalLinesLeft.length === 0 && diagonalLinesRight.length === 0) {
      linesComplete = true; //flag for circles to play again
    }
  }
}

function drawCrossBeams(numZigZags, startX, startY, beamLength, segment1, segment2, isVertical = true) {
  strokeWeight(2);
  let segmentSize = beamLength / numZigZags; //segment size of one zigzag

  for (let i = 0; i < numZigZags; i++) {
    if (isVertical) {
      let y1 = startY + i * segmentSize;
      let y2 = y1 + segmentSize;

      //draw zigzag lines between the two vertical lines
      line(segment1, y1, segment2, y2);
      line(segment2, y2, segment1, y1 + segmentSize);
    } else {
      let x1 = startX + i * segmentSize;
      let x2 = x1 + segmentSize;

      //draw zigzag lines between the two horizontal lines
      line(x1, segment1, x2, segment2);
      line(x2, segment2, x1 + segmentSize, segment1);
    }
  }
}

function drawLightBox(numSpeakers, lightBoxStates){
  speakerWidth = (cWidth / 2) / numSpeakers;

  for (let i = 0; i < numSpeakers; i++) {
    fill(0);
    rect(speakerWidth + speakerWidth * i * 2, cHeight / 20, speakerWidth, cHeight / 10);

    //get the background colour
    bgColor = getBackgroundColorAtY(cHeight / 20);
    
    //blend to background colour
    circleColor = lerpColor(bgColor, color(64, 224, 208), lightBoxStates[i].glowIntensity / 255);

    //draw the circles with the correct colour
    fill(circleColor);

    circle((speakerWidth + speakerWidth * i * 2) - speakerWidth / 4, cHeight / 20, speakerWidth / 3, cHeight / 10);
    circle((speakerWidth + speakerWidth * i * 2) + speakerWidth / 4, cHeight / 20, speakerWidth / 3, cHeight / 10);
  }
}

laserGlowIntensity = 0; //start with lazers off
function updateLaserGlowIntensity(lightNum) {
  if (lightNum> 70 && laserGlowIntensity === 0) {
    laserGlowIntensity = 255; //turn on lazers
  }
  
  //fade lazers out
  if (laserGlowIntensity > 0) {
    laserGlowIntensity -= 6.05;
    if(laserGlowIntensity < 0){laserGlowIntensity = 0;}
  }
}

laserRotationAngle = 10; //lazer rotating angle

function drawLasers() {
  push();
  strokeWeight(1); //laser thickness
  stroke(57, 255, 20, laserGlowIntensity); //green lazer that turns off and on based on drums
  
  //top left origin
  translate(0, 0);
  rotate(laserRotationAngle);
  
  line(0, 0, cWidth * 2, 0);
  line(0, 0, cWidth * 2, cWidth * 2);
  line(0, 0, 0, cWidth * 2);
  line(0, 0, cWidth, -cWidth * 2);
  line(0, 0, -cWidth * 2, 0);
  line(0, 0, -cWidth * 2, -cWidth * 2);
  line(0, 0, -cWidth * 2, -cWidth * 2);

  pop();
  
  push();
  strokeWeight(1); //laser thickness
  stroke(57, 255, 20, laserGlowIntensity); //green lazer that turns off and on based on drums
  
  //top right origin
  translate(cWidth, 0);
  rotate(-laserRotationAngle);
  
  line(0, 0, cWidth * 2, 0);
  line(0, 0, 0, cHeight * 2);
  line(0, 0, cWidth * 2, cHeight * 2);
  line(0, 0, -cWidth * 2, 0);
  line(0, 0, 0, -cHeight * 2);
  line(0, 0, -cWidth * 2, -cHeight * 2);
  
  pop();
  
  //lazer rotate speed
  laserRotationAngle += 0.5;
}

let swayAngle = 20;
let swaySpeed;
let swayAmplitude = 20;

function drawSwayingCrowdAndRect(other) {

  let swayOffsetX = sin(swayAngle) * swayAmplitude;


  let verticalAmplitude = map(other, 0, 100, 0, 30); //other is mapped for the verticle height of crowd
  let horizontalMovement = map(other, 0, 100, 0, 10);
  let swayOffsetY = -verticalAmplitude;
  swaySpeed = horizontalMovement;

  push();
  translate(swayOffsetX, swayOffsetY);
  image(crowdGraphics, -20, 0);
  pop();

  //this is a black rectangle under the crowd so there is no gap
  fill(0);
  push();
  translate(swayOffsetX, swayOffsetY);
  rect(cWidth / 1.5, cHeight - cHeight / 16, cWidth + cWidth / 2, cHeight / 8);
  pop();

  swayAngle += swaySpeed;
}

let currentGraphics = null;
let frameCounter = 0;

function updateAndDisplayLoudestImage(bass, voice, drum, other) {
  
  //change who is on screen every 150 frames
  if (frameCounter >= 150 || currentGraphics === null) {
    frameCounter = 0;

    //whoever is loudest should be displayed
    if (bass >= voice && bass >= drum && bass >= other) {
      currentGraphics = bassGraphics;
    } else if (voice >= bass && voice >= drum && voice >= other) {
      currentGraphics = voiceGraphics;
    } else if (drum >= bass && drum >= voice && drum >= other) {
      currentGraphics = drumGraphics;
    } else if (other >= bass && other >= voice && other >= drum) {
      currentGraphics = otherGraphics;
    }
  }

  if (currentGraphics) {
    image(currentGraphics, -130, -140);
  }

  frameCounter++;
}

let gradientShift = 0;
let frameCountColour = 0;

function drawOscillatingGradient() {
  frameCountColour++;
  push();
  let purple = color(148, 0, 211);
  let turquoise = color(64, 224, 209);

  //gradient shift based on frames
  gradientShift = (sin(frameCountColour * 2) + 1) / 2; //goes between 0 and 1

  for (let y = 0; y < bigScreenHeight; y++) {
    let inter = map(y, 0, bigScreenHeight, 0, 1);  //map between 0 and 1
    let colorAtY = lerpColor(turquoise, purple, abs(inter - gradientShift));
    stroke(colorAtY);
    line(cWidth / 2 - bigScreenWidth / 2, cHeight / 2 - bigScreenHeight / 2 + y, 
         cWidth / 2 + bigScreenWidth / 2, cHeight / 2 - bigScreenHeight / 2 + y);
  }
  pop();
}

function draw_one_frame(words, vocal, drum, bass, other, counter) {

  background(20);
  textFont('Verdana'); // please use CSS safe fonts
  rectMode(CENTER)
  textSize(24);

  drawGradientBackground();

  //fill(6,21,71);
  //rect(cWidth/2,cHeight/2,bigScreenWidth,bigScreenHeight); //big screen
  drawOscillatingGradient();
  fill(20);
  rect(cWidth/7,cHeight/2,smallScreenWidth,smallScreenHeight); //little screen left
  rect(cWidth - cWidth/7, cHeight/2,smallScreenWidth,smallScreenHeight); //little screen right

  updateAndDisplayLoudestImage(bass, vocal, drum, other);

  rectMode(CORNER);

  //draw the buffered image of the small screens with circles
  image(screenBuffer, cWidth / 7 - smallScreenWidth / 2, cHeight / 2 - smallScreenHeight / 2); //left screen
  image(screenBuffer, cWidth - cWidth / 7 - smallScreenWidth / 2, cHeight / 2 - smallScreenHeight / 2); //right screen

  //remove vocal noise
  if(vocal < 50){
    vocal = 0;
  }
  else {
    vocal = map(vocal, 50, 100, 0, 100); //remap vocal volume to 50,100 for smoother colour transition
  }

  turnOnBulbsInCirclePattern(25, 50, vocal, cWidth / 7, bass); //left screen
  turnOnBulbsInCirclePattern(25, 50, vocal, cWidth - cWidth / 7, bass); //right screen

  startDiagonalLineAnimation(25, 50, vocal, bass);

  rectMode(CENTER)
  //show words on small screens
  fill(20,180,240);
  textAlign(CENTER, CENTER);
  //text can't be shown due to song change not containing words
  //text(words, cWidth / 7, cHeight / 2); //display on left screen
  //text(words, cWidth - cWidth / 7, cHeight / 2); //display on right screen

  drawLasers();

  fill(0);
  rect(cWidth/2,cHeight - cHeight/16,cWidth,cHeight/8);

  stroke(0);
  strokeWeight(5);

  //cross beam lines
  lineX1 = cWidth / 2 - bigScreenWidth / 2;
  lineX2 = lineX1 - cWidth / 30;
  lineX3 = cWidth / 2 + bigScreenWidth / 2;
  lineX4 = lineX3 + cWidth / 30;
  lineY5 = 0;
  lineY6 = cHeight/30;

  line(lineX1, cHeight/25, lineX1, cHeight);
  line(lineX2, cHeight/25, lineX2, cHeight);
  line(lineX3, cHeight/25, lineX3, cHeight);
  line(lineX4, cHeight/25, lineX4, cHeight);
  line(0,lineY5 + 2.5,cWidth,lineY5 + 2.5);
  line(0,lineY6 + 2.5,cWidth,lineY6 + 2.5);

  drawCrossBeams(20, 0, cHeight / 25, cHeight, lineX1, lineX2, true); //zigzags for left beams
  drawCrossBeams(20, 0, cHeight / 25, cHeight, lineX3, lineX4, true); //zigzags for right beams
  drawCrossBeams(40, 0, lineY5 + 2.5, cWidth, lineY5 + 2.5, lineY6 + 2.5, false); //zigzags for top beams

  drawLightBox(lightBoxCount,lightBoxStates); //lightboxes

  tint(0);
  drawSwayingCrowdAndRect(other);
  image(bandGraphics,0,0); //band

  updateGradient(bass); //update gradient based on bass
  updateLaserGlowIntensity(drum); // update lasers based on drum

  /*
  quad(
   cWidth/8, cHeight/2 - smallScreenHeight/2, //top left
   cWidth/8 + smallScreenWidth, cHeight/2 - smallScreenHeight/2, //top right
   cWidth/8 + smallScreenWidth, cHeight/2 + smallScreenHeight/2, //bottom right
   cWidth/8, cHeight/2 + smallScreenHeight/2, //bottom left
  );

  quad(
    cWidth/4 * 2.5, cHeight/2 - smallScreenHeight/2, //top left
    cWidth/4 * 2.5+ smallScreenWidth, cHeight/2 - smallScreenHeight/2, //top right
    cWidth/4 * 2.5+ smallScreenWidth, cHeight/2 + smallScreenHeight/2, //bottom right
    cWidth/4 * 2.5, cHeight/2 + smallScreenHeight/2, //bottom left
   );

   */

  /*
  vocalX = map(vocal, 0, 100, 0, 540);
  vocalY = map(vocal, 0, 100, 0, 960);

  drumX = map(drum, 0 , 100, 0, 540);
  drumY = map(drum, 0 , 100, 0, 960);

  bassX = map(bass, 0 ,100, 0, 540);
  bassY = map(bass, 0, 100, 0, 960);

  otherX = map(other, 0, 100, 0, 540);
  otherY = map(other, 0, 100, 0, 960);

  if(vocal < 30){vocalX = 0;}
  if(drum < 30){drumX = 0;}
  if(bass < 30){bassX = 0;}
  if(other < 30){otherX = 0;}

  controlPoints1 = [
    { x: 0, y: 0 },
    { x: vocalX, y: 0 },
    { x: 540 - vocalX, y: 960 },
    { x: 540, y: 960 }
  ];
  controlPoints2 = [
    { x: 540, y: 0 },
    { x: 540 - drumX, y: 0 },
    { x: drumX, y: 960 },
    { x: 0, y: 960 }
  ];
  controlPoints3 = [
    { x: 0, y: 0 },
    { x: - bassX, y: 0 },
    { x: 540 + bassX, y: 960 },
    { x: 540, y: 960 }
  ];
  controlPoints4 = [
    { x: 540, y: 0 },
    { x: 540 + otherX, y: 0 },
    { x: - otherX, y: 960 },
    { x: 0, y: 960 }
  ];

  fill(110,30,100,250);
  bezier(controlPoints1[0].x,controlPoints1[0].y,controlPoints1[1].x,controlPoints1[1].y,
         controlPoints1[2].x,controlPoints1[2].y,controlPoints1[3].x,controlPoints1[3].y
  );

  fill(20,80,180);
  bezier(controlPoints2[0].x,controlPoints2[0].y,controlPoints2[1].x,controlPoints2[1].y,
    controlPoints2[2].x,controlPoints2[2].y,controlPoints2[3].x,controlPoints2[3].y
  );

  fill(80,180,60);
  bezier(controlPoints3[0].x,controlPoints3[0].y,controlPoints3[1].x,controlPoints3[1].y,
         controlPoints3[2].x,controlPoints3[2].y,controlPoints3[3].x,controlPoints3[3].y
  );

  fill(150,20,10);
  bezier(controlPoints4[0].x,controlPoints4[0].y,controlPoints4[1].x,controlPoints4[1].y,
    controlPoints4[2].x,controlPoints4[2].y,controlPoints4[3].x,controlPoints4[3].y
  );
  */


  /*

   let bar_spacing = height / 10;
   let bar_height = width / 12;
   let bar_pos_x = width / 2;
 

   // vocal bar is red
   fill(200, 0, 0);
   rect(bar_pos_x, height / 2 + 1 * bar_spacing, 4 * vocal, bar_height);
   fill(0);
   text("vocals", bar_pos_x, height / 2 + 1 * bar_spacing + 8);
 
   // drum bar is green
   fill(0, 200, 0);
   rect(bar_pos_x, height / 2 + 2 * bar_spacing, 4 * drum, bar_height);
   fill(0);
   text("drums", bar_pos_x, height / 2 + 2 * bar_spacing + 8);
 
   // bass bar is blue
   fill(50, 50, 240);
   rect(bar_pos_x, height / 2 + 3 * bar_spacing, 4 * bass, bar_height);
   fill(0);
   text("bass", bar_pos_x, height / 2 + 3 * bar_spacing + 8);
 
   // other bar is white
   fill(200, 200, 200);
   rect(bar_pos_x, height / 2 + 4 * bar_spacing, 4 * other, bar_height);
   fill(0);
   text("other", bar_pos_x, height / 2 + 4 * bar_spacing + 8);
   fill(255, 255, 0);
 
   // display "words"
   textAlign(CENTER);
   textSize(vocal);
   text(words, width/2, height/3);
   */
}