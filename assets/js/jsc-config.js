/**
 * =======================================================================
 * JIMMY SPORTS CLUB (JSC) — OFFICIAL CONFIGURATION & CONTENT SETTINGS
 * =======================================================================
 * 
 * Edit this file to update pricing, contact details, seasonal rates,
 * offers, and academy announcements without touching HTML or CSS code!
 * 
 * Instructions:
 * - Update numbers and text between quotes.
 * - Save the file and refresh the browser or re-upload to your server.
 * =======================================================================
 */

const JSC_CONFIG = {
  // Brand & Business Details
  club: {
    name: "Jimmy Sports Club",
    shortName: "JSC",
    tagline: "BUILT FOR THE GAME. BORN TO PLAY.",
    subTagline: "More than a playing ground. A place where the next generation of cricketers grows.",
    mission: "Experience the next level of cricket at Jimmy Sports Club. Train harder, play smarter and become part of a sporting community built around passion and performance.",
    locationName: "Muzaffarpur, Bihar, India",
    fullAddress: "Jail Chowk, Bandh Road, Kanhauli Vishundat (Sir Syed Colony / Chandwara), Muzaffarpur, Bihar - 842001",
    landmark: "Near Sir Syed Colony, Bandh Road, Kanhauli",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.4285124195156!2d85.39589977598463!3d26.126487992985172!2m3!1f0!2f0!3f0!3m2!1i1024!2f768!4f13.1!3m3!1m2!1s0x39ed10e7b99c7553%3A0xe54b490f23f6630f!2sJail%20Chowk%2C%20Muzaffarpur%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    googleMapsLink: "https://maps.google.com/?q=Jimmy+Sports+Club+Jail+Chowk+Bandh+Road+Muzaffarpur+Bihar",
    rating: 5.0,
    ratingCount: "Verified Community Rating"
  },

  // Contact & Social Channels
  contact: {
    phone: "+919241099299",
    phoneDisplay: "+91 92410 99299",
    email: "jsc.jimmysportsclub@gmail.com",
    instagramHandle: "@jimmysportsclub",
    instagramUrl: "https://www.instagram.com/jimmysportsclub/",
    currentWebsiteUrl: "https://jsconline.in/",
    newDomainUrl: "https://jimmysportsclub.com/"
  },

  // Central WhatsApp Booking Configuration
  whatsapp: {
    number: "919241099299", // International format without + or spaces
    defaultMessage: "Hello Jimmy Sports Club, I would like to enquire about booking a cricket turf/practice slot. Please share the available timings and booking details.",
    turfMessage: "Hello Jimmy Sports Club, I would like to book the Floodlit Cricket Turf. Please let me know the available time slots and booking procedure.",
    netsMessage: "Hello Jimmy Sports Club, I would like to enquire about reserving Covered Cricket Practice Nets for a batting/bowling session.",
    bowlingMachineMessage: "Hello Jimmy Sports Club, I am interested in Automated Bowling Machine Practice packages. Please share available slots.",
    academyMessage: "Hello Jimmy Sports Club, I would like to enquire about JSC Academy admission, training batches, and coaching details for players."
  },

  // Operating Hours
  timings: {
    operatingHours: "6:00 AM – 11:00 PM (Everyday)",
    dayPeriod: "6:00 AM – 5:00 PM",
    nightPeriod: "5:00 PM onwards (Floodlit Sessions)",
    daysOpen: "Monday through Sunday (Open all 7 Days)"
  },

  // Official Pricing Configuration (Current Winter Rates)
  pricing: {
    season: "Winter 2026 Official Rates",
    disclaimer: "Introductory launch offers have ended. Please refer to the current official pricing displayed on this website.",
    weekendChargePercent: 20, // 20% additional charge on weekend bookings
    
    // Facility Hourly Rates (Weekday Base)
    facilities: [
      {
        id: "turf",
        title: "Cricket Turf",
        badge: "Most Popular Arena",
        subtitle: "High-spec all-weather artificial turf with professional boundary netting & high-lux floodlighting.",
        dayRate: 800,
        nightRate: 800,
        unit: "per hour",
        features: [
          "Professional all-weather synthetic playing surface",
          "High-lux tournament floodlight system for night games",
          "Tournament perimeter safety netting",
          "Match-standard center pitch strip & crease markings",
          "Ideal for full squad games & corporate tournaments"
        ],
        whatsappPrompt: "Turf Slot Booking"
      },
      {
        id: "nets",
        title: "Cricket Practice Nets",
        badge: "Technique & Drills",
        subtitle: "Weather-protected covered practice nets designed for pace bowling, spin, and batting refinement.",
        dayRate: 200,
        nightRate: 200,
        unit: "per hour",
        features: [
          "High-density weather-resistant impact net enclosures",
          "Dedicated batting & bowling run-up lanes",
          "True bounce all-weather pitch mats",
          "Equipped for spin, seam & swing practice",
          "Individual or small group coaching friendly"
        ],
        whatsappPrompt: "Practice Nets Slot Booking"
      }
    ],

    // Automated Bowling Machine Practice Packages (Fixed overs packages)
    bowlingMachinePackages: [
      { overs: 10, price: 100, popular: false, badge: "Starter Drill" },
      { overs: 20, price: 200, popular: false, badge: "Skill Builder" },
      { overs: 30, price: 300, popular: true,  badge: "High Intensity" },
      { overs: 40, price: 400, popular: false, badge: "Pro Stance" },
      { overs: 50, price: 500, popular: false, badge: "Marathon Session" },
      { overs: 70, price: 600, popular: false, badge: "Mastery Pack (Best Value)" }
    ]
  },

  // Current Offers & Announcements
  offers: [
    {
      id: "winter-camp",
      title: "Winter Cricket Skill Camp 2026",
      category: "JSC Academy",
      status: "ACTIVE",
      description: "Intensive morning and evening technique camps for young cricketers focusing on batting mechanics, footwork against pace, and spin mastery.",
      validity: "Valid through Winter Season",
      ctaText: "Enquire on WhatsApp",
      tag: "Academy Spotlight"
    },
    {
      id: "corporate-leagues",
      title: "Weekend Corporate & Club Tournament Slots",
      category: "Turf Booking",
      status: "ACTIVE",
      description: "Block multi-hour turf slots for your team or weekend corporate tournament under high-lux floodlights with priority scheduling.",
      validity: "Advance weekend booking recommended",
      ctaText: "Check Slot Availability",
      tag: "Tournament Special"
    },
    {
      id: "intro-launch",
      title: "Introductory Launch Pricing (₹500 Day / ₹700 Night)",
      category: "Pricing Notice",
      status: "EXPIRED",
      description: "Introductory launch rates have concluded. Official verified rates of ₹800/hr (Turf) and ₹200/hr (Nets) are now active across all channels.",
      validity: "Concluded",
      ctaText: "View Current Pricing",
      tag: "Archived Notice"
    }
  ],

  // JSC Academy Program Details
  academy: {
    heading: "JIMMY SPORTS CLUB ACADEMY",
    subheading: "Developing The Next Generation Of Bihar's Cricketing Talent",
    description: "JSC Academy is built on discipline, athletic development, and professional cricketing fundamentals. Our structured training curriculum provides young athletes and aspiring cricketers with the right infrastructure, repetitive skill drills, and match simulation.",
    highlights: [
      { title: "Technical Fundamentals", desc: "Rigorous focus on batting stance, swing mechanics, bowling release, and fielding agility." },
      { title: "Machine-Assisted Training", desc: "Automated bowling machine sessions delivering repeatable lengths and speeds to groove strokes." },
      { title: "Match Simulations", desc: "Regular competitive turf match situations to instill game awareness and tactical mindset." },
      { title: "Youth Development Batches", desc: "Structured morning & evening schedules designed for school and college student-athletes." }
    ],
    batches: [
      { name: "Morning Cadets Batch", time: "6:30 AM – 8:30 AM", target: "Foundations & Junior Development" },
      { name: "Evening Performance Batch", time: "4:00 PM – 6:30 PM", target: "Technical Nets & Match Practice" },
      { name: "Weekend Intensive Squad", time: "Saturdays & Sundays", target: "Match Scenarios & Fitness" }
    ]
  },

  // Verified Milestones & Achievements
  achievements: [
    {
      year: "2024–2026",
      title: "State-of-the-Art Cricket Turf Launch",
      description: "Established Muzaffarpur's premier floodlit all-weather cricket facility at Jail Chowk, Bandh Road, providing athletes with world-class turf access."
    },
    {
      year: "2025",
      title: "Automated Bowling Machine Integration",
      description: "Introduced advanced programmable cricket bowling machine practice to North Bihar, enabling players to face 100+ km/h pace and swing variations."
    },
    {
      year: "2025–2026",
      title: "Grassroots Academy Programs",
      description: "Enrolled enthusiastic young cricketers into JSC Academy, mentoring player cohorts across morning and evening skill-building sessions."
    },
    {
      year: "Ongoing",
      title: "Night Box-Cricket & Club Tournaments",
      description: "Hosted highly energetic evening cricket matches and community sports leagues under professional floodlight illumination."
    }
  ],

  // Verified Customer Reviews (from jsconline.in & community feedback)
  reviews: [
    {
      author: "Verified Cricket Player",
      rating: 5,
      role: "Club Batsman, Muzaffarpur",
      text: "The turf quality at Jimmy Sports Club is unmatched in Muzaffarpur. The bounce is true, the lighting for night matches is exceptionally bright, and the staff manages slot bookings smoothly over WhatsApp.",
      source: "Verified Player Review"
    },
    {
      author: "Local Tournament Organizer",
      rating: 5,
      role: "Box Cricket League",
      text: "We hosted our weekend night tournament here. The floodlights give great visibility, the perimeter nets keep the game contained, and the all-weather surface holds up perfectly. Highly recommended for cricket enthusiasts.",
      source: "Verified Player Review"
    },
    {
      author: "Academy Parent",
      rating: 5,
      role: "JSC Academy Trainee Parent",
      text: "Having covered nets and an automated bowling machine right here in Muzaffarpur is a game changer for young cricketers. My son gets consistent practice on his front-foot strokes every week.",
      source: "Verified Player Review"
    }
  ]
};

// Freeze configuration in production so it cannot be accidentally mutated
if (typeof Object.freeze === "function") {
  Object.freeze(JSC_CONFIG);
}
