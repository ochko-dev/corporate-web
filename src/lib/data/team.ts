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
  image?: string;
  initials: string;
}

export const team: TeamMember[] = [
  {
    id: "anujin",
    positionKey: "ceo",
    image: "https://i.pravatar.cc/400?img=47",
    initials: "A",
  },
  {
    id: "tuguldur",
    positionKey: "HeadofAI",
    image: "https://i.pravatar.cc/400?img=3",
    initials: "M",
  },
  {
    id: "munkhtsogt",
    positionKey: "fullstackDeveloper",
    image: "https://i.pravatar.cc/400?img=8",
    initials: "M",
  },
  {
    id: "saruul",
    positionKey: "seniorBackendDeveloper",
    image: "https://i.pravatar.cc/400?img=12",
    initials: "S",
  },
  {
    id: "mirgalim",
    positionKey: "seniorFrontendDeveloper",
    image: "https://i.pravatar.cc/400?img=15",
    initials: "M",
  },
  {
    id: "ochbadrakh",
    positionKey: "frontendDeveloper",
    image: "https://i.pravatar.cc/400?img=62",
    
    initials: "O",
  },
  {
    id: "usukhbayar",
    positionKey: "frontendDeveloper",
    
     image: "https://i.pravatar.cc/400?img=55",
    initials: "U",
  },
  {
    id: "odmaa",
    positionKey: "projectManager",
    image: "https://i.pravatar.cc/400?img=32",
    initials: "O",
  },
    {
    id: "nymbayar",
    positionKey: "dataAnalyst",
    image: "https://i.pravatar.cc/400?img=50",
    initials: "N",
  },
  {
    id: "tumendelgerjav",
    positionKey: "researchSpecialist",
    image: "https://i.pravatar.cc/400?img=52",
    initials: "T",
  },
  {
    id: "khongorzul",
    positionKey: "systemAnalyst",
   image: "https://i.pravatar.cc/400?img=26",
    initials: "H",
  },
  {
    id: "gerel",
    positionKey: "DataScientist",
   image: "https://i.pravatar.cc/400?img=21",
    initials: "H",
  },

];
