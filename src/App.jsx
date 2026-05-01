import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Upload, CheckCircle, AlertCircle, BookOpen, FileText, Settings, ChevronRight, GraduationCap, Timer, RotateCcw, Volume2, Search, SkipBack, Plus, X } from 'lucide-react';

const INITIAL_DICTEES = [
  {
    id: 1,
    titre: "Brevet 2024 - Wood'stown",
    texte: "C’était une ville étrange. Au lieu de s’élancer vers le ciel, les maisons semblaient s’enfoncer dans le sol. On aurait dit que les arbres, lassés de l’oppression de la brique, reprenaient leurs droits. Partout, les racines soulevaient les pavés, les branches perçaient les toitures. La forêt entrait dans la cité par toutes les fissures, et l’on entendait, la nuit, le craquement des murs qui cédaient sous la poussée de la sève.",
    auteur: "Alphonse Daudet",
    annee: "2024",
    categorie: "Annales",
    difficulte: "Intermédiaire"
  },
  {
    id: 2,
    titre: "Brevet 2023 - Contes d'une grand-mère",
    texte: "Le vent s’était calmé, mais la pluie tombait fine et glacée. Les arbres de la forêt semblaient se presser les uns contre les autres pour se tenir chaud. Parfois, un oiseau effrayé s'envolait dans un battement d'ailes précipité, secouant les gouttes d'eau qui brillaient comme des perles sous la lune. Tout était silence et mystère dans cette nuit profonde.",
    auteur: "George Sand",
    annee: "2023",
    categorie: "Annales",
    difficulte: "Facile"
  },
  {
    id: 3,
    titre: "Brevet 2022 - L'Homme qui plantait des arbres",
    texte: "Il ne parlait guère. C’était le propre des solitaires, mais on le sentait sûr de lui et confiant dans cette assurance. C’était insolite dans ce pays dépouillé. Il habitait non pas une cabane, mais une vraie maison de pierre où l’on voyait très bien comment son travail personnel avait restauré la ruine qu’il avait trouvée là à son arrivée.",
    auteur: "Jean Giono",
    annee: "2022",
    categorie: "Annales",
    difficulte: "Difficile"
  },
  {
    id: 4,
    titre: "L'Enfance - La Gloire de mon père",
    texte: "Je suis né dans la ville d’Aubagne, sous le Garlaban couronné de chèvres, au temps des derniers chevriers. Mon père était instituteur, et il portait une barbe noire qui piquait mes joues quand il m'embrassait. Je me souviens de l'odeur de la craie et de l'encre fraîche qui flottait dans la salle de classe, un parfum qui, aujourd'hui encore, réveille en moi des souvenirs enchantés.",
    auteur: "Marcel Pagnol",
    annee: "Pronostic 2026",
    categorie: "Thématique",
    difficulte: "Facile"
  },
  {
    id: 5,
    titre: "L'Engagement - Une vie",
    texte: "Nous étions plusieurs milliers de femmes, entassées dans des wagons de marchandises, sans savoir vers quelle destination nous étions emmenées. Le froid était vif, et la peur se lisait sur tous les visages. Pourtant, dans cette obscurité, des liens de solidarité se tissaient. Une main serrée, un mot d'encouragement, un morceau de pain partagé devenaient des actes de résistance contre l'inhumanité qui nous entourait.",
    auteur: "Simone Veil",
    annee: "Pronostic 2026",
    categorie: "Thématique",
    difficulte: "Difficile"
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
  const [filter, setFilter] = useState('Tous');
  const [pronouncePunctuation, setPronouncePunctuation] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // State pour le formulaire d'ajout
  const [newDictee, setNewDictee] = useState({ titre: '', auteur: '', texte: '', annee: 'Perso' });
  
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  const filteredDictees = useMemo(() => {
    if (filter === 'Tous') return dictees;
    return dictees.filter(d => d.categorie === filter || (filter === 'Perso' && d.categorie === 'Perso'));
  }, [filter, dictees]);

  useEffect(() => {
    if (timerActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, isPaused]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speak = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    setReadingProgress(0);

    let textToSpeak = selectedDictee.texte;
    if (pronouncePunctuation) {
      textToSpeak = textToSpeak
        .replace(/,/g, ", virgule, ")
        .replace(/\./g, ". point. ")
        .replace(/;/g, "; point-virgule; ")
        .replace(/:/g, ": deux-points: ")
        .replace(/\!/g, "! point d'exclamation! ")
        .replace(/\?/g, "? point d'interrogation? ")
        .replace(/\.\.\./g, "... points de suspension... ");
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = speed;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const progress = (event.charIndex / textToSpeak.length) * 100;
        setReadingProgress(progress);
      }
    };

    utterance.onstart = () => { 
      setIsReading(true); 
      setIsPaused(false);
      setTimerActive(true); 
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setReadingProgress(100);
      setTimeout(() => setReadingProgress(0), 1000);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeak = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const stopAndResetSpeak = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setReadingProgress(0);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddDictee = (e) => {
    e.preventDefault();
    if (!newDictee.titre || !newDictee.texte) return;

    const dicteeToAdd = {
      ...newDictee,
      id: Date.now(),
      categorie: 'Perso',
      difficulte: 'Inconnu'
    };

    setDictees([dicteeToAdd, ...dictees]);
    setSelectedDictee(dicteeToAdd);
    setShowAddModal(false);
    setNewDictee({ titre: '', auteur: '', texte: '', annee: 'Perso' });
    
    // Reset session
    setCorrection(null);
    setUserInput("");
    setImagePreview(null);
    stopAndResetSpeak();
    setSeconds(0);
  };

  const generateCorrection = async () => {
    setTimerActive(false);
    stopAndResetSpeak();
    setLoading(true);
    setCorrection(null);

    const base64Data = imagePreview ? imagePreview.split(',')[1] : null;

    const systemPrompt = `Tu es un correcteur expert du Brevet des Collèges. 
    Ta mission est de corriger la dictée de l'élève en comparant avec le texte original.
    
    CRITÈRE CRUCIAL : Vérifie l'INTÉGRALITÉ. Si des mots ou des phrases entières manquent dans la copie de l'élève (que ce soit via le texte tapé ou l'image), signale-le impérativement.
    
    Barème :
    - Faute de grammaire/conjugaison : -1pt
    - Faute d'usage : -0.5pt
    - Ponctuation/Majuscule : -0.25pt
    - MOT MANQUANT/OUBLI : -1pt par mot important oublié.

    Texte original à comparer : "${selectedDictee.texte}"`;

    const userPrompt = `Voici ma copie. ${userInput ? `Texte tapé : "${userInput}".` : ""} ${imagePreview ? "Analyse également l'image jointe pour vérifier l'intégralité du texte écrit à la main." : ""}
    
    Réponds uniquement en JSON avec cette structure :
    {
      "note": "X/10",
      "integraliteVerifiee": boolean,
      "motsManquants": ["liste des mots ou phrases oubliés"],
      "fautesIdentifiees": ["liste détaillée"],
      "pointsForts": ["positif"],
      "axesAmelioration": ["conseils"],
      "texteCorrige": "Le texte avec les erreurs entre crochets [erreur -> correction] et les oublis signalés par [MANQUANT: texte]"
    }`;

    try {
      const payload = {
        contents: [{
          parts: [
            { text: userPrompt },
            ...(base64Data ? [{ inlineData: { mimeType: "image/png", data: base64Data } }] : [])
          ]
        }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setCorrection(result);
    } catch (error) {
      console.error("Erreur de correction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-indigo-700 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <GraduationCap className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight leading-none">DNB Dictée Master</h1>
                <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-[0.2em] mt-1">Jeannine Manuel School</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md font-mono text-sm ${timerActive && !isPaused ? 'text-emerald-300 animate-pulse' : 'text-white/70'}`}>
              <Timer className="w-4 h-4" />
              {formatTime(seconds)}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Bibliothèque
                  </h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    title="Ajouter une dictée"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Tous', 'Annales', 'Thématique', 'Perso'].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`text-[10px] px-3 py-1.5 rounded-full border transition-all font-bold uppercase tracking-wider ${filter === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
                {filteredDictees.map((d) => (
                  <button key={d.id} onClick={() => { setSelectedDictee(d); setCorrection(null); setUserInput(""); setImagePreview(null); stopAndResetSpeak(); setSeconds(0); }} className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group ${selectedDictee.id === d.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${d.categorie === 'Annales' ? 'text-amber-600' : d.categorie === 'Perso' ? 'text-indigo-600' : 'text-emerald-600'}`}>{d.annee}</div>
                      <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">{d.titre}</div>
                      <div className="text-xs text-slate-500 mt-1 italic">{d.auteur}</div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedDictee.id === d.id ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} />
                  </button>
                ))}
                {filteredDictees.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm italic">Aucune dictée dans cette catégorie.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-600" /> Réglages</h3>
                <button onClick={() => { setSeconds(0); setTimerActive(false); stopAndResetSpeak(); }} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50" title="Réinitialiser le chrono"><RotateCcw className="w-5 h-5" /></button>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-slate-500" /><span className="text-sm font-bold text-slate-700">Ponctuation orale</span></div>
                    <button onClick={() => setPronouncePunctuation(!pronouncePunctuation)} className={`w-11 h-6 rounded-full transition-colors relative ${pronouncePunctuation ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${pronouncePunctuation ? 'left-6' : 'left-1'}`} /></button>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex justify-between mb-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vitesse</label><span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2 py-0.5 rounded-md">{speed}x</span></div>
                    <input type="range" min="0.3" max="1.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={isReading && !isPaused ? pauseSpeak : speak} 
                      className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 ${isReading && !isPaused ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-inner' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
                    >
                      {isReading && !isPaused ? <><Pause className="w-5 h-5"/> Pause</> : isPaused ? <><Play className="w-5 h-5"/> Reprendre</> : <><Play className="w-5 h-5"/> Dicter</>}
                    </button>

                    {isReading && (
                      <button 
                        onClick={stopAndResetSpeak}
                        className="p-4 rounded-2xl bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-all active:scale-95"
                        title="Arrêter la lecture"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {(isReading || isPaused || readingProgress > 0) && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Progression audio</span>
                        <span>{Math.round(readingProgress)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
                          style={{ width: `${readingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isReading && (
                    <button 
                      onClick={() => { stopAndResetSpeak(); setTimeout(speak, 100); }}
                      className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <SkipBack className="w-4 h-4" /> Reprendre du début
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedDictee.titre}</h2>
                  <p className="text-slate-400 text-sm font-medium">{selectedDictee.auteur} — {selectedDictee.annee}</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2.5 rounded-xl cursor-pointer transition-all border border-indigo-100 shadow-sm">
                  <Upload className="w-4 h-4" />
                  Scanner la copie
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              {imagePreview && (
                <div className="mb-6 relative group bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                  <img src={imagePreview} alt="Aperçu" className="w-full max-h-64 object-contain p-2 opacity-90" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                        <Search className="w-3 h-3" /> Analyse visuelle prête
                    </div>
                    <button onClick={() => setImagePreview(null)} className="bg-rose-500 text-white p-1.5 rounded-full shadow-lg hover:bg-rose-600 transition-colors"><AlertCircle className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              <div className="relative">
                <textarea
                  value={userInput}
                  onChange={(e) => { setUserInput(e.target.value); if (!timerActive && e.target.value.length > 0) setTimerActive(true); }}
                  placeholder="Tape ton texte ici ou laisse l'IA analyser ta photo..."
                  className="w-full h-80 p-8 bg-slate-50/50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:bg-white focus:shadow-2xl focus:shadow-indigo-500/5 outline-none transition-all resize-none font-serif text-xl leading-relaxed"
                />
              </div>
              
              <div className="mt-8 flex flex-col items-center gap-6">
                <button 
                  onClick={generateCorrection}
                  disabled={loading || (!userInput && !imagePreview)}
                  className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white px-16 py-5 rounded-3xl font-black text-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:translate-y-0"
                >
                  {loading ? <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> Vérification intégrale...</> : <>Soumettre pour correction <CheckCircle className="w-6 h-6"/></>}
                </button>
              </div>
            </div>

            {correction && (
              <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><GraduationCap className="w-7 h-7" /></div>
                    <div>
                      <h4 className="font-black text-xl tracking-tight">Rapport de correction</h4>
                      <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Brevet Blanc • Session {selectedDictee.annee}</p>
                    </div>
                  </div>
                  <div className="bg-white text-indigo-700 px-8 py-3 rounded-2xl font-black text-3xl shadow-2xl">{correction.note}</div>
                </div>

                <div className="p-8 md:p-10 space-y-8">
                  {!correction.integraliteVerifiee && (
                    <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-3xl flex items-start gap-4 shadow-sm animate-pulse">
                        <AlertCircle className="w-8 h-8 text-rose-500 shrink-0" />
                        <div>
                            <h5 className="font-black text-rose-700 text-lg">Attention : Texte Incomplet !</h5>
                            <p className="text-rose-600 text-sm mt-1">L'IA a détecté qu'il manque des segments du texte original dans ta copie :</p>
                            <ul className="mt-2 list-disc list-inside text-rose-800 text-sm font-bold">
                                {correction.motsManquants?.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h5 className="font-black text-emerald-600 text-sm uppercase tracking-widest flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Réussites</h5>
                      <div className="space-y-3">
                        {correction.pointsForts.map((pf, i) => <div key={i} className="text-sm bg-emerald-50/50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 font-medium">{pf}</div>)}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-black text-amber-600 text-sm uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-5 h-5" /> À revoir</h5>
                      <div className="space-y-3">
                        {correction.axesAmelioration.map((aa, i) => <div key={i} className="text-sm bg-amber-50/50 text-amber-800 p-4 rounded-2xl border border-amber-100 font-medium">{aa}</div>)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h5 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> Copie annotée</h5>
                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-200 font-serif text-xl leading-relaxed text-slate-700 whitespace-pre-wrap shadow-inner">
                      {correction.texteCorrige.split(/(\[.*?\])/g).map((part, i) => {
                        if (part.startsWith('[MANQUANT:')) return <span key={i} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-lg border border-amber-300 font-bold mx-0.5 shadow-sm">{part}</span>;
                        if (part.startsWith('[')) return <span key={i} className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-lg border border-rose-200 font-bold mx-0.5 shadow-sm">{part}</span>;
                        return part;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal d'ajout de dictée */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                <Plus className="w-6 h-6" /> Ajouter une dictée
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddDictee} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Titre de la dictée</label>
                  <input 
                    required 
                    type="text" 
                    value={newDictee.titre} 
                    onChange={e => setNewDictee({...newDictee, titre: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="Ex: Wood'stown"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auteur</label>
                  <input 
                    required 
                    type="text" 
                    value={newDictee.auteur} 
                    onChange={e => setNewDictee({...newDictee, auteur: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="Ex: Alphonse Daudet"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Texte original</label>
                <textarea 
                  required 
                  value={newDictee.texte} 
                  onChange={e => setNewDictee({...newDictee, texte: e.target.value})} 
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-serif leading-relaxed" 
                  placeholder="Collez ici le texte que l'IA devra dicter et corriger..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Annuler</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-20 bg-white border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start opacity-60">
            <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <span className="font-black text-sm tracking-tight">DNB DICTÉE MASTER</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Jeannine Manuel School</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Préparation officielle • Analyse IA Avancée</p>
              <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
}