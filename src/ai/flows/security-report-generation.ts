'use server';

/**
 * @fileOverview Generates a detailed security report based on the analysis of Terraform code.
 *
 * - generateSecurityReport - A function that generates the security report.
 * - GenerateSecurityReportInput - The input type for the generateSecurityReport function.
 * - GenerateSecurityReportOutput - The return type for the generateSecurityReport function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateSecurityReportInputSchema = z.object({
  analysisResults: z.string().describe('The analysis results of the Terraform code.'),
});
export type GenerateSecurityReportInput = z.infer<typeof GenerateSecurityReportInputSchema>;

const GenerateSecurityReportOutputSchema = z.object({
  report: z.string().describe('A detailed security report including identified vulnerabilities, risk scores, and remediation recommendations.'),
});
export type GenerateSecurityReportOutput = z.infer<typeof GenerateSecurityReportOutputSchema>;

export async function generateSecurityReport(input: GenerateSecurityReportInput): Promise<GenerateSecurityReportOutput> {
  return generateSecurityReportFlow(input);
}

const generateSecurityReportPrompt = ai.definePrompt({
  name: 'generateSecurityReportPrompt',
  input: {
    schema: z.object({
      analysisResults: z.string().describe('The analysis results of the Terraform code.'),
    }),
  },
  output: {
    schema: z.object({
      report: z.string().describe('A detailed security report including identified vulnerabilities, risk scores, and remediation recommendations.'),
    }),
  },
  prompt: `Based on the following security analysis results of a Terraform configuration, generate a comprehensive security report in a well-structured and organized markdown format. The report should include a summary of identified vulnerabilities, a risk score for each vulnerability (High, Medium, Low), and specific, actionable remediation recommendations for each identified issue. Separate security issues from architecture feedback using distinct markdown sections.
  
Analysis Results: {{{analysisResults}}}
  
Report:`,
});

const generateSecurityReportFlow = ai.defineFlow<
  typeof GenerateSecurityReportInputSchema,
  typeof GenerateSecurityReportOutputSchema
>({
  name: 'generateSecurityReportFlow',
  inputSchema: GenerateSecurityReportInputSchema,
  outputSchema: GenerateSecurityReportOutputSchema,
},
async input => {
  const {output} = await generateSecurityReportPrompt(input);
  return output!;
});
