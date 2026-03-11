# AI Document Assistant

Aplicacao web full stack para upload de PDF e perguntas respondidas por IA com base no conteudo do documento.

## Stack

- Backend: Python + FastAPI
- Frontend: React + TypeScript
- IA: OpenAI API
- Processamento de PDF: pdfplumber

## Executar localmente

### Backend

1. Crie e ative um ambiente virtual.

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

2. Instale as dependencias.

```bash
pip install -r requirements.txt
```

3. Crie o arquivo `.env` dentro de `backend`.

```env
OPENAI_API_KEY=sua_chave_aqui
```

4. Inicie o servidor.

```bash
uvicorn app.main:app --reload
```

### Frontend

1. Instale as dependencias.

```bash
cd frontend
npm install
```

2. Inicie a aplicacao.

```bash
npm start
```

## Publicar online

### Backend no Render

1. Suba o projeto para o GitHub.
2. No Render, clique em New + Web Service.
3. Conecte seu repositorio.
4. Configure:
   - Root Directory: backend
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
5. Em Environment Variables, adicione:
   - OPENAI_API_KEY = sua chave
   - FRONTEND_URLS = URL do frontend publicado no Vercel

### Frontend no Vercel

1. No Vercel, clique em Add New + Project.
2. Importe o mesmo repositorio.
3. Configure:
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: build
4. Em Environment Variables, adicione:
   - REACT_APP_API_URL = URL do backend publicado no Render
5. Publique o projeto.

## Como usar

1. Abra a interface web.
2. Envie um PDF.
3. Faça uma pergunta sobre o conteudo.
4. Leia a resposta gerada pela IA.
