const axios = require('axios');
const { Product, sequelize } = require('../models');

const CATEGORIES = [
  'chocolates',
  'biscuits',
  'cereals',
  'beverages',
  'dairy',
  'snacks',
  'pasta',
  'sauces',
  'canned-foods',
  'breads'
];

async function fetchProductsFromCategory(category, limit = 20) {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/category/${category}.json`,
      {
        params: {
          page_size: limit,
          page: 1
        }
      }
    );
    return response.data.products || [];
  } catch (error) {
    console.error(`Failed to fetch category ${category}:`, error.message);
    return [];
  }
}

async function loadProducts() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.\n');

    let totalImported = 0;

    for (const category of CATEGORIES) {
      console.log(`\n📦 Fetching products from category: ${category}...`);
      
      const products = await fetchProductsFromCategory(category, 15);
      
      for (const product of products) {
        if (!product.product_name || !product.code) {
          continue;
        }

        try {
          const existing = await Product.findOne({ 
            where: { barcode: product.code } 
          });

          if (existing) {
            console.log(`  ⏭️  Skipping (exists): ${product.product_name}`);
            continue;
          }

          const price = (Math.random() * 28 + 1.99).toFixed(2);
          const stockQuantity = Math.floor(Math.random() * 100);

          await Product.create({
            name: product.product_name.substring(0, 255),
            barcode: product.code,
            brand: (product.brands || 'Unknown').substring(0, 255),
            category: (product.categories || category).split(',')[0].trim().substring(0, 255),
            pictureUrl: product.image_url || product.image_small_url || null,
            description: (product.generic_name || '').substring(0, 1000),
            price: parseFloat(price),
            stockQuantity: stockQuantity,
            nutritionalInfo: {
              energy: product.nutriments?.['energy-kcal_100g'],
              fat: product.nutriments?.fat_100g,
              saturatedFat: product.nutriments?.['saturated-fat_100g'],
              carbohydrates: product.nutriments?.carbohydrates_100g,
              sugars: product.nutriments?.sugars_100g,
              proteins: product.nutriments?.proteins_100g,
              salt: product.nutriments?.salt_100g,
              fiber: product.nutriments?.fiber_100g,
            },
            openFoodFactsId: product.id || product.code,
            lastSyncedAt: new Date()
          });

          console.log(`  ✅ Imported: ${product.product_name}`);
          totalImported++;

        } catch (err) {
          console.error(`  ❌ Failed to import ${product.product_name}:`, err.message);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n\n🎉 Done! Imported ${totalImported} products from Open Food Facts.\n`);
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

loadProducts();
