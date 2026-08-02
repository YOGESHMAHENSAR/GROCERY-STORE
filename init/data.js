const sampleListings = [
  {
    title: "Organic Alphonso Mangoes",
    description: "King of Mangoes sourced directly from Ratnagiri. Sweet, pulpy, and 100% organic.",
    image: {
      url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=60",
      filename: "listingimage",
    },
    price: 850,
    category: "Grocery"
  },
  {
    title: "Premium Basmati Rice",
    description: "Extra-long grain aged Basmati rice with a rich aroma, perfect for biryani and pulao.",
    image: {
      url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=60",
      filename: "listingimage",
    },
    price: 210,
    category: "Grocery"
  },
  {
    title: "Paneer",
    description: "Soft and fresh malai paneer made daily from pure cow milk. No preservatives added.",
    image: {
      url: "https://www.rajbhog.com/wp-content/uploads/2024/07/Raw-paneer-600x600.jpg",
      filename: "listingimage",
    },
    price: 280,
    category: "Dairy"
  },
  {
    title: "Darjeeling First Flush Tea",
    description: "Exquisite black tea from the high-altitude gardens of Darjeeling. Floral and light.",
    image: {
      url: "https://cdn.shopify.com/s/files/1/0291/9381/articles/Darjeeling-First-Flush_f8db0b0b-44c5-457e-be49-cf20d3202c3b_2048x2048.jpg?v=1585243666",
      filename: "listingimage",
    },
    price: 1500,
    category: "Beverages"
  },
  {
    title: "Kashmiri Saffron (Kesar)",
    description: "Grade A++ original Mongra saffron strands, handpicked from the fields of Pampore.",
    image: {
      url: "https://images.unsplash.com/photo-1509130872995-86c1187635f5?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNhZmZyb258ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 450,
    category: "Snacks"
  },
  {
    title: "Natural Forest Honey",
    description: "Raw, unfiltered honey collected from the wild bees of the Sunderbans.",
    image: {
      url: "https://plus.unsplash.com/premium_photo-1726704133644-bd521a727cf8?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8amFyJTIwb2YlMjBob25leXxlbnwwfHwwfHx8MA%3D%3D",
      filename: "listingimage",
    },
    price: 550,
    category: "Snacks"
  },
  {
    title: "A2 Desi Cow Ghee",
    description: "Traditional Bilona-method ghee made from the milk of Gir cows.",
    image: {
      url: "https://images.unsplash.com/photo-1707424124274-689499bbe5e9?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2hlZXxlbnwwfHwwfHx8MA%3D%3D",
      filename: "listingimage",
    },
    price: 1800,
    category: "Dairy"
  },
  {
    title: "Whole Spice Black Pepper",
    description: "Bold, sun-dried black peppercorns sourced from the Malabar coast.",
    image: {
      url: "https://images.unsplash.com/photo-1655662844262-7bb61527c0d8?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmxhY2slMjBwZXBwZXJ8ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 120,
    category: "Grocery"
  },
  {
    title: "Organic Turmeric Powder",
    description: "Lakadong turmeric from Meghalaya with the highest curcumin content.",
    image: {
      url: "https://images.unsplash.com/photo-1615485500834-bc10199bc727?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHVybWVyaWMlMjBwb3dkZXJ8ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 140,
    category: "Grocery"
  },
  {
    title: "Jodhpur Dried Red Chillies",
    description: "Famous Mathania chillies known for their vibrant red color and mild heat.",
    image: {
      url: "https://images.unsplash.com/photo-1602237514002-c2d8ae2da393?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      filename: "listingimage",
    },
    price: 90,
    category: "Grocery"
  },
  {
    title: "Stone-Ground Chakki Atta",
    description: "100% whole wheat flour, slow-ground to retain all essential nutrients.",
    image: {
      url: "https://images.slurrp.com/prod/rich_article/uhhj8oqv1i.webp?impolicy=slurrp-20210601&width=880&height=500",
      filename: "listingimage",
    },
    price: 65,
    category: "Grocery"
  },
  {
    title: "Green Cardamom (Elaichi)",
    description: "Large 8mm+ green cardamom pods with an intense aroma and flavor.",
    image: {
      url: "https://images.unsplash.com/photo-1642255521852-7e7c742ac58f?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyZGFtb218ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 350,
    category: "Grocery"
  },
  {
    title: "Fresh Alphonso Mango Pulp",
    description: "Pure, sweetened mango pulp with no artificial colors, ideal for desserts.",
    image: {
      url: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=800&q=60",
      filename: "listingimage",
    },
    price: 320,
    category: "Beverages"
  },
  {
    title: "Hand-Rolled Papad",
    description: "Authentic Bikaneri papad made with urad dal and aromatic spices.",
    image: {
      url: "https://www.shutterstock.com/image-photo/papad-roasted-roll-indian-traditional-260nw-2136884687.jpg",
      filename: "listingimage",
    },
    price: 85,
    category: "Snacks"
  },
  {
    title: "Golden Cashew Nuts",
    description: "Jumbo-sized roasted cashew nuts, perfectly crunchy and lightly salted.",
    image: {
      url: "https://images.unsplash.com/photo-1726771517475-e7acdd34cd8a?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FzaGV3JTIwbnV0c3xlbnwwfHwwfHx8MA%3D%3D",
      filename: "listingimage",
    },
    price: 480,
    category: "Snacks"
  },
  {
    title: "Mysore Sandalwood Incense",
    description: "Traditional agarbatti made with pure Mysore sandalwood oil for a calming aroma.",
    image: {
      url: "https://namasteindia.co/cdn/shop/files/1_acf546b5-e45e-4d21-bf3b-14de47da35a0_1024x1024.png?v=1719907770",
      filename: "listingimage",
    },
    price: 250,
    category: "Grocery"
  },
  {
    title: "Organic Toor Dal",
    description: "Unpolished and chemical-free pigeon peas, high in protein and fiber.",
    image: {
      url: "https://www.shutterstock.com/image-photo/generous-heap-dried-split-yellow-260nw-2716631187.jpg",
      filename: "listingimage",
    },
    price: 175,
    category: "Grocery"
  },
  {
    title: "Cold Pressed Coconut Oil",
    description: "100% pure virgin coconut oil extracted using traditional wooden ghani.",
    image: {
      url: "https://images.unsplash.com/photo-1588413336019-dd5d3beddf55?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvY29udXQlMjBvaWx8ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 390,
    category: "Grocery"
  },
  {
    title: "Nagpur Seedless Oranges",
    description: "Juicy and sweet seedless oranges from the citrus capital of India.",
    image: {
      url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=60",
      filename: "listingimage",
    },
    price: 120,
    category: "Grocery"
  },
  {
    title: "Assam Orthodox Tea",
    description: "Strong, malty black tea with a rich golden liquor from Upper Assam.",
    image: {
      url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=60",
      filename: "listingimage",
    },
    price: 800,
    category: "Beverages"
  },
  {
    title: "Premium California Almonds",
    description: "Selected high-quality almonds, rich in protein and Vitamin E.",
    image: {
      url: "https://images.unsplash.com/photo-1602948750761-97ea79ee42ec?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE3fHx8ZW58MHx8fHx8&fm=jpg&q=60&w=800",
      filename: "listingimage",
    },
    price: 950,
    category: "Snacks"
  },
  {
    title: "Pure Palm Jaggery",
    description: "Traditional Karupatti made from palmyra sap, a healthy sugar substitute.",
    image: {
      url: "https://www.shutterstock.com/image-photo/khejur-gur-date-palm-jaggery-260nw-2465063113.jpg",
      filename: "listingimage",
    },
    price: 220,
    category: "Grocery"
  },
  {
    title: "Farm Fresh Green Apples",
    description: "Crispy and tart green apples sourced from the orchards of Himachal.",
    image: {
      url: "https://images.unsplash.com/photo-1522507806580-0be3530796be?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZyZXNoJTIwYXBwbGVzfGVufDB8fDB8fHww",
      filename: "listingimage",
    },
    price: 260,
    category: "Grocery"
  },
  {
    title: "Organic Brown Sugar",
    description: "Unrefined cane sugar with natural molasses and a rich caramel flavor.",
    image: {
      url: "https://plus.unsplash.com/premium_photo-1720616747053-04041c3d5022?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGJyb3duJTIwc3VnYXJ8ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 85,
    category: "Grocery"
  },
  {
    title: "Pink Himalayan Salt",
    description: "Natural mineral-rich pink salt, crushed for daily cooking use.",
    image: {
      url: "https://plus.unsplash.com/premium_photo-1726079119122-eea1b0741c6f?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGluayUyMHNhbHR8ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 110,
    category: "Grocery"
  },
  {
    title: "Premium Pistachios",
    description: "Lightly roasted and salted Iranian pistachios with a vibrant green kernel.",
    image: {
      url: "https://images.unsplash.com/photo-1502825751399-28baa9b81efe?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGlzdGFjaGlvfGVufDB8fDB8fHww",
      filename: "listingimage",
    },
    price: 1300,
    category: "Snacks"
  },
  {
    title: "Organic Peanuts",
    description: "Bold-sized organic peanuts, perfect for roasting or making chutneys.",
    image: {
      url: "https://images.unsplash.com/photo-1549978113-29eb25c8177f?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      filename: "listingimage",
    },
    price: 150,
    category: "Snacks"
  },
  {
    title: "Fresh Broccoli",
    description: "Nutrient-dense green broccoli florets, harvested fresh from local farms.",
    image: {
      url: "https://images.unsplash.com/photo-1685504445355-0e7bdf90d415?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJvY2NvbGl8ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 95,
    category: "Grocery"
  },
  {
    title: "Saffron Infused Honey",
    description: "Premium honey infused with real Kashmiri saffron strands for a unique taste.",
    image: {
      url: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=60",
      filename: "listingimage",
    },
    price: 750,
    category: "Snacks"
  },
  {
    title: "Black Seedless Grapes",
    description: "Sweet and crunchy black seedless grapes from the vineyards of Nashik.",
    image: {
      url: "https://images.unsplash.com/photo-1515778767554-42d4b373f2b3?fm=jpg&q=60&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBncmFwZXN8ZW58MHx8MHx8fDA%3D",
      filename: "listingimage",
    },
    price: 140,
    category: "Grocery"
  },
  {
    title: "Natural Rock Candy (Mishri)",
    description: "Pure sugar crystals used in traditional sweets and as a mouth freshener.",
    image: {
      url: "https://www.shutterstock.com/image-photo/white-candy-rock-sugar-crystal-600nw-2596538403.jpg",
      filename: "listingimage",
    },
    price: 60,
    category: "Grocery"
  }
];

module.exports = { data: sampleListings };