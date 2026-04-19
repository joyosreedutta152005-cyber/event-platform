const mysql = require("mysql2/promise");

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "eventDB"
    });

    console.log("✅ Connected to MySQL");

    // Check events table
    const [events] = await connection.execute("SELECT * FROM events");
    console.log("\n📋 Events in Database:");
    console.log("Total Events:", events.length);
    
    if (events.length > 0) {
      console.log("\nEvent Details:");
      events.forEach((event, i) => {
        console.log(`\n${i + 1}. ${event.name}`);
        console.log(`   ID: ${event.id}`);
        console.log(`   Capacity: ${event.capacity}`);
        console.log(`   Type: ${event.type}`);
        console.log(`   Created: ${event.createdAt}`);
      });
    } else {
      console.log("❌ No events found in database");
    }

    connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testDatabase();
