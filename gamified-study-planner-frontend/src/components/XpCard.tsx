import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/authSlice";

const getLevelFromXP = (xp: number) => {
  const level = Math.floor(Math.sqrt(xp / 100));
  const nextLevelXP = Math.pow(level + 1, 2) * 100;
  const currentLevelXP = Math.pow(level, 2) * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    level,
    nextLevelXP,
    currentLevelXP,
    progress: Math.min(progress, 100),
  };
};

const XPCard = () => {
  const user = useSelector(selectUser);

  if (!user) return null;

  const { level, nextLevelXP, currentLevelXP, progress } = getLevelFromXP(user.xp);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-1">🧠 XP & Level</h2>
        <p className="text-sm mb-2 text-muted-foreground">
          Level <span className="font-bold">{level}</span> — {user.xp}/{nextLevelXP} XP
        </p>
        <Progress value={progress} />
        <p className="text-xs mt-1 text-muted-foreground">
          {nextLevelXP - user.xp} XP to reach Level {level + 1}
        </p>
      </CardContent>
    </Card>
  );
};

export default XPCard;
