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

You will analyze the given Terraform file for potential security vulnerabilities, misconfigurations, and risks based on cloud security best practices. Generate a detailed report in a well-structured and organized markdown format, making it easy to understand.

The report should contain two main sections:

1.  **Security Issues**: This section should list identified security vulnerabilities, misconfigurations, and risks. Each issue should include:
    *   A descriptive title
    *   A risk score (High, Medium, Low)
    *   A detailed explanation of the vulnerability
    *   Specific and actionable remediation recommendations

2.  **Architecture Feedback**: This section should provide feedback on the overall architecture defined in the Terraform file, focusing on resilience, fault tolerance, and scalability. It should include:
    *   Identified architectural weaknesses
    *   Suggestions for improvement

Separate security issues from architecture feedback using distinct markdown sections.

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
