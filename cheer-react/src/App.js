import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import * as tmPose from '@teachablemachine/pose';
import Webcam from 'react-webcam';

// import ml5 from "ml5";
import useInterval from '@use-it/interval';
import Loader from 'react-loader-spinner';

import { drawKeypoints, drawSkeleton } from './utilities.js';

import Pose from './Pose.js';
import Chart from './Chart';
import './style/Desktop.css';
import './style/Tablet.css';
import './style/Mobile.css';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { SGDOptimizer } from '@tensorflow/tfjs';

import MotionClap from './assets/motions/clap.png';
import MotionHips from './assets/motions/hips.png';
import MotionL from './assets/motions/l.png';
import MotionLowV from './assets/motions/low-v.png';
import MotionPunch from './assets/motions/punch.png';
import MotionT from './assets/motions/t.png';
import MotionV from './assets/motions/v.png';

function App() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [start, setStart] = useState(false);
  const [bestPrediction, setBestPrediction] = useState();
  const [routine, setRoutine] = useState([]);
  
  // Set this to false when pushing to prod - turned down the interval so I dont overheat computer
  const development = true;
  const seconds = development ? 500 : 100;


  let model, maxPredictions, highestProbability;

  let sequence = [];

  const toggle = () => {
    setStart(!start);
  }

  // Load TF Pose
  const runTfPose = async (model) => {
    const net = await posenet.load({
      inputResolution:{width: 640, height: 500},
      scale: 0.5,
    });
    setInterval(() => {
      detect(net, model);
      // change this back to 100 ms when not in development
    }, seconds)
  }

  // Detects movement on the webcam
  const detect = async(net, model) => {
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null && webcamRef.current.video.readyState === 4 ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const pose = await net.estimateSinglePose(video);
      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
      predict(video, model);
    }
  }

  // draw the poses on the canvas
  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext('2d');
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose['keypoints'], 0.5, ctx);
    drawSkeleton(pose['keypoints'], 0.5, ctx);
  }

  
  async function predict(video, model) {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(video);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    highestProbability = prediction.sort((a, b) => b.probability - a.probability)[0];

    if (sequence.length === 0 | sequence[sequence.length - 1] !== highestProbability.className) {
      sequence.push(highestProbability.className);
    }

    console.log(sequence);

    setRoutine(sequence);
}

async function getMyModel() {
  model = await tmPose.load("./model/model.json", "./model/metadata.json");
  const maxPredictions = model.getTotalClasses();
  runTfPose(model);
}

async function startAgain() {
  await setRoutine([]);
  sequence = [];
  getMyModel();
}

useEffect(() => {
  if (start) {
  startAgain();
  };
}, [start])

// this isnt working :-/

// useEffect(() => {
//   if (highestProbability) {
//     console.log('here', highestProbability)
//     console.log('here2', highestProbability.className)
//     setBestPrediction(highestProbability.className)
//   } else {
//     console.log('there', highestProbability)
//     console.log('there2', highestProbability)
//   }

// }, [highestProbability])

// useEffect(() => {
//   console.log('bp', bestPrediction)
// }, [bestPrediction])

useEffect(() => {
  console.log('rout', routine)
}, [routine])

  return (
    <div className="App">
      <main>
        <h1>Cheer Routine Machine</h1>
        <button onClick={() => toggle()}>
          {start ? "Stop" : "Start"}
        </button>
        {!start && routine.length === 0 && (
          <div className='instructionsContainer'>
            <h2>Welcome to Cheer Routine Machine!</h2>
            <p>Press start to record your cheer routine, then press stop to review your motions.</p>
            <br/>
            <p>Our app understands the following motions:</p>
            <br />
            <div className='motionsContainer'>
              <img src={MotionClap} className='motionsImage' alt="Clap"/>
              <img src={MotionHips} className='motionsImage' alt="Hips"/>
              <img src={MotionL} className='motionsImage' alt="L"/>
              <img src={MotionLowV} className='motionsImage' alt="Low V"/>
              <img src={MotionPunch} className='motionsImage' alt="Punch"/>
              <img src={MotionT} className='motionsImage' alt="T"/>
              <img src={MotionV} className='motionsImage' alt="V"/>
            </div>
            <br />
            <p>When you are ready, press start and perform your routine.</p>
            <p>Then press stop and review your routine.</p>

          </div>
        )}
        {!start && routine && routine.length > 1 && (
          <>
            <h2>My routine: </h2>
            <ul>{routine.map(step => {
              return (
                <li>{step}</li>
              )
            })}
            </ul>
          </>
        )}
        {!start && !routine && (
        <Loader
          type="Watch"
          color="#00BFFF"
          height={100}
          width={100}
          style={{display:'flex', justifyContent:'center', marginTop:'30px' }}
        />
        )}
        
        { start && ( 
          <div className="webcamContainer">
            <Webcam
              ref={webcamRef}
              audio={false}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480,
              }}
            />
          </div>)}
      </main>
      <footer>
        <p>Created by Charlotte 👩🏻‍💻</p>
    </footer>
    </div>
  );
}

export default App;
