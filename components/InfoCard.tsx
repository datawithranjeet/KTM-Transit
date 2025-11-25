import React from 'react';

interface InfoCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{title}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};