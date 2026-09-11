'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import {
  Settings as SettingsIcon,
  Globe,
  Clock,
  Instagram,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({
    organization_name: 'The Tox Technique',
    default_timezone: 'America/Chicago',
    pagination_limit: 25,
    repeat_warning_enabled: true,
    meta_api_configured: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    db.getSettings().then(setSettings);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await db.updateSettings(settings);
      addToast({
        title: 'Settings Saved',
        message: 'Platform configuration updated successfully.',
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Save Failed', message: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset to default seed data? This will restore initial accounts, staff, and the core repeat scenarios.')) {
      db.resetStore();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tox-orange/30 bg-tox-orange/10 text-tox-orange text-xs font-mono font-medium mb-3 backdrop-blur-md">
            <SettingsIcon className="h-3.5 w-3.5 text-tox-orange" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            System Settings & Parameters
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Global organization parameters, operational timezone, repeat alert thresholds, and Meta API integration status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Timezone */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center gap-2 border-b border-white/[0.08] pb-4">
            <Globe className="h-4 w-4 text-tox-orange" />
            <span>Organization & Reporting Timezone</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) =>
                  setSettings({ ...settings, organization_name: e.target.value })
                }
                className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Default Business Timezone (Reporting)
              </label>
              <select
                value={settings.default_timezone}
                onChange={(e) =>
                  setSettings({ ...settings, default_timezone: e.target.value })
                }
                className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-tox-orange"
              >
                <option value="America/Chicago" className="bg-obsidian-950 text-white">Central Time — America/Chicago (CT)</option>
                <option value="America/New_York" className="bg-obsidian-950 text-white">Eastern Time — America/New_York (ET)</option>
                <option value="America/Denver" className="bg-obsidian-950 text-white">Mountain Time — America/Denver (MT)</option>
                <option value="America/Los_Angeles" className="bg-obsidian-950 text-white">Pacific Time — America/Los_Angeles (PT)</option>
              </select>
              <span className="text-[11px] text-zinc-500 font-mono mt-1.5 block">
                All date-based analytics and outreach timestamps use this timezone.
              </span>
            </div>
          </div>
        </div>

        {/* Repeat Outreach Behavior */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center gap-2 border-b border-white/[0.08] pb-4">
            <RotateCcw className="h-4 w-4 text-tox-orange" />
            <span>Repeat Outreach Behavior</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.repeat_warning_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, repeat_warning_enabled: e.target.checked })
                }
                className="rounded border-white/20 bg-obsidian-950 text-tox-orange focus:ring-tox-orange accent-tox-orange cursor-pointer"
              />
              <span className="text-xs font-semibold text-zinc-200">
                Show prominent visual alerts when submitting repeat same-account outreach
              </span>
            </label>
            <p className="text-xs text-zinc-400 pl-6 leading-relaxed">
              Per policy, repeat outreach is preserved as a new historical event, flagged with repeat count, and never silently blocked.
            </p>
          </div>
        </div>

        {/* Meta / Instagram API Integration Status */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold flex items-center gap-2 border-b border-white/[0.08] pb-4">
            <Instagram className="h-4 w-4 text-tox-orange" />
            <span>Meta / Instagram Graph API Integration</span>
          </h3>

          <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-white/[0.08] space-y-2 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">In-App Live Scraper Engine</span>
              <Badge variant="success" size="xs">
                Active & Live In-App
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The in-app Meta Explorer allows inspecting any handle in the world with live profile scraping, verified profile cards, photo grids, and 1-click outreach logging.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-rose-400 hover:text-rose-300 font-mono font-medium hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            Reset to Default Seed Data
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black font-semibold text-xs shadow-tox-orange transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
