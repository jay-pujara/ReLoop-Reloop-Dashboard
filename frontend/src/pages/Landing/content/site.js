export const brand = {
  name: "ReLoop",
  wordmark: "RELOOP",
  legalName: "ReLoop",
  descriptor: "Carbon-aware",
  hq: {
    lines: ["HackOut'26", "Circular Carbon Ecosystem"],
  },
  founded: "HackOut'26",
};

/* Every href here resolves: a route or an in-page section id */
export const navLinks = [
  { label: "Dashboard", href: "/logistics" },
  { label: "How it works", href: "#services" },
  { label: "Materials", href: "#materials" },
  { label: "Carbon method", href: "#method" },
  { label: "For carriers", href: "#haulage" },
  { label: "Sign in", href: "/login" },
  { label: "Contact", href: "#contact" },
];

export const tickerItems = [
  "Break-even radius computed per listing",
  "Carbon-negative matches suppressed by default",
  "Emission factors versioned and source-cited",
];

export const hero = {
  eyebrow: "One exchange",
  headline: ["Not every", "circular trade", "is worth making"],
  subcopy:
    "A B2B exchange for surplus packaging that scores every match on net carbon, not diverted tonnage — and hides the trades that would emit more than they save.",
  primaryCta: { label: "Open Dashboard", href: "/logistics" },
  secondaryCta: { label: "Sell item", href: "/listings/new" },
};

export const manifesto = {
  eyebrow: "Method",
  lines: ["We move surplus.", "We do the arithmetic."],
  copy: "Reuse avoids the emissions of virgin production. Freight emits. Beyond a distance you can calculate, the trade costs more carbon than it saves.",
};

export const stats = {
  eyebrow: "By the numbers",
  figures: [
    {
      value: 421,
      pad: 0,
      suffix: " km",
      label: "Break-even radius, corrugated board at 0.75 load factor",
    },
    {
      value: 0.8,
      pad: 0,
      decimals: 2,
      suffix: "",
      label: "Target net carbon efficiency",
    },
    {
      value: 75,
      pad: 0,
      suffix: "%",
      label: "Target average truck load factor",
    },
  ],
  speedometer: {
    value: 886,
    unit: "kg CO₂e",
    label: "Net saved on the worked example, a 3,000 kg lot",
  },
};

export const services = {
  eyebrow: "Capabilities",
  heading: ["Six capabilities.", "One computed constraint."],
  items: [
    {
      index: "01",
      title: "Condition grading",
      line: "A vision-language model assigns a grade from photographs, flags damage and contamination, and the seller confirms or overrides.",
    },
    {
      index: "02",
      title: "Semantic matching",
      line: "Hard relational filters establish feasibility; vector similarity ranks what survives. Similarity can reorder candidates, never admit one.",
    },
    {
      index: "03",
      title: "Carbon check",
      line: "Every candidate is evaluated for net CO₂e. Negative results are withheld from default search.",
    },
    {
      index: "04",
      title: "Route consolidation",
      line: "A vehicle routing solver batches nearby pickups into one multi-stop run and matches lots to declared empty return legs.",
    },
    {
      index: "05",
      title: "Load planning",
      line: "A 3D packing heuristic arranges the load and returns a load factor, which feeds straight back into the emissions figure.",
    },
    {
      index: "06",
      title: "Certification",
      line: "Every completed trade writes a hash-chained ledger entry and issues an impact record to both sides.",
    },
  ],
};

export const stageStacker = {
  eyebrow: "Condition grading",
  heading: ["Graded.", "Matched.", "Priced."],
  copy: "Photographs are graded against a versioned rubric before a lot is published. Below 0.7 confidence the seller confirms the grade manually, or overrides it on the record.",
  steps: [
    { at: "Capture", note: "Lot photographed where it stands" },
    { at: "Grade", note: "Model assigns a grade and flags damage" },
    { at: "Publish", note: "Seller confirms, the listing goes live" },
  ],
};

export const stageTruck = {
  eyebrow: "Consolidation",
  heading: ["Batched.", "Loaded.", "Routed."],
  copy: "Nearby pickups batch into one multi-stop run, and lots match against declared empty return legs. Transport emissions are allocated by mass share.",
  steps: [
    { at: "Batch", note: "Nearby pickups grouped into one run" },
    { at: "Load", note: "3D packing returns a load factor" },
    { at: "Route", note: "Assigned to a declared backhaul leg" },
  ],
};

export const features = {
  eyebrow: "Platform",
  heading: ["Three things", "the exchange enforces."],
  items: [
    {
      index: "01",
      title: "Verified condition",
      copy: "Graded photographs become binding evidence. Delivery-side photos are re-graded against the same rubric; a drop of more than one level opens a dispute automatically.",
      meta: "Re-graded",
    },
    {
      index: "02",
      title: "Shared vehicles",
      copy: "Transport emissions are allocated by mass share, so batching improves each participant's individual figure, not just the platform total.",
      meta: "Mass share",
    },
    {
      index: "03",
      title: "Auditable ledger",
      copy: "Append-only and hash-chained. Corrections are compensating entries. Every row records the emission factor version it used.",
      meta: "Hash-chained",
    },
  ],
};

export const materialCategories = [
  {
    slug: "cardboard",
    label: "Cardboard",
    subtypes: [
      "Corrugated cardboard",
      "OCC (Old Corrugated Containers)",
      "Die-cut boxes",
    ],
  },
  {
    slug: "plastics",
    label: "Plastics",
    subtypes: ["LDPE stretch film", "Strapping", "Rigid containers"],
  },
  {
    slug: "pallets",
    label: "Pallets",
    subtypes: ["Wooden pallets", "Plastic pallets", "Euro pallets (EPAL)"],
  },
  {
    slug: "drums",
    label: "Drums",
    subtypes: ["Steel drums", "Plastic drums"],
  },
  {
    slug: "gaylords",
    label: "Gaylords",
    subtypes: ["Fibre gaylords", "Plastic gaylords"],
  },
];

export const materials = materialCategories.flatMap((c) => c.subtypes);

export const materialsSection = {
  eyebrow: "Materials",
  heading: ["Five classes,", "thirteen subtypes."],
  copy: "Each class carries its own emission factor, so each one has its own break-even radius. A stack of euro pallets and a roll of stretch film do not travel the same distance before the trade stops paying for itself.",
};

export const contact = {
  eyebrow: "Contact",
  heading: ["Put a lot", "on the exchange."],
  copy: "Sellers list surplus where it stands and let the grading model do the paperwork. Buyers set a standing requirement and the matching engine ranks what clears the carbon check.",
  email: "desk@reloop.network",
};

export const footer = {
  columns: [
    {
      title: "Explore",
      links: [
        { label: "Method", href: "#method" },
        { label: "By the numbers", href: "#numbers" },
        { label: "Terminal", href: "#terminal" },
        { label: "How it works", href: "#services" },
        { label: "Materials", href: "#materials" },
        { label: "For carriers", href: "#haulage" },
        { label: "Platform", href: "#platform" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Dashboard", href: "/logistics" },
        { label: "Marketplace", href: "/listings" },
        { label: "Requirements", href: "/requirements" },
        { label: "Matches", href: "/matches" },
        { label: "Trades", href: "/trades" },
        { label: "Impact", href: "/impact" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign in", href: "/login" },
        { label: "Create account", href: "/signup" },
        { label: "Sell item", href: "/listings/new" },
        { label: "Buy item", href: "/listings" },
      ],
    },
  ],
  note: "Emission factors are versioned and source-cited. Every listing records the factor version used to compute its break-even radius.",
};
