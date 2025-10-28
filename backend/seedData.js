const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// Sample products data
const products = [
  {
    name: 'Wireless Headphones',
    price: 79.99,
    category: 'Electronics',
    image: '🎧',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    stock: 50,
    rating: 4.5,
    reviewCount: 128
  },
  {
    name: 'Smart Watch',
    price: 199.99,
    category: 'Electronics',
    image: '⌚',
    description: 'Feature-packed smartwatch with health tracking, GPS, and 5-day battery life.',
    stock: 35,
    rating: 4.7,
    reviewCount: 94
  },
  {
    name: 'Laptop Stand',
    price: 49.99,
    category: 'Accessories',
    image: '💻',
    description: 'Ergonomic aluminum laptop stand with adjustable height and cooling ventilation.',
    stock: 75,
    rating: 4.3,
    reviewCount: 203
  },
  {
    name: 'Mechanical Keyboard',
    price: 129.99,
    category: 'Electronics',
    image: '⌨️',
    description: 'RGB mechanical gaming keyboard with customizable switches and macros.',
    stock: 40,
    rating: 4.8,
    reviewCount: 156
  },
  {
    name: 'USB-C Hub',
    price: 39.99,
    category: 'Accessories',
    image: '🔌',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery.',
    stock: 100,
    rating: 4.4,
    reviewCount: 87
  },
  {
    name: 'Desk Lamp',
    price: 34.99,
    category: 'Home',
    image: '💡',
    description: 'LED desk lamp with touch control, adjustable brightness, and USB charging port.',
    stock: 60,
    rating: 4.2,
    reviewCount: 142
  },
  {
    name: 'Phone Case',
    price: 19.99,
    category: 'Accessories',
    image: '📱',
    description: 'Durable protective phone case with military-grade drop protection.',
    stock: 200,
    rating: 4.6,
    reviewCount: 312
  },
  {
    name: 'Bluetooth Speaker',
    price: 89.99,
    category: 'Electronics',
    image: '🔊',
    description: 'Portable waterproof Bluetooth speaker with 360° sound and 24-hour battery.',
    stock: 45,
    rating: 4.5,
    reviewCount: 178
  },
  {
    name: 'Wireless Mouse',
    price: 29.99,
    category: 'Electronics',
    image: '🖱️',
    description: 'Ergonomic wireless mouse with precision tracking and rechargeable battery.',
    stock: 80,
    rating: 4.3,
    reviewCount: 95
  },
  {
    name: 'Cable Organizer',
    price: 14.99,
    category: 'Accessories',
    image: '🔗',
    description: 'Premium cable management kit to keep your workspace tidy and organized.',
    stock: 150,
    rating: 4.1,
    reviewCount: 67
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    console.log('\n📦 Created Products:');
    createdProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.category})`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();