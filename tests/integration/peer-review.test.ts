import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { editorialArticleView } from "../../src/lib/peer-review/views";
import { auditEvents, db, signedIn, uniqueEmail } from "../helpers/db";
import { Client } from "../helpers/http";

after(() => db.$disconnect());

type Person = Awaited<ReturnType<typeof signedIn>>;

const ABSTRACT =
  "This study examines the Bhava Sutra framework and its relation to pre-cognitive emotional fields in classical texts.";
const SECRET_EDITOR_NOTE = "CONFIDENTIAL-TO-EDITOR-ONLY-7f3a";
const AUTHOR_FILE = "Quillfeather_Zephyrine_final_v3.docx";

/** Strings that would identify a person if they ever appeared in the other party's traffic. */
const fingerprint = (p: Person) => [
  p.user.id,
  p.user.email,
  p.user.email.split("@")[0]!,
  ...p.user.name.split(" "),
];

function assertNoLeak(who: string, transcript: string, subjects: [string, string[]][]) {
  const haystack = transcript.toLowerCase();
  for (const [label, needles] of subjects)
    for (const needle of needles)
      assert.equal(
        haystack.includes(needle.toLowerCase()),
        false,
        `${who} traffic leaked ${label} identifier "${needle}"`,
      );
}

let author: Person, otherAuthor: Person, editor: Person, manager: Person;
let reviewer1: Person, reviewer2: Person, dualRole: Person, nonReviewer: Person;
let articleId: string;
let assignment1: string, assignment2: string;

before(async () => {
  author = await signedIn(["AUTHOR"], { name: "Zephyrine Quillfeather" });
  otherAuthor = await signedIn(["AUTHOR"], { name: "Cornelius Wetherby" });
  editor = await signedIn(["EDITOR"], { name: "Edwina Fairweather" });
  manager = await signedIn(["REVIEWER_MANAGER"], { name: "Marmaduke Pennyfeather" });
  reviewer1 = await signedIn(["REVIEWER"], { name: "Barnaby Thistlewood" });
  reviewer2 = await signedIn(["REVIEWER"], { name: "Ottoline Marchbanks" });
  dualRole = await signedIn(["AUTHOR", "REVIEWER"], { name: "Desdemona Applegarth" });
  nonReviewer = await signedIn(["READER"], { name: "Rupert Nobody" });
});

describe("author workflow and IDOR", () => {
  it("creates a draft owned by the session user — a client-supplied authorId is ignored", async () => {
    const res = await author.client.post("/api/articles", {
      title: "Bhava as a pre-cognitive field",
      abstract: ABSTRACT,
      manuscriptFileName: AUTHOR_FILE,
      authorId: otherAuthor.user.id,
      status: "PUBLISHED",
    });
    assert.equal(res.status, 201);
    articleId = res.body.article.id;
    const row = await db.article.findUniqueOrThrow({ where: { id: articleId } });
    assert.equal(row.authorId, author.user.id);
    assert.equal(row.status, "DRAFT", "status cannot be set by the client");
  });

  it("validates article input", async () => {
    assert.equal(
      (await author.client.post("/api/articles", { title: "x", abstract: "short" })).status,
      422,
    );
    const traversal = await author.client.post("/api/articles", {
      title: "A valid title here",
      abstract: ABSTRACT,
      manuscriptFileName: "../../etc/passwd",
    });
    assert.equal(traversal.status, 422);
  });

  it("returns 404 (not 403, not data) when another author probes the article id — IDOR", async () => {
    const probes = [
      otherAuthor.client.get(`/api/articles/${articleId}`),
      otherAuthor.client.patch(`/api/articles/${articleId}`, { title: "Hijacked title!!" }),
      otherAuthor.client.post(`/api/articles/${articleId}/submit`),
    ];
    for (const res of await Promise.all(probes)) assert.equal(res.status, 404);
    assert.equal((await otherAuthor.client.get("/api/articles")).body.articles.length, 0);
    assert.equal(
      (await db.article.findUniqueOrThrow({ where: { id: articleId } })).title,
      "Bhava as a pre-cognitive field",
    );
  });

  it("guessed / malformed ids are also just 404", async () => {
    for (const id of ["nope", "0".repeat(25), 'a\'; DROP TABLE "Article";--']) {
      const res = await author.client.get(`/api/articles/${encodeURIComponent(id)}`);
      assert.ok(res.status === 404, `${id} -> ${res.status}`);
    }
    assert.ok((await db.article.count()) > 0, "table still exists");
  });

  it("does not show drafts to editorial staff", async () => {
    const queue = await editor.client.get("/api/editor/articles");
    assert.equal(
      queue.body.articles.some((a: { id: string }) => a.id === articleId),
      false,
    );
    assert.equal((await editor.client.get(`/api/editor/articles/${articleId}`)).status, 404);
  });

  it("lets the owner edit a draft, submit it once, and freezes it afterwards", async () => {
    const edit = await author.client.patch(`/api/articles/${articleId}`, {
      title: "Bhava as a pre-cognitive field (rev)",
    });
    assert.equal(edit.status, 200);
    const submitted = await author.client.post(`/api/articles/${articleId}/submit`);
    assert.equal(submitted.status, 200);
    assert.equal(submitted.body.article.status, "SUBMITTED");
    assert.equal((await author.client.post(`/api/articles/${articleId}/submit`)).status, 409);
    assert.equal(
      (await author.client.patch(`/api/articles/${articleId}`, { title: "Sneaky late edit!!" }))
        .status,
      409,
    );
    assert.equal(
      (await auditEvents({ event: "ARTICLE_SUBMITTED", targetId: articleId })).length,
      1,
    );
  });
});

describe("editorial assignment", () => {
  it("shows identities to holders of review:view-identities, and audits each view", async () => {
    const detail = await editor.client.get(`/api/editor/articles/${articleId}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.article.author.name, author.user.name);
    assert.equal(detail.body.article.manuscriptFile, AUTHOR_FILE);
    const mgr = await manager.client.get(`/api/editor/articles/${articleId}`);
    assert.equal(mgr.status, 200);
    assert.ok(
      (
        await auditEvents({
          event: "REVIEW_IDENTITY_VIEWED",
          actorId: editor.user.id,
          targetId: articleId,
        })
      ).length >= 1,
    );
  });

  it("without review:view-identities the editorial view carries no identities (view-level guarantee)", async () => {
    const row = await db.article.findUniqueOrThrow({ where: { id: articleId } });
    const view = editorialArticleView(
      {
        id: row.id,
        title: row.title,
        abstract: row.abstract,
        manuscriptFileName: row.manuscriptFileName,
        status: row.status,
        submittedAt: row.submittedAt,
        decidedAt: null,
        decisionNote: null,
        publishedAt: null,
        assignments: [],
      },
      { seeInternalComments: false, identities: false },
    );
    const text = JSON.stringify(view).toLowerCase();
    assert.equal(view.author, null);
    assert.ok(!text.includes("quillfeather") && !text.includes(author.user.id.toLowerCase()));
    assert.match(view.manuscriptFile ?? "", /^manuscript-LS-/);
  });

  it("only review:assign holders may assign; reviewers, authors and readers may not", async () => {
    for (const who of [author, reviewer1, otherAuthor, nonReviewer]) {
      const res = await who.client.post(`/api/editor/articles/${articleId}/assignments`, {
        reviewerId: reviewer1.user.id,
      });
      assert.equal(res.status, 403);
    }
  });

  it("refuses ineligible reviewers, unknown ids, and conflicts of interest", async () => {
    const ineligible = await editor.client.post(`/api/editor/articles/${articleId}/assignments`, {
      reviewerId: nonReviewer.user.id,
    });
    assert.equal(ineligible.status, 422);
    assert.equal(
      (
        await editor.client.post(`/api/editor/articles/${articleId}/assignments`, {
          reviewerId: "ghost",
        })
      ).status,
      422,
    );
    // The author is also a reviewer elsewhere — they must never review their own manuscript.
    const own = await dualRole.client.post("/api/articles", {
      title: "Dual-role author paper",
      abstract: ABSTRACT,
    });
    await dualRole.client.post(`/api/articles/${own.body.article.id}/submit`);
    const conflict = await editor.client.post(
      `/api/editor/articles/${own.body.article.id}/assignments`,
      { reviewerId: dualRole.user.id },
    );
    assert.equal(conflict.status, 422);
    assert.equal(await db.reviewAssignment.count({ where: { articleId: own.body.article.id } }), 0);
  });

  it("assigns two reviewers, labels them by ordinal, rejects duplicates, and audits", async () => {
    const one = await editor.client.post(`/api/editor/articles/${articleId}/assignments`, {
      reviewerId: reviewer1.user.id,
    });
    const two = await manager.client.post(`/api/editor/articles/${articleId}/assignments`, {
      reviewerId: reviewer2.user.id,
    });
    assert.equal(one.status, 201);
    assert.equal(two.status, 201);
    assert.equal(one.body.assignment.label, "Reviewer 1");
    assert.equal(two.body.assignment.label, "Reviewer 2");
    assignment1 = one.body.assignment.assignmentId;
    assignment2 = two.body.assignment.assignmentId;
    assert.equal(
      (
        await editor.client.post(`/api/editor/articles/${articleId}/assignments`, {
          reviewerId: reviewer1.user.id,
        })
      ).status,
      409,
    );
    assert.equal(
      (await db.article.findUniqueOrThrow({ where: { id: articleId } })).status,
      "UNDER_REVIEW",
    );
    const audit = await auditEvents({ event: "REVIEW_ASSIGNED", targetId: articleId });
    assert.equal(audit.length, 2);
    assert.equal(audit[0]!.actorId, editor.user.id);
  });

  it("lists eligible reviewers for assigners only, excluding the caller", async () => {
    const res = await editor.client.get("/api/editor/reviewers");
    assert.equal(res.status, 200);
    const ids = res.body.reviewers.map((r: { id: string }) => r.id);
    assert.ok(ids.includes(reviewer1.user.id));
    assert.ok(!ids.includes(nonReviewer.user.id));
  });
});

describe("reviewer view (author identity is hidden)", () => {
  it("shows the reviewer only their own assignments, with no author information", async () => {
    const list = await reviewer1.client.get("/api/reviews");
    assert.equal(list.status, 200);
    assert.deepEqual(
      list.body.assignments.map((a: { assignmentId: string }) => a.assignmentId),
      [assignment1],
    );

    const detail = await reviewer1.client.get(`/api/reviews/${assignment1}`);
    assert.equal(detail.status, 200);
    const view = detail.body.assignment;
    assert.equal(view.title, "Bhava as a pre-cognitive field (rev)");
    assert.equal(view.abstract, ABSTRACT);
    assert.match(
      view.manuscriptFile,
      /^manuscript-LS-[0-9A-F]{8}\.docx$/,
      "author-chosen filename must be replaced",
    );
    assert.ok(
      !("articleId" in view) && !("id" in view),
      "the internal article id must not be exposed",
    );
    for (const key of Object.keys(view))
      assert.ok(!/author|email|reviewer|assignedBy|user/i.test(key), `unexpected key ${key}`);
  });

  it("IDOR: a reviewer cannot read or review another reviewer's assignment", async () => {
    assert.equal((await reviewer2.client.get(`/api/reviews/${assignment1}`)).status, 404);
    const forged = await reviewer2.client.post(`/api/reviews/${assignment1}`, {
      recommendation: "ACCEPT",
      commentsToAuthor: "I am not the assigned reviewer of this manuscript.",
    });
    assert.equal(forged.status, 404);
    assert.equal(await db.review.count({ where: { assignmentId: assignment1 } }), 0);
    // A reviewer who is not assigned at all sees nothing.
    assert.equal((await dualRole.client.get(`/api/reviews/${assignment1}`)).status, 404);
    assert.deepEqual((await dualRole.client.get("/api/reviews")).body.assignments, []);
  });

  it("a reviewer cannot reach author or editorial routes for the same manuscript", async () => {
    assert.equal((await reviewer1.client.get(`/api/editor/articles/${articleId}`)).status, 403);
    assert.equal((await reviewer1.client.get(`/api/articles/${articleId}`)).status, 403);
    // Even a user who is BOTH reviewer and author cannot use the author route to reach someone else's article.
    assert.equal((await dualRole.client.get(`/api/articles/${articleId}`)).status, 404);
    assert.equal((await dualRole.client.get(`/api/editor/articles/${articleId}`)).status, 403);
  });

  it("validates reviews, accepts one, and refuses a second submission", async () => {
    assert.equal(
      (
        await reviewer1.client.post(`/api/reviews/${assignment1}`, {
          recommendation: "MAYBE",
          commentsToAuthor: "x".repeat(40),
        })
      ).status,
      422,
    );
    assert.equal(
      (
        await reviewer1.client.post(`/api/reviews/${assignment1}`, {
          recommendation: "ACCEPT",
          commentsToAuthor: "too short",
        })
      ).status,
      422,
    );
    const ok = await reviewer1.client.post(`/api/reviews/${assignment1}`, {
      recommendation: "MINOR_REVISION",
      commentsToAuthor:
        "The framework is promising; please clarify the classification of the central claim.",
      commentsToEditor: SECRET_EDITOR_NOTE,
      reviewerId: reviewer2.user.id,
    });
    assert.equal(ok.status, 201);
    assert.equal(ok.body.assignment.status, "SUBMITTED");
    assert.equal(
      (
        await reviewer1.client.post(`/api/reviews/${assignment1}`, {
          recommendation: "ACCEPT",
          commentsToAuthor: "Trying to submit a second review here.",
        })
      ).status,
      409,
    );
    assert.equal(await db.review.count({ where: { assignmentId: assignment1 } }), 1);
    assert.equal(
      (await auditEvents({ event: "REVIEW_SUBMITTED", actorId: reviewer1.user.id })).length,
      1,
    );
  });
});

describe("author view before and after the decision", () => {
  it("shows the author nothing about reviewers while the article is under review", async () => {
    const res = await author.client.get(`/api/articles/${articleId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.article.status, "UNDER_REVIEW");
    assert.deepEqual(res.body.article.reviews, [], "feedback is withheld until the editor decides");
  });

  it("requires a decision permission, a submitted review, and records the decision", async () => {
    for (const who of [author, reviewer1, manager, nonReviewer])
      assert.equal(
        (
          await who.client.post(`/api/editor/articles/${articleId}/decision`, {
            decision: "ACCEPTED",
            note: "x",
          })
        ).status,
        403,
      );
    const res = await editor.client.post(`/api/editor/articles/${articleId}/decision`, {
      decision: "REVISION_REQUESTED",
      note: "Please address the reviewer's comment on claim classification.",
    });
    assert.equal(res.status, 200);
    assert.equal(
      (
        await editor.client.post(`/api/editor/articles/${articleId}/decision`, {
          decision: "REJECTED",
          note: "again",
        })
      ).status,
      409,
      "decision is final",
    );
    assert.equal((await auditEvents({ event: "ARTICLE_DECISION", targetId: articleId })).length, 1);
  });

  it("after the decision the author sees anonymous, ordinal-labelled comments-to-author only", async () => {
    const res = await author.client.get(`/api/articles/${articleId}`);
    assert.equal(res.body.article.status, "REVISION_REQUESTED");
    assert.equal(res.body.article.reviews.length, 1, "only the submitted review is released");
    const review = res.body.article.reviews[0];
    assert.equal(review.reviewer, "Reviewer 1");
    assert.match(review.comments, /promising/);
    assert.deepEqual(Object.keys(review).sort(), ["comments", "recommendation", "reviewer"]);
    assert.equal(
      JSON.stringify(res.body).includes(SECRET_EDITOR_NOTE),
      false,
      "comments-to-editor must never reach the author",
    );
  });

  it("late reviewers cannot submit once the manuscript has been decided", async () => {
    const res = await reviewer2.client.post(`/api/reviews/${assignment2}`, {
      recommendation: "ACCEPT",
      commentsToAuthor: "A review that arrives after the decision was recorded.",
    });
    assert.equal(res.status, 409);
  });

  it("gives editors the full picture: reviewer identities and confidential comments", async () => {
    const detail = await editor.client.get(`/api/editor/articles/${articleId}`);
    const first = detail.body.article.assignments[0];
    assert.equal(first.reviewer.name, reviewer1.user.name);
    assert.equal(first.review.commentsToEditor, SECRET_EDITOR_NOTE);
  });
});

describe("no identity leakage in anything either side was ever sent", () => {
  it("the author's entire traffic contains no reviewer identifier", () => {
    assertNoLeak("author", author.client.transcript(), [
      ["reviewer 1", fingerprint(reviewer1)],
      ["reviewer 2", fingerprint(reviewer2)],
      ["editor", [editor.user.id]],
      ["manager", [manager.user.id]],
      ["confidential comment", [SECRET_EDITOR_NOTE]],
    ]);
  });

  it("each reviewer's entire traffic contains no author identifier (name, email, id, filename)", () => {
    for (const reviewer of [reviewer1, reviewer2]) {
      assertNoLeak("reviewer", reviewer.client.transcript(), [
        ["author", [...fingerprint(author), "Quillfeather_Zephyrine", AUTHOR_FILE]],
        ["editor", [editor.user.id, editor.user.email]],
      ]);
    }
  });

  it("reviewers also do not learn each other's identity", () => {
    assertNoLeak("reviewer 1", reviewer1.client.transcript(), [
      ["reviewer 2", fingerprint(reviewer2)],
    ]);
    assertNoLeak("reviewer 2", reviewer2.client.transcript(), [
      ["reviewer 1", fingerprint(reviewer1)],
    ]);
  });

  it("nothing the server sent a reviewer contains the internal article id or any author identifier", () => {
    const received = reviewer1.client.received();
    assert.ok(
      !received.includes(articleId),
      "the internal article id must never be sent to a reviewer",
    );
    assertNoLeak("reviewer (server output)", received, [["author", fingerprint(author)]]);
    // The URLs the server handed out are assignment-scoped and opaque.
    const handedOut = reviewer1.client.history
      .filter((h) => h.path.startsWith("/api/reviews"))
      .map((h) => h.path)
      .join("\n");
    assertNoLeak("reviewer URLs", handedOut, [
      ["author", fingerprint(author)],
      ["article", [articleId]],
    ]);
  });
});

describe("editorial conflict of interest and publication", () => {
  it("staff who are also authors cannot act on their own submission", async () => {
    const dual = await signedIn(["EDITOR", "AUTHOR"], { name: "Ignatius Doublehat" });
    const mine = await dual.client.post("/api/articles", {
      title: "An editor's own paper",
      abstract: ABSTRACT,
    });
    const id = mine.body.article.id;
    await dual.client.post(`/api/articles/${id}/submit`);

    const queue = await dual.client.get("/api/editor/articles");
    assert.equal(
      queue.body.articles.some((a: { id: string }) => a.id === id),
      false,
      "own paper is absent from own queue",
    );
    assert.equal((await dual.client.get(`/api/editor/articles/${id}`)).status, 404);
    assert.equal(
      (
        await dual.client.post(`/api/editor/articles/${id}/assignments`, {
          reviewerId: reviewer1.user.id,
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await dual.client.post(`/api/editor/articles/${id}/decision`, {
          decision: "ACCEPTED",
          note: "self-approved",
        })
      ).status,
      404,
    );
    assert.equal((await dual.client.post(`/api/editor/articles/${id}/publish`)).status, 404);
    // A different editor can still process it.
    assert.equal((await editor.client.get(`/api/editor/articles/${id}`)).status, 200);
  });

  it("publishes only accepted manuscripts, and only for article:publish holders", async () => {
    const paper = await otherAuthor.client.post("/api/articles", {
      title: "A second submission",
      abstract: ABSTRACT,
    });
    const id = paper.body.article.id;
    await otherAuthor.client.post(`/api/articles/${id}/submit`);
    const assigned = await editor.client.post(`/api/editor/articles/${id}/assignments`, {
      reviewerId: reviewer2.user.id,
    });
    assert.equal(
      (await editor.client.post(`/api/editor/articles/${id}/publish`)).status,
      409,
      "not accepted yet",
    );
    assert.equal(
      (
        await editor.client.post(`/api/editor/articles/${id}/decision`, {
          decision: "ACCEPTED",
          note: "Accept.",
        })
      ).status,
      409,
      "acceptance needs at least one submitted review",
    );
    await reviewer2.client.post(`/api/reviews/${assigned.body.assignment.assignmentId}`, {
      recommendation: "ACCEPT",
      commentsToAuthor: "Excellent, clearly argued and well evidenced work.",
    });
    assert.equal(
      (
        await editor.client.post(`/api/editor/articles/${id}/decision`, {
          decision: "ACCEPTED",
          note: "Accept.",
        })
      ).status,
      200,
    );
    assert.equal((await manager.client.post(`/api/editor/articles/${id}/publish`)).status, 403);
    assert.equal((await otherAuthor.client.post(`/api/editor/articles/${id}/publish`)).status, 403);
    assert.equal((await editor.client.post(`/api/editor/articles/${id}/publish`)).status, 200);
    assert.equal(
      (await otherAuthor.client.get(`/api/articles/${id}`)).body.article.status,
      "PUBLISHED",
    );
    assert.equal((await auditEvents({ event: "ARTICLE_PUBLISHED", targetId: id })).length, 1);
  });

  it("audit records for review assignment stay out of authors' and reviewers' reach", async () => {
    for (const who of [author, reviewer1, editor, manager])
      assert.equal(
        (await who.client.get("/api/admin/audit-logs?event=REVIEW_ASSIGNED")).status,
        403,
      );
  });
});

describe("misc hardening", () => {
  it("a fresh anonymous client cannot fetch any peer-review resource", async () => {
    const anon = new Client();
    for (const path of [
      `/api/articles/${articleId}`,
      `/api/reviews/${assignment1}`,
      `/api/editor/articles/${articleId}`,
    ])
      assert.equal((await anon.get(path)).status, 401);
    void uniqueEmail;
  });
});
