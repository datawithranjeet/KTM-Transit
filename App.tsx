
import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { RouteTimeline } from './components/RouteTimeline';
import { StatsChart } from './components/StatsChart';
import { InfoCard } from './components/InfoCard';
import { fetchRouteDetails, generateCrowdData } from './services/gemini';
import { RouteData, LoadingState, CrowdData } from './types';
import { DEFAULT_SUGGESTIONS } from './constants';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setRouteData(null);

    try {
      const data = await fetchRouteDetails(searchQuery);
      const crowd = await generateCrowdData(data.routeName);
      
      setRouteData(data);
      setCrowdData(crowd);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to find route details. Please check the bus number and try again.");
      setLoadingState(LoadingState.ERROR);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Section */}
        <section className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Where are you heading in <span className="text-red-600">Kathmandu?</span>
          </h1>
          <p className="text-slate-500 mb-8 text-lg">
            Enter a bus number or route name to get AI-powered schedules and real-time traffic updates.
          </p>
          
          <form onSubmit={handleSubmit} className="relative group z-10">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white rounded-lg shadow-xl">
              <input 
                type="text" 
                className="flex-grow px-6 py-4 rounded-l-lg focus:outline-none text-lg placeholder-slate-400"
                placeholder="e.g., Ba 1 Ja 1234, Ring Road, Lagankhel..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loadingState === LoadingState.LOADING}
                className="bg-slate-900 text-white px-8 py-4 rounded-r-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingState === LoadingState.LOADING ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  'Find Bus'
                )}
              </button>
            </div>
          </form>

          {/* Suggestions */}
          {loadingState === LoadingState.IDLE && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {DEFAULT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-red-300 hover:text-red-600 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Error State */}
        {loadingState === LoadingState.ERROR && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Results Dashboard */}
        {loadingState === LoadingState.SUCCESS && routeData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Info & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Main Route Info */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {routeData.busNumber}
                  </span>
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Active Now
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{routeData.routeName}</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {routeData.description}
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                   <InfoCard 
                     title="Frequency" 
                     value={`Every ${routeData.frequencyMinutes} min`} 
                     colorClass="text-blue-600 bg-blue-100"
                     icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                   />
                   <InfoCard 
                     title="Operating Hours" 
                     value={`${routeData.firstBusTime} - ${routeData.lastBusTime}`} 
                     colorClass="text-purple-600 bg-purple-100"
                     icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>}
                   />
                </div>
              </div>

              {/* Traffic Status - NEW */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
                    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                  Current Traffic
                </h3>
                <div className={`flex flex-col gap-3 p-4 rounded-xl border ${
                    routeData.trafficCondition === 'Heavy' ? 'bg-red-50 border-red-100 text-red-900' :
                    routeData.trafficCondition === 'Moderate' ? 'bg-yellow-50 border-yellow-100 text-yellow-900' :
                    'bg-green-50 border-green-100 text-green-900'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                            routeData.trafficCondition === 'Heavy' ? 'bg-red-200' :
                            routeData.trafficCondition === 'Moderate' ? 'bg-yellow-200' :
                            'bg-green-200'
                        }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-xl leading-tight">{routeData.trafficCondition}</p>
                            <p className="text-xs font-semibold opacity-75 uppercase tracking-wide">Congestion Level</p>
                        </div>
                    </div>
                    {routeData.trafficAnalysis && (
                        <p className="text-sm mt-1 opacity-90 border-t border-black/5 pt-2">
                           {routeData.trafficAnalysis}
                        </p>
                    )}
                </div>

                {/* Grounding Sources - NEW */}
                {routeData.sourceUrls && routeData.sourceUrls.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Verified via Google Maps</p>
                      <div className="flex flex-wrap gap-2">
                          {routeData.sourceUrls.map((url, i) => (
                             <a 
                               key={i} 
                               href={url} 
                               target="_blank" 
                               rel="noreferrer"
                               className="inline-flex items-center px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                             >
                               <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                               Source {i + 1}
                             </a>
                          ))}
                      </div>
                   </div>
                )}
              </div>

              {/* Crowd Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Typical Crowd Levels</h3>
                <StatsChart data={crowdData} />
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>8 PM</span>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline */}
            <div className="lg:col-span-2">
              <RouteTimeline route={routeData} />
            </div>

          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} KTM Transit Manager.</p>
          <p className="mt-2">All right reserved by Kathmandu Valley traffic.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
