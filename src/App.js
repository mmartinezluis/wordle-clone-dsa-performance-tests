import { Profiler, useCallback, useRef, useState } from "react";
import "./App.css";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import StatefulBoard from "./components/StatefulBoard";
import StatelessBoard from "./components/StatelessBoard";
import TestsInterface from "./components/TestsInterface";
import { testSettings } from "./performanceTests/config";

export default function App() {
  const renderCount = useRef(0);
  const averageRenderTime = useRef(0);
  const location = useLocation();
  const [testsActive, setTestsActive] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(
    testSettings.grid.standard
  );
  const [testOption, setTestOption] = useState("standard");
  const [checked, setChecked] = useState(false);
  const [testResult, setTestResult] = useState("");

  const gridSize = currentSettings[0] * currentSettings[1];

  const renderCallback = (
    id,
    phase,
    actualTime,
    baseTime,
    startTime,
    commitTime
  ) => {
    console.log(`${id}'s ${phase} phase:`);
    console.log(`Actual time: ${actualTime}`);
    console.log(`Base time: ${baseTime}`);
    console.log(`Start time: ${startTime}`);
    console.log(`Coomit time: ${commitTime}`);

    // skip the render time for the component mount phase
    if (renderCount.current > 0)
      averageRenderTime.current = averageRenderTime.current + actualTime;
    if (
      (location.pathname === "/stateful" && renderCount.current === gridSize) ||
      renderCount.current - 1 === gridSize
    ) {
      setTestResult(
        `Average rerender time for ${gridSize} rerenders: ${(
          averageRenderTime.current / gridSize
        ).toFixed(6)}ms`
      );
      console.log(
        `Average rerender time for ${gridSize} rerenders: ${
          averageRenderTime.current / gridSize
        }ms`
      );
    }
    renderCount.current = renderCount.current + 1;
    console.log(averageRenderTime);
  };

  const resetTests = useCallback(() => {
    renderCount.current = 0;
    averageRenderTime.current = 0;
    setTestResult("");
    setTestsActive(() => true);
  }, []);

  const turnOffTests = () => {
    setTestsActive(() => false);
  };

  const handleCheckbox = (e) => {
    e.target.checked ? resetTests() : turnOffTests();
    setChecked(!checked);
  };

  const handleButtonChange = (e) => {
    setTestOption(e.target.value);
    setCurrentSettings(testSettings.grid[e.target.value]);
  };

  const testsPanel = (
    <div className="tests-panel">
      <div>
        <input
          type="radio"
          value="standard"
          id="standard"
          checked={testOption === "standard"}
          onChange={handleButtonChange}
        />
        <label htmlFor="standard">Standard grid (6X5) (30 rerenders)</label>
      </div>
      <div>
        <input
          type="radio"
          value="medium"
          id="medium"
          checked={testOption === "medium"}
          onChange={handleButtonChange}
        />
        <label htmlFor="medium">Medium grid (10X10) (100 rerenders)</label>
      </div>
      <div>
        <input
          type="radio"
          value="large"
          id="large"
          checked={testOption === "large"}
          onChange={handleButtonChange}
        />
        <label htmlFor="large">Large grid (20x10) (200 rerenders)</label>
      </div>
    </div>
  );

  const testsCheckbox = (
    <div className="switch-container">
      <input
        type="checkbox"
        id="switch"
        checked={checked}
        onChange={handleCheckbox}
      />
      <label htmlFor="switch">Activate Tests</label>
    </div>
  );

  return (
    <div className="App">
      <Navbar />
      <p>
        Mode:{" "}
        {testsActive
          ? `Test | Grid: ${testOption} (${currentSettings[0]}x${currentSettings[1]}) (${gridSize} rerenders)`
          : "Normal"}
      </p>
      {testResult.length ? (
        <div className="test-result">
          <p>Test Result:</p>
          <p>{testResult}</p>
        </div>
      ) : null}
      {testsActive ? (
        <Routes>
          <Route
            path="/stateful"
            element={
              <Profiler
                id="STATEFULL board component"
                onRender={renderCallback}
              >
                <StatefulBoard
                  rowSettings={currentSettings[0]}
                  colSettings={currentSettings[1]}
                  testsActive={testsActive}
                  testResult={testResult}
                  setTestResult={setTestResult}
                />
              </Profiler>
            }
          />
          <Route
            path="/stateless"
            element={
              <Profiler
                id="STATELESS board component"
                onRender={renderCallback}
              >
                <StatelessBoard
                  rowSettings={currentSettings[0]}
                  colSettings={currentSettings[1]}
                  testsActive={testsActive}
                  testResult={testResult}
                  setTestResult={setTestResult}
                />
              </Profiler>
            }
          />
          <Route
            path="/"
            element={
              <TestsInterface
                testsCheckbox={testsCheckbox}
                testsPanel={testsPanel}
                testsActive={testsActive}
                resetTests={resetTests}
              />
            }
          />
        </Routes>
      ) : (
        <Routes>
          <Route path="/stateful" element={<StatefulBoard />} />
          <Route path="/stateless" element={<StatelessBoard />} />
          <Route
            path="/"
            element={
              <TestsInterface
                testsCheckbox={testsCheckbox}
                testsPanel={testsPanel}
                testsActive={testsActive}
                resetTests={resetTests}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}

function Navbar() {
  return (
    <div className="nav">
      <NavLink
        to="/stateful"
        style={({ isActive }) => ({
          color: isActive ? "#fff" : "#545e6f",
          background: isActive ? "#7600dc" : "#f0f0f0",
        })}
      >
        Stateful Board
      </NavLink>
      <NavLink
        to="/stateless"
        style={({ isActive }) => ({
          color: isActive ? "#fff" : "#545e6f",
          background: isActive ? "#7600dc" : "#f0f0f0",
        })}
      >
        Stateless Board
      </NavLink>
      <NavLink
        to="/"
        style={({ isActive }) => ({
          color: isActive ? "#fff" : "#545e6f",
          background: isActive ? "#7600dc" : "#f0f0f0",
        })}
      >
        Tests Settings
      </NavLink>
    </div>
  );
}
