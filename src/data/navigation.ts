import { journalPath } from "@/lib/routes";

export type NavItem = {
  label: string;
  to: string;
  description?: string;
  comingSoon?: boolean;
};

export const primaryNav: NavItem[] = [
  {
    label: "About",
    to: journalPath("/about"),
    description: "Mission, editorial standards, governance",
  },
  {
    label: "Research Publications",
    to: journalPath("/research"),
    description: "Peer-reviewed papers and journal issues",
  },
  {
    label: "Archive",
    to: journalPath("/archive"),
    description: "All volumes, issues and articles",
  },
  {
    label: "Abstracts",
    to: journalPath("/research-abstracts"),
    description: "Indexed abstracts across domains",
    comingSoon: true,
  },
  {
    label: "Conferences",
    to: journalPath("/conferences"),
    description: "Calls for papers, symposia, colloquia",
    comingSoon: true,
  },
  {
    label: "IKS Dialogue",
    to: journalPath("/iks-dialogue"),
    description: "Scholarly commentary and debate",
    comingSoon: true,
  },
  {
    label: "White Papers",
    to: journalPath("/white-papers"),
    description: "Policy and framework documents",
    comingSoon: true,
  },
  {
    label: "Opportunities",
    to: journalPath("/research-opportunities"),
    description: "Fellowships, grants, calls",
    comingSoon: true,
  },
  {
    label: "Methodology",
    to: journalPath("/methodology"),
    description: "Research frameworks and protocols",
    comingSoon: true,
  },
  {
    label: "Institutions",
    to: journalPath("/institutions"),
    description: "Partner universities and centres",
    comingSoon: true,
  },
  {
    label: "Impact",
    to: journalPath("/research-impact"),
    description: "Observatory and indicators",
  },
];

export const actionNav: NavItem[] = [
  { label: "Submit Research", to: "/submit-research" },
  { label: "Upgrade", to: "/membership" },
];

export const footerGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Journal",
    items: [
      { label: "Journal Home", to: journalPath() },
      { label: "About Life Sutra Synthesis", to: journalPath("/about") },
      { label: "Research Publications", to: journalPath("/research") },
      { label: "Archive", to: journalPath("/archive") },
      { label: "Research Abstracts", to: journalPath("/research-abstracts") },
      { label: "White Papers", to: journalPath("/white-papers") },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "IKS Dialogue", to: journalPath("/iks-dialogue") },
      { label: "Researchers", to: journalPath("/researchers") },
      { label: "Institutions", to: journalPath("/institutions") },
      { label: "Conferences", to: journalPath("/conferences") },
      { label: "Upgrade", to: "/membership" },
    ],
  },
  {
    title: "Contribute",
    items: [
      { label: "Submit Research", to: "/submit-research" },
      { label: "Research Opportunities", to: journalPath("/research-opportunities") },
      { label: "Methodology", to: journalPath("/methodology") },
      { label: "Research Impact", to: journalPath("/research-impact") },
    ],
  },
];
