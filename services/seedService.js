const { FavoriteEntry } = require("../models");

// Sample data for movies and TV shows
const sampleData = [
  // Movies
  {
    title: "The Dark Knight",
    type: "Movie",
    director: "Christopher Nolan",
    budget: 185000000,
    location: "Chicago, Illinois",
    duration: "152 minutes",
    year: 2008
  },
  {
    title: "Inception",
    type: "Movie",
    director: "Christopher Nolan",
    budget: 160000000,
    location: "Los Angeles, California",
    duration: "148 minutes",
    year: 2010
  },
  {
    title: "Interstellar",
    type: "Movie",
    director: "Christopher Nolan",
    budget: 165000000,
    location: "Alberta, Canada",
    duration: "169 minutes",
    year: 2014
  },
  {
    title: "The Matrix",
    type: "Movie",
    director: "The Wachowskis",
    budget: 63000000,
    location: "Sydney, Australia",
    duration: "136 minutes",
    year: 1999
  },
  {
    title: "Pulp Fiction",
    type: "Movie",
    director: "Quentin Tarantino",
    budget: 8000000,
    location: "Los Angeles, California",
    duration: "154 minutes",
    year: 1994
  },
  {
    title: "The Godfather",
    type: "Movie",
    director: "Francis Ford Coppola",
    budget: 6000000,
    location: "New York, New York",
    duration: "175 minutes",
    year: 1972
  },
  {
    title: "Avatar",
    type: "Movie",
    director: "James Cameron",
    budget: 237000000,
    location: "Los Angeles, California",
    duration: "162 minutes",
    year: 2009
  },
  {
    title: "Titanic",
    type: "Movie",
    director: "James Cameron",
    budget: 200000000,
    location: "Rosarito, Mexico",
    duration: "194 minutes",
    year: 1997
  },

  // TV Shows
  {
    title: "Breaking Bad",
    type: "TV Show",
    director: "Vince Gilligan",
    budget: 3000000,
    location: "Albuquerque, New Mexico",
    duration: "5 seasons",
    year: 2008
  },
  {
    title: "Game of Thrones",
    type: "TV Show",
    director: "David Benioff & D.B. Weiss",
    budget: 15000000,
    location: "Northern Ireland",
    duration: "8 seasons",
    year: 2011
  },
  {
    title: "The Office",
    type: "TV Show",
    director: "Greg Daniels",
    budget: 2000000,
    location: "Los Angeles, California",
    duration: "9 seasons",
    year: 2005
  },
  {
    title: "Stranger Things",
    type: "TV Show",
    director: "The Duffer Brothers",
    budget: 8000000,
    location: "Atlanta, Georgia",
    duration: "4 seasons",
    year: 2016
  },
  {
    title: "The Sopranos",
    type: "TV Show",
    director: "David Chase",
    budget: 4000000,
    location: "New Jersey, New York",
    duration: "6 seasons",
    year: 1999
  },
  {
    title: "The Wire",
    type: "TV Show",
    director: "David Simon",
    budget: 2500000,
    location: "Baltimore, Maryland",
    duration: "5 seasons",
    year: 2002
  },
  {
    title: "Friends",
    type: "TV Show",
    director: "Marta Kauffman & David Crane",
    budget: 1000000,
    location: "Los Angeles, California",
    duration: "10 seasons",
    year: 1994
  },
  {
    title: "The Crown",
    type: "TV Show",
    director: "Peter Morgan",
    budget: 13000000,
    location: "London, England",
    duration: "6 seasons",
    year: 2016
  }
];

// Function to automatically seed the database on startup
const autoSeedDatabase = async () => {
  try {
    // Check if data already exists
    const existingCount = await FavoriteEntry.count();
    
    if (existingCount > 0) {
      console.log(`Database contains ${existingCount} entries - skipping seeding`);
      return { seeded: false, count: existingCount };
    }

    console.log("Seeding sample data...");
    
    // Insert sample data
    const createdEntries = await FavoriteEntry.bulkCreate(sampleData, {
      validate: true,
      returning: true,
      ignoreDuplicates: true
    });

    console.log(`Seeded ${createdEntries.length} entries (${sampleData.filter(item => item.type === 'Movie').length} movies, ${sampleData.filter(item => item.type === 'TV Show').length} TV shows)`);

    return { seeded: true, count: createdEntries.length };

  } catch (error) {
    console.error("Seeding error:", error.message);
    return { seeded: false, error: error.message };
  }
};

module.exports = { 
  autoSeedDatabase, 
  sampleData 
};
