interface ActiveUsersProps {
  users: string[];
  userColors: Record<string, string>;
}

export const ActiveUsers = ({ users = [], userColors }: ActiveUsersProps) => {

  return (
    <div className="space-y-4">
      <h2 className="text-m font-semibold text-white">Active Users</h2>
      {users.length === 0 ? (
        <p className="text-white/70">No active users in this board.</p>
      ) : (
        <div className="space-y-2">
          {users.map((username) => (
            <div key={username} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: userColors[username] || '#000000' }}
              />
              <span className="text-white/80">{username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

