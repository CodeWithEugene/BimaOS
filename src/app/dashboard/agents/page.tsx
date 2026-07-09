'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Search, Plus, Award, DollarSign, TrendingUp,
  UserCheck, Smartphone, Check, ShieldAlert
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AgentItem {
  id: string;
  name: string;
  phone: string;
  region: string;
  sales: number;
  commission: number;
  rating: string;
  status: 'active' | 'pending_verification' | 'suspended';
  joinedDate: string;
}

const initialAgents: AgentItem[] = [
  {
    id: 'AGT-001',
    name: 'Josephine Wambua',
    phone: '+254 711 222 333',
    region: 'Nairobi Central',
    sales: 142,
    commission: 15450,
    rating: 'A+',
    status: 'active',
    joinedDate: '2025-01-15T00:00:00Z',
  },
  {
    id: 'AGT-002',
    name: 'David Kiprop',
    phone: '+254 722 333 444',
    region: 'Eldoret Region',
    sales: 98,
    commission: 11200,
    rating: 'A',
    status: 'active',
    joinedDate: '2025-02-10T00:00:00Z',
  },
  {
    id: 'AGT-003',
    name: 'Mary Atieno',
    phone: '+254 733 444 555',
    region: 'Kisumu Lakeside',
    sales: 64,
    commission: 6800,
    rating: 'B+',
    status: 'active',
    joinedDate: '2025-03-22T00:00:00Z',
  },
  {
    id: 'AGT-004',
    name: 'Emmanuel Mwangi',
    phone: '+254 744 555 666',
    region: 'Thika Highway',
    sales: 12,
    commission: 1400,
    rating: 'C',
    status: 'pending_verification',
    joinedDate: '2025-07-07T00:00:00Z',
  },
  {
    id: 'AGT-005',
    name: 'Peter Omwamba',
    phone: '+254 755 666 777',
    region: 'Mombasa Port',
    sales: 0,
    commission: 0,
    rating: 'N/A',
    status: 'pending_verification',
    joinedDate: '2025-07-09T00:00:00Z',
  }
];

export default function AgentsDashboardPage() {
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Onboarding Form Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentRegion, setNewAgentRegion] = useState('Nairobi Central');

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPhone) return;

    const newAgent: AgentItem = {
      id: `AGT-00${agents.length + 1}`,
      name: newAgentName,
      phone: newAgentPhone,
      region: newAgentRegion,
      sales: 0,
      commission: 0,
      rating: 'N/A',
      status: 'pending_verification',
      joinedDate: new Date().toISOString(),
    };

    setAgents(prev => [newAgent, ...prev]);
    setNewAgentName('');
    setNewAgentPhone('');
    setShowAddForm(false);
  };

  const handleVerifyAgent = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return { ...a, status: 'active', rating: 'B' };
      }
      return a;
    }));
  };

  const filteredAgents = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.phone.includes(search) || 
                          a.region.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'pending_verification':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900';
      default:
        return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Distribution Agents</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage agents, verify identity documents, and track commission payouts.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Onboard Agent
        </Button>
      </div>

      {/* Onboarding Dialog */}
      {showAddForm && (
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-w-md">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-zinc-500" />
            Digital Agent Onboarding (KYC)
          </h3>
          <form onSubmit={handleAddAgent} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Full Name</label>
              <Input 
                placeholder="Jane Auma" 
                value={newAgentName}
                onChange={e => setNewAgentName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Phone Number (M-Pesa registered)</label>
              <Input 
                placeholder="+254 7XX XXX XXX" 
                value={newAgentPhone}
                onChange={e => setNewAgentPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Assigned Region</label>
              <select
                className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none"
                value={newAgentRegion}
                onChange={e => setNewAgentRegion(e.target.value)}
              >
                <option value="Nairobi Central">Nairobi Central</option>
                <option value="Eldoret Region">Eldoret Region</option>
                <option value="Kisumu Lakeside">Kisumu Lakeside</option>
                <option value="Mombasa Port">Mombasa Port</option>
                <option value="Nakuru Rift">Nakuru Rift</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                Submit for Verification
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Onboarded Agents</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
            {agents.length}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">
            {agents.filter(a => a.status === 'active').length} active, {agents.filter(a => a.status === 'pending_verification').length} pending KYC
          </p>
        </Card>

        <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Sales via Agent Network</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
            {agents.reduce((sum, a) => sum + a.sales, 0)} policies
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Accounting for 45% of total sales</p>
        </Card>

        <Card className="p-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-500">
            <span className="text-xs font-medium uppercase tracking-wider">Paid Commissions</span>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
            KES {agents.reduce((sum, a) => sum + a.commission, 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Disbursed directly via M-Pesa B2C</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search agent name, phone, region..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Agent ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Agent Details</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Region</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Policies Sold</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Commissions Paid</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-400">
                      No agents found.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((a) => (
                    <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{a.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{a.name}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Smartphone className="h-3 w-3" /> {a.phone}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{a.region}</td>
                      <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">{a.sales}</td>
                      <td className="px-5 py-4 font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(a.commission)}</td>
                      <td className="px-5 py-4">
                        <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-none font-bold">
                          {a.rating}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={getStatusBadge(a.status)}>
                          {a.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                        {a.status === 'pending_verification' ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-1"
                            onClick={() => handleVerifyAgent(a.id)}
                          >
                            Verify Agent (Approve KYC)
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-400 flex items-center justify-end gap-1.5">
                            <Check className="h-4 w-4 text-emerald-500" /> Active Agent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
