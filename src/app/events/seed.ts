import { prisma } from "../../lib/prisma";

async function main() {
  console.log("Seeding elite events...");

  const events = [
    {
      title: "SFS Manhattan Summer Gala",
      description: "An evening of elegance and high-level networking at the Top of the Standard. Formal attire required.",
      location: "The Top of the Standard, NYC",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      isEliteOnly: true,
    },
    {
      title: "Private Vineyard Retreat",
      description: "Exclusive wine tasting and dinner at a heritage Napa Valley estate. Limousine service provided.",
      location: "Stags Leap District, Napa Valley",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
      isEliteOnly: true,
    },
    {
      title: "Signature Rooftop Mixer",
      description: "Sunset cocktails and light bites for our Signature and Elite members.",
      location: "High Line Park Rooftop",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days from now
      isEliteOnly: false,
    }
  ];

  for (const evt of events) {
    await prisma.event.upsert({
      where: { id: `seed-${evt.title.replace(/\s+/g, '-').toLowerCase()}` },
      update: evt,
      create: {
        id: `seed-${evt.title.replace(/\s+/g, '-').toLowerCase()}`,
        ...evt
      }
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
