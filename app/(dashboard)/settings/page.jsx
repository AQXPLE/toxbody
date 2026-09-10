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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-[#ff5500] text-[11px] font-bold mb-2">
            <SettingsIcon className="h-3 w-3" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 flex items-center gap-2.5">
            System Settings & Parameters
          </h1>
          <p className="text-xs text-zinc-600 mt-1 max-w-xl">
            Global organization parameters, operational timezone, repeat alert thresholds, and Meta API integration status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Timezone */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-5 shadow-tox-lg">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Globe className="h-4 w-4 text-[#ff5500]" />
            <span>Organization & Reporting Timezone</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-900 block mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) =>
                  setSettings({ ...settings, organization_name: e.target.value })
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-900 block mb-1">
                Default Business Timezone (Reporting)
              </label>
              <select
                value={settings.default_timezone}
                onChange={(e) =>
                  setSettings({ ...settings, default_timezone: e.target.value })
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-[#ff5500]"
              >
                <option value="America/Chicago">Central Time — America/Chicago (CT)</option>
                <option value="America/New_York">Eastern Time — America/New_York (ET)</option>
                <option value="America/Denver">Mountain Time — America/Denver (MT)</option>
                <option value="America/Los_Angeles">Pacific Time — America/Los_Angeles (PT)</option>
              </select>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                All date-based analytics and outreach timestamps use this timezone.
              </span>
            </div>
          </div>
        </div>

        {/* Repeat Outreach Behavior */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-4 shadow-tox-lg">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <RotateCcw className="h-4 w-4 text-[#ff5500]" />
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
                className="rounded border-zinc-300 text-[#ff5500] focus:ring-[#ff5500]"
              />
              <span className="text-xs font-bold text-zinc-900">
                Show prominent visual alerts when submitting repeat same-account outreach
              </span>
            </label>
            <p className="text-xs text-zinc-600 pl-6 leading-relaxed">
              Per policy, repeat outreach is preserved as a new historical event, flagged with repeat count, and never silently blocked.
            </p>
          </div>
        </div>

        {/* Meta / Instagram API Integration Status */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-4 shadow-tox-lg">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Instagram className="h-4 w-4 text-[#ff5500]" />
            <span>Meta / Instagram Graph API Integration</span>
          </h3>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">In-App Simulation Engine</span>
              <Badge variant="success" size="xs">
                Active & Live In-App
              </Badge>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              The in-app Meta Explorer allows inspecting any handle in the world with simulated engagement stats, verified profile cards, photo grids, and 1-click outreach logging.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline underline-offset-2"
          >
            Reset to Default Seed Data
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04a00] text-white font-bold text-xs shadow-tox-orange transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
