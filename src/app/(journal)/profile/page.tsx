import { ChangePasswordForm, SignOutOthersButton } from "@/components/auth/PasswordForms";
import { requirePageUser } from "@/lib/auth/guards";
import { Container, PageHero, Section, Tag } from "@/components/site/primitives";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requirePageUser("/profile");
  return (
    <>
      <PageHero
        eyebrow="Member profile"
        title={user.name}
        lede="Your account and access details are managed securely by Life Sutra Synthesis."
      />
      <Section>
        <Container className="max-w-3xl">
          <div className="rounded-md border border-border bg-card p-7 sm:p-8">
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Email
                </dt>
                <dd className="mt-2 text-sm">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Roles
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Tag key={role} tone="gold">
                      {role.replaceAll("_", " ")}
                    </Tag>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="mt-8 border-t border-rule pt-6">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Granted permissions
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <Tag key={permission} tone="leaf">
                    {permission}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="mt-8 grid gap-8 border-t border-rule pt-6 md:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Change password
                </p>
                <ChangePasswordForm />
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Sessions
                </p>
                <SignOutOthersButton />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
