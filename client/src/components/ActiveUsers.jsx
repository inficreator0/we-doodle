import React from 'react';

const ActiveUsers = ({ users, userColors }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Active Users</h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border border-gray-200 shadow-sm"
                style={{ 
                  backgroundColor: userColors[user] || '#000000',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                }}
              />
              <span className="text-gray-700 text-sm">{user}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveUsers; 