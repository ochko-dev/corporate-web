/** Position key under the `team.positions` namespace in messages/*.json */
export type PositionKey =
  | "ceo"
  | "fullstackDeveloper"
  | "seniorBackendDeveloper"
  | "seniorFrontendDeveloper"
  | "projectManager"
  | "frontendDeveloper"
  | "dataAnalyst"
  | "systemAnalyst"
  | "researchSpecialist"
  | "HeadofAI"
  | "DataScientist";

/** Member key under the `team.names` namespace in messages/*.json */
export type TeamMemberId =
  | "anujin"
  | "tuguldur"
  | "munkhtsogt"
  | "saruul"
  | "mirgalim"
  | "ochbadrakh"
  | "usukhbayar"
  | "odmaa"
  | "khongorzul"
  | "gerel"
  | "nymbayar"
  | "tumendelgerjav";

export interface TeamMember {
  id: TeamMemberId;
  positionKey: PositionKey;

}

export const team: TeamMember[] = [
  {
    id: "anujin",
    positionKey: "ceo",
    
    
  },
  {
    id: "tuguldur",
    positionKey: "HeadofAI",
   
    
  },
  {
    id: "munkhtsogt",
    positionKey: "fullstackDeveloper",
 
  },
  {
    id: "saruul",
    positionKey: "seniorBackendDeveloper",
 
  },
  {
    id: "mirgalim",
    positionKey: "seniorFrontendDeveloper",
   
  },
  {
    id: "ochbadrakh",
    positionKey: "frontendDeveloper",
  
  },
  {
    id: "usukhbayar",
    positionKey: "frontendDeveloper",

  },
  {
    id: "odmaa",
    positionKey: "projectManager",
   
  },
    {
    id: "nymbayar",
    positionKey: "dataAnalyst",

  },
  {
    id: "tumendelgerjav",
    positionKey: "researchSpecialist",
   
  },
  {
    id: "khongorzul",
    positionKey: "systemAnalyst",
 
  },
  {
    id: "gerel",
    positionKey: "DataScientist",
  
  },

];
