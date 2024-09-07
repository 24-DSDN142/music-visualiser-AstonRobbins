
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

function updateGradientBrightness(bass) {
  //gradient showing is based off of bass
  if (bass > 70 && gradientGlowIntensity === 0) {
    gradientGlowIntensity = 255;  //Turn on
  }

  if (gradientGlowIntensity > 0) {
    gradientGlowIntensity -= 5;  //Fade to black
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

function drawLightBox(numSpeakers, bass, lightBoxStates){

  speakerWidth = (cWidth / 2) / numSpeakers;

  for (let i = 0; i < numSpeakers; i++) {
    fill(0);
    rect(speakerWidth + speakerWidth * i * 2, cHeight / 20, speakerWidth, cHeight / 10);

    if (bass > 70 && lightBoxStates[i].frameCountdown === 0 && lightBoxStates[i].glowIntensity === 10) {
      lightBoxStates[i].glowIntensity = 255;
      lightBoxStates[i].frameCountdown = 10;
    }

    if (lightBoxStates[i].frameCountdown > 0) {
      lightBoxStates[i].frameCountdown--;
    } else {
      if (lightBoxStates[i].glowIntensity > 10) {
        lightBoxStates[i].glowIntensity -= 5;
      }
    }

    fill(64, 224, 208, lightBoxStates[i].glowIntensity);

    circle((speakerWidth + speakerWidth * i * 2) - speakerWidth / 4, cHeight / 20, speakerWidth / 3, cHeight / 10);
    circle((speakerWidth + speakerWidth * i * 2) + speakerWidth / 4, cHeight / 20, speakerWidth / 3, cHeight / 10);
  }
}

// vocal, drum, bass, and other are volumes ranging from 0 to 100
function draw_one_frame(words, vocal, drum, bass, other, counter) {

  background(5);
  textFont('Verdana'); // please use CSS safe fonts
  rectMode(CENTER)
  textSize(24);

  drawGradientBackground();

  fill(0);
  rect(cWidth/2,cHeight - cHeight/16,cWidth,cHeight/8);

  fill(0,0,255);
  rect(cWidth/2,cHeight/2,bigScreenWidth,bigScreenHeight); //big screen
  rect(cWidth/7,cHeight/2,smallScreenWidth,smallScreenHeight); //little screen left
  rect(cWidth - cWidth/7, cHeight/2,smallScreenWidth,smallScreenHeight); //little screen right

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

  drawLightBox(lightBoxCount,bass,lightBoxStates); //lightboxes

  tint(0);
  image(crowd,0,cHeight/3,cWidth,cHeight); //crowd

  updateGradientBrightness(bass); //update gradient based on bass

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