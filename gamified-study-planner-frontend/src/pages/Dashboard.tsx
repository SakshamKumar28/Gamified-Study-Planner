// src/pages/Dashboard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Dashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎯 Welcome back, {user?.name || "Scholar"}!</h1>

      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">🌟 XP Progress</h2>
            <Progress value={(user?.xp ?? 0) % 100} className="h-2 bg-white/30" />
            <p className="text-sm mt-1">{user?.xp} XP</p>
          </div>
          <StarIcon className="w-12 h-12 text-yellow-300" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex gap-4 items-center">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.avatarUrl || ""} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
