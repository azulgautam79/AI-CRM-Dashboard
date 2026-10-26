//! Mongo SRV Error
import dns from 'node:dns';
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Contact } from "./models/Contact.js";
import { Note } from "./models/Note.js";
import { Task } from "./models/Task.js";

// Force public DNS
dns.setServers(['1.1.1.1', '8.8.8.8']);

const DAY = 24 * 60 * 60 * 1000;

const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysAhead = (n) => new Date(Date.now() + n * DAY);

const rand = (a, b) =>
    Math.floor(Math.random() * (b - a + 1)) + a;

const pick = (arr) =>
    arr[Math.floor(Math.random() * arr.length)];

const pickSome = (arr, n) =>
    [...arr].sort(() => Math.random() - 0.5).slice(0, n);

const weighted = (pairs) => {
    const total = pairs.reduce((sum, [, weight]) => sum + weight, 0);
    let r = Math.random() * total;

    for (const [value, weight] of pairs) {
        r -= weight;
        if (r <= 0) return value;
    }

    return pairs[0][0];
};

const slug = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");

const COMPANIES = [
    ["Nepal Telecom", "ntc.net.np"],
    ["Ncell", "ncell.axiata.com"],
    ["Daraz Nepal", "daraz.com.np"],
    ["Foodmandu", "foodmandu.com"],
    ["Pathao Nepal", "pathao.com"],
    ["eSewa", "esewa.com.np"],
    ["Khalti", "khalti.com"],
    ["Fonepay", "fonepay.com"],
    ["IME Pay", "imepay.com.np"],
    ["Chaudhary Group", "chaudharygroup.com"],
    ["Golchha Organization", "golchha.com"],
    ["Bhat-Bhateni", "bbsm.com.np"],
    ["Agni Group", "agnigroup.com"],
    ["Sipradi Trading", "sipradi.com"],
    ["Himalayan Java", "himalayanjava.com"],
    ["WorldLink", "worldlink.com.np"],
    ["Subisu", "subisu.net.np"],
    ["Vianet", "vianet.com.np"],
    ["DishHome", "dishhome.com.np"],
    ["Nepal Life Insurance", "nepallife.com.np"],
    ["Shikhar Insurance", "shikharinsurance.com"],
    ["NIC Asia Bank", "nicasiabank.com"],
    ["Nabil Bank", "nabilbank.com"],
    ["Global IME Bank", "globalimebank.com"],
    ["Siddhartha Bank", "siddharthabank.com"],
    ["Himalayan Bank", "himalayanbank.com"],
    ["Laxmi Sunrise Bank", "laxmisunrise.com"],
    ["Prabhu Bank", "prabhubank.com"],
    ["Buddha Air", "buddhaair.com"],
    ["Yeti Airlines", "yetiairlines.com"],
    ["Kumari Bank", "kumaribank.com"],
    ["F1Soft International", "f1soft.com"],
    ["Deerwalk", "deerwalk.com"],
    ["Leapfrog Technology", "lftechnology.com"],
    ["Verisk Nepal", "verisknepal.com"],
    ["CloudFactory", "cloudfactory.com"],
    ["Fusemachines Nepal", "fusemachines.com"],
    ["Cotiviti Nepal", "cotiviti.com"],
    ["Merojob", "merojob.com"],
    ["Hamro Patro", "hamropatro.com"],
];

const FIRST = [
    "Aarav", "Aayush", "Abhishek", "Aditya", "Amit",
    "Anish", "Ankit", "Anmol", "Ashish", "Bikash",
    "Bibek", "Dipesh", "Kiran", "Nabin", "Nischal",
    "Prabin", "Prakash", "Pratik", "Rabin", "Rajan",
    "Ramesh", "Roshan", "Sagar", "Samir", "Sandesh",
    "Sanjay", "Sujan", "Suman", "Suraj", "Utsav",
    "Aarati", "Anisha", "Anu", "Asmita", "Binita",
    "Bipana", "Deepa", "Gita", "Isha", "Kabita",
    "Karuna", " Kriti", "Manisha", "Menuka", "Nisha",
    "Pooja", "Prakriti", "Priya", "Rachana", "Rashmi",
    "Sabina", "Samikshya", "Sarita", "Shristi", "Smriti",
    "Sneha", "Sunita", "Sushma", "Sweta", "Yuna",
];

const LAST = [
    "Adhikari", "Acharya", "Bhandari", "Basnet", "Bista",
    "Chaudhary", "Dahal", "Devkota", "Ghimire", "Gurung",
    "Karki", "K.C.", "Khadka", "Koirala", "Lama",
    "Maharjan", "Magar", "Mishra", "Neupane", "Oli",
    "Pandey", "Parajuli", "Poudel", "Rai", "Regmi",
    "Rijal", "Shah", "Sharma", "Shrestha", "Tamang",
    "Thapa", "Tiwari", "Yadav", "Joshi", "Bhattarai",
];

const TITLES = [
    "Sales Manager",
    "Managing Director",
    "Chief Executive Officer",
    "Founder",
    "Operations Manager",
    "Product Manager",
    "Marketing Director",
    "Software Engineer",
    "IT Manager",
    "Finance Manager",
    "Business Development Manager",
    "Account Executive",
    "HR Manager",
    "Procurement Officer",
    "Customer Success Manager",
];

const TAGS = [
    "decision-maker",
    "champion",
    "technical",
    "finance",
    "executive",
    "warm",
    "vip",
    "influencer",
    "saas",
    "enterprise",
];

const SOURCES = [
    "Website",
    "Referral",
    "Cold Outreach",
    "Social",
    "Event",
    "Other",
];

const NOTE_TEMPLATES = [
    (c) =>
        `Discovery call with ${c} went well. The client is interested in our analytics solution. Arrange a technical discussion.`,
    (c) =>
        `${c} raised budget concerns. Prepare an ROI proposal before the next meeting.`,
    (c) =>
        `The internal champion at ${c} is advocating for the solution. Management approval is pending.`,
    (c) =>
        `Called ${c}, but there was no response. Follow up by email within 48 hours.`,
    (c) =>
        `${c} requested additional integration features. Confirm the delivery timeline with the product team.`,
    (c) =>
        `Successful product demo with ${c}. Two stakeholders are interested in moving forward.`,
    (c) =>
        `${c} is comparing competing vendors. Highlight service quality and local support.`,
    (c) =>
        `Renewal discussion with ${c}. The customer may expand the contract next quarter.`,
    (c) =>
        `${c} requested security and compliance documents. Share the relevant documentation.`,
    (c) =>
        `${c} confirmed the budget. Contract negotiations are expected to start this week.`,
];

const TASK_TEMPLATES = [
    (c) => `Send proposal follow-up to ${c}`,
    (c) => `Schedule technical meeting with ${c}`,
    (c) => `Quarterly check-in with ${c}`,
    (c) => `Prepare ROI proposal for ${c}`,
    (c) => `Share a relevant case study with ${c}`,
    (c) => `Confirm contract terms with ${c}`,
    (c) => `Schedule a discovery call with ${c}`,
    (c) => `Send product documents to ${c}`,
    (c) => `Discuss pricing with ${c}`,
    (c) => `Follow up on the pending deal with ${c}`,
];

const personName = () => `${pick(FIRST)} ${pick(LAST)}`;

const emailFor = (name, domain) =>
    `${slug(name.split(" ")[0])}@${domain}`;

const run = async () => {
    try {
        await connectDB();

        let user = await User.findOne({
            email: "lemongautam79@gmail.com",
        });

        if (user) {
            // Replace existing CRM data belonging to this account.
            await Promise.all([
                Lead.deleteMany({ owner: user._id }),
                Contact.deleteMany({ owner: user._id }),
                Note.deleteMany({ owner: user._id }),
                Task.deleteMany({ owner: user._id }),
            ]);

            // Keep the existing account and password unchanged.
        } else {
            user = await User.create({
                name: "Lemon Gautam",
                email: "lemongautam79@gmail.com",
                password: "Lemon123",
                company: "Lemon Gautam",
            });
        }

        const owner = user._id;

        // Seed 40 leads.
        const stageOrder = {
            New: 0,
            Qualified: 0,
            Proposal: 0,
            Won: 0,
            Lost: 0,
        };

        const leadDocs = [];
        const usedCompanies = pickSome(COMPANIES, 40);

        for (let i = 0; i < 40; i++) {
            const [company, domain] = usedCompanies[i];
            const name = personName();

            const status = weighted([
                ["New", 28],
                ["Qualified", 24],
                ["Proposal", 20],
                ["Won", 16],
                ["Lost", 12],
            ]);

            const ageDays =
                status === "Won" || status === "Lost"
                    ? rand(20, 175)
                    : rand(0, 120);

            leadDocs.push({
                owner,
                name,
                email: emailFor(name, domain),
                phone: `+977 98${rand(10000000, 99999999)}`,
                company,
                status,
                priority: weighted([
                    ["High", 35],
                    ["Medium", 45],
                    ["Low", 20],
                ]),
                source: pick(SOURCES),
                value: rand(50, 15000) * 1000,
                notes: pick([
                    "Inbound inquiry from the company website.",
                    "Referred by an existing customer.",
                    "Met at a networking event in Nepal.",
                    "Initial outreach; early-stage opportunity.",
                    "Product trial active; multiple stakeholders involved.",
                    "",
                ]),
                tags: pickSome(
                    ["saas", "enterprise", "smb", "priority"],
                    rand(0, 2)
                ),
                order: stageOrder[status]++,
                createdAt: daysAgo(ageDays),
                updatedAt: daysAgo(
                    rand(0, Math.min(ageDays, 14))
                ),
            });
        }

        const leads = await Lead.insertMany(leadDocs);

        // Seed 26 contacts.
        const contactDocs = [];

        for (let i = 0; i < 26; i++) {
            const [company, domain] = pick(COMPANIES);
            const name = personName();

            contactDocs.push({
                owner,
                name,
                title: pick(TITLES),
                company,
                email: emailFor(name, domain),
                phone: `+977 98${rand(10000000, 99999999)}`,
                tags: pickSome(TAGS, rand(1, 3)),
                favorite: Math.random() < 0.22,
                notes:
                    Math.random() < 0.5
                        ? pick([
                            "Primary point of contact.",
                            "Prefers email over calls.",
                            "Met at a local business event.",
                            "Key technical evaluator.",
                        ])
                        : "",
                createdAt: daysAgo(rand(0, 160)),
            });
        }

        await Contact.insertMany(contactDocs);

        // Seed 22 notes.
        const noteDocs = [];

        for (let i = 0; i < 22; i++) {
            const lead = pick(leads);

            noteDocs.push({
                owner,
                content: pick(NOTE_TEMPLATES)(lead.company),
                lead: lead._id,
                pinned: Math.random() < 0.25,
                createdAt: daysAgo(rand(0, 90)),
            });
        }

        await Note.insertMany(noteDocs);

        // Seed 28 tasks.
        const taskDocs = [];

        for (let i = 0; i < 28; i++) {
            const lead = pick(leads);

            const bucket = weighted([
                ["overdue", 22],
                ["today", 12],
                ["upcoming", 46],
                ["completed", 20],
            ]);

            let dueDate;
            let status;
            let completedAt = null;

            if (bucket === "overdue") {
                dueDate = daysAgo(rand(1, 18));
                status = weighted([
                    ["Pending", 60],
                    ["In Progress", 40],
                ]);
            } else if (bucket === "today") {
                dueDate = new Date();
                status = weighted([
                    ["Pending", 50],
                    ["In Progress", 50],
                ]);
            } else if (bucket === "upcoming") {
                dueDate = daysAhead(rand(1, 30));
                status = weighted([
                    ["Pending", 65],
                    ["In Progress", 35],
                ]);
            } else {
                dueDate = daysAgo(rand(1, 20));
                status = "Completed";
                completedAt = daysAgo(rand(0, 10));
            }

            taskDocs.push({
                owner,
                title: pick(TASK_TEMPLATES)(lead.company),
                description:
                    Math.random() < 0.5
                        ? pick([
                            "Review the latest proposal and pricing.",
                            "Coordinate with the technical team.",
                            "Confirm next steps and the decision timeline.",
                            "",
                        ])
                        : "",
                dueDate,
                status,
                priority: weighted([
                    ["High", 35],
                    ["Medium", 45],
                    ["Low", 20],
                ]),
                relatedLead: lead._id,
                completedAt,
                createdAt: daysAgo(rand(0, 40)),
            });
        }

        await Task.insertMany(taskDocs);

        console.log("✅ Nepal CRM seed completed!");
        console.log("Workspace: Lemon Gautam");
        console.log(`Leads: ${leads.length}`);
        console.log(`Contacts: ${contactDocs.length}`);
        console.log(`Notes: ${noteDocs.length}`);
        console.log(`Tasks: ${taskDocs.length}`);
        console.log("Login email: lemongautam79@gmail.com");
        console.log("Password: Lemon123");
    } catch (err) {
        console.error("Seed failed:", err);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

run();
