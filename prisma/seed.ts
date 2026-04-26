import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with mock data...')

  // Clean up
  await prisma.swipe.deleteMany()
  await prisma.match.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
  
  const dummyProfiles = [
    {
      name: "Sophia Martinez",
      bio: "Tech entrepreneur, coffee addict, and looking for someone who travels.",
      gender: "Female",
      interestedIn: "Male",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800",
      location: "New York, NY",
      age: 27,
      occupation: "Founder @ EcoTech"
    },
    {
      name: "Michael Chen",
      bio: "Investment banker by day, amateur chef by night. Seeking my plus one for gala events.",
      gender: "Male",
      interestedIn: "Female",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
      location: "New York, NY",
      age: 32,
      occupation: "SVP @ Goldman"
    },
    {
      name: "Jessica Albright",
      bio: "Fashion Director. I believe in high heels and higher standards. Surprise me.",
      gender: "Female",
      interestedIn: "Male",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
      location: "Los Angeles, CA",
      age: 29,
      occupation: "Creative Director"
    },
    {
      name: "David Wright",
      bio: "Venture Capitalist. Just moved from London to LA. I appreciate deep conversations.",
      gender: "Male",
      interestedIn: "Female",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
      location: "San Francisco, CA",
      age: 35,
      occupation: "Partner @ Sequoia"
    },
    {
      name: "Isabella Rossi",
      bio: "Architect. Obsessed with mid-century modern design. Let's get lost in the city.",
      gender: "Female",
      interestedIn: "Male",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800",
      location: "Chicago, IL",
      age: 30,
      occupation: "Lead Architect"
    }
  ]

  // Create users and profiles
  for (const p of dummyProfiles) {
    const user = await prisma.user.create({
      data: {
        email: `${p.name.replace(" ", "").toLowerCase()}@test.com`,
        name: p.name,
        password: "hashedpassword123", // In a real app this is hashed
      }
    })

    await prisma.profile.create({
      data: {
        userId: user.id,
        bio: p.bio,
        age: p.age,
        occupation: p.occupation,
        gender: p.gender,
        interestedIn: p.interestedIn,
        locationString: p.location,
        photos: JSON.stringify([p.image]), // Simplification
        incognitoMode: false,
        verificationStatus: "VERIFIED"
      }
    })

    console.log(`Created user ${p.name}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
