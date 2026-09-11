export type NavItem = { label: string; to: string; description?: string };

export const primaryNav: NavItem[] = [
  { label: "About", to: "/about", description: "Mission, editorial standards, governance" },
  { label: "Research", to: "/research", description: "Peer-reviewed papers and journal issues" },
  { label: "Abstracts", to: "/research-abstracts", description: "Indexed abstracts across domains" },
  { label: "Conferences", to: "/conferences", description: "Calls for papers, symposia, colloquia" },
  { label: "IKS Dialogue", to: "/iks-dialogue", description: "Scholarly commentary and debate" },
  { label: "White Papers", to: "/white-papers", description: "Policy and framework documents" },
  { label: "Opportunities", to: "/research-opportunities", description: "Fellowships, grants, calls" },
  { label: "Methodology", to: "/methodology", description: "Research frameworks and protocols" },
  { label: "Researchers", to: "/researchers", description: "Contributing scholars" },
  { label: "Institutions", to: "/institutions", description: "Partner universities and centres" },
  { label: "Impact", to: "/research-impact", description: "Observatory and indicators" },
];

export const actionNav: NavItem[] = [
  { label: "Submit Research", to: "/submit-research" },
  { label: "Membership", to: "/membership" },
];

export const footerGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Journal",
    items: [
      { label: "Home", to: "/" },
      { label: "About Life Sutra", to: "/about" },
      { label: "Research Papers", to: "/research" },
      { label: "Research Abstracts", to: "/research-abstracts" },
      { label: "White Papers", to: "/white-papers" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "IKS Dialogue", to: "/iks-dialogue" },
      { label: "Researchers", to: "/researchers" },
      { label: "Institutions", to: "/institutions" },
      { label: "Conferences", to: "/conferences" },
      { label: "Membership", to: "/membership" },
    ],
  },
  {
    title: "Contribute",
    items: [
      { label: "Submit Research", to: "/submit-research" },
      { label: "Research Opportunities", to: "/research-opportunities" },
      { label: "Methodology", to: "/methodology" },
      { label: "Research Impact", to: "/research-impact" },
    ],
  },
];
