import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 rounded-xl bg-brand flex items-center justify-center mx-auto mb-6">
          <Shield className="w-9 h-9 text-primary-foreground" />
        </div>
        <h1 className="mb-4 text-4xl font-display font-bold text-gray-900">AI Shariah Compliance Screener</h1>
        <p className="text-lg text-gray-500 mb-8">Redirecting to landing page...</p>
        <Link to="/">
          <Button className="bg-brand hover:bg-brand-dark text-primary-foreground">Go to Landing Page</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
