const { Product } = require("./models/Product");
const { User } = require("./models/Users");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");

const products = [
  {
    name: "Classic Cotton T-Shirt",
    description:
      "Soft everyday cotton tee with a modern fit and breathable fabric.",
    price: 19.99,
    image: "https://via.placeholder.com/150",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["Black", "White", "Gray"],
    category: "Tops",
    quantity: 50,
  },
  {
    name: "Urban Denim Jacket",
    description:
      "A lightweight denim jacket designed for casual everyday wear.",
    price: 64.99,
    image: "https://via.placeholder.com/150",
    availableSizes: ["M", "L", "XL", "XXL"],
    availableColors: ["Blue", "Black"],
    category: "Outerwear",
    quantity: 22,
  },
  {
    name: "Premium Wool Sweater",
    description:
      "Warm knit sweater with a clean silhouette and premium texture.",
    price: 74.5,
    image: "https://via.placeholder.com/150",
    availableSizes: ["S", "M", "L"],
    availableColors: ["Cream", "Charcoal", "Navy"],
    category: "Sweaters",
    quantity: 18,
  },
  {
    name: "Everyday Linen Shirt",
    description:
      "Breathable linen shirt suitable for warm weather and smart casual looks.",
    price: 45.0,
    image: "https://via.placeholder.com/150",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["Sand", "White", "Olive"],
    category: "Shirts",
    quantity: 31,
  },
  {
    name: "Trail Runner Sneakers",
    description:
      "Comfortable sneakers built for movement and daily walking comfort.",
    price: 89.99,
    image: "https://via.placeholder.com/150",
    availableSizes: ["M", "L", "XL"],
    availableColors: ["White", "Black", "Red"],
    category: "Shoes",
    quantity: 27,
  },
  {
    name: "Slim Fit Chino Pants",
    description:
      "Modern fitted chinos with stretch fabric for all-day comfort.",
    price: 52.25,
    image: "https://via.placeholder.com/150",
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    availableColors: ["Khaki", "Navy", "Black"],
    category: "Pants",
    quantity: 40,
  },
  {
    name: "Sport Mesh Polo",
    description:
      "Performance polo with moisture-wicking fabric for active days.",
    price: 39.99,
    image: "https://via.placeholder.com/150",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["Teal", "Blue", "White"],
    category: "Sportswear",
    quantity: 36,
  },
  {
    name: "Leather Crossbody Bag",
    description:
      "Minimal leather bag with compact storage and premium finishing.",
    price: 95.0,
    image: "https://via.placeholder.com/150",
    availableSizes: ["M", "L"],
    availableColors: ["Brown", "Black"],
    category: "Accessories",
    quantity: 14,
  },
  {
    name: "Hooded Fleece Hoodie",
    description:
      "Cozy fleece hoodie with a relaxed fit and soft brushed interior.",
    price: 58.75,
    image: "https://via.placeholder.com/150",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["Heather Gray", "Forest Green", "Black"],
    category: "Hoodies",
    quantity: 29,
  },
  {
    name: "Formal Oxford Shirt",
    description:
      "Sharp Oxford shirt tailored for office wear and formal events.",
    price: 57.99,
    image: "https://via.placeholder.com/150",
    availableSizes: ["M", "L", "XL"],
    availableColors: ["White", "Sky Blue", "Navy"],
    category: "Formal",
    quantity: 24,
  },
];

const users = [
  {
    name: "Ahmad Hassan",
    email: "ahmad.hassan1@example.com",
    phone: "0501234567",
    address: "Amman, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Sarah Ali",
    email: "sarah.ali2@example.com",
    phone: "0597654321",
    address: "Irbid, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Omar Nasser",
    email: "omar.nasser3@example.com",
    phone: "0771122334",
    address: "Zarqa, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Lina Mahmoud",
    email: "lina.mahmoud4@example.com",
    phone: "0789988776",
    address: "Aqaba, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Yousef Khaled",
    email: "yousef.khaled5@example.com",
    phone: "0512233445",
    address: "Madaba, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Maya Samir",
    email: "maya.samir6@example.com",
    phone: "0567788990",
    address: "Salt, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Karim Fares",
    email: "karim.fares7@example.com",
    phone: "0793344556",
    address: "Petra, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Nour Haddad",
    email: "nour.haddad8@example.com",
    phone: "0536677889",
    address: "Jerash, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Ali Rami",
    email: "ali.rami9@example.com",
    phone: "0778899001",
    address: "Ajloun, Jordan",
    isAdmin: false,
    password: bcrypt.hashSync("Password123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
  {
    name: "Admin User",
    email: "admin@shop.com",
    phone: "0581010101",
    address: "Head Office, Amman",
    isAdmin: true,
    password: bcrypt.hashSync("Admin123!", 10),
    productsOrdered: [],
    productsBought: [],
  },
];

const AddProducts = async () => {
  try {
    await Product.insertMany(products);
    console.log("Products added successfully");
  } catch (error) {
    console.error("Error adding products:", error);
  }
};

const RemoveProducts = async () => {
  try {
    await Product.deleteMany({});
    console.log("Products removed successfully");
  } catch (error) {
    console.error("Error removing products:", error);
  }
};

const AddUsers = async () => {
  try {
    await User.insertMany(users);
    console.log("Users added successfully");
  } catch (error) {
    console.error("Error adding users:", error);
  }
};

const RemoveUsers = async () => {
  try {
    await User.deleteMany({});
    console.log("Users removed successfully");
  } catch (error) {
    console.error("Error removing users:", error);
  }
};

if (process.argv[2] === "-delete") {
  connectDB()
    .then(() => RemoveProducts())
    .then(() => process.exit());
} else if (process.argv[2] === "-add") {
  connectDB()
    .then(() => AddProducts())
    .then(() => process.exit());
} else if (process.argv[2] === "-delete-users") {
  connectDB()
    .then(() => RemoveUsers())
    .then(() => process.exit());
} else if (process.argv[2] === "-add-users") {
  connectDB()
    .then(() => AddUsers())
    .then(() => process.exit());
} else if (process.argv[2] === "-add-all") {
  connectDB()
    .then(() => Promise.all([AddProducts(), AddUsers()]))
    .then(() => process.exit());
} else {
  console.log(
    "Usage: node seeder.js -add | -delete | -add-users | -delete-users | -add-all",
  );
}
