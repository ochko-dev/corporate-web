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
    initials: "A",
  },
  {
    id: "tuguldur",
    positionKey: "HeadofAI",
    initials: "M",
  },
  {
    id: "munkhtsogt",
    positionKey: "fullstackDeveloper",
    initials: "M",
  },
  {
    id: "saruul",
    positionKey: "seniorBackendDeveloper",
    initials: "S",
  },
  {
    id: "mirgalim",
    positionKey: "seniorFrontendDeveloper",
    initials: "M",
  },
  {
    id: "ochbadrakh",
    positionKey: "frontendDeveloper",
    initials: "O",
  },
  {
    id: "usukhbayar",
    positionKey: "frontendDeveloper",
    initials: "U",
  },
  {
    id: "odmaa",
    positionKey: "projectManager",
    initials: "O",
  },
  {
    id: "khongorzul",
    positionKey: "systemAnalyst",
    initials: "H",
  },
  {
    id: "gerel",
    positionKey: "DataScientist",
    initials: "H",
  },
  {
    id: "nymbayar",
    positionKey: "dataAnalyst",
    initials: "N",
  },
  {
    id: "tumendelgerjav",
    positionKey: "researchSpecialist",
    initials: "T",
  },
];
