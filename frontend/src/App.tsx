import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploaded(false);
      setStatus('');
      setAnswer('');
    }
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('Enviando PDF...');
    const data = new FormData();
    data.append('file', file);
    try {
      await axios.post('http://127.0.0.1:8000/upload-pdf', data);
      setStatus('✅ PDF enviado com sucesso! Agora faça sua pergunta.');
      setUploaded(true);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Falha no upload';
      setStatus(`❌ Erro no upload: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setStatus('🤖 Consultando a IA...');
    setAnswer('');
    try {
      const resp = await axios.post('http://127.0.0.1:8000/query', { question });
      if (resp.data?.error) {
        setStatus(`❌ Erro: ${resp.data.error}`);
        return;
      }
      setStatus('');
      setAnswer(resp.data.answer || 'Sem resposta.');
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || 'Falha ao consultar';
      setStatus(`❌ Erro: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && uploaded) ask();
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <span className="icon">📄</span>
          <h1>AI Document Assistant</h1>
          <p className="subtitle">Envie um PDF e faça perguntas sobre o conteúdo</p>
        </div>

        <div className="section">
          <label className="section-label">1. Selecione um PDF</label>
          <div className="file-row">
            <label className="file-btn">
              📂 Escolher arquivo
              <input type="file" accept="application/pdf" onChange={handleFileChange} hidden />
            </label>
            <span className="file-name">{file ? file.name : 'Nenhum arquivo selecionado'}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={upload}
            disabled={!file || loading}
          >
            {loading && !uploaded ? '⏳ Enviando...' : '⬆️ Enviar PDF'}
          </button>
        </div>

        <div className={`section ${!uploaded ? 'disabled' : ''}`}>
          <label className="section-label">2. Faça uma pergunta</label>
          <div className="input-row">
            <input
              className="text-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Qual é o tema principal do documento?"
              disabled={!uploaded || loading}
            />
            <button
              className="btn btn-ask"
              onClick={ask}
              disabled={!question.trim() || !uploaded || loading}
            >
              {loading && uploaded ? '⏳' : '🔍 Perguntar'}
            </button>
          </div>
        </div>

        {status && (
          <div className="status-box">{status}</div>
        )}

        {answer && (
          <div className="answer-box">
            <strong>💡 Resposta:</strong>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;