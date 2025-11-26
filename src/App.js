import React from 'react';
import './App.css'; // Mantenha este import para estilos gerais (pode estar vazio ou não)
import RouletteWheel from './RouletteWheel';

function App() {
  return (
    <div className="App">
      <header className="header-text">
        <h1></h1>
      </header>
      
      <main>
        <RouletteWheel />
      </main>

      <footer className="footer">
        <p>Desenvolvido por: Luciana Rodrigues, Yasmin Friedemann e Tainá Friedemann</p>
        <p>Universidade Senac</p>
      </footer>
    </div>
  );
}

export default App;