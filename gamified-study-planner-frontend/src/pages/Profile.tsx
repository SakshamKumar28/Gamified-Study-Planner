// src/pages/Profile.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">👤 Your Profile</h2>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input disabled value={user?.name || ""} />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input disabled value={user?.email || ""} />
          </div>

          <div>
            <label className="block text-sm font-medium">XP</label>
            <Input disabled value={user?.xp?.toString() || "0"} />
          </div>

          <Button disabled className="w-full">
            ✏️ Edit Profile (Coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
