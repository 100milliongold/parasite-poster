import React, { Component, createRef } from "react";
import ml5 from "ml5/dist/ml5.min.js";
import * as L from "fxjs2/Lazy/index.js";
import * as _ from "fxjs2/Strict/index.js";
import Webcam from "react-webcam";
import Logo from "./img/parasite.logo.png";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.vidioRef = createRef();
    this.canvasRef = createRef();
    this.webcamRef = createRef();

    this.faceapi = null;
    this.video = null;
    this.detections = null;
    this.width = 600;
    this.height = 800;
    this.canvas = null;
    this.ctx = null;
  }

  state = {
    loading: true
  };

  // relative path to your models from window.location.pathname
  detection_options = {
    withLandmarks: true,
    withDescriptors: false
    // Mobilenetv1Model: "models",
    // FaceLandmarkModel: "models",
    // FaceRecognitionModel: "models"
  };

  videoConstraints = {
    facingMode: "user"
  };

  make = async () => {
    // get the video
    // get the video
    this.video = await this.getVideo();
    this.image = await this.getImage();

    this.canvas = this.createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d");

    this.faceapi = ml5.faceApi(
      this.video,
      this.detection_options,
      this.modelReady
    );
  };

  modelReady = () => {
    console.log("ready!");
    this.setState({ loading: false });
    this.faceapi.detect(this.gotResults);
  };

  gotResults = (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    // console.log(result)
    this.detections = result;

    // Clear part of the canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
    
    this.ctx.drawImage(this.image, 0, this.height - 216, 583, 216);

    if (this.detections) {
      if (this.detections.length > 0) {
        this.drawEyeBox(this.detections);
        // this.drawLogo();
      }
    }
    this.faceapi.detect(this.gotResults);
  };


  drawEyeBox = (detections) => {
    const X_WEIGHT = 0.3,
      Y_WEIGHT = 3;
    const { x, y, boxWidth, boxHeight } = _.go(
      detections,
      L.map(({ parts: { leftEye, rightEye } }) => [leftEye, rightEye]),
      L.deepFlat,
      _.takeAll,
      (list) => {
        const maxXpoint = _.maxBy(({ _x }) => _x, list)._x;
        let x = _.minBy(({ _x }) => _x, list)._x;
        x = x - x * X_WEIGHT;
        const maxYpoint = _.maxBy(({ _y }) => _y, list)._y;
        const y = _.minBy(({ _y }) => _y, list)._y - Y_WEIGHT;
        let boxWidth = maxXpoint - x;
        boxWidth = boxWidth + boxWidth * X_WEIGHT;
        const boxHeight = maxYpoint - y + Y_WEIGHT;
        return { x, y, boxWidth, boxHeight };
      },
    );
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgb(0,0,0)";
    this.ctx.fillRect(x, y, boxWidth, boxHeight);
    this.ctx.stroke();
    this.ctx.closePath();
  };

  // Helper Functions
  getVideo = async () => {
    // Grab elements, create settings, etc.
    const videoElement = this.vidioRef.current.video;
    videoElement.setAttribute("style", "display: none;");
    videoElement.width = this.width;
    videoElement.height = this.height;
    return videoElement;
  };

  getImage = () => new Promise((resolve , reject) => {
    const temp_image = new Image();
    temp_image.src = Logo;
    temp_image.onload = () => {
      resolve(temp_image);
    };
  })

  createCanvas = (w, h) => {
    const canvas = this.canvasRef.current;
    return canvas;
  };

  componentDidMount() {
    this.make();
  }

  render() {
    return (
      <div className="App">
        {/* <video id="video" ref={this.vidioRef}></video> */}
        {this.state.loading ? <p>Loading ......</p> : null}
        <Webcam
          audio={false}
          height={this.height}
          ref={this.vidioRef}
          screenshotFormat="image/jpeg"
          width={this.width}
          videoConstraints={this.videoConstraints}
          style={{ display: "none" }}
        />
        <canvas
          id="canvas"
          ref={this.canvasRef}
          width={this.width}
          height={this.height}
        ></canvas>
      </div>
    );
  }
}

export default App;
