import { Badge, Card } from "@/components";

function DashboardPage() {
  return (
    <Card title="Dashboard Overview" description="Replace placeholders with domain modules.">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>System status:</span>
        <Badge tone="success">Ready</Badge>
      </div>
    </Card>
  );
}

export default DashboardPage;
