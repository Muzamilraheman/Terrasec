// src/ai/flows/terraform-security-analysis.ts
'use server';
/**
 * @fileOverview Analyzes Terraform files for security vulnerabilities and generates a report.
 *
 * - terraformSecurityAnalysis - A function that analyzes Terraform code and returns a security report.
 * - TerraformSecurityAnalysisInput - The input type for the terraformSecurityAnalysis function.
 * - TerraformSecurityAnalysisOutput - The return type for the terraformSecurityAnalysis function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TerraformSecurityAnalysisInputSchema = z.object({
  terraformFile: z.string().describe('The Terraform file content to analyze.'),
});
export type TerraformSecurityAnalysisInput = z.infer<typeof TerraformSecurityAnalysisInputSchema>;

const TerraformSecurityAnalysisOutputSchema = z.object({
  report: z.string().describe('A detailed security analysis report of the Terraform file.'),
});
export type TerraformSecurityAnalysisOutput = z.infer<typeof TerraformSecurityAnalysisOutputSchema>;

export async function terraformSecurityAnalysis(input: TerraformSecurityAnalysisInput): Promise<TerraformSecurityAnalysisOutput> {
  return terraformSecurityAnalysisFlow(input);
}

const terraformSecurityAnalysisPrompt = ai.definePrompt({
  name: 'terraformSecurityAnalysisPrompt',
  input: {
    schema: z.object({
      terraformFile: z.string().describe('The Terraform file content to analyze.'),
    }),
  },
  output: {
    schema: z.object({
      report: z.string().describe('A detailed security analysis report of the Terraform file, including identified vulnerabilities, risk scores, and remediation recommendations.'),
    }),
  },
  prompt: `You are a security expert specializing in Terraform security.

You will analyze the given Terraform file for potential security vulnerabilities, misconfigurations, and risks based on cloud security best practices. Generate a detailed report including identified vulnerabilities, risk scores, and remediation recommendations.

Terraform File:
{{{terraformFile}}}
`,
});

const terraformSecurityAnalysisFlow = ai.defineFlow<
  typeof TerraformSecurityAnalysisInputSchema,
  typeof TerraformSecurityAnalysisOutputSchema
>({
  name: 'terraformSecurityAnalysisFlow',
  inputSchema: TerraformSecurityAnalysisInputSchema,
  outputSchema: TerraformSecurityAnalysisOutputSchema,
}, async input => {
  const {output} = await terraformSecurityAnalysisPrompt(input);
  return output!;
});
