const { User, Product, Invoice, InvoiceItem } = require('./src/models');
const bcrypt = require('bcrypt');

async function addSampleData() {
  try {
    console.log('Adding sample data...\n');

    // 1. Create customers
    console.log('Creating customers...');
    const customer1 = await User.create({
      email: 'john@customer.com',
      password: await bcrypt.hash('customer123', 10),
      role: 'customer',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '555-0001',
      address: '123 Main St',
      city: 'Paris',
      country: 'France'
    });

    const customer2 = await User.create({
      email: 'jane@customer.com',
      password: await bcrypt.hash('customer123', 10),
      role: 'customer',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '555-0002',
      address: '456 Oak Ave',
      city: 'Lyon',
      country: 'France'
    });
    console.log('✅ Created 2 customers');

    // 2. Create products
    console.log('\nCreating products...');
    const products = await Product.bulkCreate([
      {
        name: 'Fresh Bananas',
        price: 2.99,
        brand: 'Fresh Farm',
        category: 'Fruits',
        stockQuantity: 100,
        description: 'Organic fresh bananas'
      },
      {
        name: 'Whole Milk',
        price: 3.49,
        brand: 'Dairy Fresh',
        category: 'Dairy',
        stockQuantity: 50,
        description: 'Fresh whole milk 1L'
      },
      {
        name: 'White Bread',
        price: 2.49,
        brand: 'Bakery Best',
        category: 'Bakery',
        stockQuantity: 75,
        description: 'Freshly baked white bread'
      },
      {
        name: 'Orange Juice',
        price: 4.99,
        brand: 'Citrus Co',
        category: 'Beverages',
        stockQuantity: 60,
        description: 'Fresh squeezed orange juice 1L'
      },
      {
        name: 'Chicken Breast',
        price: 8.99,
        brand: 'Farm Fresh',
        category: 'Meat',
        stockQuantity: 30,
        description: 'Fresh chicken breast 500g'
      },
      {
        name: 'Tomatoes',
        price: 3.99,
        brand: 'Garden Fresh',
        category: 'Vegetables',
        stockQuantity: 80,
        description: 'Fresh red tomatoes 1kg'
      },
      {
        name: 'Eggs (12)',
        price: 4.49,
        brand: 'Farm Fresh',
        category: 'Dairy',
        stockQuantity: 45,
        description: 'Free range eggs pack of 12'
      },
      {
        name: 'Pasta',
        price: 1.99,
        brand: 'Italian Best',
        category: 'Pantry',
        stockQuantity: 120,
        description: 'Spaghetti pasta 500g'
      },
      {
        name: 'Olive Oil',
        price: 9.99,
        brand: 'Mediterranean',
        category: 'Cooking',
        stockQuantity: 25,
        description: 'Extra virgin olive oil 750ml'
      },
      {
        name: 'Coffee',
        price: 12.99,
        brand: 'Morning Brew',
        category: 'Beverages',
        stockQuantity: 40,
        description: 'Premium ground coffee 500g'
      }
    ]);
    console.log('✅ Created 10 products');

    // 3. Create some invoices
    console.log('\nCreating orders...');
    
    // Invoice 1
    const invoice1 = await Invoice.create({
      invoiceNumber: 'INV-2024-00001',
      userId: customer1.id,
      totalAmount: 14.47,
      paymentMethod: 'card',
      paymentStatus: 'completed'
    });

    await InvoiceItem.bulkCreate([
      { invoiceId: invoice1.id, productId: products[0].id, quantity: 2, unitPrice: 2.99, subtotal: 5.98 },
      { invoiceId: invoice1.id, productId: products[1].id, quantity: 1, unitPrice: 3.49, subtotal: 3.49 },
      { invoiceId: invoice1.id, productId: products[2].id, quantity: 2, unitPrice: 2.49, subtotal: 4.98 }
    ]);

    // Invoice 2
    const invoice2 = await Invoice.create({
      invoiceNumber: 'INV-2024-00002',
      userId: customer2.id,
      totalAmount: 28.96,
      paymentMethod: 'cash',
      paymentStatus: 'completed'
    });

    await InvoiceItem.bulkCreate([
      { invoiceId: invoice2.id, productId: products[4].id, quantity: 2, unitPrice: 8.99, subtotal: 17.98 },
      { invoiceId: invoice2.id, productId: products[5].id, quantity: 1, unitPrice: 3.99, subtotal: 3.99 },
      { invoiceId: invoice2.id, productId: products[3].id, quantity: 1, unitPrice: 4.99, subtotal: 4.99 }
    ]);

    // Invoice 3
    const invoice3 = await Invoice.create({
      invoiceNumber: 'INV-2024-00003',
      userId: customer1.id,
      totalAmount: 19.47,
      paymentMethod: 'paypal',
      paymentStatus: 'completed'
    });

    await InvoiceItem.bulkCreate([
      { invoiceId: invoice3.id, productId: products[6].id, quantity: 1, unitPrice: 4.49, subtotal: 4.49 },
      { invoiceId: invoice3.id, productId: products[7].id, quantity: 3, unitPrice: 1.99, subtotal: 5.97 },
      { invoiceId: invoice3.id, productId: products[8].id, quantity: 1, unitPrice: 9.99, subtotal: 9.99 }
    ]);

    console.log('✅ Created 3 orders');

    console.log('\n🎉 Sample data added successfully!\n');
    console.log('Summary:');
    console.log('- 2 customers');
    console.log('- 10 products');
    console.log('- 3 completed orders');
    console.log('\nYou can now login and see the data!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSampleData();
