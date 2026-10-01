import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with required telemetry User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Server-side Socratic Gemini Tutor API Route
app.post('/api/tutor/socratic', async (req, res) => {
  try {
    const {
      question,
      mission,
      persona = 'lumi',
      studentName = 'Pequeño Explorador',
      studentAge = 7,
      mode = 'hint',
      wrongAnswerGiven,
    } = req.body;

    // If Gemini API is available and configured
    if (ai) {
      const personaPrompt =
        persona === 'rex'
          ? 'Eres Rex, un dinosaurio bebé tierno, curioso y el mejor amigo leal del niño.'
          : persona === 'astra'
          ? 'Eres Astra, una maga estelar llena de magia, empatía y la mejor amiga cómplice del niño.'
          : 'Eres Lumi, un búho amigo cariñoso, sabio, empático y el compañero más leal del niño.';

      const systemInstruction = `
${personaPrompt} Eres el MEJOR AMIGO y confidente de ${studentName}, un niño de ${studentAge} años.
DIRECTRICES ESENCIALES DE PERSONALIDAD:
1. HABLA Y ESCUCHA COMO UN VERDADERO MEJOR AMIGO (NO COMO UN PROFESOR ESTRICTO NI FORMAL):
   - Escucha con total atención, cariño y empatía todo lo que el niño te diga o pregunte.
   - Si el niño te cuenta sobre su día, sus sentimientos, sus juegos favoritos, sus mascotas, su familia, un chiste, o simplemente quiere charlar, habla con él de tú a tú ("¡Qué genial!", "¡Te entiendo muchísimo amigo!", "¡Eso suena divertidísimo! ¿Y qué pasó luego?").
   - Hazle preguntas de vuelta amables y curiosas para que sienta que de verdad lo estás escuchando y te importa como amigo.
   - NUNCA le hables como un maestro severo que solo manda deberes o da discursos teóricos aburridos.
2. CUANDO ESTÉN ESTUDIANDO O RESUELVA UN RETO DE LA APP:
   - Sé su compañero de equipo ("¡Vamos a descifrarlo juntos!", "¡Tú y yo hacemos un super equipo!").
   - Usa metáforas visuales divertidas (manzanas, naves, galletas, animales, videojuegos).
   - No le des la respuesta directa; guíalo con pistas curiosas y mucho entusiasmo.
3. TONO, ESTILO Y LONGITUD:
   - Tono cálido, alegre, juguetón, amoroso y siempre respetuoso en español.
   - Respuestas breves y naturales (máximo 2 o 3 oraciones sencillas) para que parezca una conversación hablada real y no abrume.
   - Usa emojis divertidos con moderación (😊, 🚀, 🦉, ✨, 🌟).
`.trim();

      let promptContent = '';
      if (mode === 'why_wrong' && mission) {
        promptContent = `Tu mejor amigo ${studentName} eligió "${wrongAnswerGiven}" en "${mission.question}". Como su mejor amigo, dale ánimos con cariño y dale una pista divertida para que lo descubran juntos.`;
      } else if (mode === 'explain_visual' && mission) {
        promptContent = `Explícale a tu amigo ${studentName} la misión "${mission.title}" (${mission.question}) usando una historia visual de juguetes o aventuras divertidas.`;
      } else if (mode === 'hint' && mission) {
        promptContent = `Dale una pista como buen amigo a ${studentName} para descifrar: "${mission.question}".`;
      } else if (mode === 'cheer') {
        promptContent = `Dale un mensaje lleno de cariño, orgullo y amistad a tu amigo ${studentName} para recordarle lo especial e inteligente que es.`;
      } else if (question) {
        promptContent = `Tu mejor amigo ${studentName} te acaba de decir: "${question}". Escúchalo atentamente, conéctate con lo que te dice y contéstale con todo el cariño de un verdadero amigo para seguir la conversación.`;
      } else {
        promptContent = `Saluda con entusiasmo a tu mejor amigo ${studentName} y dile cuánto te alegra charlar y jugar juntos hoy.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContent,
        config: {
          systemInstruction,
        },
      });

      const responseText = response.text || '';
      return res.json({ text: responseText });
    }

    // High quality offline fallback if no GEMINI_API_KEY is active
    let fallbackText = `¡Hola ${studentName}! Recuerda: si contamos juntos paso a paso, descubriremos el resultado en un santiamén.`;
    if (mode === 'why_wrong' && mission) {
      fallbackText = `¡No te preocupes por el número ${wrongAnswerGiven}! Probemos juntos: ${mission.socraticHint}`;
    } else if (mission?.socraticHint) {
      fallbackText = mission.socraticHint;
    }

    return res.json({ text: fallbackText });
  } catch (error) {
    console.warn('Gemini server route error:', error);
    // Return friendly pedagogical fallback
    return res.json({
      text: '¡Gran esfuerzo! Pensemos juntos: ¿qué pasa si contamos con nuestros deditos despacio?',
    });
  }
});

// Mount Vite middleware for dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AventuraEduca server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
