import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * SOLUTION À L'ERREUR VERCEL :
 * Nous n'importons plus "lucide-react". 
 * Toutes les icônes sont dessinées en SVG interne ci-dessous.
 */

const Icon = ({ children, className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const PlayIcon = () => <Icon><polygon points="5 3 19 12 5 21 5 3"></polygon></Icon>;
const PauseIcon = () => <Icon><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></Icon>;
const UploadIcon = () => <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></Icon>;
const BookIcon = () => <Icon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></Icon>;
const SettingsIcon = () => <Icon><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></Icon>;
const ChevronRightIcon = () => <Icon><polyline points="9 18 15 12 9 6"></polyline></Icon>;
const GradIcon = () => <Icon><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></Icon>;
const TimerIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></Icon>;
const XIcon = () => <Icon><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const PlusIcon = () => <Icon><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></Icon>;

const INITIAL_DICTEES = [
  {
    id: 1,
    titre: "Brevet 2024 - Wood'stown",
    texte: "C’était une ville étrange. Au lieu de s’élancer vers le ciel, les maisons semblaient s’enfoncer dans le sol. On aurait dit que les arbres, lassés de l’oppression de la brique, reprenaient leurs droits. Partout, les racines soulevaient les pavés, les branches perçaient les toitures. La forêt entrait dans la cité par toutes les fissures, et l’on entendait, la nuit, le craquement des murs qui cédaient sous la poussée de la sève.",
    auteur: "Alphonse Daudet",
    annee: "2024",
    categorie: "Annales"
  },
  {
    id: 2,
    titre: "Brevet 2023 - Contes d'une grand-mère",
    texte: "Le vent s’était calmé, mais la pluie tombait fine et glacée. Les arbres de la forêt semblaient se presser les uns contre les autres pour se tenir chaud. Parfois, un oiseau effrayé s'envolait dans un battement d'ailes précipité, secouant les gouttes d'eau qui brillaient comme des perles sous la lune. Tout était silence et mystère dans cette nuit profonde.",
    auteur: "George Sand",
    annee: "2023",
    categorie: "Annales"
  }
];

const apiKey = ""; 

export default function App() {
  const [dictees, setDictees] = useState(INITIAL_DICTEES);
  const [selectedDictee, setSelectedDictee] = useState(INITIAL_DICTEES[0]);
  const [userInput, setUserInput] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(0.7);
  const [correction, setCorrection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [pronouncePunctuation, setPronouncePunctuation] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDictee, setNewDictee] = useState({ titre: '', auteur: '', texte: '' });
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerActive && !isPaused) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, isPaused]);

  const speak = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    let textToSpeak = selectedDictee.texte;
    if (pronouncePunctuation) {
      textToSpeak = textToSpeak.replace(/,/g, ", virgule, ").replace(/\./g, ". point. ");
    }
    const ut = new SpeechSynthesisUtterance(textToSpeak);
    ut.lang = 'fr-FR';
    ut.rate = speed;
    ut.onstart = () => { setIsReading(true); setIsPaused(false); setTimerActive(true); };
    ut.onend = () => { setIsReading(false); setIsPaused(false); };
    window.speechSynthesis.speak(ut);
  };

  const generateCorrection = async () => {
    setLoading(true);
    const currentKey = apiKey || (typeof process !== 'undefined' ? process.env.VITE_GEMINI_API_KEY : "");
    
    if (!currentKey) {
        alert("Clé API non configurée dans Vercel (VITE_GEMINI_API_KEY).");
        setLoading(false);
        return;
    }

    const systemPrompt = `Tu es un correcteur expert. Réponds en JSON: {"note": "X/10", "pointsForts": [], "axesAmelioration": [], "texteCorrige": ""}`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${currentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Original: ${selectedDictee.texte}. Elève: ${userInput}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      setCorrection(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (e) { alert("Erreur de connexion à l'IA"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-indigo-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GradIcon />
            <h1 className="text-xl font-bold">DNB Dictée Master</h1>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm bg-white/10 px-3 py-1 rounded-full">
            <TimerIcon /> {Math.floor(seconds/60)}:{(seconds%60).toString().padStart(2,'0')}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold flex items-center gap-2"><BookIcon /> Bibliothèque</h3>
              <button onClick={() => setShowAddModal(true)} className="p-1.5 bg-indigo-600 text-white rounded-lg"><PlusIcon /></button>
            </div>
            <div className="p-2 space-y-1">
              {dictees.map(d => (
                <button key={d.id} onClick={() => {setSelectedDictee(d); setCorrection(null); setUserInput("");}} className={`w-full text-left p-4 rounded-xl flex items-center justify-between ${selectedDictee.id === d.id ? 'bg-indigo-50 text-indigo-700 font-bold' : ''}`}>
                  <span className="truncate">{d.titre}</span>
                  <ChevronRightIcon />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><SettingsIcon /> Réglages</h3>
            <button onClick={isReading && !isPaused ? () => {window.speechSynthesis.pause(); setIsPaused(true);} : speak} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex justify-center gap-2 shadow-lg">
              {isReading && !isPaused ? <><PauseIcon /> Pause</> : <><PlayIcon /> Dicter</>}
            </button>
            <div className="flex items-center justify-between text-sm">
                <span>Vitesse: {speed}x</span>
                <input type="range" min="0.5" max="1" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-24" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            <h2 className="text-2xl font-black mb-1">{selectedDictee.titre}</h2>
            <p className="text-slate-400 mb-6">{selectedDictee.auteur}</p>
            
            <textarea 
                value={userInput} 
                onChange={e => setUserInput(e.target.value)} 
                className="w-full h-80 p-6 bg-slate-50 rounded-2xl border-none outline-none font-serif text-xl leading-relaxed" 
                placeholder="Écrivez ici..."
            />
            
            <button onClick={generateCorrection} disabled={loading || !userInput} className="w-full mt-6 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xl shadow-xl transition-transform active:scale-95">
              {loading ? "Analyse..." : "Corriger ma dictée"}
            </button>
          </div>

          {correction && (
            <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <span className="font-bold">Résultats</span>
                <span className="bg-white text-indigo-700 px-4 py-1 rounded-lg font-black text-2xl">{correction.note}</span>
              </div>
              <div className="p-8 space-y-4">
                <p className="font-serif italic text-slate-600 border-l-4 border-indigo-200 pl-4">{correction.texteCorrige}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Ajouter un texte</h3>
            <input className="w-full border p-3 rounded-xl mb-3" placeholder="Titre" onChange={e => setNewDictee({...newDictee, titre: e.target.value})} />
            <textarea className="w-full border p-3 rounded-xl h-40 mb-4" placeholder="Texte de la dictée..." onChange={e => setNewDictee({...newDictee, texte: e.target.value})} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">Annuler</button>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl" onClick={() => {setDictees([...dictees, {...newDictee, id: Date.now()}]); setShowAddModal(false);}}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}