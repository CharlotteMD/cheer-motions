import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <main>
        <h1>Cheer Sequence Pose Machine</h1>
        <div class='buttonContainer'>
            <button type="button" onclick="init()" id='startButton'>Start</button>
            <button type="button" onclick="pause()" id='stopButton'>Stop</button>
        </div>
        <div>
            <canvas id="canvas"></canvas>
        </div>
        <div id="label-container"></div>

    </main>
    </div>
  );
}

export default App;
