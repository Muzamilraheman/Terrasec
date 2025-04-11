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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Vulnerability {
  id: string;
  description: string;
  risk: 'High' | 'Medium' | 'Low';
  recommendation: string;
}

function extractVulnerabilities(report: string): Vulnerability[] {
  const vulnerabilityRegex = /Vulnerability ID: (.*?)\nDescription: (.*?)\nRisk: (.*?)\nRecommendation: (.*?)(?=\nVulnerability ID:|\n---|$)/gs;
  let match;
  const vulnerabilities: Vulnerability[] = [];

  while ((match = vulnerabilityRegex.exec(report)) !== null) {
    const [, id, description, risk, recommendation] = match;
    vulnerabilities.push({
      id: id.trim(),
      description: description.trim(),
      risk: risk.trim() as 'High' | 'Medium' | 'Low',
      recommendation: recommendation.trim(),
    });
  }

  return vulnerabilities;
}


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

  const vulnerabilities = securityReport ? extractVulnerabilities(securityReport) : [];

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
            <Accordion type="multiple" collapsible>
              {vulnerabilities.map((vuln) => (
                <AccordionItem key={vuln.id} value={vuln.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full">
                      {vuln.id} - {vuln.description.substring(0, 50)}...
                      {vuln.risk === 'High' && (
                        <AlertTitle className="text-destructive">High Risk</AlertTitle>
                      )}
                      {vuln.risk === 'Medium' && (
                        <AlertTitle className="text-amber-500">Medium Risk</AlertTitle>
                      )}
                      {vuln.risk === 'Low' && (
                        <AlertTitle className="text-green-500">Low Risk</AlertTitle>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Alert className="mb-4" variant={vuln.risk === 'High' ? 'destructive' : vuln.risk === 'Medium' ? 'default' : 'default'}>
                      {vuln.risk === 'High' ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      <AlertTitle>{vuln.risk} Risk: {vuln.description}</AlertTitle>
                      <AlertDescription>
                        Recommendation: {vuln.recommendation}
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <ScrollArea className="h-[400px] w-full">
              {vulnerabilities.length === 0 && (
                <p className="whitespace-pre-line">{securityReport}</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
