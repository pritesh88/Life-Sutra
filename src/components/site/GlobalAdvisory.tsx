import { ExternalLink } from "lucide-react";
import { Card, Container, Section, SectionHeading, Tag } from "@/components/site/primitives";

export type GlobalAdvisoryMember = {
  id: string;
  name: string;
  designation: string;
  organization: string;
  department: string;
  address: string;
  email?: string;
  country: string;
  qualification: string;
  expertise: string;
  profileUrl?: string;
};

export const globalAdvisory: GlobalAdvisoryMember[] = [
  {
    id: "nitin-mali",
    name: "Dr. Nitin Chandrakant Mali",
    designation: "I/C Director",
    organization: "Shivaji University, Kolhapur",
    department: "Yashwantrao Chavan School of Rural Development",
    address: "Vidya Nagar, Shivaji University, Kolhapur, Maharashtra, India",
    email: "ycsrd@unishivaji.ac",
    country: "India",
    qualification: "PhD",
    expertise: "Marketing",
    profileUrl: "https://www.unishivaji.ac.in",
  },
  {
    id: "acharya-sri-shivam",
    name: "Acharya Sri Shivam",
    designation: "Dean",
    organization: "MIT Group of Institutions",
    department: "World Peace Dome",
    address: "Paid Road, MIT",
    country: "India",
    qualification:
      "Bachelor’s degree, alongside extensive independent study and work in spirituality, consciousness, meditation and human development",
    expertise: "Spiritual Science",
  },
  {
    id: "somnath-mane",
    name: "Dr. Somnath Hanumant Mane",
    designation: "Chief Scientist",
    organization: "Mahatma Phule Agriculture University, Rahuri, Ahilyanagar, Maharashtra, India",
    department: "Ajitdada Pawar Indigenous Cattle Research cum Training Center",
    address: "Division of Animal Husbandry and Dairy Science, College of Agriculture, Pune",
    email: "apicrtcacp@gmail.com",
    country: "India",
    qualification: "PhD",
    expertise: "Animal Husbandry",
  },
  {
    id: "asmita-gargote",
    name: "Dr. Asmita Gargote",
    designation: "Joint Director (HRD)",
    organization: "Centre for Development of Advanced Computing (C-DAC)",
    department: "Management",
    address: "C-DAC, Mumbai",
    email: "asmitag@cdac.in",
    country: "India",
    qualification: "PhD",
    expertise: "Human Resource Management",
  },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed">
      <span className="font-semibold text-ink">{label}: </span>
      <span className="text-muted-foreground">{value}</span>
    </p>
  );
}

export function GlobalAdvisoryCard({ member }: { member: GlobalAdvisoryMember }) {
  return (
    <Card as="li" className="p-6">
      <div className="text-center">
        <Tag tone="gold">{member.expertise}</Tag>
        <h3 className="mt-3 font-display text-xl leading-snug text-ink">{member.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{member.designation}</p>
      </div>

      <div className="mt-4 grid gap-2 border-t border-rule pt-4">
        <Field label="Institution" value={member.organization} />
        <Field label="Department" value={member.department} />
        <Field label="Address" value={member.address} />
        {member.email ? <Field label="Institutional Email" value={member.email} /> : null}
        <Field label="Country" value={member.country} />
        <Field label="Highest Qualification" value={member.qualification} />
      </div>

      {member.profileUrl ? (
        <div className="mt-4 border-t border-rule pt-4">
          <a
            href={member.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Institutional Profile
          </a>
        </div>
      ) : null}
    </Card>
  );
}

export function GlobalAdvisory() {
  return (
    <Section id="global-advisory">
      <Container>
        <SectionHeading
          eyebrow="Advisory"
          title="Global Advisory"
          description="Scholars and practitioners who guide the journal's direction across disciplines."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {globalAdvisory.map((member) => (
            <GlobalAdvisoryCard key={member.id} member={member} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export default GlobalAdvisory;
