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
  | "researchSpecialist";

export interface TeamMember {
  firstName: string;
  lastName?: string;
  surname?: string;
  positionKey: PositionKey;
  image?: string;
  initials: string;
}

export const team: TeamMember[] = [
  {
    firstName: "Anujin",
    lastName: "TumenBaatar",
    positionKey: "ceo",
    initials: "A",
  },
  {
    firstName: "Munkhtsogt",
    lastName: "Tsogbadrakh",
    positionKey: "fullstackDeveloper",
    initials: "M",
  },
  {
    firstName: "Saruul",
    lastName: "Ganbold",
    positionKey: "seniorBackendDeveloper",
    initials: "S",
  },
  {
    firstName: "Mirgalim",
    lastName: "Aspirant",
    positionKey: "seniorFrontendDeveloper",
    initials: "M",
  },
  {
    firstName: "Odmaa",
    lastName: "Boldbayar",
    positionKey: "projectManager",
    initials: "O",
  },
  {
    firstName: "Khongorzul",
    lastName: "Baatar",
    positionKey: "systemAnalyst",
    initials: "H",
  },
  {
    firstName: "Ochbadrakh",
    lastName: "Oyunbadrakh",
    positionKey: "frontendDeveloper",
    initials: "O",
  },
  {
    firstName: "Uskhbayar",
    lastName: "Batbayar",
    positionKey: "frontendDeveloper",
    initials: "U",
  },
  {
    firstName: "Nymbayar",
    lastName: "Batbayar",
    positionKey: "dataAnalyst",
    initials: "N",
  },
  {
    firstName: "Tumendelgerjav",
    lastName: "Batsukh",
    positionKey: "researchSpecialist",
    initials: "T",
  },
];
