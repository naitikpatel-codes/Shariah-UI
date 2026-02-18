import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  { label: 'Document prepared', key: 'pending' },
  { label: 'Clauses extracted', key: 'extracting' },
  { label: 'Running compliance analysis', key: 'analysing' },
  { label: 'Generating final report', key: 'finalising' },
];

export default function ProcessingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate processing
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => navigate('/report/1'), 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 95));
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto text-center pt-16">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">
        Analysing your document
      </h1>

      <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
        <FileText className="w-4 h-4" strokeWidth={1.75} />
        <span className="text-sm font-medium">SAMPLE MURABAHA AGREEMENT.pdf</span>
      </div>
      <p className="text-xs text-gray-400 mb-10">Murabaha Contract · 14 pages</p>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, hsl(var(--brand)) 0%, hsl(var(--brand-dark)) 100%)',
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mb-10">
        Typically 2–5 minutes depending on document size
      </p>

      {/* Steps */}
      <div className="space-y-4 text-left max-w-sm mx-auto">
        {steps.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const isIdle = i > currentStep;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300",
                  isDone && "bg-compliant",
                  isActive && "bg-brand animate-pulse-green",
                  isIdle && "bg-gray-300"
                )}
              />
              <span className={cn(
                "text-sm transition-colors",
                isDone && "text-gray-700 font-medium",
                isActive && "text-gray-900 font-medium",
                isIdle && "text-gray-400"
              )}>
                {step.label}
              </span>
              <span className="ml-auto text-xs">
                {isDone && <span className="text-compliant flex items-center gap-1"><Check className="w-3 h-3" /> Done</span>}
                {isActive && <span className="text-brand flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> In progress</span>}
                {isIdle && <span className="text-gray-300">Waiting</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => navigate('/dashboard')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
