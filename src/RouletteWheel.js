import React, { useState, useEffect, useRef } from 'react';
import './RouletteWheel.css';

// --- GRÁFICO NATIVO ---
const SimpleGraph = ({ data }) => {
  if (!data || data.length < 2) return null;

  const width = 300;
  const height = 150;
  const maxVal = Math.max(...data, 1000); 
  const minVal = Math.min(...data, 0);

  const getPoints = () => {
    return data.map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal || 1)) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  const lastBalance = data[data.length - 1];
  const lineColor = lastBalance < 1000 ? "#d90429" : "#2ecc71"; 

  return (
    <div className="simple-graph-container">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <line 
          x1="0" 
          y1={height - ((1000 - minVal) / (maxVal - minVal || 1)) * height} 
          x2={width} 
          y2={height - ((1000 - minVal) / (maxVal - minVal || 1)) * height} 
          stroke="#ccc" 
          strokeDasharray="4 4" 
          strokeWidth="1" 
        />
        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          points={getPoints()}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.length > 0 && (() => {
             const lastVal = data[data.length - 1];
             const x = width;
             const y = height - ((lastVal - minVal) / (maxVal - minVal || 1)) * height;
             return <circle cx={x} cy={y} r="4" fill={lineColor} stroke="#fff" strokeWidth="2" />
        })()}
      </svg>
      <div style={{textAlign: 'center', marginTop: '5px', fontSize: '12px', fontWeight: 'bold', color: '#d90429'}}>
        Saldo: ${lastBalance}
      </div>
    </div>
  );
};

// --- ROLETA ---
const RouletteWheel = () => {
  const ringRef = useRef(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [betOption, setBetOption] = useState('color');
  const [betDetails, setBetDetails] = useState('red');
  const [balanceHistory, setBalanceHistory] = useState([1000]); 

  // --- EFEITO PARA CRIAR OS LEDS ---
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    // Limpa LEDs antigos para não duplicar
    ring.innerHTML = ""; 

    // CONFIGURAÇÃO GEOMÉTRICA (Sincronizada com o CSS)
    const containerSize = 360; // Deve ser igual ao width/height do .wheel-wrapper no CSS
    const center = containerSize / 2; // 180
    const radius = 165; // Raio do círculo de luzes (ajuste fino para cair na borda)
    const totalLeds = 24; // Quantidade de luzes
    const ledSize = 12; // Tamanho da bolinha em px

    for (let i = 0; i < totalLeds; i++) {
        const led = document.createElement("div");
        led.className = "led";
        
        // Define atraso na animação para criar efeito de "corrida"
        led.style.animationDelay = `${i * 0.05}s`;

        const angle = (i / totalLeds) * (2 * Math.PI); // Ângulo em radianos
        
        // Fórmula Polar para Cartesiana
        const x = center + (Math.cos(angle) * radius) - (ledSize / 2);
        const y = center + (Math.sin(angle) * radius) - (ledSize / 2);

        led.style.left = `${x}px`;
        led.style.top = `${y}px`;

        ring.appendChild(led);
    }
  }, []);


  // Lógica do jogo
  const numbersConfig = Array.from({length: 37}, (_, i) => ({ number: i }));
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  const handleSpin = () => {
    if (betAmount <= 0 || betAmount > balance) {
      alert("Aposta inválida!");
      return;
    }
    setIsSpinning(true);
    setSelectedNumber(null);
    setBalance(prev => prev - betAmount);

    const randomIndex = Math.floor(Math.random() * 37);
    
    setTimeout(() => {
      setSelectedNumber(randomIndex);
      calculateResult(randomIndex, betAmount);
      setIsSpinning(false);
    }, 3000); 
  };

  const calculateResult = (winningNumber, amountAposted) => {
    let winnings = 0;
    let won = false;

    if (betOption === 'number' && parseInt(betDetails) === winningNumber) {
      winnings = amountAposted * 36;
      won = true;
    } else if (betOption === 'color') {
      if (betDetails === 'red' && redNumbers.includes(winningNumber)) {
        winnings = amountAposted * 2;
        won = true;
      } else if (betDetails === 'black' && blackNumbers.includes(winningNumber)) {
        winnings = amountAposted * 2;
        won = true;
      }
    } else if (betOption === 'evenOdd' && winningNumber !== 0) {
      const isEven = winningNumber % 2 === 0;
      if ((betDetails === 'even' && isEven) || (betDetails === 'odd' && !isEven)) {
        winnings = amountAposted * 2;
        won = true;
      }
    }

    if (won) {
      setBalance(prev => {
        const newBal = prev + winnings;
        updateHistory(newBal);
        return newBal;
      });
    } else {
      setBalance(prev => {
        updateHistory(prev);
        return prev;
      });
    }
  };

  const updateHistory = (newBalance) => {
    setBalanceHistory(prev => [...prev, newBalance]);
  };

  const runSimulation = () => {
    if (isSpinning) return;
    let simBalance = balance;
    let simHistory = [...balanceHistory];

    for (let i = 0; i < 100; i++) {
      if (simBalance <= 0) break;
      simBalance -= betAmount;
      const winningNumber = Math.floor(Math.random() * 37);
      let winnings = 0;

      const chosenColor = betOption === 'color' ? betDetails : 'red'; 
      if (chosenColor === 'red' && redNumbers.includes(winningNumber)) winnings = betAmount * 2;
      else if (chosenColor === 'black' && blackNumbers.includes(winningNumber)) winnings = betAmount * 2;

      simBalance += winnings;
      simHistory.push(simBalance);
    }
    setBalance(simBalance);
    setBalanceHistory(simHistory);
  };

  return (
    <div className="roulette-container">
      
      {/* PAINEL DE APOSTAS */}
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
                    <option value="red">Vermelho</option>
                    <option value="black">Preto</option>
                </select>
            )}
            {betOption === 'evenOdd' && (
                <select value={betDetails} onChange={(e) => setBetDetails(e.target.value)}>
                    <option value="even">Par</option>
                    <option value="odd">Ímpar</option>
                </select>
            )}
            {betOption === 'number' && (
                <input 
                    type="number" min="0" max="36" 
                    value={betDetails} onChange={(e) => setBetDetails(e.target.value)} 
                />
            )}
        </div>

        <div className="control-group">
            <label>Valor da Aposta ($):</label>
            <input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)} 
            />
        </div>

        <button className="spin-btn" onClick={handleSpin} disabled={isSpinning || balance <= 0}>
            {isSpinning ? 'GIRAR' : 'GIRAR'}
        </button>

        <div className="simulation-box">
            <button className="sim-btn" onClick={runSimulation} disabled={isSpinning || balance <= 0}>
                Simular 100 Rodadas (Teste Ruína)
            </button>
        </div>
      </div>

      {/* ROLETA ESTILO RODA DA FORTUNA */}
      <div className="panel wheel-panel">
        {/* Wrapper principal que segura os LEDs e a Roda */}
        <div className="wheel-wrapper">
            
            {/* CONTAINER DOS LEDS (Preenchido pelo JS) */}
            <div className="led-ring" ref={ringRef}></div>

            {/* SETA INDICADORA */}
            <div className="indicator"></div>

            {/* A RODA GIRATÓRIA */}
            <div className={`wheel ${isSpinning ? 'spinning' : ''}`}>
                {/* Texto no centro */}
                {!isSpinning && selectedNumber === null && <span style={{zIndex: 20}}>GIRE!</span>}
                {isSpinning && <span style={{zIndex: 20}}>{betAmount}</span>}
            </div>
        </div>
        <div className="result-display">
            Resultado: {selectedNumber !== null ? selectedNumber : '?'}
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="panel chart-panel">
        <h3>Histórico do Saldo</h3>
        <SimpleGraph data={balanceHistory} />
      </div>

    </div>
  );
};

export default RouletteWheel;