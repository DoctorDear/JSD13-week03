const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Order = require('./models/Order');

// Seed Data from week-02
const usersData = [
  {
    _id: new mongoose.Types.ObjectId("65f123456789abcdef012345"),
    name: "สมชาย ใจดี",
    email: "somchai@email.com",
    password: "somchai123", // Plain text password to hash
    role: "customer",
    cart: [
      {
        equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543210"),
        quantity: 1
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId("65f123456789abcdef012346"),
    name: "สุชาติ โชคชัย",
    email: "suchat@email.com",
    password: "suchat456",
    role: "admin",
    cart: []
  },
  {
    _id: new mongoose.Types.ObjectId("65f123456789abcdef012347"),
    name: "วิภาดา รักดี",
    email: "wipada@email.com",
    password: "wipada789",
    role: "customer",
    cart: []
  },
  {
    _id: new mongoose.Types.ObjectId("65f123456789abcdef012348"),
    name: "มานะ ขยันยิ่ง",
    email: "mana@email.com",
    password: "mana101",
    role: "customer",
    cart: [
      {
        equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543216"),
        quantity: 1
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId("65f123456789abcdef012349"),
    name: "อนันต์ รักดี",
    email: "anan@email.com",
    password: "anan202",
    role: "customer",
    cart: []
  },
  {
    _id: new mongoose.Types.ObjectId("65f123456789abcdef01234a"),
    name: "กิตติพงษ์ สุขใจ",
    email: "kittipong@email.com",
    password: "kittipong303",
    role: "customer",
    cart: [
      {
        equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543219"),
        quantity: 1
      },
      {
        equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba54321a"),
        quantity: 1
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId("65f123456789abcdef01234b"),
    name: "ณัฐพล ใฝ่รู้",
    email: "nattaphol@email.com",
    password: "nattaphol404",
    role: "customer",
    cart: [
      {
        equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543210"),
        quantity: 1
      },
      {
        equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543216"),
        quantity: 1
      }
    ]
  }
];

const equipmentData = [
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543210"),
    name: "Sony Alpha 7 IV",
    brand: "Sony",
    category: "Body",
    pricePerDay: 1500,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543211"),
    name: "Canon EOS R6 Mark II",
    brand: "Canon",
    category: "Body",
    pricePerDay: 1600,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543212"),
    name: "Sony FX3 Cinema Camera",
    brand: "Sony",
    category: "Body",
    pricePerDay: 2500,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543213"),
    name: "Sony FE 24-70mm f/2.8 GM II",
    brand: "Sony",
    category: "Lens",
    pricePerDay: 1000,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543214"),
    name: "Canon RF 24-70mm f/2.8L IS USM",
    brand: "Canon",
    category: "Lens",
    pricePerDay: 1100,
    status: "maintenance"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543215"),
    name: "Sony FE 50mm f/1.2 GM",
    brand: "Sony",
    category: "Lens",
    pricePerDay: 900,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543216"),
    name: "Godox V1-S Flash (for Sony)",
    brand: "Godox",
    category: "Flash",
    pricePerDay: 300,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543217"),
    name: "Godox V1-C Flash (for Canon)",
    brand: "Godox",
    category: "Flash",
    pricePerDay: 300,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543218"),
    name: "Godox AD200 Pro Pocket Flash",
    brand: "Godox",
    category: "Flash",
    pricePerDay: 500,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543219"),
    name: "Canon EOS R50 (Body)",
    brand: "Canon",
    category: "Body",
    pricePerDay: 800,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba54321a"),
    name: "Canon RF 50mm f/1.8 STM",
    brand: "Canon",
    category: "Lens",
    pricePerDay: 300,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba54321b"),
    name: "Canon RF 24-105mm f/4-7.1 IS STM",
    brand: "Canon",
    category: "Lens",
    pricePerDay: 500,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba54321c"),
    name: "Canon EF 50mm f/1.8 STM",
    brand: "Canon",
    category: "Lens",
    pricePerDay: 200,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba54321d"),
    name: "Canon Mount Adapter EF-EOS R",
    brand: "Canon",
    category: "Adapter",
    pricePerDay: 150,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba54321e"),
    name: "Canon EOS R5 (Body)",
    brand: "Canon",
    category: "Body",
    pricePerDay: 2000,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba54321f"),
    name: "Canon EOS R8 (Body)",
    brand: "Canon",
    category: "Body",
    pricePerDay: 1100,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543220"),
    name: "Canon EOS C70 Cinema Camera",
    brand: "Canon",
    category: "Body",
    pricePerDay: 3000,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543221"),
    name: "Canon EOS R7 (Body)",
    brand: "Canon",
    category: "Body",
    pricePerDay: 1300,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543222"),
    name: "Canon RF 70-200mm f/2.8L IS USM",
    brand: "Canon",
    category: "Lens",
    pricePerDay: 1200,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543223"),
    name: "Canon RF 85mm f/1.2L USM",
    brand: "Canon",
    category: "Lens",
    pricePerDay: 1500,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543224"),
    name: "Canon EF 70-200mm f/2.8L IS III USM",
    brand: "Canon",
    category: "Lens",
    pricePerDay: 900,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543225"),
    name: "Canon Speedlite EL-5 Flash",
    brand: "Canon",
    category: "Flash",
    pricePerDay: 400,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543226"),
    name: "Canon Speedlite 600EX II-RT Flash",
    brand: "Canon",
    category: "Flash",
    pricePerDay: 300,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543227"),
    name: "Godox Xpro-S Wireless Flash Trigger (for Sony)",
    brand: "Godox",
    category: "Flash",
    pricePerDay: 150,
    status: "available"
  },
  {
    _id: new mongoose.Types.ObjectId("65f987654321fedcba543228"),
    name: "Godox Xpro-C Wireless Flash Trigger (for Canon)",
    brand: "Godox",
    category: "Flash",
    pricePerDay: 150,
    status: "available"
  }
];

const ordersData = [
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef0"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012345"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543210"),
    startDate: new Date("2026-07-10T00:00:00Z"),
    endDate: new Date("2026-07-15T00:00:00Z"),
    rentalFee: 7500,
    deposit: 5000,
    totalAmount: 12500,
    status: "pending",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_somchai.jpg",
      uploadedAt: new Date("2026-07-09T14:30:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef1"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012347"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543213"),
    startDate: new Date("2026-07-12T00:00:00Z"),
    endDate: new Date("2026-07-15T00:00:00Z"),
    rentalFee: 3000,
    deposit: 3000,
    totalAmount: 6000,
    status: "active",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_wipada.jpg",
      uploadedAt: new Date("2026-07-11T09:00:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef2"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012348"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543218"),
    startDate: new Date("2026-07-05T00:00:00Z"),
    endDate: new Date("2026-07-07T00:00:00Z"),
    rentalFee: 1000,
    deposit: 2000,
    totalAmount: 3000,
    status: "returned",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_mana.jpg",
      uploadedAt: new Date("2026-07-04T16:15:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef3"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012347"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba54321e"),
    startDate: new Date("2026-07-18T00:00:00Z"),
    endDate: new Date("2026-07-20T00:00:00Z"),
    rentalFee: 4000,
    deposit: 8000,
    totalAmount: 12000,
    status: "pending",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_wipada.jpg",
      uploadedAt: new Date("2026-07-17T10:00:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef4"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012345"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543219"),
    startDate: new Date("2026-07-08T00:00:00Z"),
    endDate: new Date("2026-07-11T00:00:00Z"),
    rentalFee: 2400,
    deposit: 3000,
    totalAmount: 5400,
    status: "active",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_somchai.jpg",
      uploadedAt: new Date("2026-07-07T11:15:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef5"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012345"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba54321a"),
    startDate: new Date("2026-07-08T00:00:00Z"),
    endDate: new Date("2026-07-11T00:00:00Z"),
    rentalFee: 900,
    deposit: 1000,
    totalAmount: 1900,
    status: "active",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_somchai.jpg",
      uploadedAt: new Date("2026-07-07T11:15:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef6"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012348"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543220"),
    startDate: new Date("2026-07-01T00:00:00Z"),
    endDate: new Date("2026-07-04T00:00:00Z"),
    rentalFee: 9000,
    deposit: 10000,
    totalAmount: 19000,
    status: "returned",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_mana.jpg",
      uploadedAt: new Date("2026-06-30T15:20:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef7"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012345"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba543222"),
    startDate: new Date("2026-07-12T00:00:00Z"),
    endDate: new Date("2026-07-14T00:00:00Z"),
    rentalFee: 2400,
    deposit: 4000,
    totalAmount: 6400,
    status: "cancelled",
    cancelReason: "ID card photo is too blurry and illegible. Renter failed to re-upload within 24 hours.",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_somchai_blurry.jpg",
      uploadedAt: new Date("2026-07-11T13:40:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef8"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012347"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba54321c"),
    startDate: new Date("2026-07-09T00:00:00Z"),
    endDate: new Date("2026-07-12T00:00:00Z"),
    rentalFee: 600,
    deposit: 1000,
    totalAmount: 1600,
    status: "active",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_wipada.jpg",
      uploadedAt: new Date("2026-07-08T16:05:00Z")
    }
  },
  {
    _id: new mongoose.Types.ObjectId("65f9be8f123456789abcdef9"),
    renterId: new mongoose.Types.ObjectId("65f123456789abcdef012347"),
    equipmentId: new mongoose.Types.ObjectId("65f987654321fedcba54321d"),
    startDate: new Date("2026-07-09T00:00:00Z"),
    endDate: new Date("2026-07-12T00:00:00Z"),
    rentalFee: 450,
    deposit: 500,
    totalAmount: 950,
    status: "active",
    verificationDoc: {
      idCardImageUrl: "/uploads/id_card_wipada.jpg",
      uploadedAt: new Date("2026-07-08T16:05:00Z")
    }
  }
];

async function seedDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<db_password>')) {
    console.error("Error: Please replace <db_password> with your actual MongoDB Atlas password in the .env file before seeding.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    // Clear existing data
    console.log("Clearing collections...");
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Order.deleteMany({});

    // Hash passwords for user seeding
    console.log("Hashing passwords and seeding Users...");
    const seededUsers = usersData.map(user => {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(user.password, salt);
      return user;
    });
    await User.insertMany(seededUsers);
    console.log(`Seeded ${seededUsers.length} users.`);

    // Seed equipment
    console.log("Seeding Equipment...");
    const fs = require('fs');
    const seededEquipment = equipmentData.map(item => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.jpg';
      const relativePath = '/images/products/' + slug;
      const absolutePath = path.join(__dirname, '..', 'web', 'images', 'products', slug);

      if (fs.existsSync(absolutePath)) {
        item.imageUrl = relativePath;
      } else {
        if (item.category === 'Body') item.imageUrl = '/images/body.png';
        else if (item.category === 'Lens') item.imageUrl = '/images/lens.png';
        else if (item.category === 'Flash') item.imageUrl = '/images/flash.png';
        else if (item.category === 'Adapter') item.imageUrl = '/images/adapter.png';
      }
      return item;
    });
    await Equipment.insertMany(seededEquipment);
    console.log(`Seeded ${equipmentData.length} equipment items.`);

    // Seed orders
    console.log("Seeding Orders...");
    await Order.insertMany(ordersData);
    console.log(`Seeded ${ordersData.length} orders.`);

    console.log("Database Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
