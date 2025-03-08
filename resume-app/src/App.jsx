import React from "react";
import { Route, Routes } from 'react-router-dom';
import Home from './home';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import AIResume from './AIResume';
import ErrorPage from './errorpage';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<ResumeForm />} />
          <Route path="/preview" element={<ResumePreview />} />
          <Route path="/ai-optimize" element={<AIResume />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;