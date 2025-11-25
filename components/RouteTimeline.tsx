import React, { useState, useEffect } from 'react';
import { BusStop, RouteData } from '../types';

interface RouteTimelineProps {
  route: RouteData;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({ route }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Calculate cumulative times for estimation (Mocking a start at firstBusTime for simplicity, 
  // or relative to current time if we assume user just hopped on)
  const calculateEstimatedArrival = (stopIndex: number) => {
    // Start estimation from "Now" for the first bus available or next frequency slot
    // For this UI, let's just show relative time from the Start of the route
    let minutes = 0;
    for (let i = 0; i <= stopIndex; i++) {
      minutes += route.stops[i].typicalTravelTimeMinutes;
    }
    return minutes;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h3 className="text-lg font-bold text-gray-900">Route Timeline</h3>
           <p className="text-sm text-gray-500">Stops & Estimated Intervals</p>
        </div>
        <div className="text-right">
             <span className="block text-xs text-gray-400 uppercase tracking-wider">Total Est. Time</span>
             <span className="font-mono text-lg font-semibold text-blue-600">
               {route.stops.reduce((acc, stop) => acc + stop.typicalTravelTimeMinutes, 0)} min
             </span>
        </div>
      </div>
      
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
        {route.stops.map((stop, index) => {
          const isFirst = index === 0;
          const isLast = index === route.stops.length - 1;
          const cumulativeTime = calculateEstimatedArrival(index);
          
          return (
            <div key={stop.id} className="relative pl-8 group">
              {/* Dot */}
              <div 
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all duration-300
                  ${isFirst ? 'bg-green-500 border-green-200 scale-110' : 
                    isLast ? 'bg-red-500 border-red-200 scale-110' : 
                    'bg-white border-gray-300 group-hover:border-blue-400 group-hover:bg-blue-50'}
                `}
              ></div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start transition-all duration-200 group-hover:translate-x-1">
                <div>
                  <h4 className={`font-semibold text-gray-800 ${isFirst || isLast ? 'text-lg' : 'text-base'}`}>
                    {stop.name}
                  </h4>
                  {stop.landmark && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400">
                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.625a19.015 19.015 0 005.335 2.308zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {stop.landmark}
                    </p>
                  )}
                </div>
                
                <div className="mt-1 sm:mt-0 flex flex-col items-start sm:items-end">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    +{cumulativeTime} min
                  </span>
                  {!isFirst && (
                    <span className="text-[10px] text-gray-400 mt-1">
                      {stop.distanceFromPreviousKm} km leg
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};