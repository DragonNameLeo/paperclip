import { lazy, Suspense, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Pencil, X } from "lucide-react";
import type { Agent } from "@paperclipai/shared";
import { aiConnectionsApi } from "@/api/ai-connections";
import { getAdapterLabel } from "@/adapters/adapter-display-registry";
import { agentConnection, agentDefaultModel, bulkAgentDisabledReason, bulkAgentHarness, bulkConnectionName } from "@/lib/bulk-agent-settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AgentBulkSettingsSheet = lazy(() => import("./AgentBulkSettingsSheet").then(m => ({ default: m.AgentBulkSettingsSheet })));

/** Shared by both roster layouts. Mount with a company key to isolate selection. */
export function AgentBulkRoster({ companyId, agents, visibleAgents, renderAgent }: {
  companyId: string; agents: Agent[]; visibleAgents: Agent[]; renderAgent: (agent: Agent) => ReactNode;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Agent[] | null>(null);
  const [notice, setNotice] = useState("");
  const accounts = useQuery({ queryKey: ["ai-connections", companyId], queryFn: () => aiConnectionsApi.list(companyId), retry: false });
  const visible = visibleAgents.filter(a => filter === "all" || bulkAgentHarness(a) === filter);
  const selectable = visible.filter(a => !bulkAgentDisabledReason(a));
  const selectedAgents = agents.filter(a => selected.includes(a.id) && !bulkAgentDisabledReason(a));
  const harnesses = [...new Set(agents.map(bulkAgentHarness))].sort((a, b) => getAdapterLabel(a).localeCompare(getAdapterLabel(b)));
  const groups = [...new Set(selectedAgents.map(bulkAgentHarness))];
  const all = selectable.length > 0 && selectable.every(a => selected.includes(a.id));
  const some = selectable.some(a => selected.includes(a.id));
  const hidden = selectedAgents.filter(a => !visible.includes(a)).length;
  const toggleAll = () => setSelected(all ? selected.filter(id => !selectable.some(a => a.id === id)) : [...new Set([...selected, ...selectable.map(a => a.id)])]);

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Select value={filter} onValueChange={setFilter}><SelectTrigger aria-label="Filter by harness" className="w-44"><SelectValue /></SelectTrigger><SelectContent>
        <SelectItem value="all">All harnesses</SelectItem>{harnesses.map(h => <SelectItem key={h} value={h}>{getAdapterLabel(h)}</SelectItem>)}
      </SelectContent></Select>
      <span className="text-xs text-muted-foreground">{visible.length} {visible.length === 1 ? "agent" : "agents"}</span>
    </div>
    {selectedAgents.length > 0 && <div role="region" aria-label="Bulk actions" className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-md border bg-muted p-3">
      <span className="text-sm font-medium">{selectedAgents.length} selected</span>
      {hidden > 0 && <span className="text-xs text-muted-foreground">{hidden} hidden by filters</span>}
      {groups.length > 1 && <span className="text-xs text-muted-foreground">Choose a harness to edit</span>}
      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">{groups.map(h => <Button key={h} size="sm" variant="outline" onClick={() => setEditing(selectedAgents.filter(a => bulkAgentHarness(a) === h))}>
        <Pencil className="size-3.5" aria-hidden />{groups.length === 1 ? "Edit connection & model" : `Edit ${selectedAgents.filter(a => bulkAgentHarness(a) === h).length} ${getAdapterLabel(h)}`}
      </Button>)}<Button size="icon-sm" variant="ghost" aria-label="Clear selection" onClick={() => setSelected([])}><X className="size-4" /></Button></div>
    </div>}
    {notice && <p role="status" className="flex items-center gap-2 text-sm"><Check className="size-4" aria-hidden />{notice}</p>}
    {accounts.error && <p className="text-xs text-destructive">Connection names couldn’t be loaded. <Button variant="link" size="sm" onClick={() => void accounts.refetch()}>Retry</Button></p>}
    <div className="overflow-x-auto"><table aria-label="Agent roster" className="w-full text-left text-sm">
      <thead className="text-xs text-muted-foreground [&_th]:px-3 [&_th]:py-3 [&_th]:font-normal"><tr>
        <th className="w-10"><Checkbox aria-label="Select all visible editable agents" checked={all ? true : some ? "indeterminate" : false} disabled={!selectable.length} onCheckedChange={toggleAll} /></th>
        <th>Agent</th><th>Harness</th><th>Connection</th><th>Default model</th>
      </tr></thead>
      <tbody>{visible.map(agent => <tr key={agent.id} data-state={selected.includes(agent.id) ? "selected" : undefined} className="border-t border-border data-[state=selected]:bg-accent/30 [&_td]:px-3">
        <td title={bulkAgentDisabledReason(agent)}><Checkbox aria-label={`Select ${agent.name}`} checked={selectedAgents.some(a => a.id === agent.id)} disabled={!!bulkAgentDisabledReason(agent)} onCheckedChange={value => setSelected(value ? [...new Set([...selected, agent.id])] : selected.filter(id => id !== agent.id))} /></td>
        <td className="min-w-64 p-0">{renderAgent(agent)}</td>
        <td className="whitespace-nowrap text-xs">{getAdapterLabel(bulkAgentHarness(agent))}</td>
        <td className="text-xs">{["http", "process"].includes(agent.adapterType) ? "Managed externally" : bulkConnectionName(agentConnection(agent), accounts.data)}</td>
        <td className="font-mono text-xs">{agentDefaultModel(agent) ?? "Harness default"}</td>
      </tr>)}</tbody>
    </table></div>
    {!visible.length && <p className="py-8 text-center text-sm text-muted-foreground">No agents match these filters.</p>}
    {!selectedAgents.length && <p className="text-xs text-muted-foreground">Select agents to update their connection or default model.</p>}
    {editing && <Suspense fallback={<p role="status" className="text-sm text-muted-foreground">Loading editor…</p>}><AgentBulkSettingsSheet companyId={companyId} agents={editing} totalSelected={selectedAgents.length} onClose={(updatedIds, complete) => {
      setEditing(null);
      if (updatedIds.length) {
        setSelected(ids => ids.filter(id => !(complete ? editing.map(a => a.id) : updatedIds).includes(id)));
        setNotice(`Updated ${updatedIds.length} ${getAdapterLabel(bulkAgentHarness(editing[0]))} ${updatedIds.length === 1 ? "agent" : "agents"}.`);
      }
    }} /></Suspense>}
  </div>;
}
