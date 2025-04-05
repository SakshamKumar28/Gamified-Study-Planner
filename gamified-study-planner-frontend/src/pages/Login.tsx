import React, { useState, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/authSlice"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../redux/store"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { error, isLoading } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/dashboard");
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-center min-h-screen bg-gray-100 p-4"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md bg-white shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 text-sm mb-4">{error || "An error occurred"}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              name="email" 
              type="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
              className="w-full"
            />
            <Input 
              name="password" 
              type="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
              className="w-full"
            />

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" /> Logging in...
                </span>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          
          <p className="text-sm text-center mt-4">
            Don't have an account? 
            <a href="/register" className="text-indigo-600 hover:underline ml-1">Sign up</a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Login;
