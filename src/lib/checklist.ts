export type ChecklistSection = {
  id: string;
  title: string;
  when: string;
  items: { id: string; text: string; tip: string }[];
};

export const checklist: ChecklistSection[] = [
  {
    id: "before",
    title: "Before launch",
    when: "2–4 weeks before",
    items: [
      {
        id: "b1",
        text: "Write a one-line tagline",
        tip: "Under 60 characters, says what it does and for whom.",
      },
      {
        id: "b2",
        text: "Write a short product description",
        tip: "Problem, who it's for, what makes it different — 3–4 sentences.",
      },
      {
        id: "b3",
        text: "Make a square logo",
        tip: "At least 240×240 px, readable when small.",
      },
      {
        id: "b4",
        text: "Take 3–5 clear screenshots",
        tip: "Show the main screen first; 1270×760 works well.",
      },
      {
        id: "b5",
        text: "Record a 30–60 second demo video",
        tip: "Show the product doing its job, no long intro.",
      },
      {
        id: "b6",
        text: "Set up a clean landing page",
        tip: "Headline, screenshot, one clear call to action.",
      },
      {
        id: "b7",
        text: "Add page title and meta description",
        tip: "Use the free Meta Tag Generator to check them.",
      },
      {
        id: "b8",
        text: "Add a social share image",
        tip: "1200×630 px so links look good on X and LinkedIn.",
      },
      {
        id: "b9",
        text: "Install analytics",
        tip: "So you can see where launch-day visitors come from.",
      },
      {
        id: "b10",
        text: "Test sign-up and payment on phone and desktop",
        tip: "Broken sign-up on launch day wastes every visitor.",
      },
      {
        id: "b11",
        text: "Prepare a launch-day offer",
        tip: "A discount or extended trial gives people a reason to act now.",
      },
      {
        id: "b12",
        text: "Write your first comment",
        tip: "Who you are, why you built it, what feedback you want.",
      },
      {
        id: "b13",
        text: "Draft social posts for X and LinkedIn",
        tip: "One announcement, one behind-the-scenes, one thank-you.",
      },
      {
        id: "b14",
        text: "Make a list of friends and early users to tell",
        tip: "Message them personally — no mass spam.",
      },
      {
        id: "b15",
        text: "Pick your launch week",
        tip: "Avoid big holidays; Monday launches get a full week.",
      },
      {
        id: "b16",
        text: "Submit your product to WeekLaunch",
        tip: "Free, or Premium to pick your week and be pinned on top.",
      },
      {
        id: "b17",
        text: "List on other launch directories",
        tip: "Spread submissions over a few weeks for steady traffic.",
      },
      {
        id: "b18",
        text: "Prepare an FAQ and support email",
        tip: "Answer the 5 questions people will surely ask.",
      },
    ],
  },
  {
    id: "day",
    title: "Launch day",
    when: "Monday",
    items: [
      {
        id: "d1",
        text: "Check your launch is live",
        tip: "Open your product page and the board on phone and desktop.",
      },
      {
        id: "d2",
        text: "Post your first comment",
        tip: "Early comments set the tone for the conversation.",
      },
      {
        id: "d3",
        text: "Share on X, LinkedIn and relevant communities",
        tip: "Follow each community's self-promotion rules.",
      },
      {
        id: "d4",
        text: "Message your list personally",
        tip: "Ask for honest feedback, not just upvotes.",
      },
      {
        id: "d5",
        text: "Reply to every comment within an hour",
        tip: "Fast, friendly replies turn visitors into users.",
      },
      {
        id: "d6",
        text: "Email your existing users",
        tip: "Short email: what's new and a link to your launch.",
      },
      {
        id: "d7",
        text: "Post updates during the day",
        tip: "Milestones and thank-yous keep people engaged.",
      },
      {
        id: "d8",
        text: "Watch for bugs and fix them fast",
        tip: "Keep an eye on errors and sign-up numbers.",
      },
      {
        id: "d9",
        text: "Add the launch badge to your site",
        tip: "Free social proof and a backlink for your launch page.",
      },
      {
        id: "d10",
        text: "Take notes of all feedback",
        tip: "One list you'll turn into your next tasks.",
      },
    ],
  },
  {
    id: "after",
    title: "After launch",
    when: "The weeks after",
    items: [
      {
        id: "a1",
        text: "Thank everyone who supported you",
        tip: "A public thank-you post builds goodwill.",
      },
      {
        id: "a2",
        text: "Reply to late comments and emails",
        tip: "People keep finding your launch page for weeks.",
      },
      {
        id: "a3",
        text: "Review your analytics",
        tip: "Which channels brought visitors who signed up?",
      },
      {
        id: "a4",
        text: "Ship the top 3 fixes from feedback",
        tip: "Then tell those users you fixed it.",
      },
      {
        id: "a5",
        text: "Write a launch recap post",
        tip: "Numbers and lessons learned get shared a lot.",
      },
      {
        id: "a6",
        text: "Ask happy users for a short review",
        tip: "Real quotes help your next visitors decide.",
      },
      {
        id: "a7",
        text: "Keep your WeekLaunch page updated",
        tip: "Fresh screenshots and description keep it ranking.",
      },
      {
        id: "a8",
        text: "Submit to the next directories on your list",
        tip: "Steady listings beat one big day.",
      },
      {
        id: "a9",
        text: "Plan your next update launch",
        tip: "Big new features deserve their own launch.",
      },
      {
        id: "a10",
        text: "Start a simple newsletter or changelog",
        tip: "Keep new users coming back.",
      },
      {
        id: "a11",
        text: "Follow up with users who didn't convert",
        tip: "Ask what stopped them — it's free research.",
      },
      { id: "a12", text: "Celebrate", tip: "Shipping is hard. You did it." },
    ],
  },
];

export const checklistCount = checklist.reduce((n, s) => n + s.items.length, 0);
