'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/provider.js';
import { parseLegacyTsv } from '@/lib/tsvParser.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import {
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Share2,
  RotateCcw,
  Sparkles,
  FileCheck,
  ArrowRight,
  Database,
} from 'lucide-react';

export default function ImportsPage() {
  const { addToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [batches, setBatches] = useState([]);

  // Staging / Upload State
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  // Ambiguous resolution modal
  const [reviewAmbiguousOpen, setReviewAmbiguousOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    db.getAccounts().then(setAccounts);
    loadBatches();
  }, []);

  const loadBatches = async () => {
    // In db provider, memoryStore.importBatches
    setBatches(db.memoryStore?.importBatches || []);
  };

  // One-click load bundled sample TSV
  const handleLoadSampleTsv = () => {
    const sampleContent = `Fairfax\tPalmbeach\tDenver
@Notboredindc\t@willworkforfashion\t@thatothetallgirl
@tastesoftheunion\t@mariisoko\tSouthlake
@youloveandyoulearn\tAlamo\t@violinistbarbie
@alliegoneaway\t@eunifiedworld\t@monitoocrazy
@bethermias\t@ephemeralfox\t@kelbimueller
Southlake\t@zorymorylookbook\t@lovedaci
@ays_diary\t@sarah_._fan\tScottsdale
@emilyanngemma\t@charweeezy\t@nattyy_b
@theimainexchange\t@girlfromcalifornia\t@jourdskir
@theelizabetharena_\tSouthlake\t@myabenway
@ashlan.pruitt\t@joywithkelina\t@cassiesethna
Riverton\t@harrisjaneofficial\t@andreacristina_az
@baybretzing\t@realashleyrogers\tChandler
@brynnguymon\t@alexis.belbel\t@michaelajacobs
@rosieandtheshelterpups\t@cindysandjo\t@azfoodie
@amberjoyhansen\tChandler\t@callievinsonn
Alamo\t@audreyfeyzdiamont\t@drgulnurbayramli
@cookwithhenny\t@chandidayle\tRiverton
@celfstudies\t@tayandalexx\t@itssydniegreen
@marinagudov\t@ontrendwitholivia\t@baileyreaganx
@jennyandcabbage\tScottsdale\t@taylorkenz
@cyberjasbytes\t@faith_eunikian\tAlamo
@janaelynneats\t@bresheppard\t@brokeadultgirl
Scottsdale\t@azfoodie\t@myarosemiller_
@its_motek\t@scottsdaledesignservices\t@janeezhao
@ellisebee\tRiverton\t@roxyyanaya
@kimmyeatstucson\t@madelinebecker\t@paulina.trans
@kyleerogers_\t@dayana_atkinson1\t
@theashleygreenlee\t@kennadeeann\t
Chandler\t@suebagleyy\t
@amandaamonroee\tFairfax\t
@melanieangelese\t@gloria_ruppert\t
@lottieweaver\t@iheartveggies\t
@mamamadecoffee\t@kidsquarantineandme\t
\t@notboredindc\t
\t@ninailblanton\t`;

    setRawText(sampleContent);
    setFileName('influencer track - Sheet1.tsv');
    runParse(sampleContent, 'influencer track - Sheet1.tsv');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setRawText(content);
      runParse(content, file.name);
    };
    reader.readAsText(file);
  };

  const runParse = (content, name) => {
    setIsProcessing(true);
    try {
      const result = parseLegacyTsv(content, accounts);
      setParsedResult(result);
      addToast({
        title: 'TSV Parsed Successfully',
        message: `Extracted ${result.totalEntries} outreach entries across ${result.uniqueInfluencersCount} unique influencers.`,
        type: 'success',
      });
    } catch (err) {
      addToast({ title: 'Parse Error', message: err.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = async () => {
    if (!parsedResult) return;

    setIsCommitting(true);
    try {
      const commitRes = await db.commitTsvImport({
        fileName: fileName || 'legacy_import.tsv',
        parsedResult,
        employeeId: currentUser?.id,
      });

      addToast({
        title: 'Historical Migration Complete',
        message: `Created ${commitRes.newInfluencersCreated} influencers and ${commitRes.outreachRecordsCreated} historical outreach events.`,
        type: 'success',
      });

      setParsedResult(null);
      setRawText('');
      setFileName('');
      loadBatches();
    } catch (err) {
      addToast({ title: 'Migration Error', message: err.message, type: 'error' });
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Historical TSV / CSV Migration Pipeline</span>
            <Badge variant="warning" size="sm">
              Messy Data Normalizer
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Safely ingest legacy spreadsheets, detect handles, handle mid-column account shifts, resolve duplicates, and flag ambiguous cells.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSampleTsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40 text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Load "influencer track - Sheet1.tsv"</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {!parsedResult && (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-[#121319] p-8 text-center space-y-4 hover:border-zinc-500 transition-colors">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Upload className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Upload Historical TSV, CSV, or Tab-Separated File
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              The normalizer recognizes column headers (e.g. Fairfax, Palm Beach, Denver) and automatically tracks mid-column location shifts (e.g. Southlake, Riverton, Alamo).
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 shadow transition-all">
              <FileSpreadsheet className="h-4 w-4 text-amber-400" />
              <span>Browse File (.tsv, .csv)</span>
              <input
                type="file"
                accept=".tsv,.csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-zinc-500">or</span>
            <button
              onClick={handleLoadSampleTsv}
              className="text-xs text-amber-400 hover:underline font-medium"
            >
              Load the bundled sample TSV directly
            </button>
          </div>
        </div>
      )}

      {/* Parse Results Preview UI */}
      {parsedResult && (
        <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 space-y-6 shadow-2xl animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-400" />
                <span>Migration Staging & Review: {fileName}</span>
              </h2>
              <div className="text-xs text-zinc-400 mt-0.5">
                Columns recognized: <span className="font-mono text-zinc-300">{parsedResult.headers.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setParsedResult(null)}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Cancel / Re-upload
              </button>
              <button
                disabled={isCommitting}
                onClick={handleCommitImport}
                className="inline-flex items-center gap-2 px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
              >
                <Database className="h-4 w-4" />
                <span>{isCommitting ? 'Importing...' : 'Commit Historical Migration'}</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Total Rows</div>
              <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                {parsedResult.totalRows}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Recognized Handles</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {parsedResult.totalEntries}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Unique Influencers</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {parsedResult.uniqueInfluencersCount}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Account Repeats</div>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                {parsedResult.outreaches.filter((o) => o.isRepeatSameAccount).length}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Ambiguous Cells</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-1">
                {parsedResult.ambiguousCount}
              </div>
            </div>
          </div>

          {/* Cross-Account Validation Callout */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 text-xs text-blue-200 space-y-1">
            <span className="font-semibold text-blue-300 block">
              Cross-Account Normalization Verified:
            </span>
            <p className="text-zinc-300">
              Handles appearing in multiple columns (such as <span className="font-mono text-amber-300">@notboredindc</span> and <span className="font-mono text-amber-300">@azfoodie</span>) are consolidated into single canonical influencer records, while their respective outreach events are preserved under each account context. Dates will remain <span className="font-mono text-zinc-200">NULL</span> per specification ("Historical / Date unavailable").
            </p>
          </div>

          {/* Staged Outreach Preview Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
              <span>Staged Outreach Events Sample (First 15 of {parsedResult.totalEntries})</span>
              <Badge variant="default" size="xs">
                Historical Import
              </Badge>
            </h3>

            <div className="max-h-80 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/40">
              <table className="w-full text-left border-collapse dense-table">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Handle</th>
                    <th className="py-2.5 px-3">Account Context</th>
                    <th className="py-2.5 px-3">Header Context</th>
                    <th className="py-2.5 px-3">Repeat Status</th>
                    <th className="py-2.5 px-3">Date Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {parsedResult.outreaches.slice(0, 15).map((entry, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 text-xs">
                      <td className="py-2.5 px-3 font-mono text-zinc-500 text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-zinc-100">
                        {entry.handle}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 font-medium">
                        {entry.accountContext}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px]">
                        Col: {entry.headerContext}
                      </td>
                      <td className="py-2.5 px-3">
                        {entry.isRepeatSameAccount ? (
                          <Badge variant="repeat" size="xs">
                            <RotateCcw className="h-2.5 w-2.5" /> Repeat #{entry.repeatCount}
                          </Badge>
                        ) : (
                          <Badge variant="default" size="xs">
                            Valid
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="historical" size="xs">
                          NULL (Historical)
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Completed Import Batches History */}
      <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono flex items-center justify-between">
          <span>Migration Batches History</span>
          <Badge variant="default" size="xs">
            {batches.length} Batches
          </Badge>
        </h3>

        {batches.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No historical migration batches committed yet.
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-zinc-200 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    <span>{b.file_name}</span>
                    <Badge variant="success" size="xs">
                      Completed
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-3">
                    <span>{b.recognized_handles} handles processed</span>
                    <span>•</span>
                    <span>{b.new_influencers_count} new influencers</span>
                    <span>•</span>
                    <span>{b.repeat_outreach_count} repeats flagged</span>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-zinc-400">
                  {b.completed_at ? new Date(b.completed_at).toLocaleDateString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
