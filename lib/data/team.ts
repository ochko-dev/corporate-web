/** Position key under the `team.positions` namespace in messages/*.json */
export type PositionKey =
  | "ceo"
  | "fullstackDeveloper"
  | "seniorBackendDeveloper"
  | "seniorFrontendDeveloper"
  | "projectManager"
  | "dataScientist"
  | "frontendDeveloper"
  | "dataAnalyst";

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
    // lastName: "Marsh",
    positionKey: "ceo",
    initials: "A",
  },
  {
    firstName: "Munkhtsogt",
    // lastName: "Chen",
    positionKey: "fullstackDeveloper",
    initials: "M",
  },
  {
    firstName: "Saruul",
    // lastName: "Nair",
    positionKey: "seniorBackendDeveloper",
    initials: "S",
  },
  {
    firstName: "Mirgalim",
    // lastName: "Alvarez",
    positionKey: "seniorFrontendDeveloper",
    initials: "M",
  },
  {
    firstName: "Odmaa",
    // lastName: "Kowalski",
    positionKey: "projectManager",
    initials: "O",
  },
  {
    firstName: "Hongorzul",
    // lastName: "Okafor",
    positionKey: "dataScientist",
    initials: "H",
  },
  {
    firstName: "Ochbadrakh",
    // lastName: "Suzuki",
    positionKey: "frontendDeveloper",
    initials: "O",
  },
  {
    firstName: "Uskhbayar",
    // lastName: "O'Connor",
    positionKey: "frontendDeveloper",
    initials: "U",
  },
    {
    firstName: "Nymbayar",
    // lastName: "O'Connor",
    positionKey: "dataAnalyst",
    initials: "N",
  },
    {
    firstName: "Tumendembereljaw",
    // lastName: "O'Connor",
    positionKey: "dataAnalyst",
    initials: "T",
  },
];
