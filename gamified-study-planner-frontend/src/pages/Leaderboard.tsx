import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Trophy } from "lucide-react";

interface User {
  _id: string;
  username: string;
  xp: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/leaderboard"); // Use full URL
        console.log("Leaderboard API Response:", res.data);
    
        if (!Array.isArray(res.data)) {
          throw new Error("Invalid data format");
        }
    
        setUsers(res.data);
      } catch (err) {
        setError("Failed to load leaderboard");
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    
    
    

    fetchLeaderboard();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading leaderboard...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <Trophy className="text-yellow-500" /> Leaderboard
      </h1>
      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users ranked yet.</p>
      ) : (
        users.map((user, index) => (
          <Card
            key={user._id}
            className={`mb-4 ${
              index === 0 ? "border-yellow-400 shadow-lg" 
              : index === 1 ? "border-gray-400 shadow-md" 
              : index === 2 ? "border-orange-400 shadow-sm" 
              : ""
            }`}
          >
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold w-6 text-center">{index + 1}</span>
                <span className="font-medium">{user.username}</span>
                {index === 0 && <Crown className="text-yellow-400 ml-2" />}
              </div>
              <span className="text-lg font-bold text-purple-600">{user.xp} XP</span>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default Leaderboard;
