export interface User {
    userID: string;
    name: string;
    email: string;
}

export interface RequirementInput {
    requirementID: string;
    description: string;
}

export interface SRS_Document {
    title: string;
    functionalRequirements: string;
    nonFunctionalRequirements: string;
}

export interface EvaluationResult {
    completenessScore?: number;
    consistencyScore?: number;
    evaluationText: string;
}
