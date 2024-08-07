let fixationTime;
let cueTime = 200;
let postCueTime = 400;
let stimulusTime = 700;
let iti = 1600;
let trials = 80;

let trialData = [];
let currentTrial = 0;
let state = 'fixation'; // 'fixation', 'cue', 'postCue', 'stimulus', 'iti'

let fixationStartTime;
let cueStartTime;
let postCueStartTime;
let stimulusStartTime;

let stimulusPos;
let congruent;
let reactionTime;
let response;
let correctResponse;

let arrows;
let congruentArrows = ['<<<<<', '>>>>>'];
let incongruentArrows = ['<<><<', '<><><', '>><>>', '><><>'];

let showStartPage = true;
let startButton;

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  textSize(32);

  startButton = createButton('Start');
  startButton.position(width / 2 - 20, height / 2 + 150);
  startButton.mousePressed(startExperiment);
}

function draw() {
  background(200);

  if (showStartPage) {
    drawStartPage();
  } else {
    if (state === 'fixation') {
      drawFixation();
      if (millis() - fixationStartTime > fixationTime) {
        state = 'cue';
        cueStartTime = millis();
      }
    } else if (state === 'cue') {
      drawCue();
      if (millis() - cueStartTime > cueTime) {
        state = 'postCue';
        postCueStartTime = millis();
      }
    } else if (state === 'postCue') {
      drawFixation();
      if (millis() - postCueStartTime > postCueTime) {
        state = 'stimulus';
        stimulusStartTime = millis();
      }
    } else if (state === 'stimulus') {
      drawStimulus();
      if (millis() - stimulusStartTime > stimulusTime || response) {
        if (response) {
          reactionTime = millis() - stimulusStartTime;
          recordTrial();
        }
        state = 'iti';
        setTimeout(resetTrial, iti);
      }
    }
  }
}

function drawStartPage() {
  fill(0);
  textSize(18);
  text('This is an attention performance test. \n\nThere will be a row of black arrows e.g. '<<<<<', and distracting cues appear on the screen. \n\nThe arrows will only point left or right. \n\nYour task is to press left or right on the keyboard to point the direction of the center arrow.\n\nYou'll not receive feedback when pressing. \n\n A total of 80 trials will be performed. \n\nPlease save the data file when finishing.', width / 2, height / 2 - 25);
}

function startExperiment() {
  showStartPage = false;
  startButton.hide();
  resetTrial();
}

function drawFixation() {
  fill(0);
  text('+', width / 2, height / 2);
}

function drawCue() {
  drawFixation();
  fill(0);
  if (cueType === 'none') {
    // No cue
  } else if (cueType === 'center') {
    text('*', width / 2, height / 2);
  } else if (cueType === 'spatial') {
    if (stimulusPos === 'up') {
      text('*', width / 2, height / 2 - 50);
    } else {
      text('*', width / 2, height / 2 + 50);
    }
  }
}

function drawStimulus() {
  drawFixation();
  fill(0);
  if (stimulusPos === 'up') {
    text(arrows, width / 2, height / 2 - 50);
  } else {
    text(arrows, width / 2, height / 2 + 50);
  }
}

function resetTrial() {
  if (currentTrial >= trials) {
    displayResults();
    saveData();
    noLoop();
    return;
  }
  currentTrial++;
  console.log(`Current Trial: ${currentTrial}`);
  fixationTime = random(400, 1600);
  cueType = random(['none', 'center', 'spatial']);
  stimulusPos = random(['up', 'down']);
  congruent = random([true, false]);

  // choose the arrow sequence
  if (congruent) {
    arrows = random(congruentArrows);
  } else {
    arrows = random(incongruentArrows);
  }
  correctResponse = arrows[2] === '<' ? LEFT_ARROW : RIGHT_ARROW;

  response = null;
  reactionTime = null;

  fixationStartTime = millis();
  state = 'fixation';
}

function keyPressed() {
  if (state === 'stimulus' && !response) {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      response = keyCode;
    }
  }
}

function recordTrial() {
  let correct = response === correctResponse;
  trialData.push({
    trial: currentTrial,
    cueType: cueType,
    stimulusPos: stimulusPos,
    congruent: congruent,
    response: response,
    correct: correct,
    reactionTime: reactionTime,
  });
}

function displayResults() {
  let totalCorrect = 0;
  let totalReactionTime = 0;
  let countCorrect = 0;

  trialData.forEach(trial => {
    if (trial.correct) {
      totalCorrect++;
      totalReactionTime += trial.reactionTime;
      countCorrect++;
    }
  });
  let accuracy = (totalCorrect / trials) * 100;
  let avgReactionTime = totalReactionTime / countCorrect;

  fill(0);
  textSize(24);
  text(`Experiment Completed`, width / 2, height / 2 - 20);
}

function saveData() {
  let totalCorrect = 0;
  let totalReactionTime = 0;
  let countCorrect = 0;

  trialData.forEach(trial => {
    if (trial.correct) {
      totalCorrect++;
      totalReactionTime += trial.reactionTime;
      countCorrect++;
    }
  });
  let accuracy = (totalCorrect / trials) * 100;
  let avgReactionTime = totalReactionTime / countCorrect;

  let csv = 'trial,cueType,stimulusPos,congruent,response,correct,reactionTime\n';
  trialData.forEach(trial => {
    csv += `${trial.trial},${trial.cueType},${trial.stimulusPos},${trial.congruent},${trial.response},${trial.correct},${trial.reactionTime}\n`;
  });
  csv += `\nAverage Reaction Time,Accuracy\n`;
  csv += `${avgReactionTime.toFixed(2)},${accuracy.toFixed(2)}\n`;

  let blob = new Blob([csv], { type: 'text/csv' });
  let url = URL.createObjectURL(blob);
  
  let a = document.createElement('a');
  a.href = url;
  a.download = 'trial_data.csv';
  a.click();
  URL.revokeObjectURL(url);
}
