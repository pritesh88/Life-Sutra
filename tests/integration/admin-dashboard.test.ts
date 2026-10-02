import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { ADMIN_SECTIONS, visibleSections } from "../../src/lib/admin/sections";
import {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  splitPermission,
  type Permission,
  type RoleCode,
} from "../../src/lib/auth/rbac/catalog";
import { PASSWORD, createUser, db, signedIn } from "../helpers/db";
import { Client } from "../helpers/http";

after(() => db.$disconnect());

type Person = Awaited<ReturnType<typeof signedIn>>;

const ABSTRACT =
  "A manuscript submitted to exercise the administrative dashboard's queues, counts and lists.";

/** Temporarily removes a permission from a role (permissions are read per request), then restores it. */
async function withoutPermission(role: RoleCode, permission: Permission, run: () => Promise<void>) {
  const roleRow = await db.role.findUniqueOrThrow({ where: { code: role } });
  const permissionRow = await db.permission.findUniqueOrThrow({
    where: { resource_action: splitPermission(permission) },
  });
  const key = { roleId: roleRow.id, permissionId: permissionRow.id };
  await db.rolePermission.delete({ where: { roleId_permissionId: key } });
  try {
    await run();
  } finally {
    await db.rolePermission.create({ data: key });
  }
}

const kpis = async (person: Person) => (await person.client.get("/api/admin/dashboard")).body.kpis;

async function submitArticle(author: Person, title: string) {
  const created = await author.client.post("/api/articles", { title, abstract: ABSTRACT });
  assert.equal(created.status, 201);
  const id: string = created.body.article.id;
  assert.equal((await author.client.post(`/api/articles/${id}/submit`)).status, 200);
  return id;
}

async function reviewFor(reviewer: Person, assignmentId: string) {
  const res = await reviewer.client.post(`/api/reviews/${assignmentId}`, {
    recommendation: "ACCEPT",
    commentsToAuthor: "A careful, well-argued piece; the framework is clearly stated.",
    commentsToEditor: "Recommend acceptance.",
  });
  assert.equal(res.status, 201);
}

let superAdmin: Person, journalAdmin: Person, supportAdmin: Person;
let editor: Person, manager: Person, reader: Person, author: Person;
let reviewer1: Person, reviewer2: Person;
let art1: string, art2: string;
let assignment1: string, assignment2: string;

before(async () => {
  superAdmin = await signedIn(["SUPER_ADMIN"], { name: "Sabina Overseer" });
  journalAdmin = await signedIn(["JOURNAL_ADMIN"], { name: "Jasper Ledgerwood" });
  supportAdmin = await signedIn(["SUPPORT_ADMIN"], { name: "Sunita Helpdesk" });
  editor = await signedIn(["EDITOR"], { name: "Edith Ledger" });
  manager = await signedIn(["REVIEWER_MANAGER"], { name: "Mortimer Coordinator" });
  reader = await signedIn(["READER"], { name: "Rowan Reader" });
  author = await signedIn(["AUTHOR"], { name: "Aurelia Vantongeren" });
  reviewer1 = await signedIn(["REVIEWER"], { name: "Rosalind Fairbairn" });
  reviewer2 = await signedIn(["REVIEWER"], { name: "Ptolemy Hargreaves" });
});

describe("section configuration (single source of truth)", () => {
  it("every section is unlocked by a permission that exists, and nothing else gates the dashboard", () => {
    for (const section of ADMIN_SECTIONS) {
      assert.ok(section.permissions.length > 0, section.key);
      for (const permission of section.permissions) assert.ok(PERMISSIONS.includes(permission));
    }
  });

  it("navigation is derived from permissions, never from role names", () => {
    const labels = (role: RoleCode) =>
      visibleSections({ permissions: [...ROLE_PERMISSIONS[role]] }).map((s) => s.key);
    assert.deepEqual(labels("READER"), []);
    assert.deepEqual(
      labels("RESEARCH_ADMIN"),
      [],
      "roles with no dashboard-backed permission see nothing",
    );
    assert.deepEqual(labels("EDITOR"), ["overview", "submissions", "reviews", "articles"]);
    assert.deepEqual(labels("SUPPORT_ADMIN"), ["overview", "users", "roles"]);
    assert.equal(labels("SUPER_ADMIN").length, ADMIN_SECTIONS.length);
  });
});

describe("dashboard API authorization", () => {
  const endpoints = [
    "/api/admin/dashboard",
    "/api/admin/submissions",
    "/api/admin/reviews",
    "/api/admin/users",
    "/api/admin/roles",
    "/api/admin/audit-logs",
  ];

  it("returns 401 to anonymous callers on every dashboard endpoint", async () => {
    for (const path of endpoints) assert.equal((await new Client().get(path)).status, 401, path);
  });

  it("applies the existing permissions per role (matrix)", async () => {
    const expectations: [string, RoleCode, number][] = [
      ["/api/admin/dashboard", "SUPER_ADMIN", 200],
      ["/api/admin/dashboard", "JOURNAL_ADMIN", 200],
      ["/api/admin/dashboard", "EDITOR", 200],
      ["/api/admin/dashboard", "REVIEWER_MANAGER", 200],
      ["/api/admin/dashboard", "SUPPORT_ADMIN", 200],
      ["/api/admin/dashboard", "READER", 403],
      ["/api/admin/dashboard", "AUTHOR", 403],
      ["/api/admin/dashboard", "REVIEWER", 403],
      ["/api/admin/dashboard", "RESEARCH_ADMIN", 403],
      ["/api/admin/dashboard", "CONTENT_EDITOR", 403],
      ["/api/admin/submissions", "EDITOR", 200],
      ["/api/admin/submissions", "REVIEWER_MANAGER", 200],
      ["/api/admin/submissions", "JOURNAL_ADMIN", 200],
      ["/api/admin/submissions", "SUPPORT_ADMIN", 403],
      ["/api/admin/submissions", "AUTHOR", 403],
      ["/api/admin/submissions?scope=articles", "SUPPORT_ADMIN", 403],
      ["/api/admin/reviews", "EDITOR", 200],
      ["/api/admin/reviews", "REVIEWER_MANAGER", 200],
      ["/api/admin/reviews", "REVIEWER", 403],
      ["/api/admin/reviews", "SUPPORT_ADMIN", 403],
      ["/api/admin/users", "SUPPORT_ADMIN", 200],
      ["/api/admin/users", "JOURNAL_ADMIN", 200],
      ["/api/admin/users", "EDITOR", 403],
      ["/api/admin/roles", "SUPPORT_ADMIN", 200],
      ["/api/admin/roles", "EDITOR", 403],
      ["/api/admin/audit-logs", "JOURNAL_ADMIN", 200],
      ["/api/admin/audit-logs", "SUPPORT_ADMIN", 403],
      ["/api/admin/audit-logs", "EDITOR", 403],
    ];
    const clients = new Map<RoleCode, Client>();
    for (const [path, role, expected] of expectations) {
      if (!clients.has(role)) clients.set(role, (await signedIn([role])).client);
      assert.equal((await clients.get(role)!.get(path)).status, expected, `${role} ${path}`);
    }
  });

  it("the new dashboard endpoints are read-only", async () => {
    for (const path of ["/api/admin/dashboard", "/api/admin/submissions", "/api/admin/reviews"]) {
      for (const method of ["post", "put", "patch", "delete"] as const)
        assert.equal((await superAdmin.client[method](path, {})).status, 405, `${method} ${path}`);
    }
  });

  it("rejects malformed query parameters instead of passing them to the database", async () => {
    for (const path of [
      "/api/admin/submissions?limit=0",
      "/api/admin/submissions?limit=1000",
      "/api/admin/submissions?scope=everything",
      "/api/admin/submissions?status=NOPE",
      "/api/admin/submissions?queue=nope",
      "/api/admin/submissions?order=sideways",
      "/api/admin/submissions?cursor=a'%20OR%201=1--",
      "/api/admin/reviews?status=DRAFT",
      "/api/admin/users?role=GOD_MODE",
      "/api/admin/users?status=maybe",
      "/api/admin/audit-logs?from=not-a-date",
      "/api/admin/audit-logs?outcome=WHATEVER",
    ])
      assert.equal((await superAdmin.client.get(path)).status, 422, path);
  });
});

describe("KPIs: visibility", () => {
  it("returns only the KPIs a caller is entitled to — omitted, never zeroed", async () => {
    const all = [
      "newSubmissions",
      "underReview",
      "reviewsPending",
      "decisionsPending",
      "publishedArticles",
      "activeResearchers",
    ];
    const editorial = all.filter((k) => k !== "activeResearchers");
    assert.deepEqual(Object.keys(await kpis(superAdmin)).sort(), [...all].sort());
    assert.deepEqual(
      Object.keys(await kpis(journalAdmin)).sort(),
      [...editorial, "activeResearchers"].sort(),
    );
    assert.deepEqual(Object.keys(await kpis(editor)).sort(), [...editorial].sort());
    assert.deepEqual(Object.keys(await kpis(manager)).sort(), [...editorial].sort());
    assert.deepEqual(Object.keys(await kpis(supportAdmin)), ["activeResearchers"]);
  });
});

describe("KPIs: correctness against a real workflow", () => {
  const list = async (person: Person, path: string) => (await person.client.get(path)).body;

  it("moves as manuscripts move through submission, assignment, review, decision and publication", async () => {
    const base = await kpis(editor);
    const baseList = {
      awaiting: (await list(editor, "/api/admin/submissions?queue=awaiting-assignment")).total,
      inReview: (await list(editor, "/api/admin/submissions?queue=in-review")).total,
      ready: (await list(editor, "/api/admin/submissions?queue=ready-for-decision")).total,
      pending: (await list(editor, "/api/admin/reviews?status=PENDING")).total,
      published: (await list(editor, "/api/admin/submissions?scope=articles&status=PUBLISHED"))
        .total,
    };
    // Each KPI equals the size of the list it links to.
    assert.equal(base.newSubmissions.value, baseList.awaiting);
    assert.equal(base.underReview.value, baseList.inReview);
    assert.equal(base.decisionsPending.value, baseList.ready);
    assert.equal(base.reviewsPending.value, baseList.pending);
    assert.equal(base.publishedArticles.value, baseList.published);

    // 1. Two submissions and one draft: drafts are not counted.
    art1 = await submitArticle(author, "Dashboard KPI manuscript one");
    art2 = await submitArticle(author, "Dashboard KPI manuscript two");
    assert.equal(
      (
        await author.client.post("/api/articles", {
          title: "An unsubmitted draft",
          abstract: ABSTRACT,
        })
      ).status,
      201,
    );
    let now = await kpis(editor);
    assert.equal(now.newSubmissions.value, base.newSubmissions.value + 2);
    assert.equal(now.newSubmissions.submittedLast7Days, base.newSubmissions.submittedLast7Days + 2);
    assert.equal(now.underReview.value, base.underReview.value);

    // 2. Assigning two reviewers to art1 moves it from "new" to "under review".
    const a1 = await editor.client.post(`/api/editor/articles/${art1}/assignments`, {
      reviewerId: reviewer1.user.id,
    });
    const a2 = await editor.client.post(`/api/editor/articles/${art1}/assignments`, {
      reviewerId: reviewer2.user.id,
    });
    assignment1 = a1.body.assignment.assignmentId;
    assignment2 = a2.body.assignment.assignmentId;
    now = await kpis(editor);
    assert.equal(now.newSubmissions.value, base.newSubmissions.value + 1);
    assert.equal(now.underReview.value, base.underReview.value + 1);
    assert.equal(now.reviewsPending.value, base.reviewsPending.value + 2);
    assert.equal(now.decisionsPending.value, base.decisionsPending.value);

    // 3. One review in: still not ready for a decision.
    await reviewFor(reviewer1, assignment1);
    now = await kpis(editor);
    assert.equal(now.reviewsPending.value, base.reviewsPending.value + 1);
    assert.equal(now.decisionsPending.value, base.decisionsPending.value);

    // 4. Both reviews in: ready for decision.
    await reviewFor(reviewer2, assignment2);
    now = await kpis(editor);
    assert.equal(now.reviewsPending.value, base.reviewsPending.value);
    assert.equal(now.decisionsPending.value, base.decisionsPending.value + 1);
    assert.equal(
      (await list(editor, "/api/admin/submissions?queue=ready-for-decision")).total,
      baseList.ready + 1,
    );

    // 5. Acceptance takes it out of review; publication counts it.
    const decision = await editor.client.post(`/api/editor/articles/${art1}/decision`, {
      decision: "ACCEPTED",
      note: "Accepted.",
    });
    assert.equal(decision.status, 200);
    now = await kpis(editor);
    assert.equal(now.underReview.value, base.underReview.value);
    assert.equal(now.decisionsPending.value, base.decisionsPending.value);
    assert.equal(now.publishedArticles.value, base.publishedArticles.value);
    assert.equal(
      (
        await list(editor, "/api/admin/submissions?scope=articles&status=ACCEPTED")
      ).submissions.some((s: { id: string }) => s.id === art1),
      true,
    );

    assert.equal((await editor.client.post(`/api/editor/articles/${art1}/publish`)).status, 200);
    now = await kpis(editor);
    assert.equal(now.publishedArticles.value, base.publishedArticles.value + 1);
    assert.equal(
      now.publishedArticles.publishedLast30Days,
      base.publishedArticles.publishedLast30Days + 1,
    );
    assert.equal(
      (await list(editor, "/api/admin/submissions?scope=articles&status=PUBLISHED")).total,
      baseList.published + 1,
    );
  });

  it("never counts a staff member's own manuscripts in their dashboard", async () => {
    const dual = await signedIn(["EDITOR", "AUTHOR"], { name: "Ignatius Doublehat" });
    const before = await kpis(dual);
    const own = await submitArticle(dual, "A manuscript by an editor");
    const after = await kpis(dual);
    assert.equal(
      after.newSubmissions.value,
      before.newSubmissions.value,
      "own submission is excluded",
    );
    assert.equal(
      (await kpis(editor)).newSubmissions.value,
      (await list(editor, "/api/admin/submissions?queue=awaiting-assignment")).total,
    );
    const ids = (await list(dual, "/api/admin/submissions")).submissions.map(
      (s: { id: string }) => s.id,
    );
    assert.ok(!ids.includes(own));
    assert.ok(
      (await list(editor, "/api/admin/submissions")).submissions.some(
        (s: { id: string }) => s.id === own,
      ),
      "another editor still sees it",
    );
  });

  it("counts active researchers by role, account status and recent sign-in", async () => {
    const before = (await kpis(superAdmin)).activeResearchers;
    await createUser(["AUTHOR"]); // registered, never signed in
    await signedIn(["AUTHOR"]); // active
    const stale = await signedIn(["RESEARCHER"]); // researcher, but last seen 40 days ago
    await db.session.updateMany({
      where: { userId: stale.user.id },
      data: { lastSeenAt: new Date(Date.now() - 40 * 86_400_000) },
    });
    await signedIn(["READER"]); // not a researcher
    const gone = await signedIn(["AUTHOR"]);
    await db.user.update({ where: { id: gone.user.id }, data: { isActive: false } }); // deactivated

    const after = (await kpis(superAdmin)).activeResearchers;
    assert.equal(
      after.totalResearchers,
      before.totalResearchers + 3,
      "idle + recent + stale are registered researchers",
    );
    assert.equal(after.value, before.value + 1, "only the recently-seen researcher is active");
    assert.equal(after.windowDays, 30);

    // The KPI equals the list it links to.
    const linked = await list(
      superAdmin,
      "/api/admin/users?group=researchers&status=active&activity=active",
    );
    assert.equal(linked.total, after.value);
    assert.equal(
      (await list(superAdmin, "/api/admin/users?group=researchers&status=active")).total,
      after.totalResearchers,
    );
  });
});

describe("submissions and articles lists", () => {
  it("returns lightweight summaries that expose no reviewer information", async () => {
    const res = await editor.client.get("/api/admin/submissions?limit=100");
    const row = res.body.submissions.find((s: { id: string }) => s.id === art2);
    assert.deepEqual(Object.keys(row).sort(), [
      "author",
      "code",
      "decidedAt",
      "id",
      "publishedAt",
      "reviews",
      "status",
      "submittedAt",
      "title",
    ]);
    assert.deepEqual(
      Object.keys(row.author).sort(),
      ["id", "name"],
      "no author email in list rows",
    );
    assert.match(row.code, /^LS-[0-9A-F]{8}$/);
    const text = JSON.stringify(res.body);
    for (const person of [reviewer1, reviewer2]) {
      assert.equal(text.includes(person.user.id), false);
      assert.equal(text.includes(person.user.email), false);
      assert.equal(text.includes(person.user.name), false);
    }
    assert.equal(text.includes("passwordHash"), false);
  });

  it("separates the review pipeline from accepted/published articles, and hides drafts", async () => {
    const submissions = (await editor.client.get("/api/admin/submissions?limit=100")).body
      .submissions;
    const articles = (await editor.client.get("/api/admin/submissions?scope=articles&limit=100"))
      .body.submissions;
    assert.ok(
      submissions.every((s: { status: string }) =>
        ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "REJECTED"].includes(s.status),
      ),
    );
    assert.ok(
      articles.every((s: { status: string }) => ["ACCEPTED", "PUBLISHED"].includes(s.status)),
    );
    assert.ok(articles.some((s: { id: string }) => s.id === art1));
    assert.ok(!submissions.some((s: { id: string }) => s.id === art1));
    const drafts = await db.article.findMany({ where: { status: "DRAFT" }, select: { id: true } });
    const seen = new Set([...submissions, ...articles].map((s: { id: string }) => s.id));
    for (const draft of drafts) assert.ok(!seen.has(draft.id), "a draft leaked into the dashboard");
    // A status outside the requested scope simply matches nothing.
    assert.equal(
      (await editor.client.get("/api/admin/submissions?scope=articles&status=UNDER_REVIEW")).body
        .total,
      0,
    );
  });

  it("filters by queue, title and review counts", async () => {
    const awaiting = (
      await editor.client.get("/api/admin/submissions?queue=awaiting-assignment&limit=100")
    ).body.submissions;
    assert.ok(awaiting.some((s: { id: string }) => s.id === art2));
    assert.ok(
      awaiting.every(
        (s: { status: string; reviews: { assigned: number } }) =>
          s.status === "SUBMITTED" && s.reviews.assigned === 0,
      ),
    );
    const byTitle = (await editor.client.get("/api/admin/submissions?q=manuscript%20two")).body
      .submissions;
    assert.deepEqual(
      byTitle.map((s: { id: string }) => s.id),
      [art2],
    );
    const published = (
      await editor.client.get("/api/admin/submissions?scope=articles&status=PUBLISHED&limit=100")
    ).body.submissions;
    assert.deepEqual(published.find((s: { id: string }) => s.id === art1).reviews, {
      assigned: 2,
      submitted: 2,
    });
  });

  it("paginates with a stable cursor, honours order, and reports the total once", async () => {
    const first = (await editor.client.get("/api/admin/submissions?limit=1&order=asc")).body;
    assert.equal(first.submissions.length, 1);
    assert.ok(first.nextCursor);
    assert.ok(first.total >= 2);
    const second = (
      await editor.client.get(`/api/admin/submissions?limit=1&order=asc&cursor=${first.nextCursor}`)
    ).body;
    assert.notEqual(second.submissions[0].id, first.submissions[0].id);
    assert.equal(second.total, null, "total is only computed for the first page");
    const desc = (await editor.client.get("/api/admin/submissions?limit=1&order=desc")).body;
    assert.notEqual(
      desc.submissions[0].id,
      first.submissions[0].id,
      "ascending and descending start at opposite ends",
    );
  });
});

describe("double-anonymity is preserved by the dashboard", () => {
  it("shows author and reviewer identities to holders of review:view-identities", async () => {
    const subs = (await editor.client.get("/api/admin/submissions?scope=articles&limit=100")).body
      .submissions;
    assert.equal(subs.find((s: { id: string }) => s.id === art1).author.name, author.user.name);
    const reviews = (await editor.client.get("/api/admin/reviews?limit=100")).body.reviews;
    const mine = reviews.filter((r: { article: { id: string } }) => r.article.id === art1);
    assert.deepEqual(
      mine.map((r: { reviewer: { name: string } }) => r.reviewer.name).sort(),
      [reviewer1.user.name, reviewer2.user.name].sort(),
    );
    assert.deepEqual(Object.keys(mine[0]).sort(), [
      "article",
      "assignedAt",
      "assignmentId",
      "label",
      "recommendation",
      "reviewer",
      "status",
      "submittedAt",
    ]);
    assert.deepEqual(Object.keys(mine[0].reviewer).sort(), ["id", "name"]);
  });

  it("without that permission, lists carry no identities and name search is not an oracle", async () => {
    await withoutPermission("EDITOR", "review:view-identities", async () => {
      const subs = await editor.client.get("/api/admin/submissions?scope=articles&limit=100");
      assert.equal(subs.status, 200);
      assert.ok(subs.body.submissions.every((s: { author: unknown }) => s.author === null));
      const reviews = await editor.client.get("/api/admin/reviews?limit=100");
      assert.ok(reviews.body.reviews.every((r: { reviewer: unknown }) => r.reviewer === null));
      const all = subs.text + reviews.text;
      for (const person of [author, reviewer1, reviewer2]) {
        assert.equal(all.includes(person.user.id), false, `${person.user.name} id leaked`);
        assert.equal(all.includes(person.user.name), false, `${person.user.name} leaked`);
      }
      // Searching by a person's name must not reveal that they are attached to a manuscript.
      assert.equal(
        (
          await editor.client.get(
            `/api/admin/submissions?scope=articles&q=${encodeURIComponent(author.user.name)}`,
          )
        ).body.total,
        0,
      );
      assert.equal(
        (await editor.client.get(`/api/admin/reviews?q=${encodeURIComponent(reviewer1.user.name)}`))
          .body.total,
        0,
      );
    });
    // …and with identity access the same searches work.
    assert.equal(
      (
        await editor.client.get(
          `/api/admin/submissions?scope=articles&q=${encodeURIComponent(author.user.name)}`,
        )
      ).body.total >= 1,
      true,
    );
    assert.equal(
      (await editor.client.get(`/api/admin/reviews?q=${encodeURIComponent(reviewer1.user.name)}`))
        .body.total >= 1,
      true,
    );
  });

  it("filters review assignments by status and never lists staff's own manuscripts", async () => {
    const submitted = (await editor.client.get("/api/admin/reviews?status=SUBMITTED&limit=100"))
      .body.reviews;
    assert.ok(
      submitted.every(
        (r: { status: string; recommendation: string | null }) =>
          r.status === "SUBMITTED" && r.recommendation === "ACCEPT",
      ),
    );
    const pending = (await editor.client.get("/api/admin/reviews?status=PENDING&limit=100")).body
      .reviews;
    assert.ok(
      pending.every(
        (r: { status: string; submittedAt: unknown }) =>
          r.status === "PENDING" && r.submittedAt === null,
      ),
    );

    // A reviewer-and-author is assigned by an editor to someone else's paper; the paper's own author never sees it.
    const dual = await signedIn(["EDITOR", "AUTHOR"]);
    const own = await submitArticle(dual, "Own paper, dual role");
    await editor.client.post(`/api/editor/articles/${own}/assignments`, {
      reviewerId: reviewer1.user.id,
    });
    const theirs = (await dual.client.get("/api/admin/reviews?limit=100")).body.reviews;
    assert.ok(!theirs.some((r: { article: { id: string } }) => r.article.id === own));
  });

  it("redacts reviewer-linking audit entries for an auditor without identity access", async () => {
    const find = async (person: Person, query: string) =>
      (await person.client.get(`/api/admin/audit-logs?limit=100&${query}`)).body;

    // With identity access the auditor sees who submitted a review and who was assigned.
    const submittedFull = (await find(journalAdmin, "event=REVIEW_SUBMITTED")).events;
    assert.ok(
      submittedFull.some(
        (e: { actor: { name: string } | null }) => e.actor?.name === reviewer1.user.name,
      ),
    );
    const assignedFull = (await find(journalAdmin, "event=REVIEW_ASSIGNED")).events;
    assert.ok(
      assignedFull.some(
        (e: { metadata: { reviewerId?: string } | null }) =>
          e.metadata?.reviewerId === reviewer1.user.id,
      ),
    );

    await withoutPermission("JOURNAL_ADMIN", "review:view-identities", async () => {
      const submitted = (await find(journalAdmin, "event=REVIEW_SUBMITTED")).events;
      assert.ok(submitted.length > 0);
      assert.ok(
        submitted.every(
          (e: { actor: unknown; actorId: unknown }) => e.actor === null && e.actorId === null,
        ),
      );
      const assigned = (await find(journalAdmin, "event=REVIEW_ASSIGNED")).events;
      assert.ok(assigned.length > 0);
      assert.ok(assigned.every((e: { metadata: unknown }) => e.metadata === null));
      // The actor filter cannot be used to find one reviewer's submissions…
      assert.equal(
        (await find(journalAdmin, `actorId=${reviewer1.user.id}&event=REVIEW_SUBMITTED`)).events
          .length,
        0,
      );
      assert.ok(
        !(await find(journalAdmin, `actorId=${reviewer1.user.id}`)).events.some(
          (e: { event: string }) => e.event === "REVIEW_SUBMITTED",
        ),
      );
      // …nor is the event type offered.
      const first = await find(journalAdmin, "");
      assert.ok(!first.eventTypes.includes("REVIEW_SUBMITTED"));
      // No entry that links a reviewer to a manuscript survives, however it is reached.
      const linking = (await find(journalAdmin, "")).events.filter((e: { event: string }) =>
        ["REVIEW_ASSIGNED", "REVIEW_SUBMITTED"].includes(e.event),
      );
      assert.equal(JSON.stringify(linking).includes(reviewer1.user.id), false);
      assert.equal(JSON.stringify(linking).includes(reviewer1.user.name), false);
    });
  });
});

describe("users, roles and audit views", () => {
  it("filters users, reports totals, and never returns credentials", async () => {
    const res = await supportAdmin.client.get("/api/admin/users?role=EDITOR&limit=100");
    assert.equal(res.status, 200);
    assert.ok(res.body.total >= 1);
    assert.ok(res.body.users.every((u: { roles: string[] }) => u.roles.includes("EDITOR")));
    assert.equal(res.text.includes("passwordHash"), false);
    assert.equal(res.text.includes("argon2"), false);

    const inactive = await createUser(["READER"], { isActive: false, name: "Dormant Dana" });
    const found = (await supportAdmin.client.get("/api/admin/users?status=inactive&q=Dormant"))
      .body;
    assert.deepEqual(
      found.users.map((u: { id: string }) => u.id),
      [inactive.id],
    );
    assert.equal(
      (await supportAdmin.client.get("/api/admin/users?status=active&q=Dormant")).body.total,
      0,
    );
    assert.equal(
      (
        await supportAdmin.client.get(
          `/api/admin/users?q=${encodeURIComponent(inactive.email.toUpperCase())}`,
        )
      ).body.total,
      1,
      "email search is case-insensitive",
    );
  });

  it("counts a user's non-draft submissions", async () => {
    const row = (
      await superAdmin.client.get(`/api/admin/users?q=${encodeURIComponent(author.user.email)}`)
    ).body.users[0];
    assert.equal(row.submissions, 2, "art1 and art2 — the draft is not counted");
  });

  it("tells the UI which controls to offer, using the same rules the write endpoints enforce", async () => {
    const readerRow = (
      await superAdmin.client.get(`/api/admin/users?q=${encodeURIComponent(reader.user.email)}`)
    ).body.users[0];
    assert.deepEqual(readerRow.access, { status: true, roles: true });
    const selfRow = (
      await superAdmin.client.get(`/api/admin/users?q=${encodeURIComponent(superAdmin.user.email)}`)
    ).body.users[0];
    assert.deepEqual(selfRow.access, { status: false, roles: false }, "no self-service");

    // Support admins may manage low-privilege accounts' status, but not roles, and not people who outrank them.
    const asSupport = async (person: Person) =>
      (await supportAdmin.client.get(`/api/admin/users?q=${encodeURIComponent(person.user.email)}`))
        .body.users[0].access;
    assert.deepEqual(await asSupport(reader), { status: true, roles: false });
    assert.deepEqual(await asSupport(editor), { status: false, roles: false });
    assert.deepEqual(await asSupport(superAdmin), { status: false, roles: false });

    // The hints match reality.
    assert.equal(
      (
        await supportAdmin.client.patch(`/api/admin/users/${superAdmin.user.id}`, {
          isActive: false,
        })
      ).status,
      403,
    );
    assert.equal(
      (await supportAdmin.client.patch(`/api/admin/users/${editor.user.id}`, { isActive: false }))
        .status,
      403,
    );
    assert.equal(
      (
        await supportAdmin.client.post(`/api/admin/users/${reader.user.id}/roles`, {
          role: "READER",
        })
      ).status,
      403,
    );
  });

  it("lists roles with live account counts and only the roles the caller may grant", async () => {
    const asSuper = (await superAdmin.client.get("/api/admin/roles")).body;
    assert.equal(asSuper.roles.length, ROLES.length);
    assert.deepEqual([...asSuper.assignable].sort(), [...ROLES].sort());
    for (const role of asSuper.roles) {
      const expected = await db.userRole.count({ where: { role: { code: role.code } } });
      assert.equal(role.userCount, expected, `${role.code} account count`);
      assert.deepEqual(role.permissions, [...ROLE_PERMISSIONS[role.code as RoleCode]].sort());
    }
    assert.deepEqual(
      (await supportAdmin.client.get("/api/admin/roles")).body.assignable,
      [],
      "support cannot grant roles",
    );
  });

  it("resolves actors, filters by outcome and date, and offers the event types actually present", async () => {
    // Make sure there is a DENIED entry attributable to a known user.
    await reader.client.get("/api/admin/audit-logs");
    const denied = (await superAdmin.client.get("/api/admin/audit-logs?outcome=DENIED&limit=100"))
      .body;
    assert.ok(denied.events.length > 0);
    assert.ok(denied.events.every((e: { outcome: string }) => e.outcome === "DENIED"));
    const mine = denied.events.find((e: { actorId: string }) => e.actorId === reader.user.id);
    assert.deepEqual(mine.actor, {
      id: reader.user.id,
      name: reader.user.name,
      email: reader.user.email,
    });

    assert.ok(denied.eventTypes.includes("AUTHORIZATION_DENIED"));
    assert.equal(
      (await superAdmin.client.get(`/api/admin/audit-logs?cursor=${denied.nextCursor ?? "x"}`)).body
        .eventTypes,
      undefined,
      "facets only on the first page",
    );

    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    assert.equal(
      (await superAdmin.client.get(`/api/admin/audit-logs?from=${tomorrow}`)).body.events.length,
      0,
    );
    assert.equal(
      (await superAdmin.client.get(`/api/admin/audit-logs?to=${yesterday}`)).body.events.length,
      0,
    );
    assert.ok(
      (await superAdmin.client.get(`/api/admin/audit-logs?from=${yesterday}&to=${tomorrow}`)).body
        .events.length > 0,
    );
    const byActor = (
      await superAdmin.client.get(`/api/admin/audit-logs?actorId=${reader.user.id}&limit=100`)
    ).body.events;
    assert.ok(
      byActor.length > 0 && byActor.every((e: { actorId: string }) => e.actorId === reader.user.id),
    );
  });
});

/**
 * Page responses. The site's root loading.tsx makes Next flush a streaming shell
 * before a server-component guard runs, so a guard's notFound()/redirect()
 * surfaces as Next's not-found fallback / meta-refresh with HTTP 200 rather
 * than a bare 404/307. What must hold — and what these helpers assert — is that
 * nothing from the dashboard is rendered for an unauthorized caller.
 */
const visibleHtml = (text: string) => text.replace(/<script[\s\S]*?<\/script>/g, "");
const isNotFound = (res: { status: number; text: string }) =>
  res.status === 404 ||
  res.text.includes("NEXT_HTTP_ERROR_FALLBACK;404") ||
  res.text.includes("NEXT_NOT_FOUND");
const hasAdminShell = (res: { text: string }) =>
  visibleHtml(res.text).includes('aria-label="Administration"');
const allowed = (res: { status: number; text: string }) =>
  res.status === 200 && hasAdminShell(res) && !isNotFound(res);
const redirectsToLogin = (
  res: { status: number; headers: Headers; text: string },
  next: string,
) => {
  const target = `/auth/login?next=${encodeURIComponent(next)}`;
  return (res.headers.get("location") ?? "").endsWith(target) || res.text.includes(target);
};

describe("admin pages: server-side gating and chrome", () => {
  const page = (client: Client, path: string) => client.raw(path);
  const denied = (res: { status: number; text: string }) => !hasAdminShell(res) && isNotFound(res);

  it("sends anonymous visitors to sign in with a real 307, remembering where they were going", async () => {
    for (const path of ["/admin", "/admin/users", "/admin/audit"]) {
      const res = await page(new Client(), path);
      assert.equal(res.status, 307, path);
      assert.ok(redirectsToLogin(res, path), `${path} -> ${res.headers.get("location")}`);
    }
  });

  it("renders no dashboard at all for signed-in users without an admin permission", async () => {
    for (const path of [
      "/admin",
      "/admin/submissions",
      "/admin/users",
      "/admin/roles",
      "/admin/audit",
      "/admin/reviews",
      "/admin/articles",
    ]) {
      const res = await page(reader.client, path);
      assert.ok(
        denied(res),
        `${path}: expected the not-found fallback and no admin shell (status ${res.status})`,
      );
      const html = visibleHtml(res.text);
      for (const marker of [
        "Overview",
        "Audit Logs",
        "Users &amp; Researchers",
        "Sign out",
        "View site",
      ])
        assert.equal(html.includes(marker), false, `${path} leaked "${marker}"`);
    }
  });

  it("authorizes each section separately (a layout alone is not a guard)", async () => {
    const expectations: [Person, string, boolean][] = [
      [editor, "/admin", true],
      [editor, "/admin/submissions", true],
      [editor, "/admin/reviews", true],
      [editor, "/admin/articles", true],
      [editor, "/admin/users", false],
      [editor, "/admin/roles", false],
      [editor, "/admin/audit", false],
      [supportAdmin, "/admin", true],
      [supportAdmin, "/admin/users", true],
      [supportAdmin, "/admin/roles", true],
      [supportAdmin, "/admin/submissions", false],
      [supportAdmin, "/admin/reviews", false],
      [supportAdmin, "/admin/articles", false],
      [supportAdmin, "/admin/audit", false],
      [journalAdmin, "/admin/audit", true],
      [journalAdmin, "/admin/users", true],
      [superAdmin, "/admin/audit", true],
      [superAdmin, "/admin/roles", true],
      [superAdmin, "/admin/articles", true],
    ];
    for (const [person, path, ok] of expectations) {
      const res = await page(person.client, path);
      // A denied section must not render its panel even though the shell (layout) did.
      if (ok) assert.ok(allowed(res), `${person.user.name} should see ${path}`);
      else assert.ok(isNotFound(res), `${person.user.name} must not see ${path}`);
    }
  });

  it("gives /admin its own shell, filtered navigation, and no indexing", async () => {
    const res = await page(editor.client, "/admin/submissions");
    assert.equal(res.status, 200);
    const html = visibleHtml(res.text);
    assert.match(res.text, /noindex/);
    for (const visible of ["Overview", "Submissions", "Peer Review", "Articles"])
      assert.ok(html.includes(visible), visible);
    for (const hidden of ["Audit Logs", "Roles &amp; Permissions", "Users &amp; Researchers"])
      assert.equal(html.includes(hidden), false, `${hidden} must not be offered to an editor`);
    assert.equal(
      html.includes("Call for Papers open"),
      false,
      "the public header must not wrap the dashboard",
    );
    assert.equal(
      html.includes("ISSN 2947-4412"),
      false,
      "the public top bar must not wrap the dashboard",
    );

    const admin = visibleHtml((await page(superAdmin.client, "/admin")).text);
    for (const label of ["Audit Logs", "Roles &amp; Permissions", "Users &amp; Researchers"])
      assert.ok(admin.includes(label), label);
  });

  it("leaves the public website unchanged", async () => {
    const home = await page(new Client(), "/");
    assert.equal(home.status, 200);
    assert.ok(visibleHtml(home.text).includes("I Smart Life Foundation"), "publisher home renders");
    const journal = await page(new Client(), "/publications/life-sutra-synthesis");
    assert.equal(journal.status, 200);
    const html = visibleHtml(journal.text);
    assert.ok(html.includes("Call for Papers open"), "journal header still renders");
    assert.equal(html.includes('aria-label="Administration"'), false);
    for (const path of [
      "/about",
      "/publications/life-sutra-synthesis/research",
      "/publications/life-sutra",
      "/membership",
      "/submit-research",
      "/auth/login",
    ])
      assert.equal((await page(new Client(), path)).status, 200, path);
    assert.equal((await page(new Client(), "/definitely-missing")).status, 404);
  });

  it("does not embed any admin data in the page itself — data arrives only through authorized APIs", async () => {
    const res = await page(editor.client, "/admin");
    for (const person of [author, reviewer1, reviewer2])
      assert.equal(res.text.includes(person.user.email), false);
    assert.equal(res.text.includes("Dashboard KPI manuscript"), false);
  });
});

describe("existing security properties still hold on the new surface", () => {
  it("a deactivated account loses dashboard access immediately, API and pages", async () => {
    const temp = await signedIn(["EDITOR"]);
    assert.equal((await temp.client.get("/api/admin/dashboard")).status, 200);
    assert.equal(
      (await supportAdmin.client.patch(`/api/admin/users/${temp.user.id}`, { isActive: false }))
        .status,
      403,
      "support cannot disable an editor",
    );
    assert.equal(
      (await superAdmin.client.patch(`/api/admin/users/${temp.user.id}`, { isActive: false }))
        .status,
      200,
    );
    assert.equal((await temp.client.get("/api/admin/dashboard")).status, 401);
    const gone = await temp.client.raw("/admin");
    assert.equal(hasAdminShell(gone), false, "no dashboard for a deactivated account");
    assert.ok(redirectsToLogin(gone, "/admin"));
  });

  it("a role change is reflected in what the dashboard returns", async () => {
    const target = await signedIn(["READER"]);
    assert.equal((await target.client.get("/api/admin/dashboard")).status, 403);
    assert.equal(
      (await superAdmin.client.post(`/api/admin/users/${target.user.id}/roles`, { role: "EDITOR" }))
        .status,
      201,
    );
    const relogin = new Client();
    await relogin.login(target.user.email, PASSWORD);
    assert.equal((await relogin.get("/api/admin/dashboard")).status, 200);
    assert.ok(allowed(await relogin.raw("/admin/submissions")));
    assert.ok(isNotFound(await relogin.raw("/admin/audit")));
  });
});
