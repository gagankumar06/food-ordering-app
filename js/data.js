// data.js - Comprehensive Indian restaurant data, curated menus, coupons, and categories

const INITIAL_CATEGORIES = [
  { id: 'all', name: 'All Dishes', icon: '🍽️', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80' },
  { id: 'biryani', name: 'Biryani', icon: '🍗', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80' },
  { id: 'burgers', name: 'Burgers', icon: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80' },
  { id: 'south-indian', name: 'South Indian', icon: '🥞', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&auto=format&fit=crop&q=80' },
  { id: 'north-indian', name: 'North Indian', icon: '🥘', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80' },
  { id: 'chinese', name: 'Chinese', icon: '🍜', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&auto=format&fit=crop&q=80' },
  { id: 'desserts', name: 'Desserts', icon: '🍰', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=80' },
  { id: 'beverages', name: 'Beverages', icon: '🧋', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80' },
  { id: 'rolls', name: 'Rolls & Wraps', icon: '🌯', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80' },
];

const INITIAL_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'Meghana Foods',
    tagLine: 'Authentic Andhra Spiced Biryani & Starters',
    cuisines: ['Biryani', 'Andhra', 'North Indian', 'South Indian'],
    rating: 4.6,
    ratingCount: '14.2k+',
    costForTwo: 450,
    // Koramangala 5th Block, Bengaluru
    latitude: 12.9348,
    longitude: 77.6252,
    deliveryRadiusKm: 8.0,
    minOrder: 149,
    isOpen: true,
    openingHours: '11:00 AM - 11:30 PM',
    isPureVeg: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    badge: '50% OFF up to ₹100',
    featured: true,
    menu: [
      {
        id: 'm-101',
        name: 'Meghana Special Chicken Biryani',
        category: 'Biryani',
        price: 330,
        isVeg: false,
        isBestseller: true,
        isSpicy: true,
        rating: 4.8,
        ratingCount: 3410,
        description: 'Tender boneless chicken marinated in spicy Andhra masala slow-cooked with fragrant aged basmati rice. Served with raita & salan.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          portions: [
            { name: 'Regular (Serves 1)', priceDelta: 0 },
            { name: 'Large (Serves 2)', priceDelta: 160 }
          ],
          spiceLevel: ['Medium Spicy', 'Andhra Fiery Hot'],
          addOns: [
            { name: 'Extra Boiled Egg (2 pcs)', price: 40 },
            { name: 'Extra Gravy / Salan', price: 30 },
            { name: 'Thums Up (250ml)', price: 35 }
          ]
        }
      },
      {
        id: 'm-102',
        name: 'Paneer Butter Biryani',
        category: 'Biryani',
        price: 280,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.6,
        ratingCount: 1820,
        description: 'Fresh malai paneer cubes tossed in rich creamy gravy layered with ghee flavored basmati rice.',
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          portions: [
            { name: 'Regular', priceDelta: 0 },
            { name: 'Large', priceDelta: 140 }
          ],
          addOns: [
            { name: 'Extra Roasted Cashews', price: 50 },
            { name: 'Cucumber Mint Raita', price: 35 }
          ]
        }
      },
      {
        id: 'm-103',
        name: 'Andhra Chilli Chicken',
        category: 'Starters',
        price: 290,
        isVeg: false,
        isBestseller: true,
        isSpicy: true,
        rating: 4.7,
        ratingCount: 2200,
        description: 'Iconic Andhra preparation with fiery green chilies, curry leaves, and dry ground spices.',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
        customizable: false
      },
      {
        id: 'm-104',
        name: 'Guntur Paneer Tikka',
        category: 'Starters',
        price: 260,
        isVeg: true,
        isBestseller: false,
        isSpicy: true,
        rating: 4.4,
        ratingCount: 890,
        description: 'Smoky clay-oven paneer marinated in Guntur chili paste and hung curd.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
        customizable: false
      },
      {
        id: 'm-105',
        name: 'Gulab Jamun with Rabdi (2 Pcs)',
        category: 'Desserts',
        price: 120,
        isVeg: true,
        isBestseller: false,
        isSpicy: false,
        rating: 4.7,
        ratingCount: 650,
        description: 'Warm melt-in-mouth khoya jamuns dipped in rose syrup, topped with thick condensed rabdi.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-2',
    name: 'The Rameshwaram Cafe',
    tagLine: 'Crispy Ghee Podi Dosas & Filter Coffee',
    cuisines: ['South Indian', 'Beverages', 'Street Food'],
    rating: 4.7,
    ratingCount: '28.5k+',
    costForTwo: 250,
    // Indiranagar 12th Main, Bengaluru
    latitude: 12.9724,
    longitude: 77.6415,
    deliveryRadiusKm: 6.5,
    minOrder: 99,
    isOpen: true,
    openingHours: '6:30 AM - 1:00 AM',
    isPureVeg: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    badge: 'FREE DELIVERY',
    featured: true,
    menu: [
      {
        id: 'm-201',
        name: 'Ghee Podi Masala Dosa',
        category: 'South Indian',
        price: 140,
        isVeg: true,
        isBestseller: true,
        isSpicy: true,
        rating: 4.9,
        ratingCount: 15400,
        description: 'Golden crispy fermented crepe roasted in pure desi ghee, smeared with fiery gunpowder podi and filled with spiced potato masala.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          portions: [
            { name: 'Standard', priceDelta: 0 },
            { name: 'Extra Crispy Benne', priceDelta: 25 }
          ],
          addOns: [
            { name: 'Extra Desi Ghee Cup', price: 30 },
            { name: 'Extra Gunpowder Podi', price: 20 },
            { name: 'Filter Coffee', price: 45 }
          ]
        }
      },
      {
        id: 'm-202',
        name: 'Ghee Thatte Idli (2 Pcs)',
        category: 'South Indian',
        price: 110,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.8,
        ratingCount: 9200,
        description: 'Steamed plate-sized fluffy idlis soaked in melted pure ghee, dusted with spicy chutney podi. Served with 3 coconut chutneys.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          addOns: [
            { name: 'Extra Sambar', price: 25 },
            { name: 'Crispy Medu Vada (1 pc)', price: 40 }
          ]
        }
      },
      {
        id: 'm-203',
        name: 'Authentic Filter Coffee',
        category: 'Beverages',
        price: 55,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.9,
        ratingCount: 8800,
        description: 'Traditional decoction coffee brewed with Chikmagalur chicory blend & frothy full-cream milk.',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-3',
    name: 'Truffles Bistro & Burgers',
    tagLine: 'Gourmet American Burgers, Pastas & Shakes',
    cuisines: ['Burgers', 'American', 'Desserts', 'Beverages'],
    rating: 4.5,
    ratingCount: '21.4k+',
    costForTwo: 500,
    // Koramangala 5th Block, Bengaluru
    latitude: 12.9344,
    longitude: 77.6180,
    deliveryRadiusKm: 7.0,
    minOrder: 120,
    isOpen: true,
    openingHours: '11:30 AM - 11:00 PM',
    isPureVeg: false,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&auto=format&fit=crop&q=80',
    badge: 'FLAT ₹125 OFF',
    featured: true,
    menu: [
      {
        id: 'm-301',
        name: 'All American Cheese Burger',
        category: 'Burgers',
        price: 270,
        isVeg: false,
        isBestseller: true,
        isSpicy: false,
        rating: 4.7,
        ratingCount: 6540,
        description: 'Char-grilled juicy patty layered with melted cheddar, caramelised onions, pickles, tomato & chef secret mustard mayo on toasted brioche.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          portions: [
            { name: 'Single Patty', priceDelta: 0 },
            { name: 'Double Patty & Double Cheese', priceDelta: 110 }
          ],
          addOns: [
            { name: 'Seasoned Peri Peri Fries', price: 90 },
            { name: 'Crispy Bacon Strips', price: 75 },
            { name: 'Cold Chocolate Shake', price: 130 }
          ]
        }
      },
      {
        id: 'm-302',
        name: 'Crispy Paneer Makhani Burger',
        category: 'Burgers',
        price: 240,
        isVeg: true,
        isBestseller: true,
        isSpicy: true,
        rating: 4.5,
        ratingCount: 3100,
        description: 'Golden fried herb crusted cottage cheese block drenched in tandoori makhani glaze with crunchy lettuce.',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          addOns: [
            { name: 'Cheese Burst Core', price: 45 },
            { name: 'Salted Crinkle Fries', price: 70 }
          ]
        }
      },
      {
        id: 'm-303',
        name: 'Ferrero Rocher Thick Shake',
        category: 'Beverages',
        price: 210,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.8,
        ratingCount: 2900,
        description: 'Decadent chocolate hazelnut shake blended with whole Ferrero Rocher candies, whipped cream & chocolate drizzle.',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-4',
    name: 'Brik Oven Neapolitan Pizzeria',
    tagLine: 'Authentic Woodfired Sourdough Pizzas',
    cuisines: ['Pizza', 'Italian', 'Desserts'],
    rating: 4.6,
    ratingCount: '8.9k+',
    costForTwo: 700,
    // Indiranagar, Bengaluru
    latitude: 12.9782,
    longitude: 77.6402,
    deliveryRadiusKm: 6.0,
    minOrder: 250,
    isOpen: true,
    openingHours: '12:00 PM - 11:30 PM',
    isPureVeg: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    badge: '30% OFF up to ₹75',
    featured: false,
    menu: [
      {
        id: 'm-401',
        name: 'Margherita Burrata D.O.P',
        category: 'Pizza',
        price: 490,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.9,
        ratingCount: 3800,
        description: 'San Marzano tomato sauce, fresh artisan burrata cheese, extra virgin olive oil and torn fresh sweet basil on 48-hr fermented crust.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          portions: [
            { name: '11 inch Medium', priceDelta: 0 },
            { name: '13 inch Large', priceDelta: 160 }
          ],
          crusts: ['Original Sourdough', 'Cheese Stuffed Crust (+₹80)'],
          addOns: [
            { name: 'Extra Buffalo Mozzarella', price: 90 },
            { name: 'Roasted Garlic & Jalapenos', price: 40 },
            { name: 'Truffle Oil Drizzle', price: 65 }
          ]
        }
      },
      {
        id: 'm-402',
        name: 'Pepperoni & Hot Honey Woodfired Pizza',
        category: 'Pizza',
        price: 580,
        isVeg: false,
        isBestseller: true,
        isSpicy: true,
        rating: 4.8,
        ratingCount: 4100,
        description: 'Smoky pork pepperoni slices, crushed chili flakes, melted mozzarella, drizzled with spicy habanero hot honey.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          portions: [
            { name: '11 inch Medium', priceDelta: 0 },
            { name: '13 inch Large', priceDelta: 170 }
          ],
          addOns: [
            { name: 'Extra Pepperoni', price: 110 },
            { name: 'Garlic Butter Dip', price: 45 }
          ]
        }
      },
      {
        id: 'm-403',
        name: 'Garlic Knots with Marinara',
        category: 'Starters',
        price: 220,
        isVeg: true,
        isBestseller: false,
        isSpicy: false,
        rating: 4.4,
        ratingCount: 1100,
        description: 'Tied sourdough knots brushed with garlic butter, parmesan, and fresh parsley.',
        image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-5',
    name: 'Leon Grill Burgers & Wings',
    tagLine: 'Juicy Grilled Doners, Wings & Wraps',
    cuisines: ['Burgers', 'Rolls & Wraps', 'Fast Food'],
    rating: 4.3,
    ratingCount: '11.8k+',
    costForTwo: 400,
    // HSR Layout Sector 3, Bengaluru
    latitude: 12.9116,
    longitude: 77.6389,
    deliveryRadiusKm: 7.5,
    minOrder: 150,
    isOpen: true,
    openingHours: '11:00 AM - 1:00 AM',
    isPureVeg: false,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    badge: '₹100 OFF on ₹399',
    featured: false,
    menu: [
      {
        id: 'm-501',
        name: 'Peri Peri Grilled Chicken Burger',
        category: 'Burgers',
        price: 225,
        isVeg: false,
        isBestseller: true,
        isSpicy: true,
        rating: 4.5,
        ratingCount: 3890,
        description: 'Succulent chicken breast marinated in fiery African bird’s eye chili, flame-grilled and served with herb mayo.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          spiceLevel: ['Mild Lemon Herb', 'Hot Peri Peri', 'Extra Hot'],
          addOns: [
            { name: 'Cheddar Cheese Slice', price: 30 },
            { name: 'Coke 330ml', price: 40 }
          ]
        }
      },
      {
        id: 'm-502',
        name: 'Crispy Falafel Roll',
        category: 'Rolls & Wraps',
        price: 180,
        isVeg: true,
        isBestseller: false,
        isSpicy: false,
        rating: 4.3,
        ratingCount: 1420,
        description: 'Herbed chickpea falafel patties wrapped in soft pita with pickled veggies, tahini and creamy garlic sauce.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-6',
    name: 'Punjab Grill Royale',
    tagLine: 'Rich Butter Chicken, Dal Makhani & Garlic Naan',
    cuisines: ['North Indian', 'Biryani', 'Desserts'],
    rating: 4.5,
    ratingCount: '9.3k+',
    costForTwo: 650,
    // Church Street / MG Road, Bengaluru
    latitude: 12.9745,
    longitude: 77.6062,
    deliveryRadiusKm: 9.0,
    minOrder: 199,
    isOpen: true,
    openingHours: '12:00 PM - 11:30 PM',
    isPureVeg: false,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    badge: 'Flat 20% OFF',
    featured: true,
    menu: [
      {
        id: 'm-601',
        name: 'Murgh Makhani (Butter Chicken)',
        category: 'North Indian',
        price: 360,
        isVeg: false,
        isBestseller: true,
        isSpicy: false,
        rating: 4.8,
        ratingCount: 4120,
        description: 'Tandoor roasted shredded chicken steeped in velvet smooth tomato, butter & cashew gravy finished with kasuri methi.',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          addOns: [
            { name: 'Butter Garlic Naan (1 pc)', price: 65 },
            { name: 'Lacha Paratha (1 pc)', price: 55 },
            { name: 'Jeera Rice Cup', price: 90 }
          ]
        }
      },
      {
        id: 'm-602',
        name: 'Slow Cooked Dal Makhani',
        category: 'North Indian',
        price: 290,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.7,
        ratingCount: 2980,
        description: 'Black urad lentils simmered overnight on charcoal hearth with churned white butter and cream.',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
        customizable: false
      },
      {
        id: 'm-603',
        name: 'Paneer Tikka Lababdar',
        category: 'North Indian',
        price: 320,
        isVeg: true,
        isBestseller: false,
        isSpicy: true,
        rating: 4.5,
        ratingCount: 1650,
        description: 'Fresh paneer cubes in onion tomato masala laced with chopped ginger, coriander and whole spices.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-7',
    name: 'Mainland China Dimsum House',
    tagLine: 'Wok Noodles, Dimsums & Schezwan Platters',
    cuisines: ['Chinese', 'Asian', 'Beverages'],
    rating: 4.4,
    ratingCount: '7.1k+',
    costForTwo: 550,
    // Koramangala 6th Block, Bengaluru
    latitude: 12.9360,
    longitude: 77.6275,
    deliveryRadiusKm: 5.5,
    minOrder: 199,
    isOpen: true,
    openingHours: '12:30 PM - 11:00 PM',
    isPureVeg: false,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&auto=format&fit=crop&q=80',
    badge: '15% OFF',
    featured: false,
    menu: [
      {
        id: 'm-701',
        name: 'Hakka Chili Garlic Noodles',
        category: 'Chinese',
        price: 240,
        isVeg: true,
        isBestseller: true,
        isSpicy: true,
        rating: 4.6,
        ratingCount: 2200,
        description: 'Wok tossed hand-pulled noodles with crunchy bell peppers, cabbage, burnt garlic and chili flakes.',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          addOns: [
            { name: 'Add Shredded Chicken', price: 70 },
            { name: 'Add Schezwan Sauce Dip', price: 25 }
          ]
        }
      },
      {
        id: 'm-702',
        name: 'Steamed Chicken Sui Mai (6 Pcs)',
        category: 'Chinese',
        price: 280,
        isVeg: false,
        isBestseller: true,
        isSpicy: false,
        rating: 4.7,
        ratingCount: 1920,
        description: 'Delicate open-topped dumplings stuffed with seasoned minced chicken, shiitake mushrooms and water chestnuts.',
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-8',
    name: 'Chai Point & Desi Bakes',
    tagLine: 'Kadak Ginger Chai, Bun Maska & Samosas',
    cuisines: ['Beverages', 'Street Food', 'Desserts'],
    rating: 4.3,
    ratingCount: '15.6k+',
    costForTwo: 200,
    // Koramangala 1st Block, Bengaluru
    latitude: 12.9315,
    longitude: 77.6220,
    deliveryRadiusKm: 5.0,
    minOrder: 79,
    isOpen: true,
    openingHours: '7:00 AM - 11:00 PM',
    isPureVeg: true,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    badge: 'FREE DELIVERY',
    featured: false,
    menu: [
      {
        id: 'm-801',
        name: 'Ginger Cardamom Kadak Chai Flask (500ml)',
        category: 'Beverages',
        price: 135,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.8,
        ratingCount: 5200,
        description: 'Heat retaining flask holding 4-5 cups of freshly pounded ginger and crushed green cardamom milk tea.',
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          sugar: ['Normal Sweetness', 'Less Sweet', 'Jaggery Sweetened', 'Sugar Free'],
          addOns: [
            { name: 'Amul Bun Maska', price: 55 },
            { name: 'Punjabi Aloo Samosa (2 pcs)', price: 50 }
          ]
        }
      },
      {
        id: 'm-802',
        name: 'Crispy Punjabi Samosa (2 Pcs)',
        category: 'Street Food',
        price: 60,
        isVeg: true,
        isBestseller: true,
        isSpicy: true,
        rating: 4.5,
        ratingCount: 3840,
        description: 'Golden triangular pastry crust filled with spiced potatoes, green peas and whole coriander seeds. Served with mint & saunth chutney.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  },
  {
    id: 'rest-9',
    name: 'Empire Restaurant 1966',
    tagLine: 'Bengaluru Night Owl Favourite - Ghee Rice & Kebabs',
    cuisines: ['North Indian', 'Biryani', 'South Indian'],
    rating: 4.2,
    ratingCount: '24.1k+',
    costForTwo: 450,
    // Church Street, Bengaluru
    latitude: 12.9748,
    longitude: 77.6075,
    deliveryRadiusKm: 12.0,
    minOrder: 150,
    isOpen: true,
    openingHours: '12:00 PM - 2:00 AM',
    isPureVeg: false,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    badge: 'OPEN TILL 2 AM',
    featured: false,
    menu: [
      {
        id: 'm-901',
        name: 'Empire Ghee Rice & Chicken Kebab Combo',
        category: 'Biryani',
        price: 310,
        isVeg: false,
        isBestseller: true,
        isSpicy: true,
        rating: 4.7,
        ratingCount: 9400,
        description: 'Aromatic basmati ghee rice tempered with golden onions and cashews, served with crispy spiced Empire deep-fried chicken kebab and dalcha.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          addOns: [
            { name: 'Extra Chicken Kebab (4 pcs)', price: 140 },
            { name: 'Coin Parotta (2 pcs)', price: 40 }
          ]
        }
      }
    ]
  },
  {
    id: 'rest-10',
    name: 'Corner House Ice Cream',
    tagLine: 'Iconic DBC - Death By Chocolate & Sundaes',
    cuisines: ['Desserts', 'Beverages'],
    rating: 4.8,
    ratingCount: '32.0k+',
    costForTwo: 300,
    // Koramangala 7th Block, Bengaluru
    latitude: 12.9372,
    longitude: 77.6145,
    deliveryRadiusKm: 8.5,
    minOrder: 99,
    isOpen: true,
    openingHours: '11:00 AM - 11:30 PM',
    isPureVeg: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    badge: 'TOP RATED DESSERTS',
    featured: true,
    menu: [
      {
        id: 'm-1001',
        name: 'Death By Chocolate (DBC)',
        category: 'Desserts',
        price: 240,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.9,
        ratingCount: 16800,
        description: 'Warm dark chocolate fudge cake layered with vanilla bean ice cream, hot thick chocolate fudge, roasted peanuts and cherries.',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
        customizable: true,
        customizationOptions: {
          portions: [
            { name: 'Regular DBC', priceDelta: 0 },
            { name: 'Jumbo DBC (Double Fudge)', priceDelta: 90 }
          ],
          addOns: [
            { name: 'Extra Hot Fudge Cup', price: 45 },
            { name: 'Extra Roasted Cashews & Peanuts', price: 35 }
          ]
        }
      }
    ]
  },
  {
    id: 'rest-11',
    name: 'Vidyarthi Bhavan 1943',
    tagLine: 'Legendary Heritage Masala Dosa of Gandhi Bazaar',
    cuisines: ['South Indian'],
    rating: 4.6,
    ratingCount: '19.8k+',
    costForTwo: 200,
    // Basavanagudi, Bengaluru
    latitude: 12.9430,
    longitude: 77.5739,
    deliveryRadiusKm: 6.0,
    minOrder: 99,
    isOpen: false, // demonstrate closed restaurant state
    openingHours: 'Opens at 6:30 AM tomorrow',
    isPureVeg: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    badge: 'HERITAGE SINCE 1943',
    featured: false,
    menu: [
      {
        id: 'm-1101',
        name: 'Vidyarthi Special Masala Dosa',
        category: 'South Indian',
        price: 90,
        isVeg: true,
        isBestseller: true,
        isSpicy: false,
        rating: 4.8,
        ratingCount: 11200,
        description: 'Thick, pillow-soft inside with crisp golden crust roasted on cast iron griddle with red chutney smear and potato palya.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
        customizable: false
      }
    ]
  }
];

const INITIAL_COUPONS = [
  {
    code: 'WELCOME100',
    title: 'Flat ₹100 OFF',
    description: 'Use code WELCOME100 on your first feast above ₹299',
    discountType: 'flat', // flat | percent
    discountValue: 100,
    minOrder: 299,
    maxDiscount: 100,
  },
  {
    code: 'EATY50',
    title: '50% OFF up to ₹120',
    description: 'Get 50% discount up to ₹120 on orders above ₹199',
    discountType: 'percent',
    discountValue: 50,
    minOrder: 199,
    maxDiscount: 120,
  },
  {
    code: 'FREEDEL',
    title: 'Free Delivery',
    description: 'Zero delivery fee on orders above ₹149',
    discountType: 'free_delivery',
    discountValue: 100,
    minOrder: 149,
    maxDiscount: 60,
  },
  {
    code: 'BIRYANI25',
    title: '25% OFF on Biryani',
    description: 'Save 25% up to ₹100 on orders above ₹349',
    discountType: 'percent',
    discountValue: 25,
    minOrder: 349,
    maxDiscount: 100,
  }
];

const INITIAL_PRESET_LOCATIONS = [
  {
    name: 'Koramangala 5th Block',
    address: 'Near Sony World Signal, 80 Feet Road, Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    city: 'Bengaluru',
    isDefault: true
  },
  {
    name: 'Indiranagar 100ft Road',
    address: '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    city: 'Bengaluru'
  },
  {
    name: 'HSR Layout Sector 3',
    address: '27th Main Rd, Sector 3, HSR Layout, Bengaluru',
    lat: 12.9121,
    lng: 77.6446,
    city: 'Bengaluru'
  },
  {
    name: 'Church Street / MG Road',
    address: 'Near Brigade Road Metro, Central Bengaluru',
    lat: 12.9745,
    lng: 77.6062,
    city: 'Bengaluru'
  },
  {
    name: 'Bandra West (Linking Road)',
    address: 'Pali Hill, Bandra West, Mumbai, Maharashtra',
    lat: 19.0596,
    lng: 72.8295,
    city: 'Mumbai'
  },
  {
    name: 'Connaught Place (Inner Circle)',
    address: 'Block B, Connaught Place, New Delhi',
    lat: 28.6315,
    lng: 77.2167,
    city: 'New Delhi'
  },
  {
    name: 'Hitec City, Madhapur',
    address: 'Cyber Towers Signal, Madhapur, Hyderabad, Telangana',
    lat: 17.4435,
    lng: 78.3772,
    city: 'Hyderabad'
  }
];

window.EatyData = {
  categories: INITIAL_CATEGORIES,
  restaurants: INITIAL_RESTAURANTS,
  coupons: INITIAL_COUPONS,
  presetLocations: INITIAL_PRESET_LOCATIONS,
};
