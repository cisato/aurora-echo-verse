import { useState } from "react";
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  fields: string[];
}

const AVAILABLE_REPORTS: ReportConfig[] = [
  {
    id: "usage",
    name: "Usage Summary",
    description: "Overview of AI assistant usage patterns",
    icon: BarChart3,
    fields: ["Total Sessions", "Average Duration", "Peak Usage Times", "Feature Utilization"],
  },
  {
    id: "activity",
    name: "Activity Report",
    description: "Detailed activity log and interactions",
    icon: TrendingUp,
    fields: ["Chat Messages", "Voice Commands", "Searches", "Code Generations"],
  },
  {
    id: "performance",
    name: "Performance Metrics",
    description: "System performance and response times",
    icon: PieChart,
    fields: ["Response Time", "Success Rate", "Error Rate", "Memory Usage"],
  },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>("usage");
  const [dateRange, setDateRange] = useState<string>("7d");
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [exportFormat, setExportFormat] = useState<string>("csv");

  const currentReport = AVAILABLE_REPORTS.find((r) => r.id === selectedReport);

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleExport = () => {
    const activeFields = Object.entries(selectedFields)
      .filter(([_, enabled]) => enabled)
      .map(([field]) => field);

    if (activeFields.length === 0) {
      toast.error("Please select at least one field to export");
      return;
    }

    toast.success(`Exporting ${currentReport?.name} as ${exportFormat.toUpperCase()}`);
  };

  const handleGenerateReport = () => {
    toast.success(`Generated ${currentReport?.name} for last ${dateRange}`);
  };

  return (
    <div className="p-6 overflow-auto max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Reports</h1>
        </div>
        <p className="text-muted-foreground">
          Generate customizable reports and export your data
        </p>
      </header>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {AVAILABLE_REPORTS.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReport === report.id;
              
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                    </div>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {report.fields.slice(0, 3).map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {report.fields.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{report.fields.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {currentReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Configure {currentReport.name}
                </CardTitle>
                <CardDescription>
                  Select the data fields and time range for your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Range
                      </Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">Last 24 Hours</SelectItem>
                          <SelectItem value="7d">Last 7 Days</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                          <SelectItem value="90d">Last 90 Days</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Format
                      </Label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Data Fields</Label>
                    <div className="space-y-2">
                      {currentReport.fields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={selectedFields[field] || false}
                            onCheckedChange={() => handleFieldToggle(field)}
                          />
                          <Label htmlFor={field} className="text-sm font-normal cursor-pointer">
                            {field}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Button onClick={handleGenerateReport} className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button variant="outline" onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Set up automatic report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No scheduled reports</p>
                <p className="text-sm">Create a report and schedule it for automatic delivery</p>
                <Button variant="outline" className="mt-4">
                  Schedule New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                View and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No exports yet</p>
                <p className="text-sm">Your exported reports will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
