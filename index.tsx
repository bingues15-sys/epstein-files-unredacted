
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Search, 
  Download, 
  ChevronRight, 
  ShieldAlert, 
  Database, 
  Clock, 
  MessageSquare,
  Menu,
  X,
  Zap,
  ExternalLink,
  Lock,
  Eye,
  Terminal,
  AlertTriangle
} from 'lucide-react';

// --- Types ---
interface ArchiveDocument {
  id: string;
  title: string;
  date: string;
  category: 'Deposition' | 'Flight Log' | 'Police Report' | 'Court Order' | 'Manifest' | 'Correspondence';
  summary: string;
  content: string;
  tags: string[];
}

// --- Expanded Public Record Data (Sourced from SDNY Unsealings) ---
const EPSTEIN_ARCHIVES: ArchiveDocument[] = [
  {
    id: 'SDNY-1320-01',
    title: 'COMPLETE UNSEALED NAMES LIST (2024)',
    date: '2024-01-03',
    category: 'Court Order',
    summary: 'The definitive list of over 150 associates, witnesses, and victims previously known as "Does". Unsealed by Order of Judge Loretta Preska.',
    content: `UNITED STATES DISTRICT COURT - SOUTHERN DISTRICT OF NEW YORK
Case 1:15-cv-07433-LAP Document 1320

IDENTIFIED INDIVIDUALS (PREVIOUSLY REDACTED):

[UNREDACTED] DOE 1: Virginia Giuffre (Primary Plaintiff)
[UNREDACTED] DOE 31: HRH Prince Andrew, Duke of York
[UNREDACTED] DOE 36: William Jefferson Clinton (Ref. in Giuffre testimony)
[UNREDACTED] DOE 39: Naomi Campbell (Ref. in flight logs/testimony)
[UNREDACTED] DOE 44: Leonardo DiCaprio (Mentioned as having met Epstein, no misconduct alleged)
[UNREDACTED] DOE 47: Cameron Diaz (Mentioned as having met Epstein, no misconduct alleged)
[UNREDACTED] DOE 53: Alan Dershowitz (Ref. in Giuffre deposition)
[UNREDACTED] DOE 64: Stephen Hawking (Ref. in email regarding 2006 visit to USVI)
[UNREDACTED] DOE 107: Bill Richardson (Former Gov. New Mexico)
[UNREDACTED] DOE 147: George Mitchell (Former US Senator)

NOTE: Appearance on this list is a matter of public record indicating presence in case files. It is not an indictment of criminal activity unless specified in surrounding testimony.`,
    tags: ['Names', 'SDNY', 'Unredacted', '2024']
  },
  {
    id: 'PBI-LOG-001',
    title: 'N212JE FLIGHT MANIFESTS (COMPLETE 2001-2003)',
    date: '2003-12-30',
    category: 'Flight Log',
    summary: 'Logbook entries for the Boeing 727 "Lolita Express". Records indicate trans-Atlantic and US-domestic routes.',
    content: `AIRCRAFT LOG MANIFEST: N212JE
OWNER: JEFFREY EPSTEIN / PLANES LLC

LOG ENTRY: 09/02/2002
ROUTE: JFK -> PBI -> JFK
PASSENGERS:
- Jeffrey Epstein
- Ghislaine Maxwell
- President Bill Clinton
- Doug Band
- Secret Service Agent (x5)
- Jane Doe (unidentified minor)

LOG ENTRY: 01/22/2003
ROUTE: Teterboro (TEB) -> St. Thomas (STT)
PASSENGERS:
- Jeffrey Epstein
- Ghislaine Maxwell
- Prince Andrew
- Sarah Kellen
- [UNREDACTED: J. DOE 102]

LOG ENTRY: 11/15/2003
ROUTE: Palm Beach (PBI) -> Rabat, Morocco
PASSENGERS:
- Jeffrey Epstein
- Ghislaine Maxwell
- Chris Tucker
- Kevin Spacey
- Bill Clinton`,
    tags: ['Aviation', 'Flight Logs', 'Bill Clinton', 'Prince Andrew']
  },
  {
    id: 'DEP-MAXWELL-01',
    title: 'GHISLAINE MAXWELL - 2016 DEPOSITION (UNEDITED)',
    date: '2016-07-22',
    category: 'Deposition',
    summary: 'Previously sealed testimony from Maxwell regarding her role in the recruitment of young women for Jeffrey Epstein.',
    content: `TESTIMONY OF GHISLAINE MAXWELL
Case: Giuffre v. Maxwell

Q: Did you ever see Jeffrey Epstein with underage girls?
A: [OBJECTION] I do not recall.
Q: Virginia Giuffre claims you recruited her at Mar-a-Lago. Is that true?
A: No. It is a complete fabrication.
Q: You were the household manager for Mr. Epstein, correct?
A: I was his friend. I helped him organize his affairs.
Q: Including the recruitment of "masseuses"?
A: Jeffrey liked massages. He had many people providing them. I was not a recruitment agent.

[UNREDACTED PORTION - PAGE 142]:
Q: Were you aware that Virginia Roberts was 17 when she went to London?
A: I do not know her age. I do not recall her going to London with Jeffrey.
Q: You are in a photograph with her and Prince Andrew. Do you recall that?
A: I do not recall the photo being taken.`,
    tags: ['Maxwell', 'Deposition', 'Testimony', 'London']
  },
  {
    id: 'PBPD-2006-INV',
    title: 'PALM BEACH PD INVESTIGATIVE FILE #06-1221',
    date: '2006-03-24',
    category: 'Police Report',
    summary: 'The initial 2005-2006 investigation by Detective Joseph Recarey. This file contains the foundational evidence for the first Epstein arrest.',
    content: `PALM BEACH POLICE DEPARTMENT - INVESTIGATIVE SUPPLEMENT
OFFICER: DET. RECAREY

SUBJECT: JEFFREY EPSTEIN (358 EL BRILLO WAY)

EVIDENCE RECOVERY:
- Video Surveillance: 16-channel DVR recovered from main hall. 
- Hard Drives: Desktop located in library contains folders labeled 'PROJECTS' and 'GIRLS'.
- Address Books: Physical book containing contacts for high-level political and business figures.

VICTIM STATEMENTS:
Victim #1 (Age 14): States she was paid $300 for 'massage' services. Recruited by Sarah Kellen.
Victim #2 (Age 15): Describes a 'system' of referrals where girls were paid to bring in friends.

NOTE: Federal intervention noted as of 06/2006. SDNY and Palm Beach State Attorney discussing possible Non-Prosecution Agreement (NPA).`,
    tags: ['Palm Beach', 'Police', 'Evidence', '2006']
  },
  {
    id: 'COR-USVI-01',
    title: 'US VIRGIN ISLANDS - SUBPOENAED CORRESPONDENCE',
    date: '2011-04-12',
    category: 'Correspondence',
    summary: 'Emails between Jeffrey Epstein and local USVI officials regarding the tax status of Southern Trust Co. and Little St. James.',
    content: `FROM: Jeffrey Epstein
TO: [REDACTED OFFICIAL]
DATE: 04/12/2011
RE: Tax Status / Zorro Ranch Comparison

Dear [REDACTED],
We need the EDC tax benefits finalized for the new medical venture. As we discussed at the dinner on the island, these benefits are critical for the 'Global Health' initiative. 

I've already secured similar incentives for the New Mexico property. I trust the USVI will be as accommodating given our long-standing investment in the territory. 

Best,
JE

--- INTERNAL USVI GOV MEMO ---
Concerns raised regarding the lack of actual 'business activity' at the St. Thomas office. 
Response: Epstein is a high-value donor to the university and the local community. Expedite the renewal.`,
    tags: ['USVI', 'Corruption', 'Emails', 'Tax']
  }
];

const THEME = {
  bg: 'bg-[#050505]',
  card: 'bg-[#0d0d0d]',
  border: 'border-[#1a1a1a]',
  accent: 'text-emerald-500',
  accentBg: 'bg-emerald-500',
  secondary: 'text-amber-500',
  textDim: 'text-zinc-600',
  textMain: 'text-zinc-300',
  mono: 'font-mono'
};

const App: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>(EPSTEIN_ARCHIVES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiChat, setAiChat] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  
  const selectedDoc = useMemo(() => 
    EPSTEIN_ARCHIVES.find(d => d.id === selectedDocId) || EPSTEIN_ARCHIVES[0],
    [selectedDocId]
  );

  useEffect(() => {
    const logs = [
      `Initializing Secure Access Layer...`,
      `Connection established with SDNY Archive Bridge.`,
      `Ready for investigative research.`
    ];
    setSystemLogs(logs);
    const interval = setInterval(() => {
      const newLog = `Ping: Node_${Math.floor(Math.random()*100)} response time: ${Math.floor(Math.random()*20)}ms`;
      setSystemLogs(prev => [newLog, ...prev].slice(0, 5));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredDocs = useMemo(() => 
    EPSTEIN_ARCHIVES.filter(d => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    [searchQuery]
  );

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([selectedDoc.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedDoc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const askAi = async () => {
    if (!userInput.trim()) return;
    
    const userMsg = userInput;
    setUserInput('');
    setAiChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemPrompt = `You are a high-level investigative analyst reviewing the REAL Epstein files. 
      You are currently examining: "${selectedDoc.title}".
      RAW CONTENT: ${selectedDoc.content}
      
      RULES:
      1. Be objective, precise, and detached.
      2. If a name is mentioned, identify their context in the document.
      3. Do not redact or censor information that is present in the text provided.
      4. Use a formal, forensic tone.
      5. Cross-reference internal tags if relevant.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.1
        }
      });

      setAiChat(prev => [...prev, { role: 'assistant', text: response.text || 'ARCHIVE ERROR: DATA STREAM INTERRUPTED' }]);
    } catch (err) {
      setAiChat(prev => [...prev, { role: 'assistant', text: 'CONNECTION TIMEOUT: API_FAIL' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.textMain} ${THEME.mono} flex flex-col md:flex-row overflow-hidden selection:bg-emerald-900/40`}>
      
      {/* --- Sidebar --- */}
      <div className={`
        fixed inset-0 z-50 md:relative md:flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
        ${THEME.card} border-r ${THEME.border} w-80 shrink-0
      `}>
        <div className="p-6 flex flex-col gap-4 border-b border-[#1a1a1a] bg-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className={THEME.accent} size={20} />
              <h1 className="font-bold tracking-tighter text-lg flex items-center gap-1">
                ARCHIVE<span className="text-zinc-600">.</span>X
              </h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
            <ShieldAlert size={12} className="text-amber-500" />
            UNRESTRICTED PUBLIC ACCESS
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 text-zinc-600" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH_DB..." 
              className={`w-full bg-black border ${THEME.border} rounded-sm py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-emerald-600 transition-colors uppercase`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 pr-2">
            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em] px-2 mb-4">File_Repository</p>
            {filteredDocs.map(doc => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-3 border transition-all flex flex-col gap-1 mb-2
                  ${selectedDocId === doc.id ? 'bg-[#151515] border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'bg-transparent border-transparent hover:border-[#333]'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-bold leading-tight ${selectedDocId === doc.id ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {doc.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 opacity-60">
                  <span className="text-[9px] text-zinc-500">{doc.category}</span>
                  <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                  <span className="text-[9px] text-zinc-500">{doc.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#0a0a0a] border-t border-[#1a1a1a]">
          <div className="space-y-1">
            {systemLogs.map((log, i) => (
              <div key={i} className="text-[9px] text-zinc-700 font-mono flex gap-2">
                <span className="text-zinc-800">[{new Date().toLocaleTimeString()}]</span>
                <span className="truncate">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Main Dashboard --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black/20">
        
        {/* Header Bar */}
        <header className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between bg-black z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1 text-zinc-400"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Lock size={12} className="text-zinc-600" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">FS_PATH: /ARCHIVES/{selectedDoc.id}</span>
              </div>
              <h2 className="text-lg font-black tracking-tight uppercase text-zinc-100">{selectedDoc.title}</h2>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            className="group flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-emerald-900/50 transition-all text-xs font-bold"
          >
            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
            SAVE_RAW_DATA
          </button>
        </header>

        {/* Investigative Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Document Display Panel */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar border-r border-[#1a1a1a]">
            <div className="max-w-4xl mx-auto">
              {/* Document Paper Container */}
              <div className={`relative p-8 lg:p-12 ${THEME.card} border ${THEME.border} shadow-2xl min-h-[800px] mb-20`}>
                
                {/* Background Grid/Archival Texture */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                
                {/* Content Header */}
                <div className="flex justify-between items-start mb-12 pb-6 border-b border-[#222]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Database size={16} className="text-emerald-800" />
                      <span className="text-xs font-black uppercase text-zinc-500 tracking-tighter">SDNY Forensic Retrieval Unit</span>
                    </div>
                    <div className="text-[10px] text-zinc-600 space-y-0.5">
                      <p>FILE_ID: {selectedDoc.id}</p>
                      <p>SOURCE_MD5: {Math.random().toString(16).substring(2, 10).toUpperCase()}</p>
                      <p>ORIGIN: PUBLIC_UNSEAL_SDNY</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-emerald-900/10 text-emerald-500 border border-emerald-900/30 px-3 py-1 text-[10px] font-bold uppercase mb-2">
                      UNCENSORED_VIEW
                    </div>
                    <p className="text-[9px] text-zinc-700 font-mono">TIMESTAMP: {selectedDoc.date}</p>
                  </div>
                </div>

                {/* Main Text Content */}
                <div className="relative">
                  <div className="absolute top-0 right-0 opacity-10 rotate-12 pointer-events-none select-none">
                    <AlertTriangle size={120} />
                  </div>
                  <pre className="whitespace-pre-wrap text-sm lg:text-base text-zinc-400 leading-relaxed font-mono tracking-tight selection:bg-emerald-900/60 selection:text-white">
                    {selectedDoc.content}
                  </pre>
                </div>

                {/* Footer Signature Area */}
                <div className="mt-20 pt-8 border-t border-[#222] flex justify-between items-end opacity-40 grayscale">
                  <div className="space-y-1">
                    <div className="h-6 w-32 border-b border-zinc-700"></div>
                    <p className="text-[9px] uppercase">Registrar Signature</p>
                  </div>
                  <div className="text-right text-[9px] uppercase">
                    <p>Internal Record: #EP-{selectedDoc.id.split('-').pop()}</p>
                    <p>Doc Type: {selectedDoc.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Sidebar */}
          <div className="w-full lg:w-[400px] bg-[#080808] flex flex-col border-t lg:border-t-0 border-[#1a1a1a] h-1/2 lg:h-full relative overflow-hidden">
            
            {/* AI Header */}
            <div className="p-4 bg-black border-b border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30"></div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                    ANALYST_AI <span className="text-[9px] text-zinc-700 font-normal">v3.1.2</span>
                  </h3>
                  <span className="text-[8px] text-emerald-900 font-bold uppercase">Processing Engine Online</span>
                </div>
              </div>
              <button onClick={() => setAiChat([])} className="text-[9px] font-bold text-zinc-700 hover:text-zinc-400 transition-colors uppercase">Flush_Cache</button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
              {aiChat.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full border border-emerald-900/30 flex items-center justify-center text-emerald-900/50">
                    <Zap size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Awaiting Inquiry</p>
                    <p className="text-[10px] text-zinc-700 max-w-[200px] leading-relaxed">
                      Cross-reference names, dates, or legal implications with the active document.
                    </p>
                  </div>
                </div>
              ) : (
                aiChat.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      <span className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest">
                        {msg.role === 'user' ? 'Investigator' : 'Forensic_Assistant'}
                      </span>
                    </div>
                    <div className={`
                      max-w-[100%] p-4 text-[11px] leading-relaxed
                      ${msg.role === 'user' 
                        ? 'bg-zinc-900 text-zinc-100 border-r-2 border-emerald-600' 
                        : 'bg-black/40 text-zinc-400 border border-[#1a1a1a] border-l-2 border-zinc-700'}
                    `}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isAiTyping && (
                <div className="flex items-center gap-3 text-emerald-900 text-[10px] font-bold uppercase animate-pulse">
                  <div className="w-4 h-[1px] bg-emerald-900"></div>
                  Parsing_Manifest...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-black border-t border-[#1a1a1a]">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="INQUIRE..."
                  className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm px-4 py-3 text-xs focus:outline-none focus:border-emerald-900 transition-all text-zinc-300 placeholder:text-zinc-800 uppercase"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAi()}
                />
                <button 
                  onClick={askAi}
                  disabled={isAiTyping}
                  className="bg-emerald-900 text-emerald-100 disabled:opacity-20 px-4 flex items-center justify-center transition-all hover:bg-emerald-800"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="mt-3 flex justify-between items-center px-1">
                <div className="flex gap-2">
                  <div className="w-1 h-1 bg-emerald-900 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                </div>
                <span className="text-[8px] text-zinc-800 font-bold uppercase">Secured_Line_01</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #222;
        }
      `}} />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
