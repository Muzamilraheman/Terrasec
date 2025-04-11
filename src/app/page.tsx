"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSecurityReport } from "@/ai/flows/security-report-generation";
import { terraformSecurityAnalysis } from "@/ai/flows/terraform-security-analysis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, CheckCircle } from "lucide-react";
import { FileUpload } from "@/components/file-upload";

export default function Home() {
  const [terraformCode, setTerraformCode] = useState<string>("");
  const [securityReport, setSecurityReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((content: string) => {
    setTerraformCode(content);
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setSecurityReport("");

    try {
      const analysisResult = await terraformSecurityAnalysis({ terraformFile: terraformCode });
      const report = await generateSecurityReport({ analysisResults: analysisResult.report });
      setSecurityReport(report.report);
    } catch (e: any) {
      setError(e.message || "An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-secondary p-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">TerraSec Advisor</h1>

      <Card className="w-full max-w-4xl mb-4">
        <CardHeader>
          <CardTitle>Terraform Code Input</CardTitle>
          <CardDescription>Enter your Terraform code for security analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onFileChange={handleFileChange} />
          <Textarea
            placeholder="Or paste your Terraform code here..."
            className="mb-2"
            value={terraformCode}
            onChange={(e) => setTerraformCode(e.target.value)}
          />
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="w-full max-w-4xl mb-4">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {securityReport && (
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Security Analysis Report</CardTitle>
            <CardDescription>Detailed security analysis report of your Terraform code.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <ScrollArea className="h-[400px] w-full">
              <p className="whitespace-pre-line">{securityReport}</p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
