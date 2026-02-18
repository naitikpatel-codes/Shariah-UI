import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, AlertCircle, Zap, Upload, FileCheck, Shield,
  Lock, ArrowRight, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: CheckCircle,
    title: 'Clause-Level Analysis',
    description: 'Every clause individually examined against Shariah principles and regulatory standards.',
    color: 'text-compliant',
    bg: 'bg-compliant-bg',
  },
  {
    icon: AlertCircle,
    title: 'Tri-State Verdicts',
    description: 'Compliant, Needs Review, or Non-Compliant — always clear, never ambiguous.',
    color: 'text-info',
    bg: 'bg-info-bg',
  },
  {
    icon: Zap,
    title: 'Actionable Insights',
    description: 'Priority-ranked remediation guidance per finding with cited regulatory references.',
    color: 'text-review',
    bg: 'bg-review-bg',
  },
];

const steps = [
  { num: '01', icon: Upload, title: 'Upload Contract', desc: 'PDF, DOCX, or TXT' },
  { num: '02', icon: FileCheck, title: 'AI Analyses', desc: '4-Layer Compliance Engine' },
  { num: '03', icon: Shield, title: 'Get Report', desc: 'Encrypted & Secure' },
];

const contractTypes = [
  'Murabaha', 'Ijarah', 'Musharakah', 'Mudarabah',
  'Istisna', 'Tawarruq', 'Sukuk', 'Wakalah',
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/fortiv-logo.jpg" alt="Fortiv Solutions" className="h-10" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link to="/login">
              <Button className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand hover:shadow-lg transition-all hover:-translate-y-0.5">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--brand)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <motion.div className="max-w-3xl" {...fadeUp}>
            <h1 className="font-display font-bold text-4xl md:text-[52px] md:leading-[60px] text-gray-900 mb-6">
              AI Shariah Compliance{' '}
              <br />
              <span className="text-brand">Screening. Automated.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Instantly analyse Islamic finance contracts against AAOIFI, SAMA, and internal standards.
              Clause by clause. Second by second.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand hover:shadow-lg transition-all hover:-translate-y-0.5 h-12 px-8 text-base">
                  Start Free Analysis <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-gray-300 text-gray-700 hover:bg-gray-50">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Floating preview card */}
          <motion.div
            className="mt-16 bg-surface rounded-xl shadow-modal border border-border overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0, 0, 0.2, 1] }}
          >
            <div className="bg-gray-50 px-6 py-3 border-b border-border flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-noncompliant/30" />
              <div className="w-3 h-3 rounded-full bg-review/30" />
              <div className="w-3 h-3 rounded-full bg-compliant/30" />
              <span className="ml-4 text-xs text-gray-500 font-mono">Compliance Report — MURABAHA_CONTRACT_Q1.pdf</span>
            </div>
            <div className="p-6 grid grid-cols-4 gap-4">
              {[
                { label: 'Total Clauses', value: '42', color: 'text-gray-900' },
                { label: 'Compliant', value: '35', color: 'text-compliant' },
                { label: 'Needs Review', value: '5', color: 'text-review' },
                { label: 'Non-Compliant', value: '2', color: 'text-noncompliant' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
              Comprehensive Compliance Analysis
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Built for Islamic financial institutions that demand accuracy, speed, and regulatory confidence.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="bg-surface rounded-xl border border-border p-8 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-12 h-12 rounded-lg ${f.bg} flex items-center justify-center mb-5`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} strokeWidth={1.75} />
                </div>
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Three simple steps to complete compliance analysis.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent mx-auto mb-6 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-brand" strokeWidth={1.75} />
                </div>
                <span className="text-xs font-mono font-medium text-brand mb-2 block">{step.num}</span>
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-gray-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section className="bg-brand py-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-4 text-center">
          <Lock className="w-6 h-6 text-primary-foreground/80 flex-shrink-0" />
          <p className="text-primary-foreground text-lg font-medium">
            Your reports are encrypted with AES-256-GCM. Only viewable inside the app.
          </p>
        </div>
      </section>

      {/* Supported Standards */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">Supported Standards</h2>
          <p className="text-gray-600 mb-10">Cross-referenced against three authoritative frameworks.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['AAOIFI Shariah Standards', 'SAMA Regulations', 'Internal Templates'].map((s) => (
              <div key={s} className="bg-surface border border-border rounded-xl px-8 py-5 shadow-card">
                <p className="font-display font-semibold text-gray-800">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Contracts */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-10">Supported Contract Types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {contractTypes.map((c) => (
              <div key={c} className="bg-accent rounded-lg px-4 py-3 text-sm font-medium text-brand">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">Ready to automate compliance?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            Join Islamic financial institutions already using AI-powered Shariah compliance screening.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-brand hover:bg-brand-dark text-primary-foreground shadow-brand hover:shadow-lg transition-all hover:-translate-y-0.5 h-12 px-8 text-base">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-surface">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/fortiv-logo.jpg" alt="Fortiv Solutions" className="h-8" />
          </div>
          <p className="text-xs text-gray-400">© 2026 All rights reserved. Confidential.</p>
        </div>
      </footer>
    </div>
  );
}
