import React from 'react';
import PdfReader from './components/PdfReader';


const App: React.FC = () => {
  return (
    <div>
      <h1>Upload and View PDF</h1>
      <PdfReader />
    </div>
  );
};

export default App;