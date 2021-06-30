import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
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

  // Load TF Pose
  const runTfPose = async () => {
    const net = await posenet.load({
      inputResolution:{width: 640, height: 500},
      scale: 0.5,
    });
    setInterval(() => {
      detect(net)
    }, 1000)
  }


  const detect = async(net) => {
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null && webcamRef.current.video.readyState === 4 ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const pose = await net.estimateSinglePose(video);
      console.log(pose);
    }
  }

  runTfPose();

  return (
    <div className="App">
      <main>
        <h1>Cheer Sequence Pose Machine</h1>
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
      </main>
    </div>
  );
}

export default App;
