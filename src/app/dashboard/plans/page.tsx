'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { 
  Sliders, Plus, Loader2, Shield, 
  Trash2, Sparkles, CheckCircle2, Calendar
} from 'lucide-react';

interface CustomPlan {
  id: string;
  name: string;
  category: string;
  premium_amount: number;
  coverage_amount: number;
  description: string;
  duration_days: number;
  created_at: string;
}

export default function PlansDashboardPage() {
  const supabase = createClient();
  const [plans, setPlans] = useState<CustomPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('biashara');
  const [premium, setPremium] = useState('100');
  const [coverage, setCoverage] = useState('50000');
  const [duration, setDuration] = useState('1');
  const [description, setDescription] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching custom plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeployPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !premium || !coverage || !duration) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('custom_plans')
        .insert({
          name: name.trim(),
          category,
          premium_amount: parseFloat(premium),
          coverage_amount: parseFloat(coverage),
          duration_days: parseInt(duration),
          description: description.trim() || 'Custom ad-hoc policy cover.'
        });

      if (error) throw error;

      // Reset Form
      setName('');
      setDescription('');
      setPremium('100');
      setCoverage('50000');
      setDuration('1');
      
      // Refresh
      fetchPlans();
      alert('Custom dynamic policy deployed successfully! It is now active on the USSD dials and PWA menus.');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to deploy custom plan. Ensure you are signed in as an Insurer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to retract/delete this plan?')) return;
    try {
      const { error } = await supabase
        .from('custom_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPlans();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete plan.');
    }
  };

  // Quick Preset Helper: Maandamano Cover
  const applyMaandamanoPreset = () => {
    setName('Maandamano Business Cover');
    setCategory('biashara');
    setPremium('100');
    setCoverage('50000');
    setDuration('1');
    setDescription('Temporary 1-day protection covering inventory loss, theft, and looting during local demonstrations.');
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Dynamic Underwriting Plans</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Deploy temporary, customized, or risk-targeted insurance policies instantly to the client portal and USSD network.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Side: Create Dynamic Plan Form */}
        <Card className="p-5 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 md:col-span-1 h-fit">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4 justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-zinc-500" />
              <h3 className="font-semibold text-sm">Deploy Custom Plan</h3>
            </div>
            <button 
              type="button" 
              onClick={applyMaandamanoPreset}
              className="text-[10px] bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900 px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-red-200"
            >
              <Sparkles className="h-3 w-3" /> Riot Preset
            </button>
          </div>

          <form onSubmit={handleDeployPlan} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-500 dark:text-zinc-450 mb-1">Plan Name *</label>
              <Input 
                type="text" 
                placeholder="e.g. Mama Mboga Riot Cover" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-500 dark:text-zinc-450 mb-1">Underwriting Category *</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="kilimo">Kilimo Shield (Agriculture)</option>
                <option value="boda">Boda &amp; Motor Cover (Vehicle)</option>
                <option value="biashara">Biashara Cover (Micro-Retail)</option>
                <option value="health">Afya Care (Health &amp; Family)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-zinc-500 dark:text-zinc-450 mb-1">Premium (KES) *</label>
                <Input 
                  type="number" 
                  value={premium} 
                  onChange={(e) => setPremium(e.target.value)} 
                  required
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-500 dark:text-zinc-450 mb-1">Coverage Max (KES) *</label>
                <Input 
                  type="number" 
                  value={coverage} 
                  onChange={(e) => setCoverage(e.target.value)} 
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-500 dark:text-zinc-450 mb-1">Duration Days *</label>
              <Input 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-500 dark:text-zinc-450 mb-1">Description</label>
              <Textarea 
                placeholder="Explain the coverage guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting} 
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 font-bold uppercase tracking-wider text-xs rounded-lg py-2"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Deploy Policy Live
            </Button>
          </form>
        </Card>

        {/* Right Side: Active Deployed Plans List */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-3">Active Custom Deployed Plans</h3>
            
            {loading ? (
              <div className="text-center py-10">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-500" />
                <span className="text-xs text-zinc-400 mt-2 block">Syncing dynamic plans catalog...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-xs">
                No custom ad-hoc plans deployed. Use the form to deploy a temporary protection policy.
              </div>
            ) : (
              <div className="grid gap-3">
                {plans.map((p) => (
                  <div 
                    key={p.id} 
                    className="border border-zinc-200 dark:border-zinc-850 p-4 rounded-lg flex items-start justify-between bg-zinc-50 dark:bg-zinc-900/30"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{p.name}</h4>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">{p.description}</p>
                      
                      <div className="flex gap-4 pt-2 text-[10px] text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5 text-zinc-500" /> 
                          Premium: KES {p.premium_amount}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500" /> 
                          Coverage: KES {p.coverage_amount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" /> 
                          Duration: {p.duration_days} Day(s)
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeletePlan(p.id)}
                      className="text-zinc-400 hover:text-red-500 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-950 transition-colors"
                      title="Retract Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
