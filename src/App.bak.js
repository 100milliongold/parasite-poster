import React, { Component, createRef } from 'react'
import ml5 from "ml5"
import "./App.css";

class App extends Component {

  constructor(props){
    super(props);
    this.vidioRef = createRef();
    this.canvasRef = createRef();

    this.yolo = null;
    this.status = null;
    this.objects = [];
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.width = 360;
    this.height = 280;
  }
  

  

  // Helper Functions
  getVideo = async (width, height) => {
    // Grab elements, create settings, etc.
    const videoElement = this.vidioRef.current;

    videoElement.setAttribute("style", "display: none;");
    videoElement.width = width;
    videoElement.height = height;

    // Create a webcam capture
    const capture = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = capture;
    videoElement.play();

    return videoElement;
  };

  createCanvas = (w, h) => {
    const canvas = this.canvasRef.current;
    canvas.width = w;
    canvas.height = h;
    return canvas;
  };

  make = async () => {
    this.video = await this.getVideo();
    this.canvas = this.createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d");
    this.yolo = await ml5.YOLO(this.video, this.startDetecting);
  };

  startDetecting = () => {
    console.log("model ready");
    this.detect();
  };

  detect = () => {
    this.yolo.detect((err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      this.objects = results;

      if (this.objects) {
        this.draw();
      }

      this.detect();
    });
  };

  draw = () => {
    // Clear part of the canvas
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.drawImage(this.video, 0, 0);
    for (let i = 0; i < this.objects.length; i++) {
      // console.log(this.objects);
      
      this.ctx.font = "16px Arial";
      this.ctx.fillStyle = "green";
      this.ctx.fillText(
        this.objects[i].label,
        this.objects[i].x * this.width + 4,
        this.objects[i].y * this.height + 16
      );

      this.ctx.beginPath();
      this.ctx.rect(
        this.objects[i].x * this.width,
        this.objects[i].y * this.height,
        this.objects[i].w * this.width,
        this.objects[i].h * this.height
      );
      this.ctx.strokeStyle = "green";
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  componentDidMount() {
    this.make();
  }

  render() {
    return (
      <div className="App">
        <div class="booth">
          <video
            id="video"
            width="800"
            height="600"
            ref={this.vidioRef}
          ></video>
          <canvas
            id="canvas"
            width="800"
            height="600"
            ref={this.canvasRef}
          ></canvas>
        </div>
      </div>
    );
  }
}


export default App;
