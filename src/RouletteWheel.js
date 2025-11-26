import React, { useState, useEffect, useRef } from 'react';
import './RouletteWheel.css';

// --- GRÁFICO NATIVO ---
const SimpleGraph = ({ data }) => {
  if (!data || data.length < 2) return null;

  const width = 300;
  const height = 180;
  const maxVal = Math.max(...data, 100) + 50; 
  const minVal = Math.min(...data, 0);

  const getPoints = () => {
    return data.map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal || 1)) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  const getAreaPoints = () => {
    const points = getPoints();
    return `0,${height} ${points} ${width},${height}`;
  };

  const lastBalance = data[data.length - 1];
  const prevBalance = data.length > 1 ? data[data.length - 2] : 100;
  const lineColor = lastBalance >= prevBalance ? "#2ed573" : "#ff4757";

  return (
    <div className="simple-graph-container">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <defs>
          <linearGradient id="neonGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.5"/>
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        <line x1="0" y1={height/4} x2={width} y2={height/4} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="0" y1={3*height/4} x2={width} y2={3*height/4} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="0" y1={height - ((100 - minVal) / (maxVal - minVal || 1)) * height} x2={width} y2={height - ((100 - minVal) / (maxVal - minVal || 1)) * height} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" strokeWidth="1" />
        <polyline fill="url(#neonGradient)" stroke="none" points={getAreaPoints()} />
        <polyline fill="none" stroke={lineColor} strokeWidth="3" points={getPoints()} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 4px ${lineColor})`}} />
        {data.length > 0 && (() => {
             const lastVal = data[data.length - 1];
             const x = width;
             const y = height - ((lastVal - minVal) / (maxVal - minVal || 1)) * height;
             return <circle cx={x} cy={y} r="4" fill="#fff" stroke={lineColor} strokeWidth="2" />
        })()}
      </svg>
      <div className="graph-footer" style={{color: '#fff'}}>
        Saldo Atual: <strong style={{color: lineColor}}>${lastBalance}</strong>
      </div>
    </div>
  );
};

// --- ROLETA ---
const RouletteWheel = () => {
  const ringRef = useRef(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0); 
  const [balance, setBalance] = useState(100); 
  const [betAmount, setBetAmount] = useState(10);
  const [betOption, setBetOption] = useState('color');
  const [betDetails, setBetDetails] = useState('red');
  const [balanceHistory, setBalanceHistory] = useState([100]);

  const wheelOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  const getWheelBackground = () => {
    const sliceAngle = 360 / 37;
    let gradientParts = [];
    wheelOrder.forEach((num, index) => {
      let color = '#0e1411';
      if (num === 0) color = '#62a00f';
      else if (redNumbers.includes(num)) color = '#c7322c';
      const startDeg = index * sliceAngle;
      const endDeg = (index + 1) * sliceAngle;
      gradientParts.push(`${color} ${startDeg}deg ${endDeg}deg`);
    });
    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.innerHTML = "";
    
    // AJUSTE VISUAL DOS LEDS
    const totalLeds = 24; 
    const center = 180; 
    // Alterado de 165 para 166 para compensar a borda de 2px e ficar perfeitamente no centro da faixa vermelha
    const radius = 166; 
    const ledSize = 12;

    for (let i = 0; i < totalLeds; i++) {
        const led = document.createElement("div");
        led.className = "led";
        led.style.animationDelay = `${i * 0.05}s`;
        const angle = (i / totalLeds) * (2 * Math.PI);
        const x = center + (Math.cos(angle) * radius) - (ledSize / 2);
        const y = center + (Math.sin(angle) * radius) - (ledSize / 2);
        led.style.left = `${x}px`; led.style.top = `${y}px`;
        ring.appendChild(led);
    }
  }, []);

  const handleSpin = () => {
    if (betAmount <= 0 || betAmount > balance) { alert("Saldo insuficiente!"); return; }
    setIsSpinning(true); setSelectedNumber(null);
    setBalance(prev => prev - betAmount);

    const winningNumber = Math.floor(Math.random() * 37);
    const sliceAngle = 360 / 37;
    const winningIndex = wheelOrder.indexOf(winningNumber);
    
    const currentAngleOfWinner = winningIndex * sliceAngle + sliceAngle / 2;
    let targetRotation = 360 - currentAngleOfWinner;

    const currentRotMod = rotation % 360;
    let distanceNeeded = targetRotation - currentRotMod;
    
    if (distanceNeeded < 0) {
        distanceNeeded += 360;
    }

    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.2); 
    const newRotation = rotation + (360 * 5) + distanceNeeded + randomOffset;
    
    setRotation(newRotation);

    setTimeout(() => {
      setSelectedNumber(winningNumber);
      calculateResult(winningNumber, betAmount);
      setIsSpinning(false);
    }, 3000); 
  };

  const calculateResult = (winningNumber, amountAposted) => {
    let winnings = 0; let won = false;
    if (betOption === 'number' && parseInt(betDetails) === winningNumber) { winnings = amountAposted * 36; won = true; }
    else if (betOption === 'color') {
      if (betDetails === 'red' && redNumbers.includes(winningNumber)) { winnings = amountAposted * 2; won = true; }
      else if (betDetails === 'black' && blackNumbers.includes(winningNumber)) { winnings = amountAposted * 2; won = true; }
    }
    else if (betOption === 'evenOdd' && winningNumber !== 0) {
      const isEven = winningNumber % 2 === 0;
      if ((betDetails === 'even' && isEven) || (betDetails === 'odd' && !isEven)) { winnings = amountAposted * 2; won = true; }
    }
    if (won) setBalance(prev => { const newBal = prev + winnings; updateHistory(newBal); return newBal; });
    else setBalance(prev => { updateHistory(prev); return prev; });
  };

  const updateHistory = (newBal) => setBalanceHistory(prev => [...prev, newBal]);

  const runSimulation = () => {
    if (isSpinning) return;
    let simBalance = balance; let simHistory = [...balanceHistory];
    for (let i = 0; i < 100; i++) {
      if (simBalance <= 0) break;
      simBalance -= betAmount;
      const winningNumber = Math.floor(Math.random() * 37);
      let winnings = 0;
      const chosenColor = betOption === 'color' ? betDetails : 'red'; 
      if (chosenColor === 'red' && redNumbers.includes(winningNumber)) winnings = betAmount * 2;
      else if (chosenColor === 'black' && blackNumbers.includes(winningNumber)) winnings = betAmount * 2;
      simBalance += winnings; simHistory.push(simBalance);
    }
    setBalance(simBalance); setBalanceHistory(simHistory);
  };

  return (
    <div className="roulette-container">
      <div className="panel betting-panel">
        <h2>Faça sua Aposta</h2>
        <div className="control-group">
            <label>Tipo de Aposta:</label>
            <select value={betOption} onChange={(e) => setBetOption(e.target.value)} disabled={isSpinning}>
                <option value="color">Cor (Vermelho/Preto)</option>
                <option value="evenOdd">Par/Ímpar</option>
                <option value="number">Número Único (0-36)</option>
            </select>
        </div>
        <div className="control-group">
            <label>Sua escolha:</label>
            {betOption === 'color' && (
                <select value={betDetails} onChange={(e) => setBetDetails(e.target.value)}>
                    <option value="red">Vermelho</option><option value="black">Preto</option>
                </select>
            )}
            {betOption === 'evenOdd' && (
                <select value={betDetails} onChange={(e) => setBetDetails(e.target.value)}>
                    <option value="even">Par</option><option value="odd">Ímpar</option>
                </select>
            )}
            {betOption === 'number' && (
               <input type="number" min="0" max="36" value={betDetails} onChange={(e) => setBetDetails(e.target.value)} />
            )}
        </div>
        <div className="control-group">
            <label>Valor da Aposta ($):</label>
            <input type="number" value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} />
        </div>
        <button className="spin-btn" onClick={handleSpin} disabled={isSpinning || balance <= 0}>
            {isSpinning ? 'GIRANDO...' : 'GIRAR'}
        </button>
        <div className="simulation-box">
            <button className="sim-btn" onClick={runSimulation} disabled={isSpinning || balance <= 0}>Simular 100 Rodadas</button>
        </div>
      </div>

      <div className="panel wheel-panel">
        <div className="wheel-wrapper">
            <div className="led-ring" ref={ringRef}></div>
            <div className="indicator"></div>
            <div 
                className="wheel" 
                style={{ 
                    transform: `rotate(${rotation}deg)`, 
                    transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                    background: getWheelBackground()
                }}
            >
                {wheelOrder.map((num, i) => {
                    const sliceAngle = 360 / 37;
                    const angle = i * sliceAngle + sliceAngle / 2;
                    return (
                        <div 
                            key={i} 
                            className="wheel-number"
                            style={{
                                transform: `rotate(${angle}deg) translate(0, -128px)` 
                            }}
                        >
                            <span style={{transform: 'rotate(180deg)'}}>{num}</span>
                        </div>
                    );
                })}

                {!isSpinning && selectedNumber === null && <div className="center-text" style={{transform: `rotate(${-rotation}deg)`}}></div>}
            </div>
        </div>
        <div className="result-display">
            Resultado: {selectedNumber !== null ? selectedNumber : '?'}
        </div>
      </div>

      <div className="panel_historico">
        <h3>Histórico do Saldo</h3>
        <SimpleGraph data={balanceHistory} />
      </div>
    </div>
  );
};

export default RouletteWheel;