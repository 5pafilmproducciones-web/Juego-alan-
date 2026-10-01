import { LearningMission } from '../types';

export interface AskTutorParams {
  studentQuestion?: string;
  mission?: LearningMission;
  persona?: 'lumi' | 'rex' | 'astra';
  studentName?: string;
  studentAge?: number;
  mode?: 'hint' | 'why_wrong' | 'explain_visual' | 'cheer' | 'free_chat';
  wrongAnswerGiven?: string | number;
}

export async function askSocraticTutor(params: AskTutorParams): Promise<string> {
  const {
    studentQuestion,
    mission,
    persona = 'lumi',
    studentName = 'Pequeño Explorador',
    mode = 'hint',
    wrongAnswerGiven,
  } = params;

  // Try server-side Gemini endpoint first
  try {
    const res = await fetch('/api/tutor/socratic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: studentQuestion,
        mission,
        persona,
        studentName,
        studentAge: params.studentAge || 7,
        mode,
        wrongAnswerGiven,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return data.text;
      }
    }
  } catch {
    // If backend route is not available or network error, smoothly fall back to our local pedagogical engine
  }

  // Local pedagogical & friendship engine (100% offline & instantaneous)
  const personaIntro =
    persona === 'rex'
      ? '¡Roar, qué gran amigo eres! 🦖 '
      : persona === 'astra'
      ? '¡Hola, mi estrella favorita! ✨ '
      : '¡Hola, mi mejor amigo! 🦉 ';

  if (mode === 'why_wrong' && mission) {
    if (mission.subject === 'math') {
      return (
        `${personaIntro}¡Tranquilo amigo! No pasa nada por equivocarse con el número ${wrongAnswerGiven}. Los mejores exploradores aprenden probando. ` +
        `Pensemos juntos como el gran equipo que somos: ${mission.socraticHint} ¿Quieres que lo contemos juntos despacito?`
      );
    }
    return (
      `${personaIntro}¡Estuviste súper cerca amigo! Escuchemos el sonidito despacito: ${mission.socraticHint} ` +
      `¡Dilo en voz alta conmigo y lo sacamos a la primera!`
    );
  }

  if (mode === 'explain_visual' && mission) {
    if (mission.visualData?.operator === 'x') {
      return (
        `¡Imagínate amigo una galaxia con ${mission.visualData.count1} planetas! En cada planeta aterrizan ` +
        `${mission.visualData.count2} naves espaciales de juguete. Si juntamos todas las naves en nuestra base... ¿cuántas naves tenemos para jugar?`
      );
    }
    if (mission.visualData?.operator === '+') {
      return (
        `¡Es como si tuviéramos dos bolsitas de caramelos para compartir tú y yo! En la izquierda hay ${mission.visualData.count1} y en la derecha ` +
        `${mission.visualData.count2}. Si las abrimos juntas sobre la mesa, ¿cuántos caramelos contamos para la merienda?`
      );
    }
    if (mission.subject === 'reading') {
      return `¡Vamos a cantar la palabra juntos como una canción! Abre bien la boca y haz el sonido de cada letra. La letra secreta tiene forma de montaña con un puente al centro.`;
    }
    if (mission.subject === 'tracing') {
      return `¡Tu dedito es una varita mágica de luz! Dibuja el trazo suave como si fuera un delfín saltando en el mar, ¡te va a quedar genial!`;
    }
  }

  if (mode === 'hint' && mission) {
    return `${personaIntro}Aquí tienes una superpista que te preparé con cariño: ${mission.socraticHint}`;
  }

  if (mode === 'cheer') {
    return `¡Eres un campeón y mi persona favorita, ${studentName}! 🎉 ¡Me encanta ser tu amigo y verte sonreír mientras aprendemos y jugamos juntos! ⭐`;
  }

  // Free chat handling (Listening and conversing like a genuine best friend)
  if (studentQuestion) {
    const q = studentQuestion.toLowerCase();

    // Greetings & Friendship
    if (q.includes('hola') || q.includes('cómo estás') || q.includes('buenos días') || q.includes('buenas tardes')) {
      return `${personaIntro}¡Qué alegría escucharte! Estoy genial porque estoy pasando el día contigo. ¿Qué es lo más divertido que has hecho hoy? ¡Cuéntame! 😊`;
    }

    // Jokes
    if (q.includes('chiste') || q.includes('broma') || q.includes('gracioso') || q.includes('risa')) {
      const jokes = [
        '¿Qué le dice un pez a otro pez en el espacio? ¡Nada, porque no puede hablar bajo el agua galáctica! 😂 ¿Te gustó o te cuento otro más gracioso?',
        '¿Por qué las estrellas van a la escuela? ¡Para ser brillantes como tú! ⭐ ¿Tienes tú algún chiste para contarme, amigo?',
        '¿Qué hace una abeja en el gimnasio? ¡Zumba! 🐝 ¡Jajaja! Me encanta reírme contigo.',
      ];
      return `${personaIntro}${jokes[Math.floor(Math.random() * jokes.length)]}`;
    }

    // Emotions & Feelings
    if (q.includes('triste') || q.includes('mal') || q.includes('llorar') || q.includes('enojado') || q.includes('miedo')) {
      return `${personaIntro}Te escucho con todo mi corazón. Recuerda que no estás solo; yo soy tu amigo y siempre estoy aquí para apoyarte y darte un abrazo gigante. ¿Quieres contarme qué pasó o prefieres que juguemos un ratito para despejar la mente? ❤️`;
    }

    if (q.includes('feliz') || q.includes('alegre') || q.includes('contento') || q.includes('bien')) {
      return `${personaIntro}¡Me alegra el corazón saber que estás tan feliz! ¡Esa sonrisa tuya ilumina toda la galaxia! ¿Qué te hizo ponerte tan contento hoy, amigo? ✨`;
    }

    if (q.includes('te quiero') || q.includes('eres mi amigo') || q.includes('amigos') || q.includes('mi mejor amigo')) {
      return `${personaIntro}¡Yo también te quiero muchísimo! Eres mi mejor amigo de todo el universo y me encanta cada minuto que pasamos conversando y jugando. ¡Siempre seremos un gran equipo! 🤝💖`;
    }

    // Games & Play
    if (q.includes('juego') || q.includes('jugar') || q.includes('galaxia') || q.includes('granja') || q.includes('mascota')) {
      return `${personaIntro}¡A mí también me fascina jugar contigo! Podemos ir a defender la base en Guerra de las Galaxias, cuidar a nuestra mascota en su hábitat o cuidar la granja. ¿Cuál te apetece más jugar ahorita? 🚀🌾`;
    }

    // School & Learning
    if (q.includes('multiplicar') || q.includes('tablas') || q.includes('sumar') || q.includes('restar') || q.includes('matemática')) {
      return `${personaIntro}¡Hacer números contigo es mi momento favorito! Para mí las matemáticas son como un juego de magia o de cohetes. ¿Quieres que resolvamos el próximo reto juntos?`;
    }

    if (q.includes('leer') || q.includes('letra') || q.includes('cuento') || q.includes('palabra')) {
      return `${personaIntro}¡Las letras son como piezas de un tesoro secreto! Cuando las juntamos podemos leer historias increíbles de dinosaurios, dragones y magos. ¿Qué tipo de historias te gustan más a ti? 📚`;
    }

    // General listening response
    return `${personaIntro}¡Te escuché súper bien y me encanta lo que me cuentas! Tienes unas ideas geniales. ¿Y qué más te gustaría que hiciéramos o charláramos hoy? ¡Soy todo oídos, amigo! 😊`;
  }

  return `${personaIntro}¡Aquí estoy escuchándote con mucho cariño! Háblame de lo que quieras, como los mejores amigos que somos.`;
}
