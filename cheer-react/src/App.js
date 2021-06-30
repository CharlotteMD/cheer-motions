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
import './App.css';

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { SGDOptimizer } from '@tensorflow/tfjs';

function App() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  let model;

  // Load TF Pose
  const runTfPose = async (model) => {
    const net = await posenet.load({
      inputResolution:{width: 640, height: 500},
      scale: 0.5,
    });
    setInterval(() => {
      detect(net, model);
    }, 100)
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


    // for (let i = 0; i < maxPredictions; i++) {
    //   const probability = prediction[i].probability.toFixed(2);
    //   const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    //   labelContainer.childNodes[i].innerHTML = classPrediction;
        
    //   if (probability > 0.8) {
    //     const newMove = prediction[i].className;
    //     if (sequence[sequence.length - 1] !== newMove) {
    //       sequence.push(newMove)
    //     }
    //     console.log('Your sequence is: ', sequence)
    //   } 
    // }
}

async function getMyModel() {

  model = await tmPose.load("./model/model.json", "./model/metadata.json");
  
  console.log('mod yes', model);
  // setMyModel(model);

  const maxPredictions = model.getTotalClasses();
  console.log('max yes', maxPredictions);
  runTfPose(model);
}

  getMyModel();
  

  

  return (
    <div className="App">
      <main>
        <h1>Cheer Sequence Pose Machine</h1>
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
        </div>
      </main>
    </div>
  );
}

export default App;
